import React from 'react';
import { Image } from 'lucide-react';

interface LogoProps {
  logoUrl: string | null;
  logoLoading: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  alt?: string;
  showGlow?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  logoUrl,
  logoLoading,
  size = 'lg',
  alt = 'مدرسة القرآن',
  showGlow = true,
  className = '',
}) => {
  const sizes = {
    sm: 'h-16 w-16 sm:h-20 sm:w-20',
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

  return (
    <div className={`relative group ${className}`}>
      {/* Glow Effect */}
      {showGlow && (
        <div className="absolute -inset-4 bg-gradient-to-r from-emerald-300/40 via-teal-300/40 to-cyan-300/40 rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-500 animate-pulse"></div>
      )}

      {logoLoading ? (
        // Loading Skeleton
        <div
          className={`relative ${sizes[size]} rounded-full border-4 border-emerald-500/40 shadow-2xl backdrop-blur-sm bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse`}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-100/50 to-teal-100/50 animate-pulse"></div>
        </div>
      ) : logoUrl ? (
        // Logo Image
        <img
          src={logoUrl}
          alt={alt}
          className={`relative ${sizes[size]} rounded-full border-4 border-emerald-500/40 shadow-2xl backdrop-blur-sm object-cover`}
        />
      ) : (
        // Default Icon
        <div
          className={`relative ${sizes[size]} rounded-full border-4 border-emerald-500/40 shadow-2xl backdrop-blur-sm bg-gradient-to-br from-emerald-200 to-teal-200 flex items-center justify-center`}
        >
          <Image className={`${iconSizes[size]} text-emerald-600`} />
        </div>
      )}
    </div>
  );
};
