// components/ProfileHeader.tsx
import { motion, AnimatePresence } from "framer-motion";
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
    <div className="flex flex-col items-center mb-4 sm:mb-6 lg:mb-8" dir="rtl">
      {/* Name - Enhanced with Animation */}
      <motion.h1
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white mb-3 sm:mb-4 lg:mb-6 text-center drop-shadow-2xl tracking-tight px-2"
      >
        {fullName || "مرحباً بك"}
      </motion.h1>

      {/* Role and Age Badges - Enhanced Pills */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6 lg:mb-8"
      >
        <motion.div
          whileHover={{ scale: 1.08, rotate: 2 }}
          whileTap={{ scale: 0.95 }}
          style={{ touchAction: "manipulation" }}
          className="inline-flex items-center gap-1.5 sm:gap-2.5 bg-white/95 backdrop-blur-md px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 lg:py-2.5 rounded-full shadow-xl border border-white/50 cursor-default"
        >
          <motion.span
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="text-lg sm:text-xl lg:text-2xl"
          >
            {roleConfig.icon}
          </motion.span>
          <span className="text-teal-700 font-bold text-xs sm:text-sm lg:text-base">
            {roleConfig.label}
          </span>
        </motion.div>

        {age && (
          <motion.div
            whileHover={{ scale: 1.08, rotate: -2 }}
            whileTap={{ scale: 0.95 }}
            style={{ touchAction: "manipulation" }}
            className="inline-flex items-center gap-1.5 sm:gap-2.5 bg-white/95 backdrop-blur-md px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 lg:py-2.5 rounded-full shadow-xl border border-white/50 cursor-default"
          >
            <motion.span
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
              className="text-base sm:text-lg lg:text-xl"
            >
              🎂
            </motion.span>
            <span className="text-teal-700 font-bold text-xs sm:text-sm lg:text-base">{age} سنة</span>
          </motion.div>
        )}
      </motion.div>

      {/* Action Buttons - Enhanced Design */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="flex flex-wrap gap-2 sm:gap-3 lg:gap-4 justify-center w-full px-2 sm:px-0"
      >
        <AnimatePresence mode="wait">
          {!isEditing ? (
            <motion.div
              key="view-buttons"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-wrap gap-2 sm:gap-3 lg:gap-4 justify-center w-full sm:w-auto"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ touchAction: "manipulation" }} className="flex-1 sm:flex-none min-w-0">
                <Button
                  onClick={onEdit}
                  variant="primary"
                  size="lg"
                  gradient={false}
                  className="!bg-white !text-teal-700 !font-bold !px-4 sm:!px-6 lg:!px-10 !py-2.5 sm:!py-3 lg:!py-3.5 !rounded-lg sm:!rounded-xl !shadow-xl hover:!shadow-2xl !transition-all !duration-300 !text-xs sm:!text-sm lg:!text-base w-full sm:w-auto"
                  leftIcon={<Edit className="w-4 h-4 sm:w-5 sm:h-5" />}
                >
                  <span className="hidden sm:inline">تعديل المعلومات</span>
                  <span className="sm:hidden">تعديل</span>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ touchAction: "manipulation" }} className="flex-1 sm:flex-none min-w-0">
                <Button
                  onClick={onChangePassword}
                  variant="ghost"
                  size="lg"
                  className="!bg-white/25 backdrop-blur-md !text-white !font-bold !px-4 sm:!px-6 lg:!px-10 !py-2.5 sm:!py-3 lg:!py-3.5 !rounded-lg sm:!rounded-xl !border-2 !border-white/50 hover:!bg-white/35 hover:!shadow-xl !transition-all !duration-300 !text-xs sm:!text-sm lg:!text-base w-full sm:w-auto"
                  leftIcon={<Lock className="w-4 h-4 sm:w-5 sm:h-5" />}
                >
                  <span className="hidden sm:inline">تغيير كلمة المرور</span>
                  <span className="sm:hidden">كلمة المرور</span>
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="edit-buttons"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-wrap gap-2 sm:gap-3 lg:gap-4 justify-center w-full sm:w-auto"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ touchAction: "manipulation" }} className="flex-1 sm:flex-none min-w-0">
                <Button
                  onClick={onSave}
                  disabled={isSaving}
                  variant="success"
                  size="lg"
                  gradient={false}
                  className="!bg-white !text-green-700 !font-bold !px-4 sm:!px-6 lg:!px-10 !py-2.5 sm:!py-3 lg:!py-3.5 !rounded-lg sm:!rounded-xl !shadow-xl hover:!shadow-2xl !transition-all !duration-300 disabled:!opacity-70 disabled:!cursor-not-allowed !text-xs sm:!text-sm lg:!text-base w-full sm:w-auto"
                  leftIcon={
                    isSaving ? (
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    )
                  }
                >
                  <span className="hidden sm:inline">{isSaving ? "جاري الحفظ..." : "حفظ التعديلات"}</span>
                  <span className="sm:hidden">{isSaving ? "حفظ..." : "حفظ"}</span>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ touchAction: "manipulation" }} className="flex-1 sm:flex-none min-w-0">
                <Button
                  onClick={onCancel}
                  disabled={isSaving}
                  variant="danger"
                  size="lg"
                  className="!font-bold !px-4 sm:!px-6 lg:!px-10 !py-2.5 sm:!py-3 lg:!py-3.5 !rounded-lg sm:!rounded-xl !shadow-xl hover:!shadow-2xl !transition-all !duration-300 disabled:!opacity-70 disabled:!cursor-not-allowed !text-xs sm:!text-sm lg:!text-base w-full sm:w-auto"
                  leftIcon={<X className="w-4 h-4 sm:w-5 sm:h-5" />}
                >
                  إلغاء
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
