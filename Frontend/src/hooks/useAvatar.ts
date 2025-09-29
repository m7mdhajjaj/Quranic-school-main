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
      const endpoint = role === 'student' ? 'students' : 'teachers';
      const url = `${API_URL}/${endpoint}/${id}/avatar?t=${Date.now()}${
        token ? `&token=${token}` : ''
      }`;

      // Test if avatar exists by creating an image element
      const img = new Image();

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

      // Add timeout for slow connections
      const timeout = setTimeout(() => {
        img.onload = null;
        img.onerror = null;
        handleLoadComplete(false);
      }, 8000); // 8 second timeout

      img.onload = () => {
        clearTimeout(timeout);
        handleLoadComplete(true, url);
      };

      img.onerror = () => {
        clearTimeout(timeout);
        handleLoadComplete(false);
      };

      img.src = url;
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
  endpoint: 'students' | 'teachers',
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
 */
export function getUserGender(user: { 
  firstName?: string; 
  name?: string; 
  gender?: string; 
} | null): 'male' | 'female' | 'ذكر' | 'أنثى' {
  if (!user) return 'ذكر';
  
  // إذا كان الجنس محدد صراحة، استخدمه
  if (user.gender) {
    if (user.gender === 'male' || user.gender === 'ذكر') return 'ذكر';
    if (user.gender === 'female' || user.gender === 'أنثى' || user.gender === 'انثى') return 'أنثى';
  }
  
  // وإلا، حدد من الاسم
  const name = user.firstName || user.name || '';
  if (/a$|ة$|ه$|ya$|ia$|ina$/i.test(name.trim())) return 'أنثى';
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