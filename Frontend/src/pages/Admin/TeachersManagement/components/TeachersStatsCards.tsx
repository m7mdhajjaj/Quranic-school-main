import React from "react";
import { FaUserTie, FaChartBar } from "react-icons/fa";
import { StatCard } from "@/components/UI";

interface TeacherStats {
  total: number;
  male: number;
  female: number;
  avgAge: string | number;
  withGroups: number;
  withoutGroups: number;
}

interface TeachersStatsCardsProps {
  stats: TeacherStats;
  onFilterClick?: (filter: "withGroups" | "withoutGroups") => void;
}

const TeachersStatsCards: React.FC<TeachersStatsCardsProps> = ({
  stats,
  onFilterClick,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      <StatCard
        title="إجمالي"
        value={stats.total}
        icon={<FaUserTie />}
        color="blue"
      />

      <StatCard
        title="ذكور"
        value={stats.male}
        icon={
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
          </svg>
        }
        color="blue"
      />

      <StatCard
        title="إناث"
        value={stats.female}
        icon={
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
          </svg>
        }
        color="purple"
      />

      <StatCard
        title="متوسط العمر"
        value={stats.avgAge}
        icon={<FaChartBar />}
        color="amber"
      />

      <div
        onClick={() => onFilterClick?.("withGroups")}
        className="cursor-pointer"
        title="انقر لعرض المعلمين الذين لديهم حلقات فقط">
        <StatCard
          title="لديهم حلقات"
          value={stats.withGroups}
          icon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="emerald"
        />
      </div>

      <div
        onClick={() => onFilterClick?.("withoutGroups")}
        className="cursor-pointer"
        title="انقر لعرض المعلمين الذين لا يدرسون أي حلقة">
        <StatCard
          title="بلا حلقات"
          value={stats.withoutGroups}
          icon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
            </svg>
          }
          color="red"
        />
      </div>
    </div>
  );
};

export default TeachersStatsCards;
