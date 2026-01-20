// ============================================================================
// Reports/ReportHeader.tsx - Header Component for Reports
// ============================================================================

import React from "react";
import { BarChart3 } from "lucide-react";

const ReportHeader: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 text-white rounded-b-3xl shadow-xl p-6 pb-8 mb-6">
      <div className="container mx-auto">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* أيقونة */}
          <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl shadow-lg">
            <BarChart3 className="w-10 h-10 md:w-12 md:h-12" />
          </div>

          {/* العنوان */}
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-2">
              التقارير والإحصائيات
            </h1>
            <p className="text-white/80 text-sm md:text-base max-w-2xl mx-auto">
              تتبع أداء الطلاب ومعدلات الحلقات
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportHeader;
