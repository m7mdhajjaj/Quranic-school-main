/**
 * ListSkeleton Component
 * Skeleton loader for lists (Top Students, Top Teachers, etc.)
 */

interface ListSkeletonProps {
  /**
   * Number of items to show
   * @default 5
   */
  count?: number;
  /**
   * Show avatar skeleton
   * @default true
   */
  showAvatar?: boolean;
}

export const ListSkeleton = ({ count = 5, showAvatar = true }: ListSkeletonProps) => {
  return (
    <div className="space-y-3 sm:space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-2 sm:gap-3 lg:gap-4 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 relative overflow-hidden">
          {/* Shimmer effect */}
          <div className="absolute inset-0 skeleton-shimmer opacity-30"></div>
          
          <div className="relative z-10 flex items-center w-full">
            {/* Medal/Icon */}
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full flex-shrink-0 animate-pulse"></div>

            {/* Avatar */}
            {showAvatar && (
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-300 flex-shrink-0 animate-pulse"></div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="h-4 sm:h-5 bg-gray-300 rounded w-32 mb-2 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
            </div>

            {/* Value Badge */}
            <div className="flex items-center gap-2 bg-gray-200 px-3 py-2 rounded-lg flex-shrink-0 animate-pulse">
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
              <div className="h-5 bg-gray-300 rounded w-8"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListSkeleton;
