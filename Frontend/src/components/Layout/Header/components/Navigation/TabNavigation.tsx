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
  maxVisibleItems = 6 
}) => {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [visibleCount, setVisibleCount] = useState(maxVisibleItems);

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

  // حساب عدد العناصر التي يمكن عرضها بناءً على المساحة المتاحة
  useEffect(() => {
    const calculateVisibleItems = () => {
      if (!containerRef.current || items.length === 0) {
        setVisibleCount(items.length);
        return;
      }

      // انتظر قليلاً لضمان render العناصر المخفية
      setTimeout(() => {
        if (!containerRef.current) return;

        const containerWidth = containerRef.current.offsetWidth;
        const containerPadding = 8; // padding للـ container (px-0.5 sm:px-1 md:px-2)
        const moreButtonWidth = 80; // عرض تقريبي لزر "المزيد" (مع padding)
        const gap = 4; // المسافة بين العناصر (gap-0.5 = 2px, gap-1 = 4px)
        let totalWidth = containerPadding;
        let count = 0;

        // حساب عرض كل عنصر من العناصر المخفية
        for (let i = 0; i < items.length; i++) {
          const itemElement = itemsRef.current[i];
          if (!itemElement) {
            // إذا لم يكن العنصر موجوداً بعد، استخدم عرض تقريبي بناءً على طول النص
            const estimatedWidth = items[i].label.length * 8 + 60; // تقدير بناءً على طول النص
            if (totalWidth + estimatedWidth + gap + moreButtonWidth <= containerWidth) {
              totalWidth += estimatedWidth + gap;
              count++;
            } else {
              break;
            }
            continue;
          }

          const itemWidth = itemElement.offsetWidth || itemElement.getBoundingClientRect().width;

          // إذا كان هناك مساحة كافية لعرض هذا العنصر + زر "المزيد" (إذا لزم الأمر)
          const needsMoreButton = i < items.length - 1 || secondaryItems.length > 0;
          const requiredWidth = itemWidth + gap + (needsMoreButton ? moreButtonWidth : 0);

          if (totalWidth + requiredWidth <= containerWidth) {
            totalWidth += itemWidth + gap;
            count++;
          } else {
            break;
          }
        }

        // إذا كان هناك مساحة كافية لعرض جميع العناصر، اعرضها كلها
        if (count >= items.length && secondaryItems.length === 0) {
          setVisibleCount(items.length);
        } else {
          // خذ العدد المحسوب (أو واحد أقل لضمان وجود مساحة لزر "المزيد")
          setVisibleCount(Math.max(1, count));
        }
      }, 100);
    };

    // حساب عند التحميل وتغيير الحجم
    calculateVisibleItems();
    window.addEventListener('resize', calculateVisibleItems);
    
    // استخدام ResizeObserver لمراقبة تغييرات الحجم
    let resizeObserver: ResizeObserver | null = null;
    if (containerRef.current && window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => {
        calculateVisibleItems();
      });
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', calculateVisibleItems);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [items, secondaryItems.length, location.pathname]);

  // تقسيم العناصر إلى مرئية ومخفية بناءً على المساحة المتاحة
  const visibleItems = items.slice(0, visibleCount);
  const hiddenItems = items.slice(visibleCount);
  
  // دمج العناصر المخفية مع secondary items
  const moreItems = [...hiddenItems, ...secondaryItems];

  return (
    <nav className={`flex items-center gap-1 sm:gap-1.5 min-w-0 w-full ${className}`}>
      <div 
        ref={containerRef}
        className="flex items-center gap-0.5 sm:gap-1 md:gap-1.5 overflow-x-auto scrollbar-hide px-0.5 sm:px-1 md:px-2 lg:px-3 py-1 sm:py-1.5 bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl md:rounded-2xl border border-white/20 shadow-lg w-full min-w-0"
      >
        {/* جميع العناصر مخفية أولاً لحساب العرض - تستخدم نفس الـ classes */}
        <div className="absolute opacity-0 pointer-events-none -z-10 flex items-center gap-0.5 sm:gap-1 md:gap-1.5 invisible">
          {items.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={`measure-${item.to}`}
                ref={(el) => {
                  if (el) itemsRef.current[index] = el;
                }}
                className="flex items-center gap-0.5 sm:gap-1 md:gap-1.5 lg:gap-2 px-1 sm:px-1.5 md:px-2 lg:px-3 xl:px-4 py-1 sm:py-1.5 md:py-2 whitespace-nowrap flex-shrink-0"
              >
                <IconComponent size={14} className="w-4 h-4 sm:w-[16px] sm:h-[16px] md:w-[18px] md:h-[18px] flex-shrink-0" />
                <span className="text-[10px] sm:text-xs md:text-sm font-medium">{item.label}</span>
              </div>
            );
          })}
        </div>

        {/* العناصر المرئية */}
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
        
        {/* زر المزيد إذا كان هناك عناصر مخفية أو secondary items */}
        {moreItems.length > 0 && (
          <MoreDropdown items={moreItems} />
        )}
      </div>
    </nav>
  );
};

export default TabNavigation;
