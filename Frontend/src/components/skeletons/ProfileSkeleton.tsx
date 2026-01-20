import ImageSkeleton from "./ImageSkeleton";

const ProfileSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hero Section Skeleton - matches ProfilePage design */}
      <div className="relative bg-gradient-to-b from-emerald-600 via-teal-700 to-slate-700 overflow-hidden pb-16">
        <div className="relative container mx-auto px-4 py-12">
          {/* Avatar Skeleton */}
          <div className="flex justify-center mb-8">
            <div className="relative animate-pulse">
              <div className="w-32 h-32 bg-white/20 rounded-full"></div>
            </div>
          </div>

          {/* Header Skeleton */}
          <div className="flex flex-col items-center mb-8">
            {/* Name Skeleton */}
            <div className="h-12 bg-white/30 rounded-lg w-64 mb-4 animate-pulse"></div>

            {/* Role and Age Badges Skeleton */}
            <div className="flex gap-3 mb-6">
              <div className="h-10 bg-white/30 rounded-full w-32 animate-pulse"></div>
              <div className="h-10 bg-white/30 rounded-full w-24 animate-pulse"></div>
            </div>

            {/* Action Buttons Skeleton */}
            <div className="flex gap-3">
              <div className="h-12 bg-white/30 rounded-xl w-40 animate-pulse"></div>
              <div className="h-12 bg-white/20 rounded-xl w-44 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section Skeleton */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
              {/* Icon and Label Skeleton */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-5 h-5 bg-gray-200 rounded"></div>
                <div className="h-5 bg-gray-200 rounded w-32"></div>
              </div>

              {/* Value Skeleton */}
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;
