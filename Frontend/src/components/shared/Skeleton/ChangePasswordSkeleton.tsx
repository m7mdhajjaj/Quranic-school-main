import React from "react";
import Skeleton from "./Skeleton";

/**
 * مكون Skeleton لنموذج تغيير كلمة المرور
 */
const ChangePasswordSkeleton: React.FC = () => {
  return (
    <div dir="rtl" className="p-8">
      {/* Logo Skeleton */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <Skeleton variant="circular" width={80} height={80} />
          <div className="absolute -bottom-1 -right-1">
            <Skeleton variant="circular" width={28} height={28} />
          </div>
        </div>
      </div>

      {/* Title Skeleton */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-2">
          <Skeleton height={36} width={200} />
        </div>
        <div className="flex justify-center">
          <Skeleton height={20} width={280} />
        </div>
      </div>

      {/* Form Content */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Right Column - Password Fields */}
        <div className="space-y-5">
          {/* Current Password Field */}
          <div>
            <Skeleton height={20} width={140} className="mb-2" />
            <Skeleton variant="rounded" height={44} />
          </div>

          {/* New Password Field */}
          <div>
            <Skeleton height={20} width={140} className="mb-2" />
            <Skeleton variant="rounded" height={44} />
          </div>

          {/* Confirm Password Field */}
          <div>
            <Skeleton height={20} width={180} className="mb-2" />
            <Skeleton variant="rounded" height={44} />
          </div>

          {/* Password Strength Indicator */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <Skeleton height={14} width={100} />
              <Skeleton height={14} width={60} />
            </div>
            <Skeleton variant="rounded" height={8} />
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3">
            <Skeleton variant="rounded" height={44} className="flex-1" />
            <Skeleton variant="rounded" height={44} className="flex-1" />
          </div>
        </div>

        {/* Left Column - Requirements & Tips */}
        <div className="space-y-6">
          {/* Password Requirements Card */}
          <div className="p-4 bg-emerald-50/80 rounded-lg border border-emerald-200/50">
            <Skeleton height={20} width={180} className="mb-3" />
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton variant="circular" width={8} height={8} />
                  <Skeleton height={16} width={`${60 + i * 10}%`} />
                </div>
              ))}
            </div>
          </div>

          {/* Security Tips Card */}
          <div className="p-4 bg-blue-50/80 border border-blue-200/50 rounded-lg">
            <div className="flex items-start gap-3">
              <Skeleton variant="circular" width={20} height={20} />
              <div className="flex-1">
                <Skeleton height={20} width={100} className="mb-2" />
                <div className="space-y-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} height={16} width="90%" />
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

export default ChangePasswordSkeleton;
