/**
 * StatCardSkeleton Component
 * Skeleton loader for StatCard component
 */

const StatCardSkeleton = () => {
  return (
    <div className="bg-white border border-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm relative overflow-hidden">
      {/* Shimmer effect */}
      <div className="absolute inset-0 skeleton-shimmer"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          {/* Icon Skeleton */}
          <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl sm:rounded-2xl animate-pulse"></div>
        </div>
        
        <div>
          {/* Title Skeleton */}
          <div className="h-3 sm:h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
          {/* Value Skeleton */}
          <div className="h-8 sm:h-9 lg:h-10 bg-gray-300 rounded w-20 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default StatCardSkeleton;
