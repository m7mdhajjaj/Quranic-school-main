import React from "react";

interface LoadingSkeletonProps {
  title?: string;
  description?: string;
}

// Test Page Skeleton
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

// Test Question Skeleton
const TestQuestionSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar Skeleton */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
            <div className="flex items-center space-x-4">
              <div className="h-5 bg-gray-200 rounded animate-pulse w-12"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2 animate-pulse"></div>
          <div className="w-full bg-gray-200 rounded-full h-1 animate-pulse"></div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Question Preparation Skeleton */}
          <div className="text-center mb-6">
            <div className="w-8 h-8 bg-gray-200 rounded-full mx-auto mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-40 mx-auto"></div>
          </div>

          {/* Question Section Skeleton */}
          <div className="mb-6">
            <div className="h-6 bg-gray-200 rounded-full animate-pulse w-24 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded animate-pulse w-full mb-4"></div>

            {/* Context Box Skeleton */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <div className="space-y-2">
                <div className="h-5 bg-gray-200 rounded animate-pulse w-full"></div>
                <div className="h-5 bg-gray-200 rounded animate-pulse w-5/6"></div>
              </div>
            </div>
          </div>

          {/* Answer Options Skeleton */}
          <div className="space-y-3 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-full p-4 border-2 border-gray-200 rounded-xl bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-5 bg-gray-200 rounded animate-pulse w-4 mr-2"></div>
                    <div className="h-5 bg-gray-200 rounded animate-pulse w-48"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Button Skeleton */}
          <div className="h-12 bg-gray-200 rounded-xl animate-pulse w-full"></div>
        </div>
      </div>
    </div>
  );
};

// Reports Page Skeleton
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

// Quran Audio Page Skeleton
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

// Quran Page Skeleton
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

// Quran Reading View Skeleton
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

