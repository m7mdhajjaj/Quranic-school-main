import React from "react";

const QuranPageSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50" dir="rtl">
      {/* ✨ Animated Header Skeleton */}
      <header className="sticky top-0 z-20 bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg py-6 mb-8">
        <div className="container mx-auto text-center px-4">
          <div className="h-10 bg-white/20 rounded-lg animate-pulse w-64 mx-auto mb-2"></div>
          <div className="h-5 bg-white/10 rounded animate-pulse w-96 mx-auto"></div>
        </div>
      </header>

      <div className="container mx-auto px-4 pb-10">
        <div className="max-w-7xl mx-auto">
          {/* ✨ Enhanced Filter & Search Skeleton */}
          <div className="bg-gradient-to-r from-emerald-100 to-teal-100 rounded-2xl shadow-md p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="w-full md:w-64">
                <div className="h-4 bg-emerald-200 rounded animate-pulse w-20 mb-2"></div>
                <div className="h-10 bg-white/60 rounded-lg animate-pulse w-full"></div>
              </div>
              <div className="w-full md:flex-1">
                <div className="h-12 bg-white/60 rounded-lg animate-pulse w-full"></div>
              </div>
            </div>
            <div className="text-center mt-4">
              <div className="inline-flex items-center gap-2 bg-white px-6 py-2 rounded-full shadow-sm">
                <div className="h-6 bg-emerald-200 rounded animate-pulse w-16"></div>
              </div>
            </div>
          </div>

          {/* ✨ Enhanced Surahs Grid Skeleton */}
          <div className="max-h-[65vh] overflow-y-auto px-2 scrollbar-thin rounded-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                <div
                  key={i}
                  className="bg-gradient-to-br from-white to-emerald-50 border-2 border-emerald-100 rounded-2xl shadow-md p-6 animate-pulse">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="h-7 bg-emerald-200 rounded animate-pulse w-32 mb-2"></div>
                      <div className="h-4 bg-emerald-100 rounded animate-pulse w-24"></div>
                    </div>
                    <div className="w-12 h-8 bg-blue-200 rounded-full animate-pulse"></div>
                  </div>
                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-emerald-100">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuranPageSkeleton;
