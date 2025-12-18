/**
 * 🟢 Online Status Indicator - Real-time Component
 * ================================================
 * مؤشر حالة المستخدم (Online/Offline) في الوقت الفعلي
 * يعتمد 100% على UserStatusContext الذي يستمع لـ Socket.io
 * 
 * @module OnlineStatus
 * @description نقطة خضراء/حمراء تعرض حالة المستخدم لحظياً
 */

import React, { useContext, useMemo } from 'react';
import { UserStatusContext } from '@/Context/UserStatusContext';

interface OnlineStatusProps {
  /** Force status - يتجاوز Context */
  isOnline?: boolean;
  /** حجم المؤشر */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  /** CSS classes إضافية */
  className?: string;
  /** موضع المؤشر */
  position?: 'absolute' | 'relative';
  /** بيانات المستخدم (يُستخدم _id لجلب الحالة من Context) */
  user?: {
    isActive?: boolean;
    _id?: string;
  };
}

const OnlineStatusComponent: React.FC<OnlineStatusProps> = ({ 
  isOnline: externalIsOnline,
  size = 'md',
  className = '',
  position = 'absolute',
  user,
}) => {
  // ✅ الحصول على Context
  const context = useContext(UserStatusContext);
  
  /**
   * ✅ تحديد حالة المستخدم من Context
   * الأولوية: externalIsOnline > Context
   * 
   * ⚠️ Important: لا نستخدم useMemo هنا لأننا نريد re-render عند كل تغيير في userStatuses
   */
  let isOnline = false;
  
  // الأولوية 1: من prop مباشر (force)
  if (externalIsOnline !== undefined) {
    isOnline = externalIsOnline;
  }
  // الأولوية 2: من Context (Real-time من Socket)
  else if (user?._id && context) {
    const status = context.getUserStatus(user._id);
    isOnline = status?.isActive || false;
  }
  else {
    // Default to false if no context or user ID
    isOnline = false;
  }

  // Size classes - محسّنة مع useMemo
  const sizeClass = useMemo(() => {
    const sizes = {
      xs: 'w-2 h-2',
      sm: 'w-2.5 h-2.5',
      md: 'w-3 h-3',
      lg: 'w-3.5 h-3.5',
      xl: 'w-4 h-4',
      '2xl': 'w-5 h-5',
      '3xl': 'w-6 h-6',
      '4xl': 'w-7 h-7'
    };
    return sizes[size];
  }, [size]);

  // Position classes
  const positionClass = useMemo(() => {
    if (position === 'relative') return 'relative';
    
    const positions = {
      xs: 'absolute bottom-0 right-0',
      sm: 'absolute bottom-0 right-0',
      md: 'absolute bottom-0.5 right-0.5',
      lg: 'absolute bottom-0.5 right-0.5',
      xl: 'absolute bottom-1 right-1',
      '2xl': 'absolute bottom-1 right-1',
      '3xl': 'absolute bottom-1.5 right-1.5',
      '4xl': 'absolute bottom-2 right-2',
    };
    return positions[size];
  }, [size, position]);

  // Status color
  const statusColor = useMemo(() => 
    isOnline ? 'bg-green-500' : 'bg-gray-400',
    [isOnline]
  );

  // Aria label
  const ariaLabel = useMemo(() => 
    isOnline ? 'المستخدم متصل' : 'المستخدم غير متصل',
    [isOnline]
  );

  // Final container classes
  const containerClass = useMemo(() => {
    return [
      sizeClass,
      positionClass,
      statusColor,
      'rounded-full border-2 border-white transition-all duration-300',
      // إضافة تأثير النبض للـ online فقط
      isOnline && 'shadow-[0_0_8px_rgba(34,197,94,0.6)]',
      className
    ].filter(Boolean).join(' ');
  }, [sizeClass, positionClass, statusColor, isOnline, className]);

  return (
    <div
      className={containerClass}
      aria-label={ariaLabel}
      title={ariaLabel}
    />
  );
};

/**
 * ⚠️ تم إزالة React.memo لضمان re-render عند تحديث Context
 * React.memo كان يمنع التحديثات لأن props لا تتغير، لكن Context يتغير
 */
export const OnlineStatus = OnlineStatusComponent;

OnlineStatus.displayName = 'OnlineStatus';

export default OnlineStatus;