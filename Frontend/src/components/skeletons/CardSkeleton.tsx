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
      <div className="bg-gradient-to-br from-emerald-50 via-white to-emerald-100 border border-emerald-100 rounded-3xl overflow-hidden shadow-md">
        {/* Image Skeleton */}
        {hasImage && (
          <div className={`${imageHeight} overflow-hidden rounded-t-3xl`}>
            <ImageSkeleton />
          </div>
        )}
        
        {/* Content Skeleton */}
        <div className="p-6 space-y-3">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div className="h-4 bg-emerald-200 rounded w-16"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
          
          {/* Title */}
          <div className="h-8 bg-gray-300 rounded w-full"></div>
          
          {/* Content Lines */}
          <div className="space-y-2">
            {Array.from({ length: contentLines }).map((_, i) => {
              const widthClass = i === contentLines - 1 ? 'w-4/6' : i === contentLines - 2 ? 'w-5/6' : 'w-full';
              return (
                <div
                  key={i}
                  className={`h-4 bg-gray-200 rounded ${widthClass}`}
                ></div>
              );
            })}
          </div>
          
          {/* Button */}
          <div className="pt-3">
            <div className="h-10 bg-emerald-200 rounded-xl w-32"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardSkeleton;
