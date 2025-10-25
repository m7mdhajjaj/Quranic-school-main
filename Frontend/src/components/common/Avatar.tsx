import React from 'react';
import { User as UserIcon } from 'lucide-react';
import { useAvatar } from '../hooks/useAvatar';

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
  forceStatus?: 'online' | 'offline';
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

// أحجام نقطة الحالة
const statusDotSizeClasses = {
  xs: 'w-2 h-2',
  sm: 'w-2.5 h-2.5',
  md: 'w-3 h-3',
  lg: 'w-3.5 h-3.5',
  xl: 'w-4 h-4',
  '2xl': 'w-5 h-5',
  '3xl': 'w-6 h-6',
  '4xl': 'w-7 h-7',
};

// موضع نقطة الحالة
const statusDotPositionClasses = {
  xs: 'bottom-0 right-0',
  sm: 'bottom-0 right-0',
  md: 'bottom-0.5 right-0.5',
  lg: 'bottom-0.5 right-0.5',
  xl: 'bottom-1 right-1',
  '2xl': 'bottom-1 right-1',
  '3xl': 'bottom-1.5 right-1.5',
  '4xl': 'bottom-2 right-2',
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

  // أولوية الصورة:
  // 1. src مباشر
  // 2. user.avatar.url من Cloudinary
  // 3. fetchedAvatarUrl من API
  const finalAvatarUrl = src || user?.avatar?.url || fetchedAvatarUrl || null;
  const displaySrc = previewSrc || finalAvatarUrl;

  // معلومات المستخدم للـ fallback
  const userName = externalUserName || user?.firstName || user?.name || '';
  const initials = userName ? userName.charAt(0).toUpperCase() : '';
  
  // الجنس
  const userGender = user?.gender || externalGender;
  const gender = (() => {
    if (!userGender) return 'male';
    const normalized = userGender.toLowerCase().trim();
    if (normalized === 'male' || normalized === 'ذكر') return 'ذكر';
    if (normalized === 'female' || normalized === 'أنثى' || normalized === 'انثى') return 'أنثى';
    return 'male';
  })();

  // حالة التحميل
  const loading = externalLoading || isFetchingAvatar;

  // Simple status logic without external dependencies
  const userIsOnline = forceStatus === 'online' || (!forceStatus && showStatus);

  const getStatusTitle = () => {
    if (forceStatus)
      return forceStatus === 'online' ? 'نشط (مفروض)' : 'غير نشط (مفروض)';
    return userIsOnline ? 'نشط' : 'غير نشط';
  };

  const getStatusColor = () => {
    if (loading) return 'bg-gray-400';
    return userIsOnline ? 'bg-green-500' : 'bg-gray-400';
  };

  const getStatusText = () => {
    if (loading) return 'غير نشط';
    return userIsOnline ? 'نشط الآن' : 'غير نشط';
  };

  const getStatusDotSize = () => {
    switch (statusSize) {
      case 'sm': return 'w-2 h-2';
      case 'lg': return 'w-4 h-4';
      default: return 'w-3 h-3';
    }
  };

  // دالة للحصول على لون الجنس مع دعم القيم العربية والإنجليزية
  const getGenderColor = () => {
    if (gender === 'ذكر') {
      return 'bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 border-emerald-200/60 shadow-lg shadow-emerald-500/40';
    }
    if (gender === 'أنثى') {
      return 'bg-gradient-to-br from-pink-400 via-rose-500 to-fuchsia-600 border-pink-200/60 shadow-lg shadow-pink-500/40';
    }
    return 'bg-gradient-to-br from-gray-400 via-slate-500 to-gray-600 border-gray-200/60 shadow-lg shadow-gray-500/40';
  };

  // دالة للحصول على لون النص حسب الجنس
  const getTextColor = () => {
    return 'text-white drop-shadow-lg';
  };

  const LoadingSkeleton = () => (
    <div
      className={`${sizeClasses[size]} rounded-full ${borderClasses[border]} overflow-hidden flex items-center justify-center ${getGenderColor()} shadow-lg relative`}
      aria-label="جاري تحميل الصورة"
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_ease-in-out_infinite] rounded-full" />

      {/* Pulsing background */}
      <div className="w-full h-full bg-white/20 rounded-full animate-pulse" />

      {/* Loading dots */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex space-x-1">
          <div className="w-1 h-1 bg-white/70 rounded-full animate-[bounce_1.4s_ease-in-out_infinite] animation-delay-0"></div>
          <div className="w-1 h-1 bg-white/70 rounded-full animate-[bounce_1.4s_ease-in-out_infinite] animation-delay-200"></div>
          <div className="w-1 h-1 bg-white/70 rounded-full animate-[bounce_1.4s_ease-in-out_infinite] animation-delay-400"></div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

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
          ${clickable ? 'cursor-pointer hover:scale-105 hover:shadow-lg transition-all duration-300' : ''} 
          ${displaySrc ? 'bg-white' : getGenderColor()} 
          shadow-lg
          ${size === '3xl' ? 'shadow-xl' : ''}
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
              // Handle error by removing src - will fallback to initials/icon
              (e.target as HTMLImageElement).style.display = 'none';
            }}
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
                  className={`font-bold ${textSizeClasses[size]} ${getTextColor()} relative z-10`}
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

      {/* Status indicator - نقطة الحالة */}
      {showStatus && (
        <div
          className={`
            absolute 
            ${statusDotPositionClasses[size]} 
            ${statusDotSizeClasses[size]} 
            rounded-full 
            border-2 
            border-white 
            shadow-lg
            transition-all 
            duration-300
            ${
              userIsOnline
                ? 'bg-green-500 shadow-green-500/50'
                : 'bg-red-500 shadow-red-500/50'
            }
            ${userIsOnline ? 'animate-pulse' : ''}
          `}
          title={getStatusTitle()}
          aria-label={userIsOnline ? 'المستخدم متصل' : 'المستخدم غير متصل'}
        >
          {/* Inner glow effect */}
          <div
            className={`
            absolute inset-0.5 rounded-full 
            ${userIsOnline ? 'bg-green-400' : 'bg-red-400'} 
            opacity-60
          `}
          />
        </div>
      )}

      {/* Edit button */}
      {showEditButton && onEditClick && (
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
            transition 
            transform 
            group-hover:-translate-y-0.5
          `}
          title="تغيير الصورة"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      )}
    </div>
  );

  // إرجاع المحتوى مع النص الاختياري
  if (showStatusText) {
    return (
      <div className="flex items-center gap-2">
        <AvatarContent />
        {showStatus && (
          <div className="flex items-center gap-1">
            <div
              className={`
                ${getStatusDotSize()}
                ${getStatusColor()}
                rounded-full
                border-2 border-white
                shadow-sm
              `}
              title={getStatusText()}
            />
            <span className="text-xs text-gray-600">
              {getStatusText()}
            </span>
          </div>
        )}
      </div>
    );
  }

  return <AvatarContent />;
});

export default Avatar;
