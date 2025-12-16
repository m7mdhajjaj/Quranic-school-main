// contexts/UserStatusContext.tsx
import React, { createContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { useUserStatusSocket } from "../Socket";
import api from "../Api/api";

// تعريف الواجهات والأنواع
export interface UserStatusState {
  isActive: boolean;
  lastSeen?: Date;
  isLoading: boolean;
}

export interface UserStatusContextType {
  userStatus: UserStatusState;
  userStatuses: Record<string, UserStatusState>;
  getUserStatus: (userId?: string) => UserStatusState;
  refreshStatus: () => void;
}

// إنشاء السياق
export const UserStatusContext = createContext<
  UserStatusContextType | undefined
>(undefined);

export const UserStatusProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, token } = useAuth();
  const [userStatuses, setUserStatuses] = useState<
    Record<string, UserStatusState>
  >({});

  // الحالة الافتراضية - مستقرة
  const defaultStatus: UserStatusState = React.useMemo(
    () => ({
      isActive: false,
      isLoading: false,
    }),
    []
  );

  // جلب حالة مستخدم معين
  const fetchUserStatus = useCallback(
    async (userId: string) => {
      if (!token || !userId) return;

      try {
        const response = await api.get(`/users/${userId}/status`);
        const data = response.data;

        const status: UserStatusState = {
          isActive: data.isActive !== false,
          lastSeen: data.lastSeen ? new Date(data.lastSeen) : undefined,
          isLoading: false,
        };

        setUserStatuses((prev) => ({
          ...prev,
          [userId]: status,
        }));
      } catch {
        // Silently fail if backend is not running
        setUserStatuses((prev) => ({
          ...prev,
          [userId]: {
            isActive: !!user && !!token,
            isLoading: false,
          },
        }));
      }
    },
    [token, user]
  );

  // معالج تحديث حالة المستخدم من Socket
  const handleUserStatusChange = useCallback(
    (data: { userId: string; isActive: boolean; lastSeen: string }) => {
      console.log("🔄 [UserStatusContext] Status updated via socket:", data);
      setUserStatuses((prev) => ({
        ...prev,
        [data.userId]: {
          isActive: data.isActive,
          lastSeen: data.lastSeen ? new Date(data.lastSeen) : undefined,
          isLoading: false,
        },
      }));
    },
    []
  );

  // استخدام useUserStatusSocket hook للاستماع لتحديثات Socket
  useUserStatusSocket(handleUserStatusChange);

  // جلب الحالة الأولية للمستخدم الحالي
  useEffect(() => {
    if (!token || !user?._id) {
      return;
    }

    // جلب الحالة الأولية
    fetchUserStatus(user._id);
  }, [token, user?._id, fetchUserStatus]);

  // دالة للحصول على حالة مستخدم معين
  const getUserStatus = useCallback(
    (userId?: string): UserStatusState => {
      const targetUserId = userId || user?._id;
      if (!targetUserId) return defaultStatus;

      const status = userStatuses[targetUserId];

      // إذا لم تكن الحالة محملة، جدولة الـ fetch
      if (!status && token) {
        queueMicrotask(() => {
          setUserStatuses((prev) => {
            if (prev[targetUserId]) return prev;

            return {
              ...prev,
              [targetUserId]: { ...defaultStatus, isLoading: true },
            };
          });

          // جدولة الـ fetch
          setTimeout(() => {
            fetchUserStatus(targetUserId);
          }, 0);
        });

        return { ...defaultStatus, isLoading: true };
      }

      return status || defaultStatus;
    },
    [user?._id, userStatuses, token, fetchUserStatus, defaultStatus]
  );

  // دالة لتحديث الحالة يدوياً
  const refreshStatus = useCallback(() => {
    if (user?._id && token) {
      fetchUserStatus(user._id);
    }
  }, [user?._id, token, fetchUserStatus]);

  // حالة المستخدم الحالي
  const userStatus = getUserStatus();

  const contextValue: UserStatusContextType = {
    userStatus,
    userStatuses,
    getUserStatus,
    refreshStatus,
  };

  return (
    <UserStatusContext.Provider value={contextValue}>
      {children}
    </UserStatusContext.Provider>
  );
};

export default UserStatusProvider;
