import { NavLink, useLocation } from 'react-router-dom';
import type { NavigationItem } from '../../types/navigation.types';

interface IconOnlyNavigationProps {
  items: NavigationItem[];
  className?: string;
}

const IconOnlyNavigation: React.FC<IconOnlyNavigationProps> = ({ items, className = '' }) => {
  const location = useLocation();

  const checkIsActive = (itemPath: string): boolean => {
    if (itemPath === '/') {
      return location.pathname === '/';
    }
    return location.pathname === itemPath || location.pathname.startsWith(itemPath + '/');
  };

  return (
    <div className={`hidden xl:flex items-center border-t border-white/30 pt-2.5 ${className}`}>
      <div className="flex-1">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2.5 border border-white/20 shadow-lg">
          <nav className="flex items-center justify-center gap-2 flex-wrap">
            {items.map((item) => {
              const IconComponent = item.icon;
              const isActive = checkIsActive(item.to);

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  title={item.label}
                  className={`group relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-white text-emerald-600 shadow-xl scale-110 ring-2 ring-emerald-200'
                      : 'text-white/85 hover:bg-white/30 hover:text-white hover:scale-110 hover:shadow-md backdrop-blur-sm'
                  }`}
                >
                  <IconComponent 
                    size={17} 
                    className={`transition-all duration-300 ${isActive ? 'text-emerald-600' : 'text-white/85 group-hover:text-white'}`} 
                  />
                  {isActive && (
                    <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-1 bg-gradient-to-r ${item.color} rounded-full shadow-md`} />
                  )}
                  {/* Tooltip */}
                  <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900/95 backdrop-blur-sm text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl transform group-hover:translate-y-0 translate-y-1">
                    {item.label}
                    <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-0 h-0 border-l-4 border-l-transparent border-t-4 border-t-gray-900/95 border-r-4 border-r-transparent"></span>
                  </span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default IconOnlyNavigation;