import React, { useRef, useState, useEffect, useContext, useMemo, memo } from 'react';
import { UserStatusContext } from '@/Context/UserStatusContext';

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
  lazyLoad?: boolean;
}

const OnlineStatusComponent: React.FC<OnlineStatusProps> = ({ 
  isOnline: externalIsOnline,
  size = 'md',
  className = '',
  position = 'absolute',
  user,
  lazyLoad = true
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [isVisible, setIsVisible] = useState(!lazyLoad);
  const [statusFetched, setStatusFetched] = useState(false);

  // Intersection Observer للـ lazy loading - محسّن
  useEffect(() => {
    if (!lazyLoad || isVisible) return;

    // إعادة استخدام Observer بدلاً من إنشاء واحد جديد في كل مرة
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            setIsVisible(true);
            observerRef.current?.disconnect();
            observerRef.current = null;
          }
        },
        {
          root: null,
          rootMargin: '50px',
          threshold: 0.1,
        }
      );
    }

    const currentElement = elementRef.current;
    if (currentElement && observerRef.current) {
      observerRef.current.observe(currentElement);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [lazyLoad, isVisible]);

  // الحصول على Context
  const context = useContext(UserStatusContext);
  
  // جلب الحالة من Context مباشرة - بدون useMemo عشان يتحدث فوراً
  const userStatusFromContext = user?._id && context?.userStatuses 
    ? context.userStatuses[user._id] 
    : null;
  
  // جلب الحالة عند الظهور لأول مرة
  useEffect(() => {
    if (!isVisible || !user?._id || !context?.getUserStatus || statusFetched) return;
    // استدعاء getUserStatus لجلب الحالة إذا ما كانت موجودة
    if (!userStatusFromContext) {
      context.getUserStatus(user._id);
    }
    setStatusFetched(true);
  }, [isVisible, user?._id, context, statusFetched, userStatusFromContext]);

  // تحديد الحالة - بدون useMemo عشان يتحدث فوراً مع كل تغيير في Context
  const isOnline = (() => {
    // الأولوية 1: من userStatusFromContext (من Context/Socket) - Real-time
    if (userStatusFromContext?.isActive !== undefined) return userStatusFromContext.isActive;
    
    // الأولوية 2: من externalIsOnline prop
    if (externalIsOnline !== undefined) return externalIsOnline;
    
    // الأولوية 3: من user.isActive (من Backend) - Initial value فقط
    if (user?.isActive !== undefined) return user.isActive;
    
    // افتراضي
    return false;
  })();

  // استخدام useMemo للـ static classes - تجنب إعادة الحساب
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

  const statusColor = useMemo(() => 
    isOnline ? 'bg-green-500' : 'bg-red-500',
    [isOnline]
  );



  const ariaLabel = useMemo(() => 
    isOnline ? 'المستخدم متصل' : 'المستخدم غير متصل',
    [isOnline]
  );

  // تجميع classes مرة واحدة بدلاً من concatenation في كل render
  const containerClass = useMemo(() => {
    return [
      sizeClass,
      positionClass,
      statusColor,
      'rounded-full border-2 border-white transition-all duration-300',
      className
    ].filter(Boolean).join(' ');
  }, [sizeClass, positionClass, statusColor, className]);

  return (
    <div
      ref={elementRef}
      className={containerClass}
      aria-label={ariaLabel}
    />
  );
};

// استخدام React.memo لمنع re-renders غير ضرورية
export const OnlineStatus = memo(OnlineStatusComponent, (prevProps, nextProps) => {
  // Custom comparison function للتحكم في متى يتم re-render
  return (
    prevProps.isOnline === nextProps.isOnline &&
    prevProps.size === nextProps.size &&
    prevProps.className === nextProps.className &&
    prevProps.position === nextProps.position &&
    prevProps.showPing === nextProps.showPing &&
    prevProps.lazyLoad === nextProps.lazyLoad &&
    prevProps.user?.isActive === nextProps.user?.isActive &&
    prevProps.user?._id === nextProps.user?._id
  );
});

OnlineStatus.displayName = 'OnlineStatus';

export default OnlineStatus;