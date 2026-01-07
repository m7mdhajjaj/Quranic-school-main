import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
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
  const menuRef = useRef<HTMLDivElement>(null);

  // استخدام useCallback لتحسين الأداء
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, handleClickOutside]);

  // تحسين الدالة باستخدام useCallback
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

  const toggleMenu = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleItemClick = useCallback((e: React.MouseEvent, onClick: () => void) => {
    e.stopPropagation();
    setIsOpen(false);
    onClick();
  }, []);

  const alignmentClass = (position === 'left' || position === 'bottom-left') ? 'left-0' : 'right-0';

  return (
    <div className="relative" ref={menuRef}>
      {trigger ? (
        <div onClick={toggleMenu} className="cursor-pointer">
          {trigger}
        </div>
      ) : (
        <button
          onClick={toggleMenu}
          type="button"
          className={`bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm hover:bg-white transition-all duration-200 hover:scale-105 ${buttonClassName}`}
          title="المزيد"
          aria-label="المزيد"
          aria-haspopup="menu"
          aria-expanded={isOpen ? "true" : "false"}
        >
          <MoreVertical size={16} />
        </button>
      )}

      {isOpen && (
        <>
          {/* Overlay للإغلاق */}
          <div
            className="fixed inset-0 z-30"
            onClick={closeMenu}
          />

          {/* القائمة المنسدلة */}
          <div
            className={`absolute ${alignmentClass} mt-2 w-36 bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden z-40 animate-fadeIn ${menuClassName}`}
            role="menu"
          >
            {items.map((item, index) => (
              <button
                key={`${item.label}-${index}`}
                onClick={(e) => handleItemClick(e, item.onClick)}
                className={`w-full px-2.5 py-1.5 text-right flex items-center gap-1.5 transition-colors text-xs ${
                  index > 0 ? 'border-t border-gray-100' : ''
                } ${getVariantStyles(item.variant)} ${item.className || ''}`}
                role="menuitem"
              >
                {item.icon && <span className="flex-shrink-0 w-3.5 h-3.5">{item.icon}</span>}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
});

DropdownMenu.displayName = 'DropdownMenu';
