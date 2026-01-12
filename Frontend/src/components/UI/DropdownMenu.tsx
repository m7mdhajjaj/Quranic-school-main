import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical } from 'lucide-react';

export interface DropdownMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'warning' | 'danger';
  className?: string;
}

interface DropdownMenuProps {
  items: DropdownMenuItem[];
  buttonClassName?: string;
  menuClassName?: string;
  position?: 'left' | 'right' | 'bottom-left' | 'bottom-right';
  trigger?: React.ReactNode;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = memo(({
  items,
  buttonClassName = '',
  menuClassName = '',
  position = 'left',
  trigger,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    
    const rect = triggerRef.current.getBoundingClientRect();
    
    // استخدام fixed positioning لتجنب مشاكل overflow و z-index في الحاويات الأب
    // الحساب يكون بالنسبة للـ Viewport
    
    let top = rect.bottom + 5; 
    let left = rect.left;

    // محاذاة لليمين
    if (position === 'right' || position === 'bottom-right') {
       left = rect.right - 192; // 192px = w-48 (12rem)
    } else {
       // محاذاة لليسار
       left = rect.left;
    }
    
    setCoords({ top, left });
  }, [position]);

  const toggleMenu = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen) {
        calculatePosition();
        setIsOpen(true);
    } else {
        setIsOpen(false);
    }
  }, [isOpen, calculatePosition]);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleItemClick = useCallback((e: React.MouseEvent, onClick: () => void) => {
    e.stopPropagation();
    setIsOpen(false);
    onClick();
  }, []);
  
  // إغلاق القائمة عند التمرير لتجنب انفصال القائمة عن الزر
  useEffect(() => {
      if (isOpen) {
          const onScroll = () => setIsOpen(false);
          window.addEventListener('scroll', onScroll, true); // true for capture phase to catch scroll in any div
          window.addEventListener('resize', onScroll);
          return () => {
              window.removeEventListener('scroll', onScroll, true);
              window.removeEventListener('resize', onScroll);
          }
      }
  }, [isOpen]);

  const getVariantStyles = useCallback((variant?: string) => {
    switch (variant) {
      case 'warning':
        return 'hover:bg-amber-50 text-amber-700';
      case 'danger':
        return 'hover:bg-red-50 text-red-600';
      default:
        return 'hover:bg-gray-50 text-gray-700';
    }
  }, []);

  return (
    <>
      <div 
        ref={triggerRef} 
        onClick={toggleMenu} 
        className={trigger ? "cursor-pointer" : "inline-block"}
      >
        {trigger ? (
          trigger
        ) : (
          <button
            type="button"
            className={`bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm hover:bg-white transition-all duration-200 hover:scale-105 ${buttonClassName}`}
            title="المزيد"
          >
            <MoreVertical size={16} />
          </button>
        )}
      </div>

      {isOpen && createPortal(
        <>
          {/* Overlay شفاف للإغلاق عند النقر خارج القائمة */}
          <div
            className="fixed inset-0 z-[9998]"
            onClick={(e) => {
                e.stopPropagation();
                closeMenu();
            }}
          />

          {/* القائمة المنسدلة - تستخدم Portal لتظهر فوق كل العناصر */}
          <div
            className={`dropdown-menu-fixed bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-[9999] animate-fadeIn w-48 ${menuClassName}`}
            data-coords-top={coords.top}
            data-coords-left={coords.left}
            dir="rtl"
          >
            {items.map((item, index) => (
              <button
                key={`${item.label}-${index}`}
                onClick={(e) => handleItemClick(e, item.onClick)}
                className={`w-full px-3 py-2 text-right flex items-center gap-2 transition-colors text-sm ${
                  index > 0 ? 'border-t border-gray-100' : ''
                } ${getVariantStyles(item.variant)} ${item.className || ''}`}
                tabIndex={0}
              >
                {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </>,
        document.body
      )}
    </>
  );
});

DropdownMenu.displayName = 'DropdownMenu';
