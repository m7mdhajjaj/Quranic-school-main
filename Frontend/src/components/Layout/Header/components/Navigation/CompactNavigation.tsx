import { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { MoreHorizontal } from 'lucide-react';
import type { NavigationItem } from '../../types/navigation.types';
import { Card } from '@/components/UI';

interface CompactNavigationProps {
  items: NavigationItem[];
  className?: string;
}

const CompactNavigation: React.FC<CompactNavigationProps> = ({ items, className = '' }) => {
  const location = useLocation();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    };

    if (isMoreOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMoreOpen]);

  const checkIsActive = (itemPath: string): boolean => {
    if (itemPath === '/') {
      return location.pathname === '/';
    }
    return location.pathname === itemPath || location.pathname.startsWith(itemPath + '/');
  };

  // Show first 6 items as icons, rest in "More" dropdown
  const maxVisibleItems = 6;
  const visibleItems = items.slice(0, maxVisibleItems);
  const moreItems = items.slice(maxVisibleItems);

  // Check if any more item is active
  const hasActiveMoreItem = moreItems.some(item => checkIsActive(item.to));

  return (
    <nav className={`hidden xl:flex items-center gap-2 flex-1 justify-center ${className}`}>
      {visibleItems.map((item) => {
        const IconComponent = item.icon;
        const isActive = checkIsActive(item.to);

        return (
          <NavLink
            key={item.to}
            to={item.to}
            title={item.label}
            className={`group relative flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-300 ${
              isActive
                ? 'bg-white text-emerald-600 shadow-xl scale-105 ring-2 ring-white/50'
                : 'text-white/90 hover:bg-white/25 hover:text-white hover:scale-110 hover:shadow-lg backdrop-blur-sm'
            }`}
          >
            <IconComponent 
              size={20} 
              className={`transition-all duration-300 ${isActive ? 'text-emerald-600' : 'text-white/90 group-hover:text-white'}`} 
            />
            {isActive && (
              <span className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r ${item.color} rounded-full shadow-lg`} />
            )}
            {/* Tooltip */}
            <span className="absolute right-full mr-3 px-3 py-1.5 bg-gray-900/95 backdrop-blur-sm text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl transform group-hover:translate-x-0 translate-x-2">
              {item.label}
              <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full w-0 h-0 border-t-4 border-t-transparent border-r-4 border-r-gray-900/95 border-b-4 border-b-transparent"></span>
            </span>
          </NavLink>
        );
      })}

      {moreItems.length > 0 && (
        <div className="relative" ref={moreRef}>
          <button
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            className={`flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-300 ${
              hasActiveMoreItem
                ? 'bg-white text-emerald-600 shadow-xl scale-105 ring-2 ring-white/50'
                : 'text-white/90 hover:bg-white/25 hover:text-white hover:scale-110 hover:shadow-lg backdrop-blur-sm'
            }`}
            title="المزيد"
            aria-label="المزيد"
          >
            <MoreHorizontal size={20} className="transition-transform duration-300" />
          </button>

          {isMoreOpen && (
            <div className="absolute top-full right-0 mt-2 w-60 z-50 animate-fadeIn" dir="rtl">
              <Card
                variant="elevated"
                padding="none"
                className="overflow-hidden bg-white border border-emerald-200 shadow-2xl rounded-2xl backdrop-blur-md"
              >
                <div className="py-2">
                  {moreItems.map((item, index) => {
                    const IconComponent = item.icon;
                    const isActive = checkIsActive(item.to);

                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => setIsMoreOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 hover:scale-[1.02] ${
                          isActive
                            ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-600 border-r-4 border-emerald-500 shadow-sm'
                            : 'text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-teal-50/50 hover:text-emerald-600'
                        }`}
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <IconComponent
                          size={18}
                          className={`transition-colors duration-200 ${isActive ? 'text-emerald-600' : 'text-gray-500 group-hover:text-emerald-600'}`}
                        />
                        <span className="flex-1">{item.label}</span>
                        {isActive && (
                          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </Card>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default CompactNavigation;