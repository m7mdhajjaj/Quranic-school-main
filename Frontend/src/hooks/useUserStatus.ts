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

    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    const fetchUserStatus = async () => {
      if (!isMounted) return;
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/${targetUserId}/status`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok && isMounted) {
          const data = await response.json();
          setStatus({
            isOnline: data.isOnline || false,
            isActive: data.isActive !== false, // تعيين افتراضي أكثر ذكاء
            lastSeen: data.lastSeen ? new Date(data.lastSeen) : undefined,
            isLoading: false,
          });
          retryCount = 0; // إعادة تعيين العداد عند النجاح
        } else if (retryCount < maxRetries) {
          // إعادة المحاولة مع تأخير متزايد
          retryCount++;
          setTimeout(() => fetchUserStatus(), 1000 * retryCount);
        } else {
          // Fallback أفضل بعد استنفاد المحاولات
          if (isMounted) {
            setStatus({
              isOnline: !!token && !!user,
              isActive: !!user && !!token,
              isLoading: false,
            });
          }
        }
      } catch (error) {
        console.error('خطأ في جلب حالة المستخدم:', error);
        if (retryCount < maxRetries && isMounted) {
          retryCount++;
          setTimeout(() => fetchUserStatus(), 1000 * retryCount);
        } else if (isMounted) {
          // Fallback محسن
          setStatus({
            isOnline: !!token && !!user,
            isActive: !!user && !!token,
            isLoading: false,
          });
        }
      }
    };

    // تأخير قصير لضمان استقرار الاتصال
    const initialTimeout = setTimeout(fetchUserStatus, 500);

    // تحديث أقل تكراراً لتحسين الأداء
    const interval = setInterval(fetchUserStatus, 45000);
    
    return () => {
      isMounted = false;
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
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