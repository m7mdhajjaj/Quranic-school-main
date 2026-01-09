import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | 'full';
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

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  return (
    <div
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 ${overlayClassName || ''}`}
      onClick={closeOnOverlayClick ? onClose : undefined}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl ${sizeClasses[size]} w-full max-h-[90vh] flex flex-col animate-fadeIn relative z-[10000] transition-all duration-300`}
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
        
        {/* Modal Body with smooth scrolling */}
        <div className={`p-6 overflow-y-auto flex-1 min-h-0 scroll-smooth overscroll-contain ${bodyClassName || ''} custom-scrollbar`}>
           {children}
        </div>
        
        {footer && <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl shrink-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">{footer}</div>}
      </div>
    </div>
  );
};
