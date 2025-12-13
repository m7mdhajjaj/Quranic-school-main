// hooks/useProfileData.ts
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  getUserWithFallback,
  fetchAvatarBlobUrl,
} from "@/Api/profileApi";
import type { UserProfile, Endpoint, FetchState } from "../types/profile.types";

export const useProfileData = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [endpoint, setEndpoint] = useState<Endpoint>("students");
  const [fetchState, setFetchState] = useState<FetchState>({ status: "idle" });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const loadUser = async () => {
    const userId = authUser?._id || "";
    const userRole = authUser?.role;

    if (!userId) {
      setFetchState({ status: "error", message: "لا يوجد مستخدم مسجّل." });
      return;
    }
    setFetchState({ status: "loading" });

    try {
      const result = await getUserWithFallback(userId, userRole);
      setUser(result.user);
      setEndpoint(result.endpoint);

      const url = await fetchAvatarBlobUrl(result.endpoint, result.user._id);
      setAvatarUrl((prev) => {
        if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
        return url;
      });

      setFetchState({ status: "ok" });
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { status?: number; data?: { message?: string } };
      };

      if (axiosError?.response?.status === 401) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      setFetchState({
        status: "error",
        message: axiosError?.response?.data?.message || "فشل تحميل البيانات",
      });
    }
  };

  useEffect(() => {
    loadUser();
    return () => {
      if (avatarUrl && avatarUrl.startsWith("blob:"))
        URL.revokeObjectURL(avatarUrl);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // تحديث avatarUrl عند تغيير authUser.avatar
  useEffect(() => {
    // تحديث user المحلي عند تغيير authUser
    if (authUser && user && authUser._id === user._id) {
      setUser((prevUser) => {
        if (!prevUser) return prevUser;
        return {
          ...prevUser,
          avatar: authUser.avatar,
        };
      });
    }

    // جلب الصورة من API إذا كان هناك avatar في authUser
    if (authUser?.avatar?.url && user?._id === authUser._id && endpoint) {
      fetchAvatarBlobUrl(endpoint, user._id)
        .then((url) => {
          setAvatarUrl((prev) => {
            if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
            return url;
          });
        })
        .catch(() => {
          // إذا فشل، استخدم URL من authUser مباشرة
          setAvatarUrl(authUser.avatar?.url || null);
        });
    } else if (!authUser?.avatar?.url && user?._id === authUser?._id) {
      // إذا تم حذف الصورة
      setAvatarUrl((prev) => {
        if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
        return null;
      });
    }
  }, [authUser?.avatar?.url, authUser?.avatar?.publicId, user?._id, endpoint, authUser?._id]);

  const updateUser = (updates: Partial<UserProfile>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  const updateAvatarUrl = (url: string | null) => {
    setAvatarUrl((prev) => {
      if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return url;
    });
  };

  return {
    user,
    endpoint,
    fetchState,
    avatarUrl,
    loadUser,
    updateUser,
    updateAvatarUrl,
  };
};
