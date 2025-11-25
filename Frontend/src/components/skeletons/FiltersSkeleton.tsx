/**
 * FiltersSkeleton Component
 * Skeleton loader for filter inputs (select, search, etc.)
 */

interface FiltersSkeletonProps {
  /**
   * Number of filter inputs to show
   * @default 2
   */
  count?: number;
  /**
   * Height of each skeleton input
   * @default "42px"
   */
  height?: string;
}

export const FiltersSkeleton = ({ count = 2, height = "42px" }: FiltersSkeletonProps) => {
  // تحويل height لـ Tailwind class
  const heightClass = height === "42px" ? "h-[42px]" : "h-12";
  
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-24 mb-3"></div>
          <div className={`bg-gray-200 rounded-lg ${heightClass}`}></div>
        </div>
      ))}
    </>
  );
};

export default FiltersSkeleton;
