import React from 'react';
import { useUserStatus } from '../hooks/useUserStatus';

interface PresenceIndicatorProps {
  userId?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({
  userId,
  size = 'md',
  showText = false,
  className = ''
}) => {
  const { isActive, isOnline, isLoading } = useUserStatus(userId);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-2 h-2';
      case 'lg':
        return 'w-4 h-4';
      default:
        return 'w-3 h-3';
    }
  };

  const getStatusColor = () => {
    if (isLoading) return 'bg-gray-400';
    if (isOnline && isActive) return 'bg-green-500';
    if (isActive) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  const getStatusText = () => {
    if (isLoading) return 'جاري التحميل...';
    if (isOnline && isActive) return 'متصل الآن';
    if (isActive) return 'نشط';
    return 'غير متصل';
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`
          ${getSizeClasses()}
          ${getStatusColor()}
          rounded-full
          border-2 border-white
          shadow-sm
        `}
        title={getStatusText()}
      />
      {showText && (
        <span className="text-xs text-gray-600">
          {getStatusText()}
        </span>
      )}
    </div>
  );
};

export default PresenceIndicator;