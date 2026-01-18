// hooks/profile/useProfileData.ts
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getProfile } from "@/Api/profileApi";
import type { UserProfile, Endpoint, FetchState } from "@/types/profile.types";

export const useProfileData = () => {
  const { user: authUser } = useAuth();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [endpoint, setEndpoint] = useState<Endpoint>("students");
  const [fetchState, setFetchState] = useState<FetchState>({ status: "idle" });

  const loadUser = async () => {
    if (!authUser?._id) {
      setFetchState({ status: "error", message: "لا يوجد مستخدم مسجّل." });
      return;
    }

    setFetchState({ status: "loading" });

    try {
      const userData = await getProfile();
      setUser(userData);

      // Set endpoint based on role
      const role = userData.role || authUser.role;
      setEndpoint(
        role === "student"
          ? "students"
          : role === "teacherAssistant"
            ? "teacher-assistants"
            : role === "teacher"
              ? "teachers"
              : "admins"
      );

      setFetchState({ status: "ok" });
    } catch (error: any) {
      setFetchState({
        status: "error",
        message: error?.response?.data?.message || "فشل تحميل البيانات",
      });
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const updateUser = (updates: Partial<UserProfile>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  return {
    user,
    endpoint,
    fetchState,
    loadUser,
    updateUser,
  };
};
