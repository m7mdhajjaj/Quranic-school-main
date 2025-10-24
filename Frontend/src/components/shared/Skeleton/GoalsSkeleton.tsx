import React from "react";

const GoalsSkeleton: React.FC = () => {
  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100"
      dir="rtl">
      <div className="container mx-auto py-12 px-4">
        {/* Header Section Skeleton */}
        <div className="text-center mb-16">
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse mb-4 w-48 mx-auto"></div>
          <div className="w-24 h-1 bg-gray-200 mx-auto mb-6 animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-5 bg-gray-100 rounded animate-pulse w-3/4 mx-auto"></div>
            <div className="h-5 bg-gray-100 rounded animate-pulse w-2/3 mx-auto"></div>
          </div>
        </div>

        {/* Main Goals Grid Skeleton */}
        <div className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col md:flex-row">
                {/* Icon Section Skeleton */}
                <div className="bg-gray-200 animate-pulse p-6 md:w-1/4 flex justify-center items-center">
                  <div className="w-16 h-16 bg-gray-300 rounded-full animate-pulse"></div>
                </div>
                {/* Content Section Skeleton */}
                <div className="p-6 md:w-3/4">
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-32 mb-3"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-100 rounded animate-pulse w-full"></div>
                    <div className="h-4 bg-gray-100 rounded animate-pulse w-5/6"></div>
                    <div className="h-4 bg-gray-100 rounded animate-pulse w-4/5"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Goals Section Skeleton */}
        <div className="bg-gradient-to-r from-gray-300 to-gray-400 rounded-2xl shadow-lg py-10 px-6 mb-16 animate-pulse">
          <div className="h-7 bg-gray-500 rounded animate-pulse w-48 mx-auto mb-10"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white/20 backdrop-blur-sm p-6 rounded-lg">
                <div className="w-14 h-14 bg-gray-400 rounded-full mx-auto mb-4 animate-pulse"></div>
                <div className="h-6 bg-gray-400 rounded animate-pulse w-32 mx-auto mb-3"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-400 rounded animate-pulse w-full"></div>
                  <div className="h-4 bg-gray-400 rounded animate-pulse w-5/6 mx-auto"></div>
                  <div className="h-4 bg-gray-400 rounded animate-pulse w-4/5 mx-auto"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quote Section Skeleton */}
        <div className="bg-white rounded-xl shadow-md p-8 text-center mb-16 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gray-200 animate-pulse"></div>
          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-6 animate-pulse"></div>
          <div className="space-y-3">
            <div className="h-6 bg-gray-200 rounded animate-pulse w-80 mx-auto"></div>
            <div className="h-4 bg-gray-100 rounded animate-pulse w-48 mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalsSkeleton;
