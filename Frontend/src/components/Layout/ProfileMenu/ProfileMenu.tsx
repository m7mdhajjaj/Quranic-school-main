import React from "react";
import { User, Key, LogOut, ChevronLeft } from "lucide-react";
import { Card } from "@/components/UI";
import Avatar from "@/components/Avatar/Avatar";
import type { User as UserType } from "@/Context/AuthContext";
import { useProfileMenu } from "./hooks";

interface ProfileMenuProps {
  user: UserType | null;
  isOpen: boolean;
  onClose: () => void;
  onProfileClick: () => void;
  onChangePasswordClick: () => void;
  onLogout: () => void;
  buttonRef?: React.RefObject<HTMLButtonElement>;
}

// خريطة الأيقونات
const iconMap = {
  user: <User size={18} />,
  key: <Key size={18} />,
  logout: <LogOut size={18} />,
};

const ProfileMenu: React.FC<ProfileMenuProps> = ({
  user,
  isOpen,
  onClose,
  onProfileClick,
  onChangePasswordClick,
  onLogout,
  buttonRef,
}) => {
  // استخدام الـ hook للمنطق
  const { menuPosition, menuButtons } = useProfileMenu({
    isOpen,
    onClose,
    onProfileClick,
    onChangePasswordClick,
    onLogout,
    buttonRef,
  });

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay للإغلاق */}
      <div
        className="fixed inset-0 z-[190]"
        onClick={onClose}
      />
      
      <div 
        className="fixed w-56 sm:w-64 z-[200] transition-all duration-200 animate-fadeIn" 
        dir="rtl"
        style={{
          top: `${menuPosition.top}px`,
          right: `${menuPosition.right}px`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Card 
          variant="elevated" 
          padding="none"
          className="overflow-hidden bg-white border border-emerald-200 shadow-xl rounded-xl backdrop-blur-sm"
        >
        {/* User Info Header - Compact Design */}
        <div className="relative bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 px-4 py-3 rounded-t-xl border-b border-emerald-100">
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative flex-shrink-0">
                <Avatar
                  key={`profile-menu-avatar-${user._id}-${user.avatar?.url || 'no-avatar'}`}
                  user={user}
                  size="sm"
                  border="none"
                  className="w-12 h-12"
                  showStatus={true}
                  statusSize="sm"
                  autoFetch={true}
                  userId={user._id}
                  userRole={user.role}
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-emerald-200 flex items-center justify-center flex-shrink-0">
                <User size={24} className="text-emerald-600" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h3 className="text-gray-900 font-semibold text-sm truncate flex-1 min-w-0">
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.firstName || "المستخدم"}
                </h3>
                {user?.role && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200 flex-shrink-0">
                    {user.role === "teacher" 
                      ? "معلم" 
                      : user.role === "admin" 
                      ? "مدير" 
                      : user.role === "secretary"
                      ? "سكرتير"
                      : "طالب"}
                  </span>
                )}
              </div>
              {user?.email && (
                <p className="text-gray-600 text-xs break-words">{user.email}</p>
              )}
            </div>
          </div>
        </div>

        {/* Menu Items - Compact Design */}
        <div className="p-2 space-y-1 bg-white">
          {menuButtons.map((button, index) => (
            <button
              key={index}
              onClick={button.onClick}
              className={`
                w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg
                font-medium text-sm transition-all duration-200
                ${button.isActive 
                  ? button.label === "الملف الشخصي"
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : button.label === "تغيير كلمة المرور"
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-red-600 text-white shadow-sm'
                  : button.isLogout
                  ? 'text-red-600 hover:bg-red-50 hover:text-red-700'
                  : 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700'
                }
                hover:scale-[1.01] active:scale-[0.99]
              `}
            >
              <div className={`flex-shrink-0 ${
                button.isActive 
                  ? 'text-white' 
                  : button.isLogout
                  ? 'text-red-500'
                  : 'text-emerald-500'
              }`}>
                {iconMap[button.icon as keyof typeof iconMap]}
              </div>
              <span className="flex-1 text-right">{button.label}</span>
              <ChevronLeft 
                size={16} 
                className={`flex-shrink-0 transition-colors duration-200 ${
                  button.isActive 
                    ? 'text-white' 
                    : button.isLogout
                    ? 'text-red-400'
                    : 'text-emerald-400'
                }`}
              />
            </button>
          ))}
        </div>
      </Card>
      </div>
    </>
  );
};

export default ProfileMenu;