import { NavLink, useLocation } from "react-router-dom";
import type { NavigationItem } from "../../types/navigation.types";

interface NavItemProps {
  item: NavigationItem;
  className?: string;
}

const NavItem: React.FC<NavItemProps> = ({ item, className = "" }) => {
  const location = useLocation();
  const IconComponent = item.icon;

  // دالة لتحديد ما إذا كان الرابط نشطاً
  const checkIsActive = (currentPath: string): boolean => {
    // الصفحة الرئيسية تكون نشطة فقط عندما نكون في المسار الدقيق "/"
    if (item.to === "/") {
      return currentPath === "/";
    }

    // باقي الصفحات تكون نشطة إذا كان المسار الحالي يبدأ بمسار العنصر
    return currentPath === item.to || currentPath.startsWith(item.to + "/");
  };

  const isCurrentActive = checkIsActive(location.pathname);

  return (
    <NavLink
      to={item.to}
      className={() => {
        return `group relative transition-all duration-200 hover:scale-105 ${
          isCurrentActive
            ? "bg-white text-emerald-600 shadow-md transform scale-105"
            : "text-white hover:bg-white/20"
        } ${className}`;
      }}
    >
      <>
        <span className="flex items-center gap-1.5">
          <IconComponent
            size={16}
            className={`group-hover:scale-110 transition-transform ${
              isCurrentActive ? "text-emerald-600" : "text-white/70"
            }`}
          />
          <span>{item.label}</span>
        </span>
        {isCurrentActive && (
          <span
            className={`absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r ${item.color} rounded-full`}
          ></span>
        )}
      </>
    </NavLink>
  );
};

export default NavItem;