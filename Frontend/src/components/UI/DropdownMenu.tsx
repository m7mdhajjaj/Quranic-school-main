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
  const menuRef = useRef<HTMLDivElement>(null);

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    
    // استخدام getBoundingClientRect يضمن الحصول على إحداثيات بالنسبة للـ Viewport
    const rect = triggerRef.current.getBoundingClientRect();
    
    // بما أننا نستخدم position: fixed في الـ Portal، لا نحتاج لإضافة scrollX/Y
    
    let top = rect.bottom + 5; 
    let left = rect.left;

    // تعديل المحاذاة والاتجاه
    if (position === 'right' || position === 'bottom-right') {
       // محاذاة للجهة اليمنى (للغات LTR) أو اليسرى (RTL context if flipped?)
       // ببساطة: نجعل الحافة اليمنى للقائمة مع الحافة اليمنى للزر
       left = rect.right - 192; // 192px هو العرض الافتراضي w-48
    } else {
       // محاذاة لليسار
       left = rect.left;
    }

    // تصحيح الخروج عن الشاشة عمودياً
    if (top + 150 > window.innerHeight) {
        // إذا كانت القائمة ستخرج من أسفل الشاشة، اقلبها للأعلى
        top = rect.top - 5 - (items.length * 40 + 10); // تقدير الارتفاع
    }
    
    // تصحيح الخروج عن الشاشة أفقياً
    if (left < 10) left = 10;
    if (left + 192 > window.innerWidth) left = window.innerWidth - 202;

    setCoords({ top, left });
  }, [position, items.length]);

  const toggleMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isOpen) {
        setIsOpen(false);
    } else {
        calculatePosition();
        setIsOpen(true);
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

  // إغلاق القائمة عند التمرير أو تغيير الحجم أو الضغط على Escape
  useEffect(() => {
      if (isOpen) {
          const handleInteract = () => setIsOpen(false);
          const handleKeyDown = (e: KeyboardEvent) => {
              if (e.key === 'Escape') setIsOpen(false);
          };
          
          window.addEventListener('scroll', handleInteract, true);
          window.addEventListener('resize', handleInteract);
          window.addEventListener('keydown', handleKeyDown);
          
          return () => {
              window.removeEventListener('scroll', handleInteract, true);
              window.removeEventListener('resize', handleInteract);
              window.removeEventListener('keydown', handleKeyDown);
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
        onMouseDown={(e) => e.stopPropagation()}
        className={trigger ? "cursor-pointer" : "inline-block"}
        aria-haspopup="true"
        aria-expanded={isOpen ? "true" : "false"}
      >
        {trigger ? (
          trigger
        ) : (
          <button
            type="button"
            className={`bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm hover:bg-white transition-all duration-200 hover:scale-105 active:scale-95 ${buttonClassName}`}
            title="خيارات"
          >
            <MoreVertical size={16} />
          </button>
        )}
      </div>

      {isOpen && createPortal(
        <>
          {/* Overlay - Z-index عالي جداً */}
          <div
            className="fixed inset-0 z-[99999]"
            onClick={(e) => {
                e.stopPropagation();
                closeMenu();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onScroll={(e) => e.stopPropagation()}
            aria-hidden="true"
          />

          {/* Menu Content - Z-index أعلى من الـ Overlay */}
          <div
            ref={menuRef}
            className={`fixed bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden z-[100000] animate-fadeIn w-48 ${menuClassName}`}
            style={{
                top: coords.top,
                left: coords.left,
                minWidth: '12rem',
            }}
            role="menu"
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="py-1">
                {items.map((item, index) => (
                <button
                    key={`${item.label}-${index}`}
                    onClick={(e) => handleItemClick(e, item.onClick)}
                    className={`w-full px-4 py-2 text-right flex items-center gap-3 transition-colors text-sm font-medium ${
                        index > 0 ? 'border-t border-gray-50' : ''
                    } ${getVariantStyles(item.variant)} ${item.className || ''}`}
                    role="menuitem"
                >
                    {item.icon && <span className="flex-shrink-0 opacity-80">{item.icon}</span>}
                    <span>{item.label}</span>
                </button>
                ))}
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
});

DropdownMenu.displayName = 'DropdownMenu';
