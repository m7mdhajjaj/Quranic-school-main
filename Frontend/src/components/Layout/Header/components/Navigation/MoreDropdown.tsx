import { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { MoreHorizontal, ChevronLeft, ChevronDown } from 'lucide-react';
import type { NavigationItem } from '../../types/navigation.types';
import { Card } from '@/components/UI';

interface MoreDropdownProps {
  items: NavigationItem[];
  className?: string;
}

const MoreDropdown: React.FC<MoreDropdownProps> = ({ items, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setExpandedItems(new Set());
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setExpandedItems(new Set());
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isOpen]);

  const checkIsActive = (itemPath: string): boolean => {
    if (itemPath === '/') {
      return location.pathname === '/';
    }
    return location.pathname === itemPath || location.pathname.startsWith(itemPath + '/');
  };

  // Check if any item is active
  const hasActiveItem = items.some((item) => {
    if (item.subItems && item.subItems.length > 0) {
      return item.subItems.some((subItem) => checkIsActive(subItem.to));
    }
    return checkIsActive(item.to);
  });

  const toggleSubItems = (itemTo: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemTo)) {
        newSet.delete(itemTo);
      } else {
        newSet.add(itemTo);
      }
      return newSet;
    });
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative transition-all duration-300 hover:scale-105 px-1 sm:px-1.5 md:px-2 lg:px-3 xl:px-4 py-1 sm:py-1.5 md:py-2 rounded-md sm:rounded-lg md:rounded-xl text-[10px] sm:text-xs md:text-sm font-semibold flex items-center gap-0.5 sm:gap-1 md:gap-1.5 whitespace-nowrap flex-shrink-0 ${
          hasActiveItem
            ? 'bg-white text-emerald-600 shadow-xl scale-105'
            : 'text-white/90 hover:text-white hover:bg-white/20 font-medium'
        }`}
        aria-label="المزيد"
        aria-expanded={isOpen}
      >
        <MoreHorizontal
          size={14}
          className={`w-4 h-4 sm:w-[16px] sm:h-[16px] md:w-[18px] md:h-[18px] flex-shrink-0 transition-transform ${hasActiveItem ? 'text-emerald-600' : 'text-white/70'}`}
        />
        <span className="text-[10px] sm:text-xs md:text-sm">المزيد</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 sm:mt-2 w-56 sm:w-64 z-50" dir="rtl">
          <Card
            variant="elevated"
            padding="none"
            className="overflow-hidden bg-white border border-emerald-200 shadow-2xl rounded-2xl"
          >
            <div className="py-2 max-h-[500px] overflow-y-auto">
              {items.map((item) => {
                const IconComponent = item.icon;
                const isActive = checkIsActive(item.to);
                const hasActiveSubItem = item.subItems?.some((subItem) => checkIsActive(subItem.to));
                const isItemActive = isActive || hasActiveSubItem;
                const isExpanded = expandedItems.has(item.to);
                const hasSubItems = item.subItems && item.subItems.length > 0;

                return (
                  <div key={item.to}>
                    {hasSubItems ? (
                      <div>
                        <button
                          onClick={() => toggleSubItems(item.to)}
                          className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm font-medium transition-all ${
                            isItemActive
                              ? 'bg-emerald-50 text-emerald-600 border-r-2 border-emerald-600'
                              : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600'
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <IconComponent
                              size={18}
                              className={isItemActive ? 'text-emerald-600' : 'text-gray-500'}
                            />
                            <span className="flex-1 text-right">{item.label}</span>
                          </div>
                          <ChevronDown
                            size={16}
                            className={`transition-transform duration-200 ${
                              isExpanded ? 'rotate-180' : ''
                            } text-gray-400`}
                          />
                        </button>
                        {isExpanded && item.subItems && (
                          <div className="mr-4 bg-emerald-50/50 rounded-lg p-1">
                            {item.subItems.map((subItem) => {
                              const SubIconComponent = subItem.icon;
                              const isSubActive = checkIsActive(subItem.to);

                              return (
                                <NavLink
                                  key={subItem.to}
                                  to={subItem.to}
                                  onClick={() => {
                                    setIsOpen(false);
                                    setExpandedItems(new Set());
                                  }}
                                  className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all ${
                                    isSubActive
                                      ? 'bg-emerald-100 text-emerald-700 font-semibold'
                                      : 'text-gray-600 hover:bg-emerald-100 hover:text-emerald-600'
                                  }`}
                                >
                                  <SubIconComponent
                                    size={16}
                                    className={isSubActive ? 'text-emerald-600' : 'text-gray-500'}
                                  />
                                  <span className="flex-1">{subItem.label}</span>
                                </NavLink>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ) : (
                      <NavLink
                        to={item.to}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-600 border-r-2 border-emerald-600'
                            : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600'
                        }`}
                      >
                        <IconComponent
                          size={18}
                          className={isActive ? 'text-emerald-600' : 'text-gray-500'}
                        />
                        <span className="flex-1">{item.label}</span>
                        <ChevronLeft size={16} className="text-gray-400" />
                      </NavLink>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MoreDropdown;