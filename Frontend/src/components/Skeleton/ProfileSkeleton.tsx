import React from "react";

const ProfileSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section Skeleton */}
        <div className="relative bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl shadow-2xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar Skeleton */}
            <div className="relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white/20 animate-pulse"></div>
              <div className="absolute bottom-0 right-0 w-12 h-12 bg-white/30 rounded-full animate-pulse"></div>
            </div>

            {/* User Info Skeleton */}
            <div className="flex-1 text-center md:text-right space-y-3">
              <div className="h-10 bg-white/20 rounded-lg animate-pulse w-64 mx-auto md:mx-0"></div>
              <div className="h-6 bg-white/15 rounded-lg animate-pulse w-48 mx-auto md:mx-0"></div>
              
              {/* Status Badges Skeleton */}
              <div className="flex flex-wrap gap-3 justify-center md:justify-start mt-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-8 bg-white/20 rounded-full animate-pulse w-24"></div>
                ))}
              </div>
            </div>

            {/* Action Buttons Skeleton */}
            <div className="flex gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl animate-pulse"></div>
              <div className="w-12 h-12 bg-white/20 rounded-xl animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Info Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                  <div className="h-6 bg-gray-300 rounded-lg animate-pulse w-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info Section Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Info Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-32"></div>
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-20 mb-2"></div>
                    <div className="h-5 bg-gray-300 rounded-lg animate-pulse w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Groups/Additional Info Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-teal-100 rounded-xl animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-32"></div>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;
