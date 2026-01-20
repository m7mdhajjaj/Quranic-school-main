import { Button, Badge } from "@/components/UI";
import type { AzkarHeaderProps } from "../Types/types";
import { showConfirmMessage } from "@/utils/sweetalertUtils";
import { showSuccessToast } from "@/utils/toastUtils";
import { BookOpen } from 'lucide-react';

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
      {/* رأس الصفحة مع التدرج الجديد */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 rounded-2xl shadow-xl p-5 mb-4 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/15 backdrop-blur-sm rounded-xl shadow-sm">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{icon} {title}</h1>
            <p className="text-white/70 text-sm mt-0.5">اذكر الله وتقرب إليه</p>
          </div>
        </div>
      </div>
      
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
