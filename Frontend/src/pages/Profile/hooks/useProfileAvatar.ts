// hooks/useProfileAvatar.ts
import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { showConfirmDialog } from "@/utils/sweetalertUtils";
import { showSuccessToast, showErrorToast } from "@/utils/toastUtils";
import {
  uploadUserAvatar,
  deleteUserAvatar,
  fetchAvatarBlobUrl,
} from "@/Api/profileApi";
import type { UserProfile, Endpoint } from "../types/profile.types";

export const useProfileAvatar = (
  user: UserProfile | null,
  endpoint: Endpoint,
  currentAvatarUrl: string | null,
  onAvatarUpdate?: (avatarUrl: string | null) => void
) => {
  const { updateUser: updateAuthUser } = useAuth();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Create preview URL from selected file with automatic cleanup
  const previewUrl = useMemo(() => {
    if (avatarFile) {
      return URL.createObjectURL(avatarFile);
    }
    return null;
  }, [avatarFile]);

  // Cleanup preview URL on unmount or file change
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleDeleteAvatar = async () => {
    if (!user || !endpoint) return;

    // استخدام showConfirmDialog للتأكيد
    const result = await showConfirmDialog(
      "هل أنت متأكد؟",
      `
        <div class="text-center py-4">
          <div class="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg class="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </div>
          <p class="text-lg font-semibold text-gray-800 mb-2">سيتم حذف الصورة الشخصية نهائياً</p>
          <p class="text-sm text-gray-600">لا يمكن التراجع عن هذا الإجراء</p>
        </div>
      `,
      "نعم، احذف الصورة",
      "إلغاء"
    );

    if (!result.isConfirmed) return;

    try {
      await deleteUserAvatar(endpoint, user._id);

      if (currentAvatarUrl && currentAvatarUrl.startsWith("blob:")) {
        URL.revokeObjectURL(currentAvatarUrl);
      }
      setAvatarFile(null);

      updateAuthUser({
        avatar: undefined,
      });

      // حذف من localStorage مباشرة للتأكد من الاستمرارية
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        delete parsedUser.avatar;
        localStorage.setItem('user', JSON.stringify(parsedUser));
      }

      if (onAvatarUpdate) {
        onAvatarUpdate(null);
      }

      showSuccessToast("تم حذف الصورة الشخصية بنجاح");
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      const msg = axiosError?.response?.data?.message || "تعذّر حذف الصورة";
      showErrorToast(msg);
    }
  };

  const uploadAvatar = async () => {
    if (!user || !endpoint || !avatarFile) return;

    try {
      const fd = new FormData();
      fd.append("avatar", avatarFile);
      const uploadResponse = await uploadUserAvatar(endpoint, user._id, fd);

      // جلب الصورة الجديدة من API
      const newUrl = await fetchAvatarBlobUrl(endpoint, user._id);
      setAvatarFile(null);

      // تحديث AuthContext مع البيانات الكاملة من الاستجابة
      if (uploadResponse?.avatar || uploadResponse?.avatarUrl) {
        const avatarData = {
          url: uploadResponse.avatar?.url || uploadResponse.avatarUrl || "",
          publicId: uploadResponse.avatar?.publicId,
        };
        
        updateAuthUser({
          avatar: avatarData,
        });

        // حفظ في localStorage مباشرة للتأكد من الاستمرارية
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          parsedUser.avatar = avatarData;
          localStorage.setItem('user', JSON.stringify(parsedUser));
        }
      }

      if (onAvatarUpdate) {
        onAvatarUpdate(newUrl);
      }
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      const msg =
        axiosError?.response?.data?.message || "تعذّر رفع الصورة";
      showErrorToast(msg);
      throw error;
    }
  };

  const resetAvatar = () => {
    setAvatarFile(null);
  };

  return {
    avatarFile,
    previewUrl,
    setAvatarFile,
    handleDeleteAvatar,
    uploadAvatar,
    resetAvatar,
  };
};
