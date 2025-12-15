import ImageSkeleton from "./ImageSkeleton";

interface CardSkeletonProps {
  hasImage?: boolean;
  imageHeight?: string;
  contentLines?: number;
}

const CardSkeleton = ({
  hasImage = true,
  imageHeight = "h-60 sm:h-64 md:h-72",
  contentLines = 3,
}: CardSkeletonProps) => {
  return (
    <div className="animate-pulse">
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
        {/* Global Shimmer Overlay (stronger visibility) */}
        <div className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-gray-100/80 to-transparent" />

        {/* Image Skeleton */}
        {hasImage && (
          <div className={`${imageHeight} overflow-hidden`}>
            <ImageSkeleton />
          </div>
        )}
        
        {/* Content Skeleton */}
        <div className="p-5 sm:p-6">
          {hasImage ? (
            <>
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>

              {/* Title */}
              <div className="h-7 bg-gray-300 rounded w-11/12 mb-4"></div>

              {/* Content Lines */}
              <div className="space-y-2">
                {Array.from({ length: contentLines }).map((_, i) => {
                  const widthClass =
                    i === contentLines - 1
                      ? "w-4/6"
                      : i === contentLines - 2
                        ? "w-5/6"
                        : "w-full";
                  return <div key={i} className={`h-4 bg-gray-200 rounded ${widthClass}`}></div>;
                })}
              </div>

              {/* Button */}
              <div className="pt-4">
                <div className="h-10 bg-emerald-200 rounded-xl w-32"></div>
              </div>
            </>
          ) : (
            <>
              {/* Avatar + Title (better for student cards) */}
              <div className="flex items-start gap-4 mb-5" dir="rtl">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-300 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>

              {/* Info rows */}
              <div className="space-y-3">
                {Array.from({ length: Math.max(3, contentLines) }).map((_, i) => {
                  const widthClass = i % 3 === 0 ? "w-full" : i % 3 === 1 ? "w-5/6" : "w-4/6";
                  return <div key={i} className={`h-4 bg-gray-200 rounded ${widthClass}`}></div>;
                })}
              </div>

              {/* Actions row */}
              <div className="pt-5 flex gap-2">
                <div className="h-10 bg-gray-200 rounded-xl w-24"></div>
                <div className="h-10 bg-emerald-200 rounded-xl w-24"></div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardSkeleton;
