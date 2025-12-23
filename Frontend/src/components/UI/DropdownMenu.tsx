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
  position?: 'left' | 'right';
}

export const DropdownMenu: React.FC<DropdownMenuProps> = memo(({
  items,
  buttonClassName = '',
  menuClassName = '',
  position = 'left',
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

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={toggleMenu}
        type="button"
        className={`bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-all duration-200 hover:scale-110 ${buttonClassName}`}
        title="المزيد"
        aria-label="المزيد"
        aria-haspopup="menu"
        aria-expanded={isOpen ? "true" : "false"}
      >
        <MoreVertical size={20} />
      </button>

      {isOpen && (
        <>
          {/* Overlay للإغلاق */}
          <div
            className="fixed inset-0 z-30"
            onClick={closeMenu}
          />

          {/* القائمة المنسدلة */}
          <div
            className={`absolute ${
              position === 'left' ? 'left-0' : 'right-0'
            } mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-40 animate-fadeIn ${menuClassName}`}
            role="menu"
          >
            {items.map((item, index) => (
              <button
                key={`${item.label}-${index}`}
                onClick={(e) => handleItemClick(e, item.onClick)}
                className={`w-full px-4 py-3 text-right flex items-center gap-3 transition-colors font-semibold ${
                  index > 0 ? 'border-t border-gray-100' : ''
                } ${getVariantStyles(item.variant)} ${item.className || ''}`}
                role="menuitem"
              >
                {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
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
