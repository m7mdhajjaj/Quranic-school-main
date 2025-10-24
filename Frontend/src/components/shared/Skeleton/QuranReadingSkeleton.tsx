import React from "react";

const QuranReadingSkeleton: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto animate-fadeIn" dir="rtl">
      {/* ✨ Enhanced Controls Skeleton */}
      <div className="bg-gradient-to-r from-white to-emerald-50 border-2 border-emerald-100 rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
          {/* Back Button */}
          <div className="h-12 bg-emerald-200 rounded-lg animate-pulse w-full lg:w-40"></div>

          {/* Surah Info */}
          <div className="text-center bg-white px-6 py-3 rounded-xl shadow-sm border-2 border-emerald-200 w-full lg:w-auto">
            <div className="h-6 bg-emerald-200 rounded animate-pulse w-32 mx-auto mb-2"></div>
            <div className="h-4 bg-emerald-100 rounded animate-pulse w-24 mx-auto"></div>
          </div>

          {/* Font Size Control */}
          <div className="w-full lg:w-64 bg-white p-4 rounded-xl shadow-sm border-2 border-emerald-200">
            <div className="h-4 bg-emerald-200 rounded animate-pulse w-20 mb-3"></div>
            <div className="h-2 bg-emerald-200 rounded-full animate-pulse w-full"></div>
          </div>
        </div>
      </div>

      {/* ✨ Enhanced Basmala Skeleton */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl shadow-lg p-6 text-center mb-8">
        <div className="h-10 bg-emerald-200 rounded animate-pulse w-48 mx-auto mb-2"></div>
        <div className="h-6 bg-emerald-100 rounded animate-pulse w-64 mx-auto"></div>
      </div>

      {/* ✨ Enhanced Ayahs Skeleton */}
      <div className="bg-gradient-to-br from-white to-emerald-50 border-2 border-emerald-100 rounded-2xl shadow-xl p-8 mb-8">
        <div className="space-y-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div
              key={i}
              className="flex items-start gap-4 p-4 rounded-xl border-b-2 border-emerald-100 last:border-b-0">
              {/* Ayah Number Badge */}
              <div className="flex-shrink-0 mt-1">
                <div className="w-10 h-10 bg-blue-200 rounded-full animate-pulse"></div>
              </div>

              {/* Ayah Text */}
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-gray-200 rounded animate-pulse w-full"></div>
                <div className="h-6 bg-gray-200 rounded animate-pulse w-11/12"></div>
                <div className="h-6 bg-gray-200 rounded animate-pulse w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ✨ Enhanced Pagination Skeleton */}
      <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-center gap-4 border-2 border-emerald-100">
        <div className="h-10 bg-emerald-200 rounded-lg animate-pulse w-24"></div>
        <div className="h-5 bg-gray-200 rounded animate-pulse w-32"></div>
        <div className="h-10 bg-emerald-200 rounded-lg animate-pulse w-24"></div>
      </div>
    </div>
  );
};

export default QuranReadingSkeleton;
