import React from "react";

const ActivitySkeleton: React.FC = () => {
  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4"
      dir="rtl">
      <div className="container mx-auto">
        {/* Header Skeleton */}
        <div className="text-center mb-16">
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse mb-4 w-80 mx-auto"></div>
          <div className="w-24 h-1 bg-gray-200 mx-auto mb-6 animate-pulse"></div>
          <div className="h-6 bg-gray-100 rounded-lg animate-pulse w-96 mx-auto mb-8"></div>

          {/* Add Activity Button Skeleton */}
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-40 mx-auto"></div>
        </div>

        {/* Filter Buttons Skeleton */}
        <div className="mb-8 flex flex-wrap justify-center gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-8 bg-gray-200 rounded-full animate-pulse w-20"></div>
          ))}
        </div>

        {/* Activities Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Image Skeleton */}
              <div className="h-80 bg-gray-200 animate-pulse"></div>

              {/* Content Skeleton */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-40"></div>
                  <div className="flex gap-2">
                    <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>

                {/* Description Skeleton */}
                <div className="space-y-2 mb-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                </div>

                {/* Date Skeleton */}
                <div className="flex items-center">
                  <div className="h-5 w-5 bg-gray-200 rounded animate-pulse ml-1"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivitySkeleton;
