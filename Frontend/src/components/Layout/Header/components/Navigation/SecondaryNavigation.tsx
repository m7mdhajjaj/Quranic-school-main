import { NavLink, useLocation } from "react-router-dom";
import type { NavigationProps } from "../../types/navigation.types";

const SecondaryNavigation: React.FC<NavigationProps> = ({ items, className = "" }) => {
  const location = useLocation();

  // دالة لتحديد ما إذا كان الرابط نشطاً
  const checkIsActive = (itemPath: string, currentPath: string): boolean => {
    // الصفحة الرئيسية تكون نشطة فقط عندما نكون في المسار الدقيق "/"
    if (itemPath === "/") {
      return currentPath === "/";
    }

    // باقي الصفحات تكون نشطة إذا كان المسار الحالي يبدأ بمسار العنصر
    return currentPath === itemPath || currentPath.startsWith(itemPath + "/");
  };

  // Show first 8 items, rest in scrollable area or dropdown
  const maxVisibleItems = 8;
  const visibleItems = items.slice(0, maxVisibleItems);
  const scrollableItems = items.slice(maxVisibleItems);

  return (
    <div className={`hidden xl:flex items-center border-t border-white/20 py-2 ${className}`}>
      <div className="flex-1">
        <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 border border-white/20">
          <nav className="flex items-center justify-center gap-1.5">
            {visibleItems.map((item) => {
              const IconComponent = item.icon;
              const isCurrentActive = checkIsActive(item.to, location.pathname);

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={() => {
                    return `group relative px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap hover:scale-105 ${
                      isCurrentActive
                        ? "bg-white text-emerald-600 shadow-md border border-emerald-200 transform scale-105"
                        : "text-emerald-100 hover:bg-white/20 hover:text-white"
                    }`;
                  }}
                  title={item.label}
                >
                  <>
                    <IconComponent
                      size={14}
                      className={
                        isCurrentActive ? "text-emerald-600" : "text-emerald-100"
                      }
                    />
                    <span className="hidden 2xl:inline">{item.label}</span>
                    {isCurrentActive && (
                      <span
                        className={`absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r ${item.color} rounded-full`}
                      ></span>
                    )}
                  </>
                </NavLink>
              );
            })}
            {scrollableItems.length > 0 && (
              <div className="flex items-center gap-1.5 px-2 border-r border-white/20">
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide max-w-[400px]">
                  {scrollableItems.map((item) => {
                    const IconComponent = item.icon;
                    const isCurrentActive = checkIsActive(item.to, location.pathname);

                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={() => {
                          return `group relative px-2 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap hover:scale-105 ${
                            isCurrentActive
                              ? "bg-white text-emerald-600 shadow-md border border-emerald-200 transform scale-105"
                              : "text-emerald-100 hover:bg-white/20 hover:text-white"
                          }`;
                        }}
                        title={item.label}
                      >
                        <>
                          <IconComponent
                            size={14}
                            className={
                              isCurrentActive ? "text-emerald-600" : "text-emerald-100"
                            }
                          />
                          <span>{item.label}</span>
                          {isCurrentActive && (
                            <span
                              className={`absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r ${item.color} rounded-full`}
                            ></span>
                          )}
                        </>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            )}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default SecondaryNavigation;