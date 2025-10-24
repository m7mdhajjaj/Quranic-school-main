import React from "react";

const ReportsSkeleton: React.FC = () => {
  return (
    <div
      className="container mx-auto py-4 sm:py-6 md:py-8 px-2 sm:px-4"
      dir="rtl">
      {/* Page Header Skeleton */}
      <div className="text-center mb-8 sm:mb-10 lg:mb-12 animate-fadeIn">
        {/* Icon Skeleton */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gray-300 rounded-full blur-xl opacity-30 animate-pulse"></div>
            <div className="relative bg-gray-300 rounded-full p-4 sm:p-6 shadow-2xl w-16 h-16 sm:w-20 sm:h-20 animate-pulse"></div>
          </div>
        </div>

        {/* Title Skeleton */}
        <div className="h-8 sm:h-10 lg:h-12 bg-gray-200 rounded-lg animate-pulse mb-3 sm:mb-4 w-64 sm:w-80 mx-auto"></div>

        {/* Subtitle Skeleton */}
        <div className="h-4 sm:h-5 lg:h-6 bg-gray-200 rounded animate-pulse w-80 sm:w-96 mx-auto mb-4 sm:mb-6"></div>

        {/* Divider Skeleton */}
        <div className="flex justify-center mt-4 sm:mt-6">
          <div className="h-1 w-20 sm:w-24 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Filter Section Skeleton - Updated to match new design */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-6 sm:mb-8 max-w-md mx-auto">
        <div className="h-6 bg-gray-200 rounded animate-pulse mb-3 sm:mb-4 w-48 mx-auto"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mb-2"></div>
            <div className="h-10 bg-gray-100 rounded-lg animate-pulse w-full border-2 border-gray-200"></div>
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mb-2"></div>
            <div className="h-10 bg-gray-100 rounded-lg animate-pulse w-full border-2 border-gray-200"></div>
          </div>
        </div>
      </div>

      {/* Chart Section Skeleton - Updated to match new design */}
      <div className="bg-white rounded-2xl shadow-2xl p-6 lg:p-8 max-w-4xl mx-auto mt-6 sm:mt-8">
        <div className="h-6 sm:h-8 bg-gray-200 rounded animate-pulse mb-4 sm:mb-6 w-48 sm:w-64 mx-auto"></div>

        {/* Chart Area Skeleton */}
        <div className="h-80 sm:h-96 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg animate-pulse mb-4 sm:mb-6 relative overflow-hidden">
          {/* Chart bars simulation */}
          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around p-4 sm:p-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col items-center">
                <div
                  className="bg-gradient-to-t from-emerald-300 to-teal-300 animate-pulse w-8 sm:w-10 rounded-t"
                  style={{ height: `${Math.random() * 120 + 40}px` }}></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-12 sm:w-16 mt-2"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Description Skeleton */}
        <div className="text-center mt-4 sm:mt-6">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-80 sm:w-96 mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default ReportsSkeleton;
