import React from 'react';

interface LoadingSkeletonProps {
  title?: string;
  description?: string;
}

// Activity Page Skeleton
const ActivitySkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4" dir="rtl">
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
            <div key={i} className="h-8 bg-gray-200 rounded-full animate-pulse w-20"></div>
          ))}
        </div>

        {/* Activities Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden">
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
  description = "الرجاء الانتظار" 
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
            <div key={i} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
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
            <div key={i} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
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
export { ActivitySkeleton };