// Daily Marks Page Skeleton
const DailyMarksSkeleton: React.FC = () => {
  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4"
      dir="rtl">
      <div className="container mx-auto">
        {/* Header Section Skeleton */}
        <div className="text-center mb-10">
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse mb-4 w-80 mx-auto"></div>
          <div className="w-24 h-1 bg-gray-200 mx-auto mb-6 animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-6 bg-gray-100 rounded animate-pulse w-64 mx-auto"></div>
            <div className="h-4 bg-gray-100 rounded animate-pulse w-32 mx-auto"></div>
          </div>
        </div>

        {/* Month and Year Filter Skeleton */}
        <div className="mb-6 flex justify-center">
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="h-6 bg-gray-200 rounded animate-pulse w-64 mx-auto mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20 mb-2"></div>
                <div className="h-10 bg-gray-100 rounded animate-pulse w-full"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20 mb-2"></div>
                <div className="h-10 bg-gray-100 rounded animate-pulse w-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Teacher View Layout Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student List Card Skeleton */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden lg:col-span-1">
            <div className="bg-gray-200 py-4 px-6 animate-pulse">
              <div className="h-6 bg-gray-300 rounded animate-pulse w-24"></div>
            </div>
            <div className="p-4 max-h-80 overflow-y-auto">
              <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="py-3">
                    <div className="w-full py-2 px-4 rounded-lg bg-gray-100 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-48"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 bg-gray-50 space-y-3">
              <div className="h-12 bg-gray-200 rounded-lg animate-pulse w-full"></div>
              <div className="h-12 bg-gray-200 rounded-lg animate-pulse w-full"></div>
              <div className="h-12 bg-gray-200 rounded-lg animate-pulse w-full"></div>
            </div>
          </div>

          {/* Student Details and Marks Skeleton */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gray-200 py-4 px-6 animate-pulse">
                <div className="h-6 bg-gray-300 rounded animate-pulse w-64"></div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr className="text-right">
                      <th className="py-3 px-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
                      </th>
                      <th className="py-3 px-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                      </th>
                      <th className="py-3 px-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                      </th>
                      <th className="py-3 px-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                      </th>
                      <th className="py-3 px-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                      </th>
                      <th className="py-3 px-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
                            <div className="w-16 h-2 bg-gray-200 rounded-full mr-2 animate-pulse"></div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
                            <div className="w-16 h-2 bg-gray-200 rounded-full mr-2 animate-pulse"></div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="h-6 bg-gray-200 rounded-lg animate-pulse w-20"></div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Averages Section Skeleton */}
              <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-t">
                <div className="h-6 bg-gray-200 rounded animate-pulse w-48 mx-auto mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-white rounded-lg p-4 shadow-sm border-r-4 border-gray-300">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-20 mb-1"></div>
                      <div className="h-8 bg-gray-200 rounded animate-pulse w-16 mb-2"></div>
                      <div className="h-3 bg-gray-100 rounded animate-pulse w-24"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Goals Page Skeleton
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

// Absence Page Skeleton
const AbsenceSkeleton: React.FC = () => {
  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8 px-4"
      dir="rtl">
      <div className="container mx-auto max-w-6xl">
        {/* Header Skeleton */}
        <div className="text-center mb-8">
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse mb-2 w-80 mx-auto"></div>
          <div className="w-24 h-1 bg-gray-200 mx-auto mb-4 animate-pulse"></div>
          <div className="h-5 bg-gray-100 rounded-lg animate-pulse w-96 mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Control Panel Skeleton */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
              {/* Date Input Skeleton */}
              <div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-16 mb-1"></div>
                <div className="h-10 bg-gray-100 rounded-lg animate-pulse w-full"></div>
              </div>

              {/* Group Filter Skeleton */}
              <div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20 mb-1"></div>
                <div className="h-10 bg-gray-100 rounded-lg animate-pulse w-full"></div>
              </div>

              {/* Search Input Skeleton */}
              <div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24 mb-1"></div>
                <div className="h-10 bg-gray-100 rounded-lg animate-pulse w-full"></div>
              </div>

              {/* Buttons Skeleton */}
              <div className="flex gap-2 items-end w-full">
                <div className="h-10 bg-gray-200 rounded-lg animate-pulse flex-1"></div>
                <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-24"></div>
              </div>
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-16 mx-auto mb-2"></div>
                <div className="h-8 bg-gray-200 rounded animate-pulse w-12 mx-auto"></div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-16 mx-auto mb-2"></div>
                <div className="h-8 bg-gray-200 rounded animate-pulse w-12 mx-auto"></div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20 mx-auto mb-2"></div>
                <div className="h-8 bg-gray-200 rounded animate-pulse w-16 mx-auto"></div>
              </div>
            </div>
          </div>

          {/* Students Table Skeleton */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Table Header Skeleton */}
            <div className="bg-gray-200 py-4 px-6 animate-pulse">
              <div className="h-6 bg-gray-300 rounded w-32 animate-pulse"></div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-right">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                    </th>
                    <th className="py-3 px-4 text-right">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                    </th>
                    <th className="py-3 px-4 text-right">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                    </th>
                    <th className="py-3 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-40"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <div className="w-5 h-5 bg-gray-200 rounded animate-pulse mx-auto"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Save Button Skeleton */}
            <div className="p-4 bg-gray-50 flex justify-center">
              <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-32"></div>
            </div>
          </div>

          {/* Instructions Card Skeleton */}
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex items-center mb-2">
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse ml-1"></div>
              <div className="h-5 bg-gray-200 rounded animate-pulse w-16"></div>
            </div>
            <div className="space-y-2 mr-6">
              <div className="h-4 bg-gray-100 rounded animate-pulse w-full"></div>
              <div className="h-4 bg-gray-100 rounded animate-pulse w-5/6"></div>
              <div className="h-4 bg-gray-100 rounded animate-pulse w-4/6"></div>
              <div className="h-4 bg-gray-100 rounded animate-pulse w-full"></div>
              <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// News Page Skeleton
const NewsSkeleton: React.FC = () => {
  return (
    <main className="container mx-auto px-4 py-12" dir="rtl">
      <section className="mb-12">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center mb-8">
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-80"></div>
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-40"></div>
        </div>

        {/* Description Skeleton */}
        <div className="mb-12">
          <div className="h-6 bg-gray-100 rounded-lg animate-pulse w-96 mb-2"></div>
          <div className="h-6 bg-gray-100 rounded-lg animate-pulse w-80"></div>
        </div>

        {/* News Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Image Skeleton */}
              <div className="w-full h-64 bg-gray-200 animate-pulse"></div>

              {/* Content Skeleton */}
              <div className="p-6">
                {/* Title and Date Skeleton */}
                <div className="flex justify-between items-center mb-3">
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-48"></div>
                  <div className="h-6 bg-gray-100 rounded-full animate-pulse w-24 px-3 py-1"></div>
                </div>

                {/* Content Skeleton */}
                <div className="space-y-2 mb-4">
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-full"></div>
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-5/6"></div>
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-4/6"></div>
                </div>

                {/* Action Buttons Skeleton */}
                <div className="flex flex-wrap justify-between items-center mt-4 gap-2">
                  <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-28"></div>
                  <div className="flex gap-2">
                    <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-20"></div>
                    <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-16"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

// Arrangement Page Skeleton
const ArrangementSkeleton: React.FC = () => {
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

          {/* Controls Skeleton */}
          <div className="flex flex-wrap justify-center items-center gap-4 mt-8">
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-40"></div>
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-48"></div>
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-40"></div>
          </div>

          {/* Period Title Skeleton */}
          <div className="h-6 bg-gray-100 rounded-lg animate-pulse w-48 mx-auto mt-8"></div>
        </div>

        {/* Olympic Podium Skeleton */}
        <div className="mb-20 relative">
          <div className="flex justify-center items-end h-96 mb-8">
            {/* Second place - left */}
            <div className="w-1/4 flex flex-col items-center mx-2">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-200 animate-pulse mb-4"></div>
              <div className="text-center mb-4">
                <div className="h-5 bg-gray-200 rounded animate-pulse w-32 mb-2"></div>
                <div className="h-4 bg-gray-100 rounded animate-pulse w-20"></div>
              </div>
              <div className="w-full bg-gray-200 h-40 rounded-t-lg animate-pulse"></div>
            </div>

            {/* First place - center */}
            <div className="w-1/3 flex flex-col items-center mx-2 -mt-10">
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-gray-200 animate-pulse mb-4"></div>
              <div className="text-center mb-4">
                <div className="h-6 bg-gray-200 rounded animate-pulse w-36 mb-2"></div>
                <div className="h-4 bg-gray-100 rounded animate-pulse w-24"></div>
              </div>
              <div className="w-full bg-gray-200 h-52 rounded-t-lg animate-pulse"></div>
            </div>

            {/* Third place - right */}
            <div className="w-1/4 flex flex-col items-center mx-2">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-200 animate-pulse mb-4"></div>
              <div className="text-center mb-4">
                <div className="h-5 bg-gray-200 rounded animate-pulse w-32 mb-2"></div>
                <div className="h-4 bg-gray-100 rounded animate-pulse w-20"></div>
              </div>
              <div className="w-full bg-gray-200 h-32 rounded-t-lg animate-pulse"></div>
            </div>
          </div>
          <div className="h-6 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>

        {/* Top 10 Table Skeleton */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gray-200 py-4 px-6 animate-pulse">
            <div className="h-6 bg-gray-300 rounded w-32 animate-pulse"></div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr className="text-right">
                  <th className="py-3 px-6">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                  </th>
                  <th className="py-3 px-6">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                  </th>
                  <th className="py-3 px-6">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                  </th>
                  <th className="py-3 px-6">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                  </th>
                  <th className="py-3 px-6">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse mr-2"></div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse mr-3"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Criteria Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-14 h-14 bg-gray-200 rounded-full animate-pulse mb-4 mx-auto"></div>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-20 mx-auto mb-2"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-100 rounded animate-pulse w-full"></div>
                <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4 mx-auto"></div>
                <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2 mx-auto"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Activity Page Skeleton
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

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  title = "جاري تحميل البيانات...",
  description = "الرجاء الانتظار",
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse mb-2 w-64"></div>
          <div className="h-6 bg-gray-100 rounded-lg animate-pulse w-48"></div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-24"></div>
                  <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <div className="h-6 bg-gray-200 rounded animate-pulse mb-6 w-40"></div>
              <div className="h-72 bg-gray-100 rounded-lg animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Loading Spinner */}
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg font-medium">{title}</p>
            <p className="text-gray-500 text-sm mt-2">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
export {
  ActivitySkeleton,
  ArrangementSkeleton,
  NewsSkeleton,
  AbsenceSkeleton,
  GoalsSkeleton,
  DailyMarksSkeleton,
  QuranPageSkeleton,
  QuranReadingSkeleton,
  QuranAudioSkeleton,
  ReportsSkeleton,
  TestSkeleton,
  TestQuestionSkeleton,
};
