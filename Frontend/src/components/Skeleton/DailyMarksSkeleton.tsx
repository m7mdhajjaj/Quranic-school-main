import React from "react";

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

export default DailyMarksSkeleton;
