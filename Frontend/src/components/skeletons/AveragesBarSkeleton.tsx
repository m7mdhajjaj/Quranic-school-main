/**
 * AveragesBarSkeleton Component
 * Skeleton loader for AveragesBar component
 */

export const AveragesBarSkeleton = () => {
  return (
    <div className="p-6 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border-t-2 border-emerald-300 rounded-xl shadow-lg animate-pulse skeleton-container">
      {/* Header skeleton */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-emerald-300 to-teal-400 rounded-xl w-14 h-14 shadow-lg"></div>
          <div>
            <div className="h-7 bg-emerald-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-emerald-200 rounded w-36"></div>
          </div>
        </div>
        
        {/* Badge skeleton */}
        <div className="h-11 bg-gradient-to-r from-emerald-300 to-teal-400 rounded-full w-44 shadow-lg"></div>
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" dir="rtl">
        {[1, 2, 3].map((index) => (
          <div key={index} className="transform transition-all duration-300">
            {/* Stat card skeleton */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              {/* Icon and title */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-7 h-7 bg-emerald-200 rounded"></div>
                <div className="h-5 bg-emerald-200 rounded w-28"></div>
              </div>
              
              {/* Value */}
              <div className="h-9 bg-emerald-300 rounded w-24 mb-2"></div>
              
              {/* Description */}
              <div className="h-4 bg-emerald-100 rounded w-36"></div>
            </div>
            
            {/* Progress ring skeleton */}
            <div className="mt-3 flex justify-center">
              <div className="relative inline-flex items-center justify-center contain-layout">
                <div className="w-20 h-20 bg-emerald-200 rounded-full"></div>
                <div className="absolute inset-0 flex items-center justify-center contain-layout">
                  <div className="w-8 h-5 bg-emerald-300 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
