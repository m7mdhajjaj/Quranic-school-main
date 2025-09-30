import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Avatar from "./Avatar";
import { useAvatar, getUserGender } from "../hooks/useAvatar";
import { useAuth } from "../hooks/useAuth";

const AdminHeader: React.FC = () => {
  const { user: currentUser, logout: authLogout } = useAuth();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const { avatarUrl, avatarLoading } = useAvatar({
    userId: currentUser?._id,
    userRole: currentUser?.role,
  });

  const userGender = getUserGender(currentUser);

  const handleLogout = () => {
    setProfileMenuOpen(false);
    authLogout();
  };

  useEffect(() => {
    if (!currentUser) {
      navigate("/login", { replace: true });
    }
  }, [currentUser, navigate]);

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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-[#009C5C] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* ✅ Logo */}
          <div className="flex items-center">
            <h1 className="text-lg md:text-xl font-bold">لوحة تحكم الإدارة</h1>
          </div>

          {/* ✅ Navigation Links */}
          <nav className="flex space-x-4 rtl:space-x-reverse">
            <button
              onClick={() => navigate("/admin/dashboard")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive("/admin/dashboard")
                  ? "bg-white text-[#009C5C] shadow-sm"
                  : "hover:bg-[#00B26F] hover:text-white"
              }`}>
              الإحصائيات
            </button>
            <button
              onClick={() => navigate("/admin/management")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive("/admin/management")
                  ? "bg-white text-[#009C5C] shadow-sm"
                  : "hover:bg-[#00B26F] hover:text-white"
              }`}>
              الإدارة
            </button>
          </nav>

          {/* ✅ Profile Menu */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center space-x-2 rtl:space-x-reverse text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00B26F]">
              <Avatar
                src={avatarUrl}
                userName={currentUser?.firstName || currentUser?.name}
                gender={userGender}
                loading={avatarLoading}
                size="sm"
              />
              <span className="hidden sm:block font-medium">
                {currentUser?.firstName} {currentUser?.lastName}
              </span>
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${
                  profileMenuOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-md shadow-lg py-1 z-10 border border-gray-200">
                <button
                  onClick={() => navigate("/profile")}
                  className="block w-full text-right px-4 py-2 text-sm hover:bg-gray-100">
                  الملف الشخصي
                </button>
                <button
                  onClick={() => navigate("/change-password")}
                  className="block w-full text-right px-4 py-2 text-sm hover:bg-gray-100">
                  تغيير كلمة المرور
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                  تسجيل الخروج
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
