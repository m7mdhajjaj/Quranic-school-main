import React from 'react';

interface OnlineStatusProps {
  isOnline?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const OnlineStatus: React.FC<OnlineStatusProps> = ({ 
  isOnline = true, 
  size = 'md',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const statusColor = isOnline 
    ? 'bg-green-400 shadow-green-400/50' 
    : 'bg-gray-400 shadow-gray-400/50';

  return (
    <div className={`
      ${sizeClasses[size]} 
      ${statusColor} 
      rounded-full 
      border-2 border-white 
      shadow-lg 
      ${isOnline ? 'animate-pulse' : ''}
      ${className}
    `} />
  );
};

export default OnlineStatus;