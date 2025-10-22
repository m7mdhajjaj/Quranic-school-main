import React from "react";

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

export default ArrangementSkeleton;
