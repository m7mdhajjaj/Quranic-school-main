import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
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
  secondaryItems = [],
  className = ''
}) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Toggle category expansion
  const toggleExpand = (label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
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
        <div key={item.label} className="relative">
          {/* Category Button */}
          <button
            onClick={() => toggleExpand(item.label)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all duration-300 ${
              isActive
                ? 'bg-white text-emerald-600 shadow-xl font-semibold'
                : 'text-white/90 hover:text-white hover:bg-white/20 font-medium'
            }`}
          >
            <IconComponent size={18} className="flex-shrink-0" />
            <span className="text-xs sm:text-sm whitespace-nowrap">{item.label}</span>
            <ChevronDown 
              size={16}
              className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown Menu */}
          {isExpanded && (
            <div className="absolute top-full left-0 mt-2 min-w-[200px] bg-white rounded-xl shadow-2xl border border-gray-200 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              {item.subItems.map((subItem) => {
                const SubIconComponent = subItem.icon;
                const isSubActive = checkIsActive(subItem.to, location.pathname);

                return (
                  <NavLink
                    key={subItem.to}
                    to={subItem.to}
                    onClick={() => setExpandedItems([])}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-300 ${
                      isSubActive
                        ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <SubIconComponent size={18} className="flex-shrink-0" />
                    <span className="text-sm">{subItem.label}</span>
                    {isSubActive && (
                      <div className="mr-auto w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
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
        className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all duration-300 ${
          isActive
            ? 'bg-white text-emerald-600 shadow-xl font-semibold scale-105'
            : 'text-white/90 hover:text-white hover:bg-white/20 font-medium'
        }`}
      >
        <IconComponent size={18} className="flex-shrink-0" />
        <span className="text-xs sm:text-sm whitespace-nowrap">{item.label}</span>
      </NavLink>
    );
  };

  return (
    <nav className={`flex flex-col gap-2 sm:gap-3 w-full ${className}`}>
      {/* Primary Navigation Row */}
      {items.length > 0 && (
        <div className="flex items-center justify-center flex-wrap gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl border border-white/20 shadow-lg">
          {items.map(item => renderHorizontalItem(item))}
        </div>
      )}

      {/* Secondary Navigation Row */}
      {secondaryItems.length > 0 && (
        <div className="flex items-center justify-center flex-wrap gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-white/5 backdrop-blur-md rounded-xl sm:rounded-2xl border border-white/10 shadow-md">
          {secondaryItems.map(item => renderHorizontalItem(item))}
        </div>
      )}
    </nav>
  );
};

export default TabNavigation;
