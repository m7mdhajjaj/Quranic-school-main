import { NavLink, useLocation } from "react-router-dom";
import type { NavigationProps } from "../../types/navigation.types";

const SecondaryNavigation: React.FC<NavigationProps> = ({ items, className = "" }) => {
  const location = useLocation();

  return (
    <div className={`hidden xl:flex items-center border-t border-white/20 py-3 ${className}`}>
      <div className="flex-1">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-2.5 border border-white/20">
          <nav className="flex items-center justify-center gap-2">
            {items.map((item) => {
              const IconComponent = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) => {
                    const currentPath = location.pathname;
                    let isCurrentActive = isActive;

                    if (item.to === "/" && currentPath !== "/") {
                      isCurrentActive = false;
                    }

                    if (item.to !== "/" && !isActive) {
                      isCurrentActive = currentPath.startsWith(item.to + "/");
                    }

                    return `group relative px-3 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap hover:scale-105 ${
                      isCurrentActive
                        ? "bg-white text-emerald-600 shadow-lg border border-emerald-200 transform scale-105"
                        : "text-emerald-100 hover:bg-white/20 hover:text-white"
                    }`;
                  }}
                >
                  {({ isActive }) => {
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
                        <IconComponent
                          size={18}
                          className={
                            isCurrentActive ? "text-emerald-600" : "text-emerald-100"
                          }
                        />
                        <span>{item.label}</span>
                        {isCurrentActive && (
                          <span
                            className={`absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r ${item.color} rounded-full animate-gradient-slide`}
                          ></span>
                        )}
                      </>
                    );
                  }}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default SecondaryNavigation;