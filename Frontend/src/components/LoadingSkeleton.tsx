import React from "react";

interface LoadingSkeletonProps {
  title?: string;
  description?: string;
}

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
export { ActivitySkeleton, ArrangementSkeleton };
