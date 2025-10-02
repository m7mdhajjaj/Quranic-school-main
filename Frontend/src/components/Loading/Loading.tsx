import React, { useEffect, useState } from 'react';

interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullscreen?: boolean;
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars' | 'quran';
  overlay?: boolean;
  showProgress?: boolean;
  progress?: number;
  tips?: string[];
}

const Loading: React.FC<LoadingProps> = ({ 
  message = 'جاري التحميل...', 
  size = 'md',
  fullscreen = false,
  variant = 'spinner',
  overlay = true,
  showProgress = false,
  progress = 0,
  tips = []
}) => {
  const [currentTip, setCurrentTip] = useState(0);
  const [animatedProgress, setAnimatedProgress] = useState(0);

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const dotSizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
    xl: 'w-6 h-6'
  };

  const barSizes = {
    sm: 'w-1 h-8',
    md: 'w-1.5 h-12',
    lg: 'w-2 h-16',
    xl: 'w-3 h-24'
  };

  // Rotate tips every 3 seconds
  useEffect(() => {
    if (tips.length > 0) {
      const interval = setInterval(() => {
        setCurrentTip((prev) => (prev + 1) % tips.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [tips.length]);

  // Animate progress
  useEffect(() => {
    if (showProgress) {
      const timer = setTimeout(() => {
        setAnimatedProgress(progress);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [progress, showProgress]);

  // Spinner Variant
  const SpinnerLoader = () => (
    <div className="relative">
      <div 
        className={`${sizeClasses[size]} border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin-fast`}
      />
      <div 
        className={`${sizeClasses[size]} border-4 border-transparent border-r-teal-400 rounded-full animate-spin-reverse absolute top-0 left-0`}
      />
    </div>
  );

  // Dots Variant
  const DotsLoader = () => (
    <div className="flex gap-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`${dotSizes[size]} bg-emerald-600 rounded-full animate-bounce`}
          style={{ 
            animationDelay: `${i * 0.15}s`,
            animationDuration: '0.6s'
          }}
        />
      ))}
    </div>
  );

  // Pulse Variant
  const PulseLoader = () => (
    <div className="relative">
      <div className={`${sizeClasses[size]} bg-emerald-600 rounded-full animate-ping absolute`} />
      <div className={`${sizeClasses[size]} bg-emerald-500 rounded-full animate-pulse-slow`} />
    </div>
  );

  // Bars Variant
  const BarsLoader = () => (
    <div className="flex gap-1.5 items-end">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`${barSizes[size]} bg-gradient-to-t from-emerald-600 to-teal-400 rounded-full animate-bar`}
          style={{ 
            animationDelay: `${i * 0.1}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  );

  // Quran/Islamic Variant
  const QuranLoader = () => (
    <div className="relative">
      <div className={`${sizeClasses[size]} flex items-center justify-center`}>
        <svg 
          className="animate-spin-slow" 
          viewBox="0 0 50 50" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M25 5L27.5 20H32.5L28 24L30 35L25 30L20 35L22 24L17.5 20H22.5L25 5Z" 
            fill="url(#gradient)"
            className="animate-pulse-slow"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#14b8a6" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`${sizeClasses[size]} border-2 border-emerald-300 rounded-full animate-ping`} />
      </div>
    </div>
  );

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return <DotsLoader />;
      case 'pulse':
        return <PulseLoader />;
      case 'bars':
        return <BarsLoader />;
      case 'quran':
        return <QuranLoader />;
      default:
        return <SpinnerLoader />;
    }
  };

  const LoadingContent = () => (
    <div className="flex flex-col items-center justify-center gap-6 animate-fadeIn">
      {/* Loader */}
      <div className="relative">
        {renderLoader()}
      </div>

      {/* Message */}
      {message && (
        <div className="text-center space-y-2">
          <p className="text-gray-700 font-semibold text-lg animate-pulse-slow">
            {message}
          </p>
          
          {/* Animated dots */}
          <div className="flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce"
                style={{ 
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {showProgress && (
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-xs text-gray-600">
            <span>التقدم</span>
            <span className="font-semibold">{Math.round(animatedProgress)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
              style={{ width: `${animatedProgress}%` }}
            >
              <div className="absolute inset-0 bg-white/30 animate-shimmer" />
            </div>
          </div>
        </div>
      )}

      {/* Tips Rotation */}
      {tips.length > 0 && (
        <div className="max-w-md text-center">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 animate-slideUp">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-semibold text-emerald-900 mb-1">نصيحة</p>
                <p className="text-sm text-emerald-800 animate-fadeIn" key={currentTip}>
                  {tips[currentTip]}
                </p>
              </div>
            </div>
          </div>
          
          {/* Tip indicators */}
          {tips.length > 1 && (
            <div className="flex justify-center gap-1.5 mt-3">
              {tips.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentTip 
                      ? 'w-6 bg-emerald-600' 
                      : 'w-1.5 bg-emerald-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div 
        className={`fixed inset-0 flex items-center justify-center z-50 ${
          overlay 
            ? 'bg-white/90 backdrop-blur-md' 
            : 'bg-gradient-to-br from-emerald-50 via-teal-50 to-slate-50'
        }`}
      >
        <div className="relative">
          {/* Decorative circles */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-200/30 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-teal-200/30 rounded-full blur-3xl animate-pulse-slow-delayed" />
          
          <LoadingContent />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <LoadingContent />
    </div>
  );
};

export default Loading;