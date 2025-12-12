import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Menu } from "lucide-react";
import { NotificationHeader } from "@/components/Notifications";

const AdminHeader: React.FC<{ onMenuToggle?: () => void }> = ({ onMenuToggle }) => {
  const { user: currentUser } = useAuth();
  const location = useLocation();

  // Get breadcrumbs from location
  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path === "/admin/dashboard" || path === "/admin" || path === "/") {
      return { main: "الرئيسية", current: "لوحة التحكم" };
    } else if (path.startsWith("/admin/students")) {
      return { main: "الرئيسية", current: "الطلاب" };
    } else if (path.startsWith("/admin/teachers")) {
      return { main: "الرئيسية", current: "المعلمين" };
    } else if (path.startsWith("/admin/groups")) {
      return { main: "الرئيسية", current: "الحلقات" };
    } else if (path.startsWith("/admin/settings")) {
      return { main: "الرئيسية", current: "الإعدادات" };
    }
    return { main: "الرئيسية", current: "لوحة التحكم" };
  };

  const breadcrumbs = getBreadcrumbs();

  if (!currentUser) return null;

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-40 bg-white shadow-md border-b border-gray-200"
        dir="rtl">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Right Side - Menu & Breadcrumbs */}
            <div className="flex items-center gap-4">
              {/* Hamburger Menu */}
              <button
                onClick={onMenuToggle}
                aria-label="Toggle menu"
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700">
                <Menu size={20} />
              </button>

              {/* Breadcrumbs */}
              <div className="flex items-center gap-2 text-sm">
                <Link
                  to="/admin/dashboard"
                  className="text-gray-600 hover:text-green-600 transition-colors">
                  {breadcrumbs.main}
                </Link>
                <span className="text-gray-400">/</span>
                <span className="text-gray-900 font-medium">{breadcrumbs.current}</span>
              </div>
            </div>

            {/* Center - Welcome Message */}
            <div className="flex-1 flex justify-center items-center">
              <div className="text-center">
                <h2 className="text-lg font-bold text-gray-800">
                  مرحباً بك، {currentUser?.firstName || "المدير"}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  لوحة تحكم المدرسة القرآنية
                </p>
              </div>
            </div>

            {/* Left Side - Icons */}
            <div className="flex items-center gap-4">
              {/* Icons */}
              <div className="flex items-center gap-3">
                {/* Notifications */}
                <div className="relative">
                  <NotificationHeader userId={currentUser._id} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default AdminHeader;

