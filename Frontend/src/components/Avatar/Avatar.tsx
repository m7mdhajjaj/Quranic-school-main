import React, { useContext, useMemo } from 'react';
import { User as UserIcon, Camera } from 'lucide-react';
import { useAvatar } from '../Hooks/useAvatar';
import { LoadingSpinner, Tooltip, OnlineStatus } from '../UI';
import { UserStatusContext } from '@/Context/UserStatusContext';
import {
  getUserInfo,
  getAvatarUrl,
  getGenderColor,
  getTextColor,
} from '.';

export interface AvatarProps {
  /** Avatar image URL from Cloudinary */
  src?: string | null;
  /** Alternative image URL (for preview when editing) */
  previewSrc?: string | null;
  /** Alt text for the image */
  alt?: string;
  /** Size of the avatar */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  /** User's name for fallback initial */
  userName?: string;
  /** User ID for fetching avatar from API */
  userId?: string;
  /** User role for API endpoint */
  userRole?: string;
  /** User object with all data (including avatar from Cloudinary) */
  user?: {
    _id?: string;
    firstName?: string;
    name?: string;
    gender?: string;
    role?: string;
    isActive?: boolean;
    avatar?: {
      url?: string;
      publicId?: string;
    };
  };
  /** Auto-fetch avatar from API using userId */
  autoFetch?: boolean;
  /** User's gender for color theming */
  gender?: 'male' | 'female' | 'ذكر' | 'أنثى';
  /** Whether to show loading state */
  loading?: boolean;
  /** Whether the avatar is clickable */
  clickable?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Show camera edit button */
  showEditButton?: boolean;
  /** Edit button click handler */
  onEditClick?: () => void;
  /** Custom fallback icon */
  fallbackIcon?: React.ReactNode;
  /** Border style */
  border?: 'none' | 'thin' | 'thick' | 'ring';
  /** Show online status indicator */
  showStatus?: boolean;
  /** Show status text next to avatar */
  showStatusText?: boolean;
  /** Status indicator size (separate from avatar size) */
  statusSize?: 'sm' | 'md' | 'lg';
  /** Force status (overrides useAuth) */
  forceStatus?: 'online' | 'offline' | 'active' | 'inactive';
  /** Show status as circular ring/arc around avatar */
  statusAsRing?: boolean;
  /** Status ring progress (0-100) - for partial circle */
  statusRingProgress?: number;
}

const sizeClasses = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
  '2xl': 'w-20 h-20',
  '3xl': 'w-24 h-24 md:w-28 md:h-28',
  '4xl': 'w-32 h-32 md:w-40 md:h-40',
};

const iconSizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
  '2xl': 'w-10 h-10',
  '3xl': 'w-12 h-12',
  '4xl': 'w-16 h-16',
};

const borderClasses = {
  none: '',
  thin: 'border border-gray-200',
  thick: 'border-2 border-white',
  ring: 'ring-4 ring-white/30',
};

const textSizeClasses = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-2xl md:text-3xl',
  '4xl': 'text-3xl md:text-5xl',
};



