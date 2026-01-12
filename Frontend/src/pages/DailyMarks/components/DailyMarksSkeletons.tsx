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
  <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm h-full flex flex-col justify-between animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <div className="space-y-2">
        <div className="h-4 w-32 bg-gray-200 rounded" />
        <div className="h-3 w-20 bg-gray-100 rounded" />
      </div>
      <div className="h-6 w-24 bg-emerald-50 rounded-full border border-emerald-100" />
    </div>
    
    <div className="space-y-3 mb-4">
       <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
           <div className="h-full w-1/3 bg-gray-200" />
       </div>
       <div className="flex justify-between">
           <div className="h-3 w-16 bg-gray-100 rounded" />
           <div className="h-3 w-10 bg-gray-100 rounded" />
       </div>
    </div>

    <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
        <div className="h-8 w-24 bg-gray-100 rounded" />
        <div className="flex gap-2">
            <div className="h-8 w-8 bg-gray-100 rounded-full" />
            <div className="h-8 w-8 bg-gray-100 rounded-full" />
        </div>
    </div>
  </div>
);

export const SectionsGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: Math.max(1, count) }).map((_, i) => (
      <SectionCardSkeleton key={i} />
    ))}
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
