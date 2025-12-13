/**
 * AttendanceSkeleton Component
 * Skeleton loader for AttendanceSection
 */

export const AttendanceSkeleton = () => {
  // استخدام قيم ثابتة بدلاً من Math.random() للأداء
  const progressWidths = [45, 30, 25]; // قيم ثابتة للنسب
  
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 border border-gray-100 shadow-sm relative overflow-hidden">
      {/* Shimmer effect */}
      <div className="absolute inset-0 skeleton-shimmer opacity-20"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <div className="w-5 h-5 bg-gray-300 rounded animate-pulse"></div>
          <div className="h-6 bg-gray-300 rounded w-32 animate-pulse"></div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="border-2 border-gray-200 rounded-xl p-4 sm:p-5 bg-gray-50">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-8 sm:h-9 bg-gray-300 rounded w-12 animate-pulse"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-16 mb-2 animate-pulse"></div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="h-full bg-gray-300 rounded-full transition-all duration-1000" 
                  style={{ width: `${progressWidths[index]}%` }}></div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-12 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AttendanceSkeleton;
