// ============================================================================
// WarningsPageHeader - رأس صفحة الإنذارات
// ============================================================================

import PageHeader from "@/components/UI/PageHeader";
import { Button } from "@/components/UI/Button";
import { BarChart3 } from "lucide-react";

interface WarningsPageHeaderProps {
  onShowStatistics: () => void;
}

export const WarningsPageHeader: React.FC<WarningsPageHeaderProps> = ({
  onShowStatistics,
}) => {
  return (
    <div className="mb-8">
      <PageHeader
        title="📋 إدارة الإنذارات"
        subtitle="اختر الحلقة لعرض الطلاب وإدارة الإنذارات"
        showDivider={true}
      />
      
      {/* زر الإحصائيات */}
      <div className="flex justify-center mt-6">
        <Button
          onClick={onShowStatistics}
          className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          <span>📊 عرض الإحصائيات</span>
        </Button>
      </div>
    </div>
  );
};
