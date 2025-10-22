import React from "react";

const QuranPageSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="text-center mb-8">
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse mb-2 w-64 mx-auto"></div>
          <div className="h-5 bg-gray-100 rounded animate-pulse w-96 mx-auto"></div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Search Skeleton */}
          <div className="mb-6">
            <div className="h-12 bg-gray-200 rounded-lg animate-pulse w-full"></div>
          </div>

          {/* Surahs Grid Skeleton */}
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            dir="rtl">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-md p-4 border-r-4 border-gray-300">
                <div className="text-right">
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-32 mb-2"></div>
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-24 mb-1"></div>
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-40"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuranPageSkeleton;
