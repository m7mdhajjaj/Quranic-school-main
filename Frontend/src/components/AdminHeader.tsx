import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";

interface User {
  _id: string;
  name: string;
  role?: "student" | "teacher" | "admin" | string;
  firstName?: string;
  lastName?: string;
}

const API_ORIGIN = API_BASE_URL;

const api = axios.create({
  baseURL: API_ORIGIN,
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const AdminHeader: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [avatarLoading, setAvatarLoading] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setAvatarUrl("");
    setAvatarLoading(false);
    setCurrentUser(null);
    setProfileMenuOpen(false);
    navigate("/login", { replace: true });
  };

  const fetchUserAvatar = (userId: string, role: string) => {
    if (!userId) return;
    setAvatarLoading(true);

    const minLoadingTime = 300;
    const startTime = Date.now();

    const token = localStorage.getItem("token");
    const endpoint = role === "student" ? "students" : "teachers";
    const avatarUrl = `${API_ORIGIN}/api/${endpoint}/${userId}/avatar?t=${Date.now()}${
      token ? `&token=${token}` : ""
    }`;

    const img = new Image();
    const handleLoadComplete = (success: boolean, url?: string) => {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

      setTimeout(() => {
        if (success && url) {
          setAvatarUrl(url);
        } else {
          setAvatarUrl("");
        }
        setAvatarLoading(false);
      }, remainingTime);
    };

    const timeout = setTimeout(() => {
      img.onload = null;
      img.onerror = null;
      handleLoadComplete(false);
    }, 8000);

    img.onload = () => {
      clearTimeout(timeout);
      handleLoadComplete(true, avatarUrl);
    };
    img.onerror = () => {
      clearTimeout(timeout);
      handleLoadComplete(false);
    };

    img.src = avatarUrl;
  };

  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        const userData = JSON.parse(userJson) as User;
        setCurrentUser(userData);
        if (userData._id && userData.role) {
          fetchUserAvatar(userData._id, userData.role);
        }
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
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  {avatarLoading ? (
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-600 font-medium">
                      {currentUser?.firstName?.charAt(0) || "A"}
                    </span>
                  )}
                </div>
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
