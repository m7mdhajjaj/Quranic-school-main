/**
 * AbsentStudentCardSkeleton Component
 * Skeleton loader for absent students cards in grid layout
 */

interface AbsentStudentCardSkeletonProps {
  /**
   * Number of cards to show
   * @default 8
   */
  count?: number;
}

export const AbsentStudentCardSkeleton = ({ count = 8 }: AbsentStudentCardSkeletonProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col gap-1.5 p-2.5 sm:p-3 bg-gray-50 border border-gray-200 rounded-lg animate-pulse"
        >
          {/* Header with Avatar and Name */}
          <div className="flex items-center gap-2">
            {/* Avatar Circle */}
            <div className="flex-shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-300 rounded-full"></div>
            </div>
            {/* Name */}
            <div className="flex-1 min-w-0">
              <div className="h-4 bg-gray-300 rounded w-24 sm:w-28"></div>
            </div>
          </div>
          
          {/* Teacher and Group Info */}
          <div className="flex flex-col gap-1">
            {/* Teacher */}
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-gray-300 rounded flex-shrink-0"></div>
              <div className="h-3 bg-gray-200 rounded w-20 sm:w-24"></div>
            </div>
            {/* Group */}
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-gray-300 rounded flex-shrink-0"></div>
              <div className="h-3 bg-gray-200 rounded w-16 sm:w-20"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AbsentStudentCardSkeleton;
