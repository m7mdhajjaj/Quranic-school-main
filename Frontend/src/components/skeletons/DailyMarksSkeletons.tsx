import {  AveragesBarSkeleton } from "@/components/skeletons";

export { AveragesBarSkeleton };

export const TableSkeleton = ({ rows = 5, hasActions = true }: { rows?: number, hasActions?: boolean }) => (
  <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
    {/* Header */}
    <div className="h-12 bg-gray-50 border-b border-gray-200 flex items-center px-4 gap-4">
        {hasActions && <div className="w-6 h-6 bg-gray-200 rounded" />}
        <div className="h-4 bg-gray-200 rounded w-8" /> {/* # */}
        <div className="h-4 bg-gray-200 rounded flex-1" /> {/* Name */}
        <div className="h-4 bg-gray-200 rounded w-24" /> {/* Mark 1 */}
        <div className="h-4 bg-gray-200 rounded w-24" /> {/* Mark 2 */}
        {hasActions && <div className="h-4 bg-gray-200 rounded w-16" />} {/* Actions */}
    </div>
    
    {/* Rows */}
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center p-4 border-b border-gray-100 last:border-0 gap-4">
        {hasActions && <div className="w-4 h-4 bg-gray-200 rounded" />}
        <div className="h-6 w-8 bg-gray-200 rounded" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-32 md:w-48" />
        </div>
        <div className="h-8 w-20 bg-gray-100 rounded hidden md:block" />
        <div className="h-8 w-20 bg-gray-100 rounded hidden md:block" />
        {hasActions && (
             <div className="flex gap-2">
                <div className="h-8 w-8 bg-gray-100 rounded" />
                <div className="h-8 w-8 bg-gray-100 rounded" />
            </div>
        )}
      </div>
    ))}
  </div>
);

