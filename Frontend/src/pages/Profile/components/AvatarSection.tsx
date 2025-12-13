// components/AvatarSection.tsx
import { useMemo, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { getUserGender } from "../utils/profileHelpers";
import type { UserProfile } from "../types/profile.types";

interface AvatarSectionProps {
  user: UserProfile;
  avatarUrl: string | null;
  avatarFile: File | null;
  isEditing: boolean;
  onAvatarChange: (file: File | null) => void;
  onDeleteAvatar: () => void;
}

export const AvatarSection = ({
  user,
  avatarUrl,
  avatarFile,
  isEditing,
  onAvatarChange,
  onDeleteAvatar,
}: AvatarSectionProps) => {
  // إنشاء preview URL من الملف المحدد مع تنظيف تلقائي
  const previewUrl = useMemo(() => {
    if (avatarFile) {
      return URL.createObjectURL(avatarFile);
    }
    return null;
  }, [avatarFile]);

  // تنظيف preview URL عند unmount أو تغيير الملف
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // معالجة النقر على زر التعديل
  const handleEditClick = () => {
    document.getElementById("profile-avatar-input")?.click();
  };

  return (
    <div className="relative group mb-8 flex justify-center" dir="rtl">
      {/* Avatar Container - استخدام مكون Avatar الجديد */}
      <div className="relative transform transition-all duration-300 hover:scale-105">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-400/20 to-emerald-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <Avatar
          key={`avatar-${user._id}-${avatarUrl || (typeof user.avatar === 'object' ? user.avatar?.url : user.avatar) || 'no-avatar'}`}
          // استخدام user object كاملاً مع autoFetch
          user={{
            _id: user._id,
            firstName: user.firstName,
            name: user.lastName,
            gender: user.gender,
            role: user.role,
            avatar: typeof user.avatar === 'object' ? user.avatar : (user.avatar ? { url: user.avatar } : undefined),
          }}
          // مصادر الصورة - استخدام avatarUrl أولاً، ثم user.avatar
          src={avatarUrl || (typeof user.avatar === 'object' ? user.avatar?.url : user.avatar) || undefined}
          previewSrc={previewUrl}
          // معلومات المستخدم
          userName={`${user.firstName || ""} ${user.lastName || ""}`.trim()}
          gender={getUserGender(user)}
          // الإعدادات
          size="4xl"
          border="thick"
          showStatus={true}
          statusSize="lg"
          // زر التعديل المدمج
          showEditButton={isEditing}
          onEditClick={handleEditClick}
          // Auto-fetch من API
          autoFetch={true}
          userId={user._id}
          userRole={user.role}
        />

        {/* زر الحذف - يظهر فقط عند التعديل وعند وجود صورة */}
        {isEditing && (avatarUrl || avatarFile) && (
                <button
                  type="button"
                  onClick={onDeleteAvatar}
                  title="حذف الصورة الشخصية"
            className="absolute -bottom-3 right-1/2 translate-x-1/2 bg-white text-red-600 p-2.5 rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-red-500 z-10">
                  <Trash2 className="w-5 h-5" />
                </button>
        )}
      </div>

      {/* Input مخفي لرفع الصورة */}
      {isEditing && (
        <input
          id="profile-avatar-input"
          type="file"
          accept="image/*"
          title="اختيار صورة شخصية"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            onAvatarChange(file);
          }}
        />
      )}
    </div>
  );
};
