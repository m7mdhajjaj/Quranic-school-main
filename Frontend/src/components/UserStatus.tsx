import React from 'react';

interface UserStatusProps {
  isActive?: boolean;
  lastSeen?: Date | string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

// دالة تنسيق آخر ظهور بصيغة "منذ..."
const formatLastSeen = (lastSeen: Date | string): string => {
  const lastSeenDate = typeof lastSeen === 'string' ? new Date(lastSeen) : lastSeen;
  const now = new Date();
  const diffMs = now.getTime() - lastSeenDate.getTime();
  
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  
  if (diffSeconds < 60) {
    return "منذ لحظات";
  }
  
  if (diffMinutes < 60) {
    return diffMinutes === 1 ? "منذ دقيقة" : `منذ ${diffMinutes} دقيقة`;
  }
  
  if (diffHours < 24) {
    return diffHours === 1 ? "منذ ساعة" : `منذ ${diffHours} ساعة`;
  }
  
  if (diffDays < 7) {
    return diffDays === 1 ? "منذ يوم" : `منذ ${diffDays} أيام`;
  }
  
  if (diffWeeks < 4) {
    return diffWeeks === 1 ? "منذ أسبوع" : `منذ ${diffWeeks} أسابيع`;
  }
  
  if (diffMonths < 12) {
    return diffMonths === 1 ? "منذ شهر" : `منذ ${diffMonths} أشهر`;
  }
  
  const diffYears = Math.floor(diffMonths / 12);
  return diffYears === 1 ? "منذ سنة" : `منذ ${diffYears} سنوات`;
};

const UserStatus: React.FC<UserStatusProps> = ({ 
  isActive = false, 
  lastSeen, 
  size = 'md',
  showText = true,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const statusIndicator = (
    <div 
      className={`
        ${sizeClasses[size]} 
        rounded-full 
        border-2 
        border-white 
        ${isActive 
          ? 'bg-green-500 shadow-green-200 shadow-sm animate-pulse' 
          : 'bg-gray-400'
        }
        ${className}
      `}
      title={isActive ? 'متصل' : lastSeen ? `آخر ظهور ${formatLastSeen(lastSeen)}` : 'غير محدد'}
    />
  );

  if (!showText) {
    return statusIndicator;
  }

  return (
    <div className="flex items-center gap-1">
      {statusIndicator}
      <span className={`${textSizeClasses[size]} text-gray-600`}>
        {isActive 
          ? 'متصل' 
          : lastSeen 
            ? `آخر ظهور ${formatLastSeen(lastSeen)}` 
            : 'آخر ظهور غير محدد'
        }
      </span>
    </div>
  );
};

export default UserStatus;