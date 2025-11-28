/**
 * InfoNote Component
 * ملاحظة معلوماتية
 */

import { Card } from "@/components/UI";

const InfoNote = () => {
  return (
    <Card className="bg-blue-50 border-r-4 border-blue-500">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">ℹ️</div>
          <div>
            <h4 className="font-bold text-blue-800 mb-1">ملاحظة</h4>
            <p className="text-blue-700 text-sm">
              المواقيت المعروضة خاصة بمدينة نابلس، فلسطين. يتم تحديث المواقيت
              تلقائياً كل يوم.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default InfoNote;