const Avatar: React.FC<AvatarProps> = React.memo(({
  src,
  previewSrc,
  alt = 'صورة المستخدم',
  size = 'md',
  userName: externalUserName,
  userId,
  userRole,
  user,
  autoFetch = false,
  gender: externalGender = 'male',
  loading: externalLoading = false,
  clickable = false,
  onClick,
  className = '',
  showEditButton = false,
  onEditClick,
  fallbackIcon,
  border = 'thick',
  showStatus = false,
  showStatusText = false,
  statusSize = 'md',
  forceStatus,
}) => {
  // استخدام hook لجلب الصورة من Cloudinary إذا لزم الأمر
  const { avatarUrl: fetchedAvatarUrl, isLoading: isFetchingAvatar } = useAvatar({
    userId: userId || user?._id,
    userRole: userRole || user?.role,
    avatarData: user?.avatar,
    enabled: autoFetch && !!(userId || user?._id) && !!(userRole || user?.role),
  });

  // الحصول على URL الصورة من مصادر مختلفة
  const finalAvatarUrl = getAvatarUrl(src, user?.avatar, fetchedAvatarUrl);
  const displaySrc = previewSrc || finalAvatarUrl;


  // معلومات المستخدم (اسم، أحرف أولى، جنس)
  const { initials, gender } = getUserInfo(externalUserName, user, externalGender);

  // حالة التحميل
  const loading = externalLoading || isFetchingAvatar;

  // تحديد حالة المستخدم - الآن OnlineStatus يتولى المنطق من Context
  // نستخدم forceStatus فقط إذا كان محدداً، وإلا OnlineStatus سيجلب الحالة من Context
  const userIsOnline = (() => {
    if (forceStatus === 'online' || forceStatus === 'active') return true;
    if (forceStatus === 'offline' || forceStatus === 'inactive') return false;
    // إذا لم يكن forceStatus محدداً، OnlineStatus سيتولى المنطق من Context
    return undefined;
  })();

  const genderColorClass = getGenderColor(gender);
  const textColorClass = getTextColor();

  // عرض fallback بدلاً من spinner عند التحميل
  // if (loading) {
  //   return (
  //     <div className={`${sizeClasses[size]} rounded-full ${borderClasses[border]} flex items-center justify-center ${genderColorClass}`}>
  //       <LoadingSpinner size="sm" />
  //     </div>
  //   );
  // }

  const AvatarContent = () => (
    <div className={`relative group ${className}`}>
      <div
        className={`
          ${sizeClasses[size]} 
          ${borderClasses[border]} 
          rounded-full 
          overflow-hidden 
          flex 
          items-center 
          justify-center 
          ${clickable ? 'cursor-pointer hover:scale-105 transition-all duration-300' : ''} 
          ${displaySrc ? 'bg-white' : genderColorClass} 
          group 
          relative
        `}
        onClick={clickable ? onClick : undefined}
        {...(clickable && {
          role: 'button',
          tabIndex: 0,
          onKeyDown: (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onClick?.();
            }
          },
        })}
        aria-label={clickable ? 'القائمة الشخصية' : alt}
      >
        {displaySrc ? (
          <img
            src={displaySrc}
            alt={alt}
            className={`
              object-cover 
              w-full 
              h-full 
              rounded-full 
              transition-opacity 
              duration-200 
              ${previewSrc ? '' : 'opacity-0 animate-[fadeIn_0.3s_ease-in-out_forwards]'}
            `}
            onLoad={(e) => {
              if (!previewSrc) {
                (e.target as HTMLImageElement).style.opacity = '1';
              }
            }}
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              // Log informative message instead of 404 error
              if (process.env.NODE_ENV === 'development') {
                console.warn(
                  '⚠️ Avatar image failed to load:', 
                  displaySrc,
                  '\nFalling back to initials/icon for user:',
                  userName || alt || 'Unknown'
                );
              }
              // Prevent default 404 error display
              e.preventDefault();
              // Hide the broken image
              img.style.display = 'none';
              // Remove src to prevent further requests
              img.removeAttribute('src');
            }}
            suppressHydrationWarning
          />
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* نمط خفيف للخلفية لإضافة عمق بصري */}
            <div className="absolute inset-0 opacity-10">
              <div className="w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.3),transparent_50%)]" />
            </div>
            
            {fallbackIcon ||
              (initials ? (
                <span
                  className={`font-bold ${textSizeClasses[size]} ${textColorClass} relative z-10`}
                >
                  {initials}
                </span>
              ) : (
                <UserIcon className={`${iconSizeClasses[size]} text-white drop-shadow-lg relative z-10`} />
              ))}

            {/* Subtle retry indicator on hover for clickable avatars */}
            {clickable && !displaySrc && (
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full flex items-center justify-center z-20">
                <svg
                  className="w-3 h-3 text-white/80"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status indicator - استخدام OnlineStatus مع المنطق الجديد من Context */}
      {showStatus && (
          <OnlineStatus 
            isOnline={userIsOnline !== undefined ? userIsOnline : undefined}
            size={statusSize}
            position="absolute"
            showPing={true}
            user={user || (userId ? { _id: userId } : undefined)}
          />
      )}

      {/* Edit button مع Tooltip */}
      {showEditButton && onEditClick && (
        <Tooltip content="تغيير الصورة" position="top">
          <button
            type="button"
            onClick={onEditClick}
            className={`
              absolute 
              ${showStatus ? '-bottom-2 left-0' : '-bottom-2 right-0'}
              bg-emerald-600 
              hover:bg-emerald-700 
              text-white 
              rounded-full 
              p-2 
              cursor-pointer 
              shadow-lg 
              transition-all
              duration-300
              transform 
              group-hover:-translate-y-0.5
              hover:scale-110
            `}
            aria-label="تغيير الصورة"
          >
            <Camera className="w-4 h-4" />
          </button>
        </Tooltip>
      )}
    </div>
  );

  // إرجاع المحتوى مع النص الاختياري - استخدام OnlineStatus مع showStatusText
  if (showStatusText) {
    // جلب الحالة من Context للعرض مع النص
    const context = useContext(UserStatusContext);
    const targetUserId = userId || user?._id;
    const userStatusFromContext = useMemo(() => {
      if (!targetUserId || !context?.getUserStatus) return null;
      try {
        return context.getUserStatus(targetUserId);
      } catch {
        return null;
      }
    }, [targetUserId, context?.getUserStatus, context?.userStatuses?.[targetUserId || '']]);

    const statusText = useMemo(() => {
      if (userIsOnline === true) return 'نشط الآن';
      if (userIsOnline === false) return 'غير نشط';
      if (userStatusFromContext?.isActive === true) return 'نشط الآن';
      if (userStatusFromContext?.isActive === false) return 'غير نشط';
      if (user?.isActive === true) return 'نشط الآن';
      if (user?.isActive === false) return 'غير نشط';
      return 'جاري التحميل...';
    }, [userIsOnline, userStatusFromContext?.isActive, user?.isActive]);

    return (
      <div className="flex items-center gap-2">
        <AvatarContent />
        {showStatus && (
          <div className="flex items-center gap-1">
            <OnlineStatus 
              isOnline={userIsOnline !== undefined ? userIsOnline : undefined}
              size={statusSize}
              position="relative"
              showPing={false}
              user={user || (userId ? { _id: userId } : undefined)}
            />
            <span className="text-xs text-gray-600">
              {statusText}
            </span>
          </div>
        )}
      </div>
    );
  }

  return <AvatarContent />;
});

export default Avatar;
