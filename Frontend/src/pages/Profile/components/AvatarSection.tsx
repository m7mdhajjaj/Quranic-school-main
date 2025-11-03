// components/AvatarSection.tsx
import { Camera, Trash2 } from "lucide-react";
import Avatar from "../../../components/Avatar/Avatar";
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
  return (
    <div className="relative group mb-6 flex justify-center">
      {/* Avatar Container - Simple Design */}
      <div className="relative">
        <Avatar
          src={avatarUrl}
          previewSrc={avatarFile ? URL.createObjectURL(avatarFile) : null}
          userName={user.firstName}
          gender={getUserGender(user)}
          size="4xl"
          border="thick"
          showStatus={true}
          fallbackIcon={
            <svg
              className="w-20 h-20 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          }
        />

        {/* Avatar Action Buttons - Simple Bottom Buttons */}
        {isEditing && (
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {avatarUrl || avatarFile ? (
              // Edit and Delete Buttons (when avatar exists)
              <>
                <button
                  type="button"
                  onClick={() => document.getElementById("avatar")?.click()}
                  title="تعديل الصورة الشخصية"
                  className="bg-white text-teal-600 p-2.5 rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-teal-500">
                  <Camera className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={onDeleteAvatar}
                  title="حذف الصورة الشخصية"
                  className="bg-white text-red-600 p-2.5 rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-red-500">
                  <Trash2 className="w-5 h-5" />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => document.getElementById("avatar")?.click()}
                title="رفع صورة شخصية"
                className="bg-white text-teal-600 p-2.5 rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-teal-500">
                <Camera className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>

      {isEditing && (
        <input
          id="avatar"
          type="file"
          accept="image/*"
          title="اختيار صورة شخصية"
          className="hidden"
          onChange={(e) => onAvatarChange(e.target.files?.[0] || null)}
        />
      )}
    </div>
  );
};
