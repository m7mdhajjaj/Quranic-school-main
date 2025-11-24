const StatCardSkeleton = () => {
  return (
    <div className="animate-pulse bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {/* Label */}
          <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
          {/* Value */}
          <div className="h-9 bg-gray-300 rounded w-16"></div>
        </div>
        {/* Icon */}
        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
      </div>
    </div>
  );
};

export default StatCardSkeleton;
