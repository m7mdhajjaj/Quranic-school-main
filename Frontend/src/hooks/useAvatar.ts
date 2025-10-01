import { useState, useCallback, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5005/api';

export interface UseAvatarOptions {
  userId?: string | null;
  userRole?: string | null;
  /** Minimum loading time in ms to prevent skeleton flash */
  minLoadingTime?: number;
}

export interface UseAvatarReturn {
  avatarUrl: string;
  avatarLoading: boolean;
  refetchAvatar: () => void;
  setAvatarUrl: (url: string) => void;
}

/**
 * Hook for managing avatar URLs with loading states
 */
export const useAvatar = ({
  userId,
  userRole,
  minLoadingTime = 300,
}: UseAvatarOptions = {}): UseAvatarReturn => {
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [avatarLoading, setAvatarLoading] = useState(false);

  const fetchUserAvatar = useCallback(
    (id: string, role: string) => {
      if (!id || !role) return;

      setAvatarLoading(true);

      const startTime = Date.now();
      const token = localStorage.getItem('token');
      const endpoint = role === 'student' ? 'students' : role === 'admin' ? 'admins' : 'teachers';
      
      // تقليل cache busting - كل 30 دقيقة بدلاً من كل دقيقة
      const cacheKey = Math.floor(Date.now() / 1800000); // 30 minutes
      const url = `${API_URL}/${endpoint}/${id}/avatar?v=${cacheKey}`;

      // استخدام fetch API مع تحسينات الكاش
      const controller = new AbortController();
      
      const handleLoadComplete = (success: boolean, loadedUrl?: string) => {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

        // Ensure minimum loading time to prevent skeleton flash
        setTimeout(() => {
          if (success && loadedUrl) {
            setAvatarUrl(loadedUrl);
          } else {
            setAvatarUrl('');
          }
          setAvatarLoading(false);
        }, remainingTime);
      };

      // Timeout with abort controller for better cleanup
      const timeout = setTimeout(() => {
        controller.abort();
        handleLoadComplete(false);
      }, 6000); // تقليل timeout لتحسين الأداء

      // Use fetch with improved caching strategy
      fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Authorization': `Bearer ${token || ''}`,
        },
        cache: 'default', // السماح بالكاش الافتراضي للمتصفح
      })
      .then(response => {
        clearTimeout(timeout);
        if (response.ok && response.status === 200) {
          // تحقق من نوع المحتوى
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.startsWith('image/')) {
            handleLoadComplete(true, url);
          } else {
            handleLoadComplete(false);
          }
        } else {
          handleLoadComplete(false);
        }
      })
      .catch(error => {
        clearTimeout(timeout);
        if (error.name !== 'AbortError') {
          console.warn('Avatar fetch failed:', error.message);
        }
        handleLoadComplete(false);
      });
      
      // Return cleanup function
      return () => {
        clearTimeout(timeout);
        controller.abort();
      };
    },
    [minLoadingTime]
  );

  const refetchAvatar = useCallback(() => {
    if (userId && userRole) {
      fetchUserAvatar(userId, userRole);
    }
  }, [userId, userRole, fetchUserAvatar]);

  // Auto-fetch on mount or when userId/userRole changes
  useEffect(() => {
    if (userId && userRole) {
      fetchUserAvatar(userId, userRole);
    }
  }, [userId, userRole, fetchUserAvatar]);

  return {
    avatarUrl,
    avatarLoading,
    refetchAvatar,
    setAvatarUrl,
  };
};

/**
 * Utility function to fetch avatar as blob URL (for profile pages)
 */
export async function fetchAvatarBlobUrl(
  endpoint: 'students' | 'teachers' | 'admins',
  id: string
): Promise<string> {
  try {
    const res = await fetch(`${API_URL}/${endpoint}/${id}/avatar`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      },
    });
    if (!res.ok) return '';
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch {
    return '';
  }
}

/**
 * Utility function to determine user gender from name or explicit gender field
 * Enhanced with better Arabic name pattern recognition
 */
export function getUserGender(user: { 
  firstName?: string; 
  name?: string; 
  gender?: string; 
} | null): 'male' | 'female' | 'ذكر' | 'أنثى' {
  if (!user) return 'ذكر';
  
  // إذا كان الجنس محدد صراحة، استخدمه
  if (user.gender) {
    const genderLower = user.gender.toLowerCase().trim();
    if (genderLower === 'male' || genderLower === 'ذكر') return 'ذكر';
    if (genderLower === 'female' || genderLower === 'أنثى' || genderLower === 'انثى') return 'أنثى';
  }
  
  // وإلا، حدد من الاسم مع تحسين أنماط الأسماء العربية
  const name = (user.firstName || user.name || '').trim();
  if (!name) return 'ذكر'; // افتراضي إذا لم يوجد اسم
  
  // أنماط أسماء الإناث العربية والإنجليزية
  const femalePatterns = [
    /ة$/,           // التاء المربوطة
    /ه$/,           // الهاء
    /اء$/,          // نهاية بـ اء (مثل فاطمة، علياء)
    /ان$/,          // نهاية بـ ان (مثل ريان)
    /ين$/,          // نهاية بـ ين (مثل ياسمين)
    /a$/i,          // English names ending with 'a'
    /ya$/i,         // English names ending with 'ya'
    /ia$/i,         // English names ending with 'ia'
    /ina$/i,        // English names ending with 'ina'
    /ah$/i,         // English names ending with 'ah'
  ];
  
  // أسماء إناث شائعة لا تتبع القواعد
  const commonFemaleNames = [
    'مريم', 'سارة', 'هدى', 'نور', 'أمل', 'سعاد', 'زينب', 'خديجة',
    'عائشة', 'حفصة', 'رقية', 'أم كلثوم', 'سكينة', 'زهراء', 'بتول',
    'mary', 'sarah', 'noor', 'amal', 'zeinab', 'khadija', 'aisha'
  ];
  
  // تحقق من الأسماء الشائعة أولاً
  if (commonFemaleNames.includes(name.toLowerCase())) {
    return 'أنثى';
  }
  
  // تحقق من الأنماط
  if (femalePatterns.some(pattern => pattern.test(name))) {
    return 'أنثى';
  }
  
  return 'ذكر';
}

/**
 * Legacy function for backward compatibility - returns English values
 */
export function getUserGenderLegacy(user: { firstName?: string; name?: string } | null): 'male' | 'female' {
  if (!user) return 'male';
  const name = user.firstName || user.name || '';
  if (/a$|ة$|ه$|ya$|ia$|ina$/i.test(name.trim())) return 'female';
  return 'male';
}