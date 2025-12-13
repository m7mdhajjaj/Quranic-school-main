import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  BarChart3,
  Users,
  UserPlus,
  BookOpen,
  Clock,
  MessageSquare,
  User,
  Key,
  LogOut,
  Menu,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { showLogoutConfirmation } from "@/pages/Auth/LogOut/logoutUtils";
import { ChangePasswordModal } from "@/pages/Auth/ChangePass";

interface SidebarItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  children?: SidebarItem[];
}

interface AdminSidebarProps {
  isCollapsed?: boolean;
  isMobileOpen?: boolean;
  onToggle?: () => void;
  onMobileToggle?: () => void;
  onMobileClose?: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  isCollapsed = false, 
  isMobileOpen = false,
  onToggle,
  onMobileClose 
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: currentUser, logout: authLogout } = useAuth();
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  const sidebarItems: SidebarItem[] = [
    {
      to: "/admin/dashboard",
      label: "لوحة التحكم",
      icon: BarChart3,
    },
    {
      to: "/admin/students",
      label: "الطلاب",
      icon: Users,
    },
    {
      to: "/admin/teachers",
      label: "المعلمين",
      icon: UserPlus,
    },
    {
      to: "/admin/groups",
      label: "الحلقات",
      icon: BookOpen,
    },
    {
      to: "/timetable",
      label: "المواعيد",
      icon: Clock,
    },
    {
      to: "/chat",
      label: "المحادثة",
      icon: MessageSquare,
    },
  ];

  const isActive = (path: string): boolean => {
    if (path === "/") return location.pathname === "/";
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const handleLogout = async () => {
    await showLogoutConfirmation({
      userType: "user",
      onConfirm: () => {
        authLogout();
      },
    });
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleChangePasswordClick = () => {
    setIsChangePasswordModalOpen(true);
  };

  return (
    <>
      {/* Mobile Sidebar */}
      <aside
        className={`fixed right-0 top-14 sm:top-16 h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] bg-gradient-to-b from-emerald-50 via-green-50 to-teal-50 border-l border-emerald-100 shadow-xl z-40 overflow-y-auto overflow-x-hidden transition-all duration-300 lg:hidden ${
          isMobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
        dir="rtl"
        style={{ width: "280px" }}>
        {/* Mobile Navigation */}
        <nav className="p-4 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onMobileClose}
                className={`
                  group relative flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200
                  ${active
                    ? "bg-white text-emerald-700 shadow-md"
                    : "text-emerald-600 hover:bg-white/60 hover:text-emerald-700"
                  }
                `}>
                {active && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-500 rounded-l-full" />
                )}
                <div className={`
                  flex-shrink-0 transition-colors duration-200
                  ${active ? "text-emerald-600" : "text-emerald-500 group-hover:text-emerald-600"}
                `}>
                  <Icon size={22} />
                </div>
                <span className="font-medium text-sm flex-1">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Mobile User Section */}
        {currentUser && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-emerald-200 bg-white/50 backdrop-blur-sm">
            <div className="space-y-2">
              <button
                onClick={() => {
                  handleProfileClick();
                  onMobileClose?.();
                }}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-emerald-600 hover:bg-white hover:text-emerald-700 transition-all duration-200 font-medium text-sm">
                <User size={20} />
                <span>الملف الشخصي</span>
              </button>
              <button
                onClick={() => {
                  handleChangePasswordClick();
                  onMobileClose?.();
                }}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-emerald-600 hover:bg-white hover:text-emerald-700 transition-all duration-200 font-medium text-sm">
                <Key size={20} />
                <span>تغيير كلمة المرور</span>
              </button>
              <button
                onClick={() => {
                  handleLogout();
                  onMobileClose?.();
                }}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 font-medium text-sm">
                <LogOut size={20} />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block fixed right-0 top-16 h-[calc(100vh-4rem)] bg-gradient-to-b from-emerald-50 via-green-50 to-teal-50 border-l border-emerald-100 shadow-xl z-40 overflow-y-auto overflow-x-hidden transition-all duration-300`}
        dir="rtl"
        style={{ width: isCollapsed ? "80px" : "280px" }}>
      
      {/* Toggle Button */}
      {onToggle && (
        <div className="p-4 border-b border-emerald-200">
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-center p-2 rounded-2xl hover:bg-white/60 transition-all duration-200 text-emerald-600">
            <Menu size={20} />
          </button>
        </div>
      )}

      {/* Navigation Items */}
      <nav className="p-4 space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => {
                const active = isActive;
                return `
                  group relative flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200
                  ${active
                    ? "bg-white text-emerald-700 shadow-md"
                    : "text-emerald-600 hover:bg-white/60 hover:text-emerald-700"
                  }
                  ${isCollapsed ? "justify-center" : ""}
                `;
              }}
              title={isCollapsed ? item.label : undefined}>
              {({ isActive }) => (
                <>
                  {/* Active Indicator Bar */}
                  {isActive && !isCollapsed && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-500 rounded-l-full" />
                  )}
                  
                  {/* Icon */}
                  <div className={`
                    flex-shrink-0 transition-colors duration-200
                    ${isActive ? "text-emerald-600" : "text-emerald-500 group-hover:text-emerald-600"}
                  `}>
                    <Icon size={isCollapsed ? 24 : 22} />
                  </div>
                  
                  {/* Label */}
                  {!isCollapsed && (
                    <span className="font-medium text-sm flex-1">{item.label}</span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Section */}
      {!isCollapsed && currentUser && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-emerald-200 bg-white/50 backdrop-blur-sm">
          <div className="space-y-2">
            <button
              onClick={handleProfileClick}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-emerald-600 hover:bg-white hover:text-emerald-700 transition-all duration-200 font-medium text-sm">
              <User size={20} />
              <span>الملف الشخصي</span>
            </button>
            <button
              onClick={handleChangePasswordClick}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-emerald-600 hover:bg-white hover:text-emerald-700 transition-all duration-200 font-medium text-sm">
              <Key size={20} />
              <span>تغيير كلمة المرور</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 font-medium text-sm">
              <LogOut size={20} />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
      </aside>
    </>
  );
};

export default AdminSidebar;

