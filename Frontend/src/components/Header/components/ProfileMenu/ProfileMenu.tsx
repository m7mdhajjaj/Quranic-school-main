import React, { useMemo } from "react";
import { User, Key, LogOut, Mail } from "lucide-react";
import { Card, Button, OnlineStatus } from "../../../UI";
import Avatar from "../../../Avatar/Avatar";
import type { ProfileMenuProps } from "../../types/navigation.types";

const ProfileMenu: React.FC<ProfileMenuProps> = ({
  user,
  isOpen,
  onClose,
  onProfileClick,
  onChangePasswordClick,
  onLogout,
}) => {
  // استخدام حالة ثابتة للآن
  const isOnline = true;
  const menuButtons = useMemo(() => [
    {
      label: "الملف الشخصي",
      icon: <User size={18} />,
      onClick: () => {
        onClose();
        onProfileClick();
      },
      variant: "ghost" as const,
      className: "justify-start text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
    },
    {
      label: "تغيير كلمة المرور", 
      icon: <Key size={18} />,
      onClick: () => {
        onClose();
        onChangePasswordClick();
      },
      variant: "ghost" as const,
      className: "justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50"
    },
    {
      label: "تسجيل الخروج",
      icon: <LogOut size={18} />,
      onClick: onLogout,
      variant: "ghost" as const,
      className: "justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
    }
  ], [onClose, onProfileClick, onChangePasswordClick, onLogout]);

  if (!isOpen) return null;

  return (
    <div className="absolute left-0 mt-3 w-72 animate-slide-down z-50">
      <Card 
        variant="elevated" 
        padding="none"
        className="overflow-hidden backdrop-blur-sm border border-white/20 shadow-2xl transform transition-all duration-200 hover:shadow-3xl"
      >
        {/* User Info Header with Enhanced Design */}
        <div className="relative bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 px-6 py-6">
          {/* Decorative Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 translate-y-12"></div>
          </div>
          
          <div className="relative flex items-center gap-4">
            <div className="relative">
              <Avatar
                user={user}
                size="xl"
                border="none"
                className="shadow-xl"
              />
              <OnlineStatus 
                isOnline={isOnline}
                size="lg"
                className="absolute -bottom-1 -right-1"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-bold text-lg truncate">
                {user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user?.firstName || "المستخدم"}
              </h3>
              {user?.email && (
                <div className="flex items-center gap-2 mt-1">
                  <Mail size={14} className="text-white/70 flex-shrink-0" />
                  <p className="text-white/80 text-sm truncate">{user.email}</p>
                </div>
              )}
              {user?.role && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm">
                    {user.role === "teacher" ? "معلم" : user.role === "admin" ? "مدير" : "طالب"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Menu Items with Enhanced Buttons */}
        <div className="p-3 space-y-1">
          {menuButtons.map((button, index) => (
            <Button
              key={index}
              variant={button.variant}
              size="md"
              onClick={button.onClick}
              leftIcon={button.icon}
              className={`w-full h-12 ${button.className} font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md`}
            >
              {button.label}
            </Button>
          ))}
        </div>

        {/* Footer with Subtle Branding */}
        <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center font-medium">
            المدرسة القرآنية • الإصدار 2.0
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ProfileMenu;