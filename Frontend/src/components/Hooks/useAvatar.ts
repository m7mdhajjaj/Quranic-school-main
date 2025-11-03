import { useState, useEffect } from 'react';
import { fetchAvatarBlobUrl, getUserEndpoint } from '../../Api/profileApi';

export interface UseAvatarOptions {
  userId?: string;
  userRole?: string;
  avatarData?: {
    url?: string;
    publicId?: string;
  };
  enabled?: boolean; // للتحكم في تفعيل الـ hook
}

export interface UseAvatarReturn {
  avatarUrl: string | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook لجلب وعرض صورة الأفاتار من Cloudinary
 * يدعم:
 * - جلب الصورة من API إذا كان userId موجود
 * - استخدام الصورة من avatarData إذا كانت موجودة
 * - عرض fallback (أول حرف من الاسم) إذا لم تكن الصورة موجودة
 */
export function useAvatar({
  userId,
  userRole,
  avatarData,
  enabled = true,
}: UseAvatarOptions): UseAvatarReturn {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAvatar = async () => {
    // إذا كان الـ hook معطل
    if (!enabled) {
      setAvatarUrl(null);
      return;
    }

    // إذا كان في بيانات avatar موجودة مباشرة
    if (avatarData?.url) {
      setAvatarUrl(avatarData.url);
      setIsLoading(false);
      return;
    }

    // إذا ما في userId، ما نقدر نجلب الصورة
    if (!userId || !userRole) {
      setAvatarUrl(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const endpoint = getUserEndpoint(userRole);
      const url = await fetchAvatarBlobUrl(endpoint, userId);
      setAvatarUrl(url); // سيكون null إذا لم يكن هناك صورة
    } catch (err) {
      // لا نطبع error في console إذا كان المستخدم ببساطة ليس لديه صورة
      const error = err as { response?: { status?: number } };
      if (error.response?.status !== 404) {
        console.error('Error fetching avatar:', err);
      }
      setError(err as Error);
      setAvatarUrl(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAvatar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, userRole, avatarData?.url, enabled]);

  return {
    avatarUrl,
    isLoading,
    error,
    refetch: fetchAvatar,
  };
}
