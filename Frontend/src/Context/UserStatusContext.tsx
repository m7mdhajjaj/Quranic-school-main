// contexts/UserStatusContext.tsx
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { socketManager } from '../Socket/SocketManager';
import api from '../Api/api';

// تعريف الواجهات والأنواع
export interface UserStatusState {
  isActive: boolean;
  lastSeen?: Date;
  isLoading: boolean;
}

export interface UserStatusContextType {
  userStatus: UserStatusState;
  getUserStatus: (userId?: string) => UserStatusState;
  refreshStatus: () => void;
}

// إنشاء السياق
/* eslint-disable react-refresh/only-export-components */
export const UserStatusContext = createContext<UserStatusContextType | undefined>(undefined);

export const UserStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [userStatuses, setUserStatuses] = useState<Record<string, UserStatusState>>({});

  // الحالة الافتراضية - مستقرة
  const defaultStatus: UserStatusState = React.useMemo(() => ({
    isActive: false,
    isLoading: false,
  }), []);

  // جلب حالة مستخدم معين
  const fetchUserStatus = useCallback(async (userId: string) => {
    if (!token || !userId) return;

    try {
      const response = await api.get(`/users/${userId}/status`);
      const data = response.data;
      
      const status: UserStatusState = {
        isActive: data.isActive !== false,
        lastSeen: data.lastSeen ? new Date(data.lastSeen) : undefined,
        isLoading: false,
      };

      setUserStatuses(prev => ({
        ...prev,
        [userId]: status,
      }));
    } catch {
      // Silently fail if backend is not running, don't spam console
      setUserStatuses(prev => ({
        ...prev,
        [userId]: {
          isActive: !!user && !!token,
          isLoading: false,
        },
      }));
    }
  }, [token, user]);

  // إعداد Socket.IO للتحديثات الفورية باستخدام socketManager
  useEffect(() => {
    if (!token || !user?._id) {
      return;
    }

    // جلب الحالة الأولية للمستخدم الحالي
    fetchUserStatus(user._id);

    // الاستماع لتحديثات حالة المستخدمين من socketManager
    const handleUserStatusChange = (data: { 
      userId: string; 
      isActive: boolean; 
      lastSeen?: string;
    }) => {
      setUserStatuses(prev => ({
        ...prev,
        [data.userId]: {
          isActive: data.isActive,
          lastSeen: data.lastSeen ? new Date(data.lastSeen) : undefined,
          isLoading: false,
        },
      }));
    };

    // الحصول على Socket من socketManager
    const socket = socketManager.getSocket();
    if (socket) {
      socket.on('userStatusChange', handleUserStatusChange);
    }

    // Cleanup: إزالة المستمع عند unmount
    return () => {
      const socket = socketManager.getSocket();
      if (socket) {
        socket.off('userStatusChange', handleUserStatusChange);
      }
    };
  }, [token, user?._id, fetchUserStatus]);

  // ❌ تم إزالة التحديث الدوري - نعتمد على socket للتحديثات الفورية
  // التحديث التلقائي غير ضروري لأن socket يرسل userStatusChange event
  // فقط نجلب الحالة عند الحاجة الأولى من خلال getUserStatus

  // دالة للحصول على حالة مستخدم معين - محسّنة لتجنب setState في render
  const getUserStatus = useCallback((userId?: string): UserStatusState => {
    const targetUserId = userId || user?._id;
    if (!targetUserId) return defaultStatus;

    const status = userStatuses[targetUserId];
    
    // إذا لم تكن الحالة محملة، جدولة الـ fetch في المرة القادمة
    if (!status && token) {
      // استخدام queueMicrotask بدلاً من setState مباشرة
      queueMicrotask(() => {
        setUserStatuses(prev => {
          // تحقق مزدوج: لو تم التحديث بالفعل، لا تفعل شيء
          if (prev[targetUserId]) return prev;
          
          return {
            ...prev,
            [targetUserId]: { ...defaultStatus, isLoading: true },
          };
        });
        
        // جدولة الـ fetch بعد الـ render
        requestAnimationFrame(() => {
          fetchUserStatus(targetUserId);
        });
      });
      
      return { ...defaultStatus, isLoading: true };
    }

    return status || defaultStatus;
  }, [user?._id, userStatuses, token, fetchUserStatus, defaultStatus]);

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