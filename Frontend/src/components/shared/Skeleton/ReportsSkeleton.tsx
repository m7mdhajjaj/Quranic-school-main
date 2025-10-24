import React from "react";

const ReportsSkeleton: React.FC = () => {
  return (
    <div className="container mx-auto py-8" dir="rtl">
      {/* Header Skeleton */}
      <div className="h-8 bg-gray-200 rounded-lg animate-pulse mb-6 w-32 mx-auto"></div>

      {/* Filter Section Skeleton */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-8 max-w-md mx-auto">
        <div className="h-6 bg-gray-200 rounded animate-pulse mb-4 w-48 mx-auto"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mb-2"></div>
            <div className="h-10 bg-gray-100 rounded animate-pulse w-full"></div>
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mb-2"></div>
            <div className="h-10 bg-gray-100 rounded animate-pulse w-full"></div>
          </div>
        </div>
      </div>

      {/* Chart Section Skeleton */}
      <div className="bg-white rounded-xl shadow-md p-6 max-w-2xl mx-auto mt-8">
        <div className="h-6 bg-gray-200 rounded animate-pulse mb-4 w-48 mx-auto"></div>

        {/* Chart Area Skeleton */}
        <div className="h-80 bg-gray-100 rounded-lg animate-pulse mb-4 relative overflow-hidden">
          {/* Chart bars simulation */}
          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around p-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col items-center">
                <div
                  className="bg-gray-300 animate-pulse w-8 rounded-t"
                  style={{ height: `${Math.random() * 120 + 40}px` }}></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-12 mt-2"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Description Skeleton */}
        <div className="text-center mt-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-80 mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default ReportsSkeleton;
