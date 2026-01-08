import { NavLink, useLocation } from "react-router-dom";
import { User, LogOut, X } from "lucide-react";

// Components
import { Button } from "@/components/UI";
import Avatar from "@/components/Avatar/Avatar";

// Utils
import { checkIsActive } from '../../utils/navigation.utils';

// Types
import type { MobileMenuProps, NavigationItem } from "../../types/navigation.types";

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

  // Flatten all items (expand subItems into flat list)
  const flattenItems = (items: NavigationItem[]): NavigationItem[] => {
    const flattened: NavigationItem[] = [];
    items.forEach(item => {
      if (item.subItems && item.subItems.length > 0) {
        // Add all subItems directly
        flattened.push(...item.subItems);
      } else {
        // Add regular item
        flattened.push(item);
      }
    });
    return flattened;
  };

  const allItems = flattenItems([...primaryItems, ...secondaryItems]);

  return (
    <div className="xl:hidden fixed inset-0 z-40 animate-fade-in">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Menu Content */}
      <div className="fixed right-0 top-0 h-full w-80 max-w-[90vw] bg-gradient-to-b from-emerald-600 via-emerald-700 to-emerald-800 shadow-2xl overflow-y-auto animate-slide-in-right">
        <div className="p-6 flex flex-col justify-end text-right">
          {/* ==================== Header ==================== */}
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

          {/* ==================== User Card ==================== */}
          {/* ==================== User Card ==================== */}
          {user && (
            <div className="mb-6">
              <div className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                <div className="relative flex-shrink-0">
                  <Avatar 
                    user={user} 
                    size="lg" 
                    border="thick" 
                    className="shadow-lg"
                    showStatus={true}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold text-lg truncate">
                    {user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user.firstName || "المستخدم"}
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <span className="text-emerald-200 text-sm">
                      {user.role === "teacher"
                        ? "معلم"
                        : user.role === "admin"
                        ? "مدير"
                        : "طالب"}
                    </span>
                    <span className="text-green-400 text-xs font-medium flex-shrink-0">متصل الآن</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== Navigation Items ==================== */}
          <div className="space-y-1">
            {allItems.map((item) => {
              const IconComponent = item.icon;
              const isCurrentActive = checkIsActive(item.to, location.pathname);

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={() => {
                    return `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isCurrentActive
                        ? "bg-white/20 text-white shadow-lg transform scale-105"
                        : "text-emerald-100 hover:bg-white/15 hover:text-white"
                    }`;
                  }}
                >
                  <>
                    <IconComponent
                      size={22}
                      className={isCurrentActive ? "text-white" : "text-white/70"}
                    />
                    <span className="font-medium flex-1">{item.label}</span>
                  </>
                </NavLink>
              );
            })}
          </div>

          {/* ==================== Footer Actions ==================== */}

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