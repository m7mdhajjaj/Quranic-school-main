import { NavLink, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

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
  className = ''
}) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const navRef = useRef<HTMLElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setExpandedItems([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toggle category expansion (Exclusive - close others)
  const toggleExpand = (label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) 
        ? []
        : [label]
    );
  };

  // Check if category has active item
  const hasActiveItem = (categoryItems: NavigationItem[]) => {
    return categoryItems.some(item => checkIsActive(item.to, location.pathname));
  };

  // Render horizontal item with dropdown
  const renderHorizontalItem = (item: NavigationItem) => {
    const IconComponent = item.icon;
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = expandedItems.includes(item.label);
    const isActive = hasSubItems 
      ? hasActiveItem(item.subItems)
      : checkIsActive(item.to, location.pathname);

    if (hasSubItems) {
      return (
        <div key={item.label} className="relative group">
          {/* Category Button */}
          <button
            onClick={() => toggleExpand(item.label)}
            className={`flex items-center gap-1 xl:gap-1.5 2xl:gap-2 px-2 xl:px-3 2xl:px-4 py-1.5 xl:py-2 2xl:py-2.5 rounded-xl transition-all duration-300 ${
              isActive
                ? 'bg-white text-emerald-600 shadow-xl font-semibold'
                : 'text-white/90 hover:text-white hover:bg-white/20 font-medium'
            }`}
          >
            <IconComponent className="flex-shrink-0 w-4 h-4 xl:w-[18px] xl:h-[18px]" />
            <span className="text-[10px] xl:text-xs 2xl:text-sm whitespace-nowrap">{item.label}</span>
            <ChevronDown 
              className={`w-3 h-3 xl:w-3.5 xl:h-3.5 2xl:w-4 2xl:h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown Menu - RTL aligned (right-0) */}
          {isExpanded && (
            <div className="absolute top-full right-0 mt-2 min-w-[180px] xl:min-w-[200px] 2xl:min-w-[220px] bg-white rounded-xl shadow-2xl border border-gray-200 p-1.5 xl:p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              {item.subItems!.map((subItem) => {
                const SubIconComponent = subItem.icon;
                const isSubActive = checkIsActive(subItem.to, location.pathname);

                return (
                  <NavLink
                    key={subItem.to}
                    to={subItem.to}
                    onClick={() => setExpandedItems([])}
                    className={`flex items-center gap-2 xl:gap-3 px-3 xl:px-4 py-2 xl:py-2.5 rounded-lg transition-all duration-300 ${
                      isSubActive
                        ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <SubIconComponent size={16} className="flex-shrink-0" />
                    <span className="text-xs xl:text-sm">{subItem.label}</span>
                    {isSubActive && (
                      <div className="mr-auto w-1.5 h-1.5 xl:w-2 xl:h-2 bg-emerald-500 rounded-full animate-pulse" />
                    )}
                  </NavLink>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    // Simple item without subItems
    return (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.to === '/'}
        className={`flex items-center gap-1 xl:gap-1.5 2xl:gap-2 px-2 xl:px-3 2xl:px-4 py-1.5 xl:py-2 2xl:py-2.5 rounded-xl transition-all duration-300 ${
          isActive
            ? 'bg-white text-emerald-600 shadow-xl font-semibold scale-105'
            : 'text-white/90 hover:text-white hover:bg-white/20 font-medium'
        }`}
      >
        <IconComponent className="flex-shrink-0 w-4 h-4 xl:w-[18px] xl:h-[18px]" />
        <span className="text-[10px] xl:text-xs 2xl:text-sm whitespace-nowrap">{item.label}</span>
      </NavLink>
    );
  };

  return (
    <nav ref={navRef} className={`flex items-center justify-center w-full ${className}`}>
      {/* Navigation Row */}
      {items.length > 0 && (
        <div className="flex items-center justify-center flex-nowrap gap-0.5 xl:gap-1 2xl:gap-1.5">
          {items.map(item => renderHorizontalItem(item))}
        </div>
      )}
    </nav>
  );
};


export default TabNavigation;
