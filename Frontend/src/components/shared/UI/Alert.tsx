import React from 'react';
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from 'lucide-react';

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  onClose,
  className,
}) => {
  const variants = {
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: <Info className="w-5 h-5 text-blue-600" />,
    },
    success: {
      container: 'bg-green-50 border-green-200 text-green-800',
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
    },
    warning: {
      container: 'bg-amber-50 border-amber-200 text-amber-800',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
    },
    danger: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: <AlertCircle className="w-5 h-5 text-red-600" />,
    },
  };

  const config = variants[variant];

  return (
    <div className={`rounded-lg border-2 p-4 ${config.container} ${className || ''}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
        <div className="flex-1">
          {title && <h4 className="font-bold mb-1">{title}</h4>}
          <div className="text-sm">{children}</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 hover:bg-white/50 rounded transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
