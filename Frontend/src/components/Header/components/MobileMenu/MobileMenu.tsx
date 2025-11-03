import { NavLink, useLocation } from "react-router-dom";
import { User, LogOut, X } from "lucide-react";
import { Button } from "../../../UI/Button";
import Avatar from "../../../Avatar/Avatar";
import type { MobileMenuProps } from "../../types/navigation.types";

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  user,
  primaryItems,
  secondaryItems,
  onLogout,
  onProfileClick,
}) => {
  const location = useLocation();

  if (!isOpen) return null;

  const allItems = [...primaryItems, ...secondaryItems];

  return (
    <div className="xl:hidden fixed inset-0 z-40 animate-fade-in">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 h-full w-80 max-w-[90vw] bg-gradient-to-b from-emerald-600 via-emerald-700 to-emerald-800 shadow-2xl overflow-y-auto animate-slide-in-right">
        <div className="p-6 flex flex-col justify-end text-right">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-emerald-500/30">
            <h2 className="text-lg font-bold text-white">القائمة الرئيسية</h2>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border-none"
              title="إغلاق القائمة"
              leftIcon={<X size={20} />}
            />
          </div>

          {user && (
            <div className="flex items-center gap-4 mb-6 p-4 bg-white/10 rounded-2xl backdrop-blur-md">
              <Avatar user={user} size="lg" border="thick" className="shadow-lg" />
              <div className="flex-1">
                <div className="text-white font-semibold text-lg truncate">
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user.firstName || "المستخدم"}
                </div>
                <div className="text-emerald-200 text-sm">
                  {user.role === "teacher"
                    ? "معلم"
                    : user.role === "admin"
                    ? "مدير"
                    : "طالب"}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-1">
            {allItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  onClick={onClose}
                  className={({ isActive }) => {
                    const currentPath = location.pathname;
                    let isCurrentActive = isActive;

                    if (item.to === "/" && currentPath !== "/") {
                      isCurrentActive = false;
                    }

                    if (item.to !== "/" && !isActive) {
                      isCurrentActive = currentPath.startsWith(item.to + "/");
                    }

                    return `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isCurrentActive
                        ? "bg-white/20 text-white shadow-lg transform scale-105"
                        : "text-emerald-100 hover:bg-white/15 hover:text-white"
                    }`;
                  }}
                >
                  {({ isActive }) => {
                    const currentPath = location.pathname;
                    let isCurrentActive = isActive;

                    if (item.to === "/" && currentPath !== "/") {
                      isCurrentActive = false;
                    }

                    if (item.to !== "/" && !isActive) {
                      isCurrentActive = currentPath.startsWith(item.to + "/");
                    }

                    return (
                      <>
                        <IconComponent
                          size={22}
                          className={isCurrentActive ? "text-white" : "text-white/70"}
                        />
                        <span className="font-medium flex-1">{item.label}</span>
                      </>
                    );
                  }}
                </NavLink>
              );
            })}
          </div>

          <div className="space-y-2 border-t border-emerald-500/30 pt-4 mt-6">
            <Button
              onClick={() => {
                onClose();
                onProfileClick();
              }}
              variant="ghost"
              size="md"
              className="w-full justify-start gap-3 px-4 py-3 text-emerald-100 hover:bg-white/15 hover:text-white border-none"
              leftIcon={<User size={20} className="text-emerald-200" />}
            >
              الملف الشخصي
            </Button>
            <Button
              onClick={() => {
                onClose();
                onLogout();
              }}
              variant="ghost"
              size="md"
              className="w-full justify-start gap-3 px-4 py-3 text-red-300 hover:bg-red-500/20 hover:text-red-100 border-none"
              leftIcon={<LogOut size={20} className="text-red-400" />}
            >
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;