import { Card } from "@/components/UI";

export const SectionCardSkeleton = () => {
  return (
    <Card className="p-4 border border-gray-100 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
        <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
        <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
      </div>
    </Card>
  );
};
