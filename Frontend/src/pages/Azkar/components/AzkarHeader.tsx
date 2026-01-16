import PageHeader from "@/components/UI/PageHeader";
import { Button, Badge } from "@/components/UI";
import type { AzkarHeaderProps } from "../Types/types";
import { showConfirmMessage } from "@/utils/sweetalertUtils";
import { showSuccessToast } from "@/utils/toastUtils";

const AzkarHeader = ({
  title,
  icon,
  completedCount,
  totalCount,
  onBack,
  onReset,
}: AzkarHeaderProps) => {
  const handleReset = async () => {
    const result = await showConfirmMessage(
      "هل أنت متأكد؟",
      "سيتم إعادة تعيين جميع الأذكار في هذا القسم",
      "نعم، إعادة تعيين",
      "إلغاء"
    );

    if (result.isConfirmed) {
      onReset();
      showSuccessToast("✅ تم إعادة تعيين الأذكار بنجاح");
    }
  };
  return (
    <div className="mb-6">
      {/* استخدام PageHeader من shared */}
      <PageHeader
        title={title}
        icon={icon}
        showDivider={false}
        className="mb-4"
      />
      
      {/* الأزرار والشارة */}
      <div className="flex items-center justify-between gap-4 px-4" dir="rtl">
        <Button onClick={onBack} variant="ghost" size="md">
          <span className="text-2xl">→</span>
          <span className="font-medium">رجوع</span>
        </Button>

        <Badge variant="success" size="lg">
          التقدم: {completedCount} / {totalCount}
        </Badge>

        <Button
          onClick={handleReset}
          variant="primary"
          size="md"
          className="bg-blue-500 hover:bg-blue-600">
          إعادة تعيين
        </Button>
      </div>
    </div>
  );
};

export default AzkarHeader;
