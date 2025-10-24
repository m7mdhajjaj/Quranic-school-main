import React from "react";

const HomeSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col-reverse md:flex-row items-center justify-between bg-white rounded-2xl overflow-hidden shadow-lg">
      {/* Text Skeleton */}
      <div className="w-full md:w-1/2 p-8 md:p-12">
        <div className="text-center mb-8">
          {/* Title Skeleton */}
          <div className="space-y-3 mb-6">
            <div className="h-8 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-lg w-4/5 mx-auto animate-pulse"></div>
            <div className="h-8 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-lg w-3/4 mx-auto animate-pulse"></div>
            <div className="h-8 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-lg w-5/6 mx-auto animate-pulse"></div>
          </div>

          {/* Paragraph Skeleton */}
          <div className="mx-auto max-w-2xl space-y-3">
            <div className="h-6 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-lg w-full animate-pulse"></div>
            <div className="h-6 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-lg w-11/12 mx-auto animate-pulse"></div>
            <div className="h-6 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-lg w-4/5 mx-auto animate-pulse"></div>

            <div className="h-5 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-lg w-full mt-4 animate-pulse"></div>
            <div className="h-5 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-lg w-10/12 mx-auto animate-pulse"></div>
            <div className="h-5 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-lg w-3/4 mx-auto animate-pulse"></div>
          </div>

          {/* Group Badge Skeleton */}
          <div className="h-4 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-full w-32 mx-auto mt-4 animate-pulse"></div>
        </div>

        {/* Button Skeleton */}
        <div className="h-12 bg-gradient-to-r from-emerald-200 via-emerald-100 to-emerald-200 rounded-full w-56 mx-auto animate-pulse"></div>
      </div>

      {/* Image Skeleton */}
      <div className="w-full md:w-1/2 p-6 md:p-0">
        <div className="bg-slate-200 rounded-tl-[80px] rounded-bl-2xl overflow-hidden relative h-[400px]">
          <div className="w-full h-full bg-gradient-to-br from-slate-300 via-slate-200 to-slate-300 animate-pulse relative">
            {/* Animated Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/40 via-white/60 to-white/40"></div>

            {/* Loading Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <svg
                  className="w-20 h-20 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeSkeleton;
