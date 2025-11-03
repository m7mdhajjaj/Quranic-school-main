// ============================================================================
// Reports/ReportHeader.tsx - Header Component for Reports
// ============================================================================

import React from "react";
import  PageHeader  from "../../components/UI/PageHeader";
import { BarChart3 } from "lucide-react";

const ReportHeader: React.FC = () => {
  return (
    <PageHeader
      title="التقارير والإحصائيات"
      subtitle="تتبع أداء الطلاب ومعدلات الحلقات"
      icon={<BarChart3 className="w-12 h-12 sm:w-16 sm:h-16 text-white" />}
      showDivider={true}
    />
  );
};

export default ReportHeader;
