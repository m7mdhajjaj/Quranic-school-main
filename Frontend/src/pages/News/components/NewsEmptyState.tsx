import { EmptyState } from "@/components/UI";
import type { NewsEmptyStateProps } from "../utils/types";

const NewsEmptyState = ({
  hasError,
  error,
  isFiltered,
  isTeacherOrAdmin,
  onRetry,
  onAddNews,
}: NewsEmptyStateProps) => {
  // Error State
  if (hasError) {
    return (
      <div className="col-span-2">
        <EmptyState
          illustration="error"
          title="حدث خطأ!"
          description={error || "حدث خطأ غير متوقع"}
          action={{
            label: "إعادة المحاولة",
            onClick: onRetry,
            icon: <span>🔄</span>,
          }}
        />
      </div>
    );
  }

  // No Results State (After filtering/search)
  if (isFiltered) {
    return (
      <div className="col-span-2">
        <EmptyState
          illustration="search"
          title="لم يتم العثور على نتائج"
          description="جرب تغيير معايير البحث أو الفلترة"
        />
      </div>
    );
  }

  // No News State (Empty database)
  return (
    <div className="col-span-2">
      <EmptyState
        illustration="no-data"
        title="لا توجد أخبار متاحة حالياً"
        description="لم يتم نشر أي أخبار بعد. تابعنا للحصول على آخر المستجدات!"
        action={
          isTeacherOrAdmin
            ? {
                label: "إضافة خبر جديد",
                onClick: onAddNews,
                icon: <span>➕</span>,
              }
            : undefined
        }
      />
    </div>
  );
};

export default NewsEmptyState;
