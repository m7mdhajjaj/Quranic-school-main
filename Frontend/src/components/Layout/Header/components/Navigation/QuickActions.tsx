import { NavLink, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import type { NavigationItem } from '../../types/navigation.types';

interface QuickActionsProps {
  items: NavigationItem[];
  className?: string;
}

const QuickActions: React.FC<QuickActionsProps> = ({ items, className = '' }) => {
  const location = useLocation();

  const checkIsActive = (itemPath: string): boolean => {
    if (itemPath === '/') {
      return location.pathname === '/';
    }
    return location.pathname === itemPath || location.pathname.startsWith(itemPath + '/');
  };

  // Show only first 8 items
  const visibleItems = items.slice(0, 8);

  return (
    <nav className={`hidden xl:flex items-center gap-1 ${className}`}>
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide px-2 py-1.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-md">
        {visibleItems.map((item) => {
          // إذا كان العنصر يحتوي على subItems، استخدم QuickActionDropdown
          if (item.subItems && item.subItems.length > 0) {
            return (
              <QuickActionDropdown
                key={item.to}
                item={item}
                checkIsActive={checkIsActive}
              />
            );
          }

          // وإلا استخدم NavLink العادي
          const IconComponent = item.icon;
          const isActive = checkIsActive(item.to);

          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={item.label}
              className={`group relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'bg-white text-emerald-600 shadow-lg scale-110 ring-2 ring-white/50'
                  : 'text-white/80 hover:text-white hover:bg-white/20 hover:scale-105'
              }`}
            >
              <IconComponent size={17} />
              {isActive && (
                <span
                  className={`absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-gradient-to-r ${item.color} rounded-full shadow-sm`}
                />
              )}
              {/* Tooltip */}
              <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-gray-900/95 backdrop-blur-sm text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                {item.label}
                <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-0 h-0 border-l-4 border-l-transparent border-t-4 border-t-gray-900/95 border-r-4 border-r-transparent"></span>
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

// مكون القائمة المنسدلة للـ QuickActions
interface QuickActionDropdownProps {
  item: NavigationItem;
  checkIsActive: (itemPath: string) => boolean;
}

const QuickActionDropdown: React.FC<QuickActionDropdownProps> = ({
  item,
  checkIsActive,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const IconComponent = item.icon;

  // التحقق من وجود عنصر نشط في القائمة المنسدلة
  const hasActiveSubItem = item.subItems?.some((subItem) => checkIsActive(subItem.to));
  const isItemActive = checkIsActive(item.to) || hasActiveSubItem;

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
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        title={item.label}
        className={`group relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${
          isItemActive
            ? 'bg-white text-emerald-600 shadow-lg scale-110 ring-2 ring-white/50'
            : 'text-white/80 hover:text-white hover:bg-white/20 hover:scale-105'
        }`}
        aria-label={item.label}
        aria-expanded={isOpen}
      >
        <IconComponent size={17} />
        {isItemActive && (
          <span
            className={`absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-gradient-to-r ${item.color} rounded-full shadow-sm`}
          />
        )}
        <ChevronDown
          size={12}
          className={`absolute -bottom-0.5 right-0.5 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          } ${isItemActive ? 'text-emerald-600' : 'text-white/60'}`}
        />
      </button>

      {isOpen && item.subItems && item.subItems.length > 0 && (
        <div className="absolute top-full mt-2 right-0 w-56 z-50" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl border border-emerald-100 overflow-hidden backdrop-blur-xl">
            {/* رأس القائمة المنسدلة */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-2.5 border-b border-emerald-100">
              <div className="flex items-center gap-2">
                <IconComponent size={16} className="text-emerald-600" />
                <span className="text-xs font-semibold text-emerald-700">{item.label}</span>
              </div>
            </div>

            {/* عناصر القائمة */}
            <div className="py-1.5">
              {item.subItems.map((subItem) => {
                const SubIconComponent = subItem.icon;
                const isSubActive = checkIsActive(subItem.to);

                return (
                  <NavLink
                    key={subItem.to}
                    to={subItem.to}
                    onClick={() => setIsOpen(false)}
                    className={`group flex items-center gap-2.5 px-3 py-2.5 mx-1.5 my-0.5 rounded-lg transition-all duration-200 ${
                      isSubActive
                        ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 shadow-md border-r-3 border-emerald-500'
                        : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 hover:shadow-sm'
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-md transition-all ${
                        isSubActive
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-gray-100 text-gray-500 group-hover:bg-emerald-100 group-hover:text-emerald-600'
                      }`}
                    >
                      <SubIconComponent size={16} />
                    </div>
                    <span className="flex-1 text-xs font-medium">{subItem.label}</span>
                    {isSubActive && (
                      <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${subItem.color}`} />
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

export default QuickActions;
