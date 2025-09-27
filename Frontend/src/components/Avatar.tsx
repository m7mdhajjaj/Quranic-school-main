import React from 'react';
import { User as UserIcon } from 'lucide-react';

export interface AvatarProps {
  /** Avatar image URL */
  src?: string | null;
  /** Alternative image URL (for preview when editing) */
  previewSrc?: string | null;
  /** Alt text for the image */
  alt?: string;
  /** Size of the avatar */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  /** User's name for fallback initial */
  userName?: string;
  /** User's gender for color theming */
  gender?: 'male' | 'female';
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
}

const sizeClasses = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
  '2xl': 'w-20 h-20',
  '3xl': 'w-24 h-24 md:w-28 md:h-28',
};

const iconSizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
  '2xl': 'w-10 h-10',
  '3xl': 'w-12 h-12',
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
};

const Avatar: React.FC<AvatarProps> = ({
  src,
  previewSrc,
  alt = 'صورة المستخدم',
  size = 'md',
  userName,
  gender = 'male',
  loading = false,
  clickable = false,
  onClick,
  className = '',
  showEditButton = false,
  onEditClick,
  fallbackIcon,
  border = 'thick',
}) => {
  const displaySrc = previewSrc || src;
  const initials = userName ? userName.charAt(0).toUpperCase() : '';

  const genderColors = {
    female: 'bg-gradient-to-br from-pink-400 to-fuchsia-500 border-pink-200/50 shadow-pink-500/30',
    male: 'bg-gradient-to-br from-emerald-400 to-teal-500 border-emerald-200/50 shadow-emerald-500/30',
  };

  const LoadingSkeleton = () => (
    <div
      className={`${sizeClasses[size]} rounded-full ${borderClasses[border]} overflow-hidden flex items-center justify-center ${genderColors[gender]} shadow-lg relative`}
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
          ${displaySrc ? 'bg-white' : genderColors[gender]} 
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
          }
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
            {fallbackIcon || (
              initials ? (
                <span className={`text-white font-bold ${textSizeClasses[size]} drop-shadow-sm`}>
                  {initials}
                </span>
              ) : (
                <UserIcon className={`${iconSizeClasses[size]} text-white`} />
              )
            )}

            {/* Subtle retry indicator on hover for clickable avatars */}
            {clickable && !displaySrc && (
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full flex items-center justify-center">
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

      {/* Edit button */}
      {showEditButton && onEditClick && (
        <button
          type="button"
          onClick={onEditClick}
          className="absolute -bottom-2 right-0 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-2 cursor-pointer shadow-lg transition transform group-hover:-translate-y-0.5"
          title="تغيير الصورة"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      )}
    </div>
  );

  return <AvatarContent />;
};

export default Avatar;