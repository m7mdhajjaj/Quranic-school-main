import React from "react";

const QuranAudioSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="text-center mb-8">
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse mb-4 w-80 mx-auto"></div>
          <div className="h-6 bg-gray-100 rounded animate-pulse w-96 mx-auto"></div>
        </div>

        {/* Reciter Selection Skeleton */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse mb-4 w-32"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div
                key={i}
                className="p-4 rounded-lg border-2 border-gray-200 bg-gray-50">
                <div className="h-6 bg-gray-200 rounded animate-pulse w-32"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Surah Selection Skeleton */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse mb-4 w-32"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map(
              (i) => (
                <div
                  key={i}
                  className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="h-5 bg-gray-200 rounded animate-pulse w-20 mb-1"></div>
                      <div className="h-4 bg-gray-100 rounded animate-pulse w-16"></div>
                    </div>
                    <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Audio Controls Skeleton */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="text-center mb-6">
            <div className="h-8 bg-gray-200 rounded animate-pulse w-48 mx-auto mb-2"></div>
            <div className="h-5 bg-gray-100 rounded animate-pulse w-32 mx-auto"></div>
          </div>
          <div className="flex flex-col justify-center items-center gap-4">
            <div className="h-12 bg-gray-200 rounded-lg animate-pulse w-48"></div>
          </div>
        </div>

        {/* Ayahs Display Skeleton */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-24 mx-auto mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="border-b border-gray-100 pb-4 last:border-b-0">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse flex-shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-full"></div>
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-5/6"></div>
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-4/5"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuranAudioSkeleton;