export const SectionDetailsSkeleton = () => (
    <div className="space-y-6 animate-fade-in">
        {/* Back Button */}
        <div className="w-32 h-6 bg-gray-200 rounded animate-pulse" />

        {/* Section Header */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm animate-pulse space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                 <div className="flex items-center gap-4 w-full md:w-auto">
                     <div className="w-12 h-12 bg-gray-200 rounded-lg shrink-0" />
                     <div className="space-y-2 w-full">
                         <div className="w-48 h-6 bg-gray-200 rounded" />
                         <div className="w-32 h-4 bg-gray-200 rounded" />
                     </div>
                 </div>
                 <div className="w-full md:w-64 h-10 bg-gray-200 rounded shrink-0" />
            </div>
            
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="h-24 bg-gray-100 rounded-xl border border-gray-200" />
                <div className="h-24 bg-gray-100 rounded-xl border border-gray-200" />
            </div>
        </div>

        {/* Table */}
        <TableSkeleton rows={8} hasActions={true} />
    </div>
);

const SectionCardSkeleton = () => (
  <div className="bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/30 rounded-xl p-6 border-2 border-gray-300 shadow-lg h-full flex flex-col justify-between animate-pulse">
    {/* Dropdown placeholder */}
    <div className="absolute top-4 left-4">
      <div className="w-8 h-8 bg-gray-200 rounded-lg" />
    </div>
    
    {/* Header with Date */}
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-5 h-5 bg-emerald-200 rounded" />
        <div className="h-5 w-20 bg-emerald-200 rounded" />
      </div>
      <div className="h-3 w-36 bg-gray-200 rounded" />
    </div>

    {/* Status Badge */}
    <div className="mb-4">
      <div className="h-7 w-28 bg-emerald-100 rounded-lg border border-emerald-200" />
    </div>

    {/* Progress Bar */}
    <div className="space-y-2 mb-4">
      <div className="flex justify-between items-center">
        <div className="h-3 w-20 bg-gray-200 rounded" />
        <div className="h-3 w-12 bg-gray-200 rounded" />
      </div>
      <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full w-1/3 bg-emerald-300 rounded-full" />
      </div>
    </div>

    {/* Sections Preview */}
    <div className="space-y-3 mb-4">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-emerald-200 rounded" />
        <div className="h-4 w-full bg-emerald-100 rounded" />
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-teal-200 rounded" />
        <div className="h-4 w-full bg-teal-100 rounded" />
      </div>
    </div>

    {/* Footer */}
    <div className="pt-4 border-t border-emerald-200 flex justify-between items-center">
      <div className="h-8 w-24 bg-emerald-200 rounded-lg" />
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-gray-200 rounded" />
        <div className="h-4 w-12 bg-gray-200 rounded" />
      </div>
    </div>
  </div>
);

export const SectionsGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="animate-fade-in">
    {/* Back Button Skeleton */}
    <div className="mb-4 flex items-center gap-2">
      <div className="w-5 h-5 bg-emerald-200 rounded animate-pulse" />
      <div className="w-28 h-5 bg-emerald-200 rounded animate-pulse" />
    </div>

    {/* Header Card Skeleton */}
    <div className="mb-6 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border-2 border-emerald-300 shadow-lg rounded-xl p-5 animate-pulse">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        {/* Section Name */}
        <div className="flex items-start gap-4">
          <div className="p-3 bg-gradient-to-br from-emerald-300 to-teal-400 rounded-xl shadow-md shrink-0">
            <div className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <div className="h-7 w-40 bg-emerald-200 rounded mb-2" />
            <div className="h-4 w-24 bg-emerald-100 rounded mb-3" />
            <div className="h-9 w-32 bg-white rounded-lg border border-emerald-200" />
          </div>
        </div>

        {/* Date Range & Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
          <div className="w-full md:w-60 h-10 bg-white rounded-lg border border-emerald-200" />
          <div className="w-full md:w-64 h-10 bg-white rounded-lg border border-emerald-200" />
        </div>
      </div>
    </div>

    {/* Status Filter & Action Buttons Skeleton */}
    <div className="mb-6 flex flex-col xl:flex-row xl:items-center justify-between gap-4 animate-pulse">
      {/* Status Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-10 w-24 bg-white rounded-lg shrink-0 border-2 border-emerald-200 shadow-sm" />
        ))}
      </div>
      
      {/* Action Buttons */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-3">
        <div className="h-10 w-[140px] bg-gradient-to-r from-emerald-300 to-teal-400 rounded-lg" />
        <div className="h-10 w-28 bg-amber-100 rounded-lg border border-amber-200" />
        <div className="h-10 w-28 bg-purple-100 rounded-lg border border-purple-200" />
        <div className="h-10 w-[140px] bg-white rounded-lg border border-red-200" />
      </div>
    </div>

    {/* Sections Grid Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: Math.max(1, count) }).map((_, i) => (
        <SectionCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

export const DailyMarksPageSkeleton = () => (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-teal-50 to-green-50 py-6 px-3 md:px-4 lg:px-6" dir="rtl">
        <div className="w-full max-w-full mx-auto space-y-8 animate-pulse">
            {/* Header */}
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="space-y-4 relative z-10">
                   <div className="w-64 h-8 bg-white/20 rounded" />
                   <div className="w-48 md:w-96 h-4 bg-white/20 rounded" />
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-xl relative z-10" />
            </div>

            {/* Averages Mock */}
            <div className="h-40 bg-white rounded-xl border border-emerald-100 shadow-sm" />

            {/* Content Grid */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-xl h-64 shadow-sm p-5 space-y-4 border border-gray-100">
                         <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                             <div className="w-32 h-5 bg-gray-200 rounded" />
                         </div>
                        <div className="h-24 bg-gray-50 rounded-lg border border-gray-100" />
                        <div className="space-y-2 pt-2">
                            <div className="h-3 bg-gray-100 rounded w-full" />
                            <div className="h-3 bg-gray-100 rounded w-2/3" />
                        </div>
                    </div>
                 ))}
             </div>
        </div>
    </div>
);
