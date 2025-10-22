import React from "react";

const QuranReadingSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="text-center mb-8">
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse mb-2 w-64 mx-auto"></div>
          <div className="h-5 bg-gray-100 rounded animate-pulse w-96 mx-auto"></div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Controls Skeleton */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="h-10 bg-gray-200 rounded animate-pulse w-32"></div>
              <div className="text-center">
                <div className="h-5 bg-gray-200 rounded animate-pulse w-24 mb-1"></div>
                <div className="h-4 bg-gray-100 rounded animate-pulse w-20"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                <div className="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-8"></div>
              </div>
            </div>
          </div>

          {/* Bismillah Skeleton */}
          <div className="text-center mb-6">
            <div className="h-6 bg-gray-200 rounded animate-pulse w-80 mx-auto"></div>
          </div>

          {/* Ayahs Skeleton */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div
                  key={i}
                  className="border-b border-gray-100 pb-4 last:border-b-0">
                  <div className="text-right mb-2">
                    <div className="flex items-end justify-between">
                      <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse flex-shrink-0"></div>
                      <div className="flex-1 mr-2 space-y-2">
                        <div className="h-6 bg-gray-200 rounded animate-pulse w-full"></div>
                        <div className="h-6 bg-gray-200 rounded animate-pulse w-5/6"></div>
                        <div className="h-6 bg-gray-200 rounded animate-pulse w-4/5"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination Skeleton */}
          <div className="flex items-center justify-center gap-4 bg-white rounded-lg shadow-md p-4">
            <div className="h-10 bg-gray-200 rounded animate-pulse w-20"></div>
            <div className="h-5 bg-gray-200 rounded animate-pulse w-16"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse w-20"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuranReadingSkeleton;
