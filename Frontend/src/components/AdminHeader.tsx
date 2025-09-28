import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Avatar from "./Avatar";
import { useAvatar, getUserGender } from "../hooks/useAvatar";

interface User {
  _id: string;
  name: string;
  role?: "student" | "teacher" | "admin" | string;
  firstName?: string;
  lastName?: string;
}



const AdminHeader: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Use the reusable avatar hook
  const { avatarUrl, avatarLoading } = useAvatar({
    userId: currentUser?._id,
    userRole: currentUser?.role,
  });

  const userGender = getUserGender(currentUser);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setCurrentUser(null);
    setProfileMenuOpen(false);
    navigate("/login", { replace: true });
  };



  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        const userData = JSON.parse(userJson) as User;
        setCurrentUser(userData);
      } catch (err) {
        console.error("Error parsing user data:", err);
        navigate("/login", { replace: true });
      }
    }
  }, [navigate]);

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
    <header className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">
              لوحة تحكم الإدارة
            </h1>
          </div>

          {/* Navigation Links */}
          <nav className="flex space-x-8">
            <button
              onClick={() => navigate("/admin/dashboard")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive("/admin/dashboard")
                  ? "bg-blue-100 text-blue-700 border-b-2 border-blue-500"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}>
              الإحصائيات
            </button>
            <button
              onClick={() => navigate("/admin/management")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive("/admin/management")
                  ? "bg-blue-100 text-blue-700 border-b-2 border-blue-500"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}>
              الإدارة
            </button>
          </nav>

          {/* Profile Menu */}
          <div className="flex items-center space-x-4">
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center space-x-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <Avatar
                  src={avatarUrl}
                  userName={currentUser?.firstName || currentUser?.name}
                  gender={userGender}
                  loading={avatarLoading}
                  size="sm"
                />
                <span className="text-gray-700">
                  {currentUser?.firstName} {currentUser?.lastName}
                </span>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
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
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                  <button
                    onClick={() => navigate("/profile")}
                    className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    الملف الشخصي
                  </button>
                  <button
                    onClick={() => navigate("/change-password")}
                    className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
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
      </div>
    </header>
  );
};

export default AdminHeader;
