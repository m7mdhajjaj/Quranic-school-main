import { NavLink, useLocation } from "react-router-dom";
import type { NavigationItem } from "../../types/navigation.types";

interface NavItemProps {
  item: NavigationItem;
  className?: string;
}

const NavItem: React.FC<NavItemProps> = ({ item, className = "" }) => {
  const location = useLocation();
  const IconComponent = item.icon;

  return (
    <NavLink
      to={item.to}
      end={item.to === "/"}
      className={({ isActive }) => {
        // تحسين تحديد الحالة النشطة للمسارات الفرعية
        const currentPath = location.pathname;
        let isCurrentActive = isActive;

        // معالجة خاصة للصفحة الرئيسية - تكون نشطة فقط في المسار الدقيق
        if (item.to === "/" && currentPath !== "/") {
          isCurrentActive = false;
        }

        // معالجة المسارات الأخرى - تكون نشطة في المسارات الفرعية أيضاً
        if (item.to !== "/" && !isActive) {
          isCurrentActive = currentPath.startsWith(item.to + "/");
        }

        return `group relative transition-all duration-300 hover:scale-105 ${
          isCurrentActive
            ? "bg-white text-emerald-600 shadow-lg transform scale-105"
            : "text-white hover:bg-white/20"
        } ${className}`;
      }}
    >
      {({ isActive }) => {
        // تحديد الحالة النشطة هنا أيضاً للتناسق
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
            <span className="flex items-center gap-2">
              <IconComponent
                size={20}
                className={`group-hover:scale-125 transition-transform ${
                  isCurrentActive ? "text-emerald-600" : "text-white/70"
                }`}
              />
              <span>{item.label}</span>
            </span>
            {isCurrentActive && (
              <span
                className={`absolute -bottom-3 left-0 right-0 h-1 bg-gradient-to-r ${item.color} rounded-full animate-gradient-slide`}
              ></span>
            )}
          </>
        );
      }}
    </NavLink>
  );
};

export default NavItem;