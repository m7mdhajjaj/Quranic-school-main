import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  footer?: React.ReactNode;
  headerClassName?: string;
  bodyClassName?: string;
  overlayClassName?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = '2xl',
  showCloseButton = true,
  closeOnOverlayClick = true,
  footer,
  headerClassName,
  bodyClassName,
  overlayClassName,
}) => {
  const [mounted, setMounted] = useState(false);
  const scrollYRef = useRef(0);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open - improved version
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      scrollYRef.current = window.scrollY;
      
      // Lock body scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollYRef.current}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
      document.body.style.width = '100%';
      
      return () => {
        // Restore body styles
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.overflow = '';
        document.body.style.width = '';
        // Restore scroll position
        window.scrollTo(0, scrollYRef.current);
      };
    }
  }, [isOpen]);

  // Handle wheel event to prevent scroll bleeding to parent
  // Using useEffect to add non-passive event listener
  useEffect(() => {
    const bodyElement = bodyRef.current;
    if (!bodyElement) return;

    const handleWheel = (e: WheelEvent) => {
      const target = e.currentTarget as HTMLDivElement;
      const { scrollTop, scrollHeight, clientHeight } = target;
      const isAtTop = scrollTop === 0;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight;
      
      // Prevent scroll bleeding when at boundaries
      if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
        e.preventDefault();
      }
    };

    // Add non-passive event listener
    bodyElement.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      bodyElement.removeEventListener('wheel', handleWheel);
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const sizeClasses: Record<string, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  return createPortal(
    <div
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 ${overlayClassName || ''}`}
      onClick={closeOnOverlayClick ? onClose : undefined}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl ${sizeClasses[size]} w-full max-h-[90vh] flex flex-col animate-fadeIn relative z-[10000]`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <div className={`flex items-center justify-between p-6 border-b border-emerald-300 bg-gradient-to-r from-emerald-500 to-teal-600 shrink-0 rounded-t-2xl ${headerClassName || ''}`}>
            {title && <h2 className="text-2xl font-bold text-white">{title}</h2>}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-all duration-300 text-white"
                aria-label="إغلاق"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>
        )}
        
        {/* Modal Body with controlled scrolling */}
        <div 
          ref={bodyRef}
          className={`p-6 overflow-y-auto flex-1 min-h-0 overscroll-contain ${bodyClassName || ''} scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent`}
        >
           {children}
        </div>
        
        {footer && <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl shrink-0">{footer}</div>}
      </div>
    </div>,
    document.body
  );
};
