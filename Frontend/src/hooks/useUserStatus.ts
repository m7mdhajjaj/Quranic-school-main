// hooks/useUserStatus.ts
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { API_BASE_URL } from '../config';

interface UserStatus {
  isOnline: boolean;
  isActive: boolean; // من قاعدة البيانات
  lastSeen?: Date;
  isLoading: boolean;
}

export const useUserStatus = (userId?: string): UserStatus => {
  const { user, token } = useAuth();
  const [status, setStatus] = useState<UserStatus>({
    isOnline: false,
    isActive: false,
    isLoading: true,
  });

  const targetUserId = userId || user?._id;

  useEffect(() => {
    if (!targetUserId || !token) {
      setStatus(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const fetchUserStatus = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/${targetUserId}/status`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStatus({
            isOnline: data.isOnline || false,
            isActive: data.isActive || false,
            lastSeen: data.lastSeen ? new Date(data.lastSeen) : undefined,
            isLoading: false,
          });
        } else {
          // Fallback للطريقة القديمة
          setStatus({
            isOnline: !!token,
            isActive: !!user,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('خطأ في جلب حالة المستخدم:', error);
        // Fallback للطريقة القديمة
        setStatus({
          isOnline: !!token,
          isActive: !!user,
          isLoading: false,
        });
      }
    };

    fetchUserStatus();

    // تحديث كل 30 ثانية
    const interval = setInterval(fetchUserStatus, 30000);
    return () => clearInterval(interval);
  }, [targetUserId, token, user]);

  return status;
};

// Hook مبسط للـ Avatar
export const useAvatarStatus = (forceStatus?: 'online' | 'offline') => {
  const { isAuthenticated } = useAuth();
  const { isActive, isOnline } = useUserStatus();

  if (forceStatus) {
    return {
      isOnline: forceStatus === 'online',
      statusType: 'forced' as const,
    };
  }

  // أولوية للـ isActive من قاعدة البيانات
  return {
    isOnline: isActive || isOnline || isAuthenticated,
    statusType: isActive ? 'database' as const : 
                isOnline ? 'realtime' as const : 
                'fallback' as const,
  };
};