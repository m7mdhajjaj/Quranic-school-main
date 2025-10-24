import React from "react";

const NewsSkeleton: React.FC = () => {
  return (
    <main className="container mx-auto px-4 py-12" dir="rtl">
      <section className="mb-12">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center mb-8">
          <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg w-80"></div>
          <div className="h-10 bg-gradient-to-r from-emerald-100 via-emerald-200 to-emerald-100 bg-[length:200%_100%] animate-shimmer rounded-lg w-40"></div>
        </div>
        {/* Description Skeleton */}
        <div className="mb-12 space-y-3">
          <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg w-full max-w-3xl"></div>
          <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg w-5/6 max-w-2xl"></div>
        </div>
        {/* News Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-lg overflow-hidden animate-fadeIn">
              {/* Image Skeleton with Shimmer */}
              <div className="w-full h-64 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent"></div>
              </div>
              {/* Content Skeleton */}
              <div className="p-6">
                {/* Title and Date Skeleton */}
                <div className="flex justify-between items-center mb-3">
                  <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg w-48"></div>
                  <div className="h-6 bg-gradient-to-r from-emerald-100 via-emerald-200 to-emerald-100 bg-[length:200%_100%] animate-shimmer rounded-full w-24"></div>
                </div>
                {/* Content Lines Skeleton */}
                <div className="space-y-3 mb-4">
                  <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-full"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-5/6"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-3/4"></div>
                </div>
                {/* Action Buttons Skeleton */}
                <div className="flex flex-wrap justify-between items-center mt-4 gap-2">
                  <div className="h-10 bg-gradient-to-r from-emerald-100 via-emerald-200 to-emerald-100 bg-[length:200%_100%] animate-shimmer rounded-lg w-28"></div>
                  <div className="flex gap-2">
                    <div className="h-10 bg-gradient-to-r from-amber-100 via-amber-200 to-amber-100 bg-[length:200%_100%] animate-shimmer rounded-lg w-20"></div>
                    <div className="h-10 bg-gradient-to-r from-red-100 via-red-200 to-red-100 bg-[length:200%_100%] animate-shimmer rounded-lg w-16"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default NewsSkeleton;
