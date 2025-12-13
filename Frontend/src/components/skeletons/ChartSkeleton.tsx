/**
 * ChartSkeleton Component
 * Skeleton loader for charts (Donut, Pie, Bar charts)
 */

interface ChartSkeletonProps {
  /**
   * Type of chart skeleton
   * @default "donut"
   */
  type?: "donut" | "pie" | "bar";
}

export const ChartSkeleton = ({ type = "donut" }: ChartSkeletonProps) => {
  if (type === "bar") {
    return (
      <div className="animate-pulse w-full">
        <div className="h-full flex items-end justify-center gap-2 px-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center flex-1" style={{ minWidth: "60px" }}>
              <div className="w-full bg-gray-200 rounded-2xl" style={{ height: "200px" }}>
                <div
                  className="bg-gradient-to-t from-gray-300 to-gray-200 rounded-2xl w-full"
                  style={{
                    height: `${Math.random() * 60 + 30}%`,
                  }}></div>
              </div>
              <div className="mt-3 w-full">
                <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Donut or Pie Chart Skeleton - محسّن للأداء
  return (
    <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-8 w-full">
      {/* Chart SVG Skeleton */}
      <div className="relative w-full max-w-[280px] sm:w-[280px] aspect-square">
        {/* Shimmer effect بدلاً من animate-pulse للأداء الأفضل */}
        <div className="w-full h-full rounded-full bg-gray-200 border-4 border-gray-100 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skeleton-shimmer"></div>
        </div>
        {/* Center Circle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120px] h-[120px] bg-white rounded-full border-2 border-gray-100 flex flex-col items-center justify-center">
          <div className="h-6 bg-gray-300 rounded w-16 mb-2 animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
        </div>
      </div>

      {/* Legend Skeleton */}
      <div className="flex flex-col gap-2 sm:gap-3 w-full lg:w-auto lg:min-w-[240px]">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl border border-gray-200">
            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-lg bg-gray-300 flex-shrink-0 animate-pulse"></div>
            <div className="flex-1 min-w-0">
              <div className="h-4 bg-gray-300 rounded w-24 mb-1 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChartSkeleton;
