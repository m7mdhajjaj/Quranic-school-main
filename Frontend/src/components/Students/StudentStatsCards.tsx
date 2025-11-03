import React from "react";
import { StatCard } from "../UI";
import { FaUserGraduate, FaChartBar } from "react-icons/fa";

interface StudentStatsCardsProps {
  stats: {
    total: number;
    male: number;
    female: number;
    avgAge: string | number;
  };
}

export const StudentStatsCards: React.FC<StudentStatsCardsProps> = ({
  stats,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Students */}
      <StatCard
        title="إجمالي الطلاب"
        value={stats.total}
        icon={<FaUserGraduate className="text-2xl" />}
        color="blue"
        description="جميع الطلاب في هذه الحلقة"
      />

      {/* Male Students */}
      <StatCard
        title="طلاب ذكور"
        value={stats.male}
        icon={<FaChartBar className="text-2xl" />}
        color="emerald"
        description={`${
          stats.total > 0 ? Math.round((stats.male / stats.total) * 100) : 0
        }% من الإجمالي`}
      />

      {/* Female Students */}
      <StatCard
        title="طالبات إناث"
        value={stats.female}
        icon={<FaChartBar className="text-2xl" />}
        color="purple"
        description={`${
          stats.total > 0 ? Math.round((stats.female / stats.total) * 100) : 0
        }% من الإجمالي`}
      />

      {/* Average Age */}
      <StatCard
        title="متوسط العمر"
        value={stats.avgAge}
        icon={<FaChartBar className="text-2xl" />}
        color="amber"
        description="متوسط أعمار الطلاب"
      />
    </div>
  );
};
