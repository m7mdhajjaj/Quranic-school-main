// ============================================================================
// TransparentModal Component
// ============================================================================

import React, { useEffect } from "react";

// Helper function to merge class names
const cn = (...classes: (string | undefined | false)[]) => classes.filter(Boolean).join(' ');

interface TransparentModalProps {
  open: boolean;
  onClose: () => void;
  maxWidth?: string;
  children: React.ReactNode;
  cardClassName?: string;
  ariaLabel?: string;
  title?: string;
  icon?: React.ReactNode;
  gradientFrom?: string;
  gradientTo?: string;
}

export const TransparentModal: React.FC<TransparentModalProps> = ({
  open,
  onClose,
  maxWidth = "max-w-lg",
  children,
  cardClassName,
  ariaLabel,
  title,
  icon,
  gradientFrom = "emerald-600",
  gradientTo = "slate-700",
}) => {
  // منع scroll الصفحة الأساسية عند فتح المودال
  useEffect(() => {
    if (open) {
      // حفظ الموقع الحالي للـ scroll
      const scrollY = window.scrollY;
      
      // منع scroll على body
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      return () => {
        // إرجاع scroll عند إغلاق المودال
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [open]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]"
      role="dialog"
      aria-label={ariaLabel ?? "Modal"}
      aria-modal
      onMouseDown={(e) => {
        // إغلاق عند الضغط خارج البطاقة
        if (e.target === e.currentTarget) onClose();
      }}>
      <div
        className={cn(
          "bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-hidden animate-fadeIn flex flex-col",
          maxWidth,
          cardClassName
        )}>
        {title && (
          <div
            className="p-6 flex-shrink-0 bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                {icon && (
                  <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    {icon}
                  </div>
                )}
                <h3 className="text-xl font-bold text-white">{title}</h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition"
                aria-label="إغلاق">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};
