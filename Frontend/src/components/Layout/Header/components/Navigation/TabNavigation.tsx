import { NavLink, useLocation } from 'react-router-dom';
import { useRef } from 'react';

// Components
import DropdownNavItem from './DropdownNavItem';

// Utils
import { checkIsActive } from '../../utils/navigation.utils';

// Types
import type { NavigationItem } from '../../types/navigation.types';

interface TabNavigationProps {
  items: NavigationItem[];
  secondaryItems?: NavigationItem[];
  className?: string;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ 
  items, 
  secondaryItems = [],
  className = ''
}) => {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);

  // Merge all items (primary + secondary)
  const allItems = [...items, ...secondaryItems];

  return (
    <nav className={`flex items-center gap-1 sm:gap-1.5 min-w-0 w-full ${className}`}>
      <div 
        ref={containerRef}
        className="flex items-center gap-0.5 sm:gap-1 md:gap-1.5 overflow-x-auto scrollbar-hide px-0.5 sm:px-1 md:px-2 lg:px-3 py-1 sm:py-1.5 bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl md:rounded-2xl border border-white/20 shadow-lg w-full min-w-0"
      >
        {allItems.map((item) => {
          // If item has subItems, use DropdownNavItem
          if (item.subItems && item.subItems.length > 0) {
            return <DropdownNavItem key={item.to} item={item} />;
          }

          // Otherwise use regular NavLink
          const IconComponent = item.icon;
          const isActive = checkIsActive(item.to, location.pathname);

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={() => {
                return `group relative flex items-center gap-0.5 sm:gap-1 md:gap-1.5 lg:gap-2 px-1 sm:px-1.5 md:px-2 lg:px-3 xl:px-4 py-1 sm:py-1.5 md:py-2 rounded-md sm:rounded-lg md:rounded-xl transition-all duration-300 whitespace-nowrap isolation-auto flex-shrink-0 ${
                  isActive
                    ? 'bg-white text-emerald-600 shadow-xl scale-105 font-semibold z-10'
                    : 'text-white/90 hover:text-white hover:bg-white/20 font-medium'
                }`;
              }}
            >
              <>
                <IconComponent size={14} className="w-4 h-4 sm:w-[16px] sm:h-[16px] md:w-[18px] md:h-[18px] flex-shrink-0" />
                <span className="text-[10px] sm:text-xs md:text-sm font-medium">{item.label}</span>
              </>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default TabNavigation;
