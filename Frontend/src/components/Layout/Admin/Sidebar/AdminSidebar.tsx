import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  BarChart3,
  Users,
  UserPlus,
  BookOpen,
  Clock,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  User,
  Key,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Avatar from "@/components/Avatar/Avatar";
import { showLogoutConfirmation } from "@/pages/Auth/LogOut/logoutUtils";
import { ChangePasswordModal } from "@/pages/Auth/ChangePass";

interface SidebarItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  children?: SidebarItem[];
}

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: currentUser, logout: authLogout } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  const sidebarItems: SidebarItem[] = [
    {
      to: "/admin/dashboard",
      label: "لوحة التحكم",
      icon: BarChart3,
    },
    {
      to: "/admin/students",
      label: "إدارة الطلاب",
      icon: Users,
    },
    {
      to: "/admin/teachers",
      label: "إدارة المعلمين",
      icon: UserPlus,
    },
    {
      to: "/admin/groups",
      label: "إدارة الحلقات",
      icon: BookOpen,
    },
    {
      to: "/timetable",
      label: "مواعيد الحلقات",
      icon: Clock,
    },
    {
      to: "/chat",
      label: "المحادثة",
      icon: MessageSquare,
    },
  ];

  const toggleExpand = (path: string) => {
    setExpandedItems((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  };

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
    <aside
      className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-64 bg-gradient-to-b from-green-800 to-green-900 text-white shadow-2xl z-40 overflow-y-auto"
      dir="rtl">
      {/* Admin Info Section */}
      {currentUser && (
        <div className="p-4 border-b border-green-700">
          <div className="flex items-center gap-3">
            <Avatar
              user={currentUser}
              size="md"
              border="none"
              className="w-12 h-12"
              showStatus={true}
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-sm truncate">
                {currentUser.firstName && currentUser.lastName
                  ? `${currentUser.firstName} ${currentUser.lastName}`
                  : currentUser.firstName || "المدير"}
              </h3>
              <p className="text-green-200 text-xs truncate">
                {currentUser.email || "مدير النظام"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Items */}
      <nav className="p-4 pb-32">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to);
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expandedItems.includes(item.to);

          return (
            <div key={item.to}>
              {hasChildren ? (
                <>
                  <button
                    onClick={() => toggleExpand(item.to)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg mb-2 transition-all duration-200 ${
                      active
                        ? "bg-green-600 text-white shadow-lg"
                        : "text-green-100 hover:bg-green-700 hover:text-white"
                    }`}>
                    <div className="flex items-center gap-3">
                      <Icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown size={18} />
                    ) : (
                      <ChevronRight size={18} />
                    )}
                  </button>
                  {isExpanded && item.children && (
                    <div className="mr-4 mb-2 space-y-1">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;
                        const childActive = isActive(child.to);
                        return (
                          <NavLink
                            key={child.to}
                            to={child.to}
                            className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                              childActive
                                ? "bg-green-700 text-white"
                                : "text-green-200 hover:bg-green-700 hover:text-white"
                            }`}>
                            <ChildIcon size={16} />
                            <span>{child.label}</span>
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <NavLink
                  to={item.to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all duration-200 ${
                    active
                      ? "bg-green-600 text-white shadow-lg"
                      : "text-green-100 hover:bg-green-700 hover:text-white"
                  }`}>
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              )}
            </div>
          );
        })}
      </nav>

      {/* Settings Section */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-green-700 bg-green-900">
        <div className="p-4 space-y-1">
          <button
            onClick={handleProfileClick}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-green-100 hover:bg-green-700 hover:text-white">
            <User size={20} />
            <span className="font-medium">الملف الشخصي</span>
          </button>
          <button
            onClick={handleChangePasswordClick}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-green-100 hover:bg-green-700 hover:text-white">
            <Key size={20} />
            <span className="font-medium">تغيير كلمة المرور</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-red-300 hover:bg-red-600 hover:text-white">
            <LogOut size={20} />
            <span className="font-medium">تسجيل الخروج</span>
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
    </aside>
  );
};

export default AdminSidebar;

