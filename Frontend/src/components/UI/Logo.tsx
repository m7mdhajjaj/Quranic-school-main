import React from 'react';
import { Image } from 'lucide-react';

interface LogoProps {
  logoUrl: string | null;
  logoLoading: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  alt?: string;
  showGlow?: boolean;
  className?: string;
  variant?: 'default' | 'header';
}

export const Logo: React.FC<LogoProps> = ({
  logoUrl,
  logoLoading,
  size = 'lg',
  alt = 'مدرسة القرآن',
  showGlow = true,
  className = '',
  variant = 'default',
}) => {
  const sizes = {
    sm: 'h-12 w-12 md:h-14 md:w-14 lg:h-16 lg:w-16',
    md: 'h-24 w-24 sm:h-28 sm:w-28',
    lg: 'h-32 w-32 sm:h-40 sm:w-40 lg:h-48 lg:w-48',
    xl: 'h-40 w-40 sm:h-48 sm:w-48 lg:h-56 lg:w-56',
  };

  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  };

  // Header variant styles
  const headerStyles = variant === 'header' ? {
    container: 'rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/30 shadow-xl',
    loadingSkeleton: 'bg-gradient-to-br from-white/40 to-white/20 animate-pulse',
    defaultIcon: 'bg-gradient-to-br from-white/60 to-white/40',
    iconColor: 'text-emerald-600'
  } : {
    container: 'rounded-full border-4 border-emerald-500/40 shadow-2xl backdrop-blur-sm',
    loadingSkeleton: 'bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse',
    defaultIcon: 'bg-gradient-to-br from-emerald-200 to-teal-200',
    iconColor: 'text-emerald-600'
  };

  return (
    <div className={`relative group ${className}`}>
      {/* Glow Effect */}
      {showGlow && variant !== 'header' && (
        <div className="absolute -inset-4 bg-gradient-to-r from-emerald-300/40 via-teal-300/40 to-cyan-300/40 rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-500 animate-pulse"></div>
      )}

      {logoLoading ? (
        // Loading Skeleton
        <div
          className={`relative ${sizes[size]} ${headerStyles.container} flex items-center justify-center`}
        >
          <div className={`w-9 h-9 md:w-10 md:w-10 lg:w-12 lg:h-12 rounded-full ${headerStyles.loadingSkeleton}`}></div>
        </div>
      ) : logoUrl ? (
        // Logo Image
        variant === 'header' ? (
          <div className={`relative ${sizes[size]} ${headerStyles.container} flex items-center justify-center`}>
            <img
              src={logoUrl}
              alt={alt}
              loading="eager"
              decoding="async"
              width="48"
              height="48"
              className="w-9 h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full object-cover"
            />
          </div>
        ) : (
          <img
            src={logoUrl}
            alt={alt}
            loading="eager"
            decoding="async"
            width="192"
            height="192"
            className={`relative ${sizes[size]} ${headerStyles.container} object-cover`}
          />
        )
      ) : (
        // Default Icon
        <div
          className={`relative ${sizes[size]} ${headerStyles.container} ${headerStyles.defaultIcon} flex items-center justify-center`}
        >
          <Image className={`${variant === 'header' ? 'w-5 h-5' : iconSizes[size]} ${headerStyles.iconColor}`} />
        </div>
      )}
    </div>
  );
};
