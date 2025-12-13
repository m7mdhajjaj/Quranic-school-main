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
    <div className="flex flex-col items-center mb-8" dir="rtl">
      {/* Name - Enhanced */}
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 text-center drop-shadow-2xl tracking-tight">
        {fullName || "مرحباً بك"}
      </h1>

      {/* Role and Age Badges - Enhanced Pills */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
        <div className="inline-flex items-center gap-2.5 bg-white/95 backdrop-blur-md px-6 py-2.5 rounded-full shadow-xl border border-white/50 hover:shadow-2xl hover:scale-105 transition-all duration-300">
          <span className="text-2xl">{roleConfig.icon}</span>
          <span className="text-teal-700 font-bold text-base">
            {roleConfig.label}
          </span>
        </div>

        {age && (
          <div className="inline-flex items-center gap-2.5 bg-white/95 backdrop-blur-md px-6 py-2.5 rounded-full shadow-xl border border-white/50 hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <span className="text-xl">🎂</span>
            <span className="text-teal-700 font-bold text-base">{age} سنة</span>
          </div>
        )}
      </div>

      {/* Action Buttons - Enhanced Design */}
      <div className="flex flex-wrap gap-4 justify-center">
        {!isEditing ? (
          <>
            <Button
              onClick={onEdit}
              variant="primary"
              size="lg"
              gradient={false}
              className="!bg-white !text-teal-700 !font-bold !px-10 !py-3.5 !rounded-xl !shadow-xl hover:!shadow-2xl hover:!scale-105 !transition-all !duration-300"
              leftIcon={<Edit className="w-5 h-5" />}>
              تعديل المعلومات
            </Button>
            <Button
              onClick={onChangePassword}
              variant="ghost"
              size="lg"
              className="!bg-white/25 backdrop-blur-md !text-white !font-bold !px-10 !py-3.5 !rounded-xl !border-2 !border-white/50 hover:!bg-white/35 hover:!shadow-xl hover:!scale-105 !transition-all !duration-300"
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
              className="!bg-white !text-green-700 !font-bold !px-10 !py-3.5 !rounded-xl !shadow-xl hover:!shadow-2xl hover:!scale-105 !transition-all !duration-300 disabled:!opacity-70 disabled:!cursor-not-allowed"
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
              className="!font-bold !px-10 !py-3.5 !rounded-xl !shadow-xl hover:!shadow-2xl hover:!scale-105 !transition-all !duration-300 disabled:!opacity-70 disabled:!cursor-not-allowed"
              leftIcon={<X className="w-5 h-5" />}>
              إلغاء
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
