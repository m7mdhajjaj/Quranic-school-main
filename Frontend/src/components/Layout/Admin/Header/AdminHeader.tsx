import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Bell, ChevronDown, Menu } from "lucide-react";
import { NotificationHeader } from "@/components/Notifications";
import Avatar from "@/components/Avatar/Avatar";
import ProfileMenu from "../../ProfileMenu";
import { showLogoutConfirmation } from "@/pages/Auth/LogOut/logoutUtils";
import { ChangePasswordModal } from "@/pages/Auth/ChangePass";

interface AdminHeaderProps {
  onMenuToggle?: () => void;
  onChangePasswordClick?: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onMenuToggle, onChangePasswordClick }) => {
  const { user: currentUser, logout: authLogout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Get page title and breadcrumbs from location
  const getPageInfo = () => {
    const path = location.pathname;
    if (path === "/admin/dashboard" || path === "/admin" || path === "/") {
      return { title: "لوحة التحكم", breadcrumb: "الرئيسية / لوحة التحكم" };
    } else if (path.startsWith("/admin/students")) {
      return { title: "الطلاب", breadcrumb: "الرئيسية / الطلاب" };
    } else if (path.startsWith("/admin/teachers")) {
      return { title: "المعلمين", breadcrumb: "الرئيسية / المعلمين" };
    } else if (path.startsWith("/admin/groups")) {
      return { title: "الحلقات", breadcrumb: "الرئيسية / الحلقات" };
    } else if (path.startsWith("/admin/settings")) {
      return { title: "الإعدادات", breadcrumb: "الرئيسية / الإعدادات" };
    }
    return { title: "لوحة التحكم", breadcrumb: "الرئيسية / لوحة التحكم" };
  };

  const pageInfo = getPageInfo();

  const handleLogout = async () => {
    await showLogoutConfirmation({
      userType: "user",
      onConfirm: () => {
        setProfileMenuOpen(false);
        authLogout();
      },
    });
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleChangePasswordClick = () => {
    setProfileMenuOpen(false);
    onChangePasswordClick?.();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!currentUser) return null;

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 h-14 sm:h-16 bg-gradient-to-b from-indigo-50 via-slate-50 to-blue-50 shadow-lg border-b border-indigo-100"
        dir="rtl">
        <div className="max-w-full mx-auto px-3 sm:px-4 lg:px-6 h-full">
          <div className="flex items-center justify-between h-full gap-2 sm:gap-4">
            {/* Right Side - Menu Button (Mobile) & Page Title & Breadcrumb */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-6 min-w-0 flex-1">
              {/* Mobile Menu Button */}
              {onMenuToggle && (
                <button
                  onClick={onMenuToggle}
                  className="lg:hidden p-2 rounded-xl hover:bg-white/60 text-indigo-700 transition-colors duration-200">
                  <Menu size={20} />
                </button>
              )}
              <div className="flex flex-col min-w-0">
                <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-tight truncate">
                  {pageInfo.title}
                </h1>
                <p className="text-[10px] sm:text-xs text-indigo-600 mt-0.5 hidden sm:block">
                  {pageInfo.breadcrumb}
                </p>
              </div>
            </div>

            {/* Left Side - Notifications & User Menu */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-shrink-0">
              {/* Notifications */}
              <div className="relative">
                <NotificationHeader userId={currentUser._id} />
              </div>

              {/* User Menu */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-white/60 hover:bg-white border border-indigo-200 shadow-sm hover:shadow-md transition-all duration-200 group">
                  <Avatar
                    user={currentUser}
                    size="sm"
                    border="none"
                    className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9"
                    showStatus={true}
                  />
                  <div className="flex flex-col items-start hidden sm:flex">
                    <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate max-w-[80px] lg:max-w-none">
                      {currentUser?.firstName || "المدير"}
                    </span>
                    <span className="text-[10px] sm:text-xs text-gray-500">
                      {currentUser?.role === "admin" ? "مدير" : "مستخدم"}
                    </span>
                  </div>
                  <ChevronDown
                    size={14}
                    className={`text-gray-600 transition-transform duration-200 hidden sm:block ${
                      profileMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <ProfileMenu
                  user={currentUser}
                  isOpen={profileMenuOpen}
                  onClose={() => setProfileMenuOpen(false)}
                  onProfileClick={handleProfileClick}
                  onChangePasswordClick={handleChangePasswordClick}
                  onLogout={handleLogout}
                />
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default AdminHeader;

