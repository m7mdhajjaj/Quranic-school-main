import { Card } from "@/components/UI";

export const SectionCardSkeleton = () => {
  return (
    <Card className="border-2 border-emerald-200 bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/30 shadow-lg overflow-hidden">
      <div className="p-6 relative">
        {/* Date */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
            <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-3 w-40 bg-gray-100 rounded animate-pulse" />
        </div>

        {/* Status badge */}
        <div className="mb-4">
          <div className="h-7 w-28 bg-emerald-100 border border-emerald-200 rounded-lg animate-pulse" />
        </div>

        {/* Review / Memorization blocks */}
        <div className="space-y-3 mb-5">
          <div className="bg-white/80 p-3.5 rounded-lg border border-emerald-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 bg-emerald-200 rounded animate-pulse" />
              <div className="h-3 w-24 bg-emerald-100 rounded animate-pulse" />
            </div>
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
          </div>

          <div className="bg-white/80 p-3.5 rounded-lg border border-teal-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 bg-teal-200 rounded animate-pulse" />
              <div className="h-3 w-24 bg-teal-100 rounded animate-pulse" />
            </div>
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        {/* Footer hint */}
        <div className="flex items-center justify-center gap-2 text-sm pt-4 border-t border-emerald-200/60">
          <div className="w-5 h-5 bg-emerald-100 rounded animate-pulse" />
          <div className="h-4 w-40 bg-emerald-50 rounded animate-pulse" />
        </div>
      </div>
    </Card>
  );
};
