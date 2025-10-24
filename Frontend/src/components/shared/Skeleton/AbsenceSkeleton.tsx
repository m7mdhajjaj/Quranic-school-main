import React from "react";

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

export default AbsenceSkeleton;
