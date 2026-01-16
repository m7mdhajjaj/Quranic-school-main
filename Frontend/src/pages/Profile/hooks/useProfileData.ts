// hooks/useProfileData.ts
import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  getUserWithFallback,
  fetchAvatarBlobUrl,
} from "@/Api/profileApi";
import type { UserProfile, Endpoint, FetchState } from "../types/profile.types";

export const useProfileData = () => {
  const { user: authUser, logout } = useAuth();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [endpoint, setEndpoint] = useState<Endpoint>("students");
  const [fetchState, setFetchState] = useState<FetchState>({ status: "idle" });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  // Track loading state to prevent duplicate requests
  const loadingRef = useRef(false);
  const lastLoadedUserIdRef = useRef<string | null>(null);

  const loadUser = useCallback(async () => {
    const userId = authUser?._id || "";
    const userRole = authUser?.role;

    if (!userId) {
      setFetchState({ status: "error", message: "لا يوجد مستخدم مسجّل." });
      return;
    }
    
    // Prevent duplicate requests for the same user
    if (loadingRef.current && lastLoadedUserIdRef.current === userId) {
      return;
    }
    
    // Prevent loading if already redirecting
    if (fetchState.status === "redirecting") return;
    
    loadingRef.current = true;
    lastLoadedUserIdRef.current = userId;
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
      loadingRef.current = false;
    } catch (error: unknown) {
      loadingRef.current = false;
      const axiosError = error as {
        response?: { status?: number; data?: { message?: string } };
        message?: string;
      };

      // Handle 401 - unauthorized
      if (axiosError?.response?.status === 401) {
        console.warn('⚠️ جلسة منتهية - تسجيل خروج');
        setFetchState({ status: "redirecting", message: "جلسة منتهية" });
        logout(); // استخدام logout من AuthContext
        return;
      }

      // Handle 404 - user deleted from database
      if (axiosError?.response?.status === 404 || 
          (error instanceof Error && error.message.includes('غير موجود'))) {
        console.warn('⚠️ المستخدم غير موجود في قاعدة البيانات - تسجيل خروج');
        setFetchState({ status: "redirecting", message: "المستخدم غير موجود" });
        logout(); // استخدام logout من AuthContext
        return;
      }

      setFetchState({
        status: "error",
        message: axiosError?.response?.data?.message || 
                 (error instanceof Error ? error.message : "فشل تحميل البيانات"),
      });
    }
  }, [authUser?._id, authUser?.role, logout, fetchState.status]);

  // Reload when authUser changes (e.g., after login)
  useEffect(() => {
    // Reset state when user changes
    if (authUser?._id) {
      // Reset refs when user changes
      if (lastLoadedUserIdRef.current !== authUser._id) {
        loadingRef.current = false;
      }
      loadUser();
    }
    return () => {
      if (avatarUrl && avatarUrl.startsWith("blob:"))
        URL.revokeObjectURL(avatarUrl);
    };
  }, [authUser?._id, authUser?.role]); // eslint-disable-line react-hooks/exhaustive-deps

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
