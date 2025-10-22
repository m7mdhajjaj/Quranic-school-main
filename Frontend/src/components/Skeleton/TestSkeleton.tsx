import React from "react";

const TestSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Section Skeleton */}
        <div className="text-center mb-8">
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse mb-4 w-80 mx-auto"></div>
          <div className="h-6 bg-gray-100 rounded animate-pulse w-96 mx-auto"></div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Surah Selection Section Skeleton */}
          <div className="mb-6">
            <div className="h-6 bg-gray-200 rounded animate-pulse w-48 mb-3"></div>

            {/* Action Buttons Skeleton */}
            <div className="mb-3 flex gap-2">
              <div className="h-9 bg-gray-200 rounded-lg animate-pulse w-20"></div>
              <div className="h-9 bg-gray-200 rounded-lg animate-pulse w-20"></div>
            </div>

            {/* Surah List Container Skeleton */}
            <div className="max-h-60 overflow-y-auto border-2 border-gray-300 rounded-xl p-4 space-y-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                <div
                  key={i}
                  className="flex items-center p-2 hover:bg-gray-50 rounded-lg">
                  <div className="w-4 h-4 bg-gray-200 rounded animate-pulse ml-3"></div>
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-64"></div>
                </div>
              ))}
            </div>

            {/* Selected Surahs Info Skeleton */}
            <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="h-5 bg-gray-200 rounded animate-pulse w-32"></div>
                <div className="h-5 bg-gray-200 rounded-full animate-pulse w-16"></div>
              </div>
              <div className="flex flex-wrap gap-1">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-6 bg-gray-200 rounded-full animate-pulse w-20"></div>
                ))}
                <div className="h-6 bg-gray-200 rounded-full animate-pulse w-24"></div>
              </div>
              <div className="h-4 bg-gray-100 rounded animate-pulse w-80 mt-3"></div>
            </div>
          </div>

          {/* Timer Information Section Skeleton */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
            <div className="h-6 bg-gray-200 rounded animate-pulse w-40 mb-3"></div>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center">
                  <div className="w-2 h-2 bg-gray-200 rounded-full ml-3 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-64"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Start Button Skeleton */}
          <div className="h-12 bg-gray-200 rounded-xl animate-pulse w-full"></div>
        </div>
      </div>
    </div>
  );
};

export default TestSkeleton;
