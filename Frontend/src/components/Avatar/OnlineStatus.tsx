import React from 'react';

interface OnlineStatusProps {
  isOnline?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  className?: string;
  position?: 'absolute' | 'relative';
  showPing?: boolean;
  user?: {
    isActive?: boolean;
    _id?: string;
  };
}

export const OnlineStatus: React.FC<OnlineStatusProps> = ({ 
  isOnline: externalIsOnline,
  size = 'md',
  className = '',
  position = 'absolute',
  showPing = true,
  user
}) => {
  // أولوية تحديد الحالة: user.isActive > externalIsOnline > افتراضي true
  const isOnline = user?.isActive !== undefined ? user.isActive : (externalIsOnline ?? true);

  const sizeClasses = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5',
    xl: 'w-4 h-4',
    '2xl': 'w-5 h-5',
    '3xl': 'w-6 h-6',
    '4xl': 'w-7 h-7'
  };

  const positionClasses = {
    xs: 'bottom-0 right-0',
    sm: 'bottom-0 right-0',
    md: 'bottom-0.5 right-0.5',
    lg: 'bottom-0.5 right-0.5',
    xl: 'bottom-1 right-1',
    '2xl': 'bottom-1 right-1',
    '3xl': 'bottom-1.5 right-1.5',
    '4xl': 'bottom-2 right-2',
  };

  const statusColor = isOnline 
    ? 'bg-green-500 shadow-green-500/50' 
    : 'bg-gray-400 shadow-gray-400/50';

  const innerGlowColor = isOnline ? 'bg-green-400' : 'bg-gray-300';

  return (
    <div 
      className={`
        ${sizeClasses[size]} 
        ${position === 'absolute' ? `absolute ${positionClasses[size]}` : 'relative'}
        ${statusColor} 
        rounded-full 
        border-2 border-white 
        shadow-lg 
        ${isOnline && showPing ? 'animate-pulse' : ''}
        transition-all 
        duration-300
        ${className}
      `}
      aria-label={isOnline ? 'المستخدم متصل' : 'المستخدم غير متصل'}
      title={isOnline ? 'متصل الآن' : 'غير متصل'}
    >
      {/* Inner glow effect */}
      <div
        className={`
          absolute inset-0.5 rounded-full 
          ${innerGlowColor} 
          opacity-60
        `}
      />
      
      {/* Ping animation ring */}
      {isOnline && showPing && (
        <div
          className={`
            absolute inset-0 
            ${statusColor} 
            rounded-full 
            animate-ping 
            opacity-75
          `}
        />
      )}
    </div>
  );
};

export default OnlineStatus;