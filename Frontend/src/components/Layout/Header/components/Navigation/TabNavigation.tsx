import { NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import type { NavigationItem } from '../../types/navigation.types';
import DropdownNavItem from './DropdownNavItem';
import MoreDropdown from './MoreDropdown';

interface TabNavigationProps {
  items: NavigationItem[];
  secondaryItems?: NavigationItem[];
  className?: string;
  maxVisibleItems?: number;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ 
  items, 
  secondaryItems = [],
  className = '',
  maxVisibleItems = 999 
}) => {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  // دمج جميع العناصر (primary + secondary) لعرضها معاً
  const allItems = [...items, ...secondaryItems];
  const [visibleCount, setVisibleCount] = useState(allItems.length);

  const checkIsActive = (itemPath: string): boolean => {
    // الصفحة الرئيسية تكون نشطة فقط عندما نكون في المسار الدقيق "/"
    if (itemPath === '/') {
      return location.pathname === '/';
    }
    // باقي الصفحات تكون نشطة إذا كان المسار الحالي يبدأ بمسار العنصر
    // لكن يجب التأكد من أن المسار لا يبدأ بمسار آخر أطول
    const currentPath = location.pathname;
    if (currentPath === itemPath) {
      return true;
    }
    // التحقق من أن المسار يبدأ بمسار العنصر + "/" (وليس فقط يبدأ بالمسار)
    return currentPath.startsWith(itemPath + '/');
  };

  // جميع العناصر مرئية - لا حاجة لحساب المساحة
  useEffect(() => {
    // تعيين عدد العناصر المرئية = جميع العناصر
    setVisibleCount(allItems.length);
  }, [allItems.length]);

  // جميع العناصر مرئية
  const visibleItems = allItems;
  const hiddenItems: NavigationItem[] = [];
  
  // لا يوجد عناصر في قائمة "المزيد"
  const moreItems: NavigationItem[] = [];

  return (
    <nav className={`flex items-center gap-1 sm:gap-1.5 min-w-0 w-full ${className}`}>
      <div 
        ref={containerRef}
        className="flex items-center gap-0.5 sm:gap-1 md:gap-1.5 overflow-x-auto scrollbar-hide px-0.5 sm:px-1 md:px-2 lg:px-3 py-1 sm:py-1.5 bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl md:rounded-2xl border border-white/20 shadow-lg w-full min-w-0"
      >
        {/* العناصر المرئية - جميع العناصر */}
        {visibleItems.map((item, index) => {
          // إذا كان العنصر يحتوي على subItems، استخدم DropdownNavItem
          if (item.subItems && item.subItems.length > 0) {
            return <DropdownNavItem key={item.to} item={item} />;
          }

          // وإلا استخدم NavLink العادي
          const IconComponent = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => {
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
