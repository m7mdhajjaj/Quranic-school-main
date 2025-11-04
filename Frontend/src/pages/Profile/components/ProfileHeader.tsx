// components/ProfileHeader.tsx
import { Edit, Lock, CheckCircle2, X, Loader2 } from "lucide-react";
import { Button } from "@/components/UI/Button";
import type { RoleConfig } from "../types/profile.types";

interface ProfileHeaderProps {
  fullName: string;
  age?: number;
  roleConfig: RoleConfig;
  isEditing: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onChangePassword: () => void;
}

export const ProfileHeader = ({
  fullName,
  age,
  roleConfig,
  isEditing,
  isSaving,
  onEdit,
  onSave,
  onCancel,
  onChangePassword,
}: ProfileHeaderProps) => {
  return (
    <div className="flex flex-col items-center mb-8">
      {/* Name - Simple */}
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-center drop-shadow-lg">
        {fullName || "مرحباً بك"}
      </h1>

      {/* Role and Age Badges - Simple Pills */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
        <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-5 py-2 rounded-full shadow-lg">
          <span className="text-2xl">{roleConfig.icon}</span>
          <span className="text-teal-700 font-bold text-base">
            {roleConfig.label}
          </span>
        </div>

        {age && (
          <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-5 py-2 rounded-full shadow-lg">
            <span className="text-xl">🎂</span>
            <span className="text-teal-700 font-bold text-base">{age} سنة</span>
          </div>
        )}
      </div>

      {/* Action Buttons - Simple Design */}
      <div className="flex flex-wrap gap-3 justify-center">
        {!isEditing ? (
          <>
            <Button
              onClick={onEdit}
              variant="primary"
              size="lg"
              gradient={false}
              className="!bg-white !text-teal-700 !font-bold !px-8 !py-3"
              leftIcon={<Edit className="w-5 h-5" />}>
              تعديل المعلومات
            </Button>
            <Button
              onClick={onChangePassword}
              variant="ghost"
              size="lg"
              className="!bg-white/20 backdrop-blur-sm !text-white !font-bold !px-8 !py-3 !border-2 !border-white/40"
              leftIcon={<Lock className="w-5 h-5" />}>
              تغيير كلمة المرور
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={onSave}
              disabled={isSaving}
              variant="success"
              size="lg"
              gradient={false}
              className="!bg-white !text-green-700 !font-bold !px-8 !py-3"
              leftIcon={
                isSaving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )
              }>
              {isSaving ? "جاري الحفظ..." : "حفظ التعديلات"}
            </Button>
            <Button
              onClick={onCancel}
              disabled={isSaving}
              variant="danger"
              size="lg"
              className="!font-bold !px-8 !py-3"
              leftIcon={<X className="w-5 h-5" />}>
              إلغاء
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
