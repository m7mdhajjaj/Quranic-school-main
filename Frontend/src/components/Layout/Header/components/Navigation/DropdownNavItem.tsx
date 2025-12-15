import { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import type { NavigationItem } from '../../types/navigation.types';

interface DropdownNavItemProps {
  item: NavigationItem;
  className?: string;
}

const DropdownNavItem: React.FC<DropdownNavItemProps> = ({ item, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const IconComponent = item.icon;

  // التحقق من وجود عنصر نشط في القائمة المنسدلة
  const hasActiveSubItem = item.subItems?.some((subItem) => {
    if (subItem.to === '/') {
      return location.pathname === '/';
    }
    return location.pathname === subItem.to || location.pathname.startsWith(subItem.to + '/');
  });

  // التحقق من أن العنصر نفسه نشط
  const isActive = item.to === '/' 
    ? location.pathname === '/' 
    : location.pathname === item.to || location.pathname.startsWith(item.to + '/');

  const isItemActive = isActive || hasActiveSubItem;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // إغلاق القائمة عند الضغط على ESC
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isOpen]);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative flex items-center gap-0.5 sm:gap-1 md:gap-1.5 lg:gap-2 px-1 sm:px-1.5 md:px-2 lg:px-3 xl:px-4 py-1 sm:py-1.5 md:py-2 rounded-md sm:rounded-lg md:rounded-xl transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
          isItemActive
            ? 'bg-white text-emerald-600 shadow-xl scale-105 font-semibold'
            : 'text-white/90 hover:text-white hover:bg-white/20 font-medium'
        }`}
        aria-label={item.label}
        aria-expanded={isOpen}
      >
        <IconComponent size={14} className="w-4 h-4 sm:w-[16px] sm:h-[16px] md:w-[18px] md:h-[18px] flex-shrink-0" />
        <span className="text-[10px] sm:text-xs md:text-sm">{item.label}</span>
        <ChevronDown
          size={12}
          className={`w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          } ${isItemActive ? 'text-emerald-600' : 'text-white/70'}`}
        />
      </button>

      {isOpen && item.subItems && item.subItems.length > 0 && (
        <div className="absolute top-full mt-1 sm:mt-2 right-0 w-56 sm:w-64 z-50" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl border border-emerald-100 overflow-hidden backdrop-blur-xl">
            {/* رأس القائمة المنسدلة */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-3 border-b border-emerald-100">
              <div className="flex items-center gap-2">
                <IconComponent size={18} className="text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-700">{item.label}</span>
              </div>
            </div>

            {/* عناصر القائمة */}
            <div className="py-2">
              {item.subItems.map((subItem) => {
                const SubIconComponent = subItem.icon;
                const isSubActive =
                  subItem.to === '/'
                    ? location.pathname === '/'
                    : location.pathname === subItem.to || location.pathname.startsWith(subItem.to + '/');

                return (
                  <NavLink
                    key={subItem.to}
                    to={subItem.to}
                    onClick={() => setIsOpen(false)}
                    className={`group flex items-center gap-3 px-4 py-3 mx-2 my-1 rounded-xl transition-all duration-200 ${
                      isSubActive
                        ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 shadow-md border-r-4 border-emerald-500'
                        : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 hover:shadow-sm'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg transition-all ${
                        isSubActive
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-gray-100 text-gray-500 group-hover:bg-emerald-100 group-hover:text-emerald-600'
                      }`}
                    >
                      <SubIconComponent size={18} />
                    </div>
                    <span className="flex-1 text-sm font-medium">{subItem.label}</span>
                    {isSubActive && (
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${subItem.color}`} />
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownNavItem;
