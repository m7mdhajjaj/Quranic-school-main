import React from "react";
import Skeleton from "./Skeleton";

/**
 * مكون Skeleton عام لنموذج Modal
 * يمكن استخدامه مع أي modal يحتوي على نموذج
 */
const ModalFormSkeleton: React.FC = () => {
  return (
    <div dir="rtl" className="p-8">
      {/* Logo/Icon Skeleton */}
      <div className="flex justify-center mb-6">
        <Skeleton variant="circular" width={64} height={64} />
      </div>

      {/* Title & Subtitle */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-2">
          <Skeleton height={32} width="50%" />
        </div>
        <div className="flex justify-center">
          <Skeleton height={20} width="70%" />
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-5 max-w-2xl mx-auto">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <Skeleton height={20} width={120} className="mb-2" />
            <Skeleton variant="rounded" height={44} />
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div className="flex gap-3 mt-6 max-w-2xl mx-auto">
        <Skeleton variant="rounded" height={44} className="flex-1" />
        <Skeleton variant="rounded" height={44} className="flex-1" />
      </div>
    </div>
  );
};

export default ModalFormSkeleton;
