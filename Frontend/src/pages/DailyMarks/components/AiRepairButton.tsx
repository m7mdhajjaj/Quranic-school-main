import { useState } from 'react';
import { Button } from '@/components/UI';
import { showSuccessToast } from '@/utils/toastUtils';
import { showErrorMessage, showConfirmMessage } from '@/utils/sweetalertUtils';
import { repairSequence } from '@/Api/DailyMark/sectionApi';
import { Bot } from 'lucide-react';

interface AiRepairButtonProps {
  selectedGroup: string;
  onSuccess?: () => void;
  className?: string;
}

export const AiRepairButton = ({
  selectedGroup,
  onSuccess,
  className
}: AiRepairButtonProps) => {
  const [isRepairing, setIsRepairing] = useState(false);

  const handleAutoRepair = async () => {
    if (!selectedGroup) return;

    const result = await showConfirmMessage(
      "المصلح الذكي (AI Repair)",
      `<div class="text-right space-y-2">
        <p class="font-bold text-gray-800">هل تريد تشغيل الفحص التلقائي لجميع السور في هذه الحلقة؟</p>
        <ul class="text-sm text-gray-600 list-disc list-inside space-y-1">
          <li>سيقوم النظام بفحص جميع سجلات الحفظ والمراجعة.</li>
          <li>إصلاح الفجوات الزمنية تلقائياً.</li>
          <li>ربط المراجعات اليتيمة (Orphans).</li>
        </ul>
      </div>`,
      "تشغيل الإصلاح",
      "إلغاء"
    );

    if (result.isConfirmed) {
      setIsRepairing(true);
      try {
        const res = await repairSequence(selectedGroup);
        if (res?.repaired === false) {
           showSuccessToast(res.message || "السجلات سليمة ومحدثة.");
        } else {
           showSuccessToast(res?.message || "تمت عملية الإصلاح بنجاح");
           if (onSuccess) onSuccess(); 
        }
      } catch (error: any) {
        console.error(error);
        showErrorMessage("خطأ في الإصلاح", error.response?.data?.message || "حدث خطأ غير متوقع");
      } finally {
        setIsRepairing(false);
      }
    }
  };

  return (
    <Button
      onClick={handleAutoRepair}
      className={`bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg hover:shadow-indigo-500/20 transition-all font-semibold h-[40px] px-4 min-w-[140px] flex items-center justify-between gap-3 border-0 group ${className || ''}`}
      type="button"
      dir="rtl"
      title="المصلح الذكي: إصلاح فجوات الحفظ والمراجعات"
      disabled={isRepairing}
      loading={isRepairing}
    >
      <div className="flex flex-col items-start leading-[1.1] pt-0.5">
        <span className="text-[9px] text-indigo-200 font-bold uppercase tracking-widest">AI Agent</span>
        <span className="text-sm font-bold">المصلح الذكي</span>
      </div>
      {!isRepairing && <Bot size={20} className="text-indigo-100 group-hover:text-white group-hover:scale-110 transition-transform" />}
    </Button>
  );
};
