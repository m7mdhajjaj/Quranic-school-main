// ============================================================================
// StudentStatsCards - بطاقات إحصائيات الطلاب
// ============================================================================

import React, { memo, useMemo } from 'react';
import { GraduationCap, User, UserCheck, Cake } from 'lucide-react';

interface StudentStatsCardsProps {
  stats: {
    total: number;
    male: number;
    female: number;
    avgAge: string | number;
  };
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
}

const StatCard = memo<StatCardProps>(({ title, value, subtitle, icon }) => (
  <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-xs font-medium text-white/90 mb-1">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-white/80 mt-1">{subtitle}</p>
      </div>
      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">{icon}</div>
    </div>
  </div>
));
StatCard.displayName = 'StatCard';

export const StudentStatsCards: React.FC<StudentStatsCardsProps> = memo(({ stats }) => {
  const malePercentage = useMemo(
    () => (stats.total > 0 ? Math.round((stats.male / stats.total) * 100) : 0),
    [stats.male, stats.total]
  );

  const femalePercentage = useMemo(
    () => (stats.total > 0 ? Math.round((stats.female / stats.total) * 100) : 0),
    [stats.female, stats.total]
  );

  const statsConfig = useMemo(
    () => [
      {
        title: 'إجمالي الطلاب',
        value: stats.total,
        subtitle: 'جميع الطلاب المسجلين',
        icon: <GraduationCap className="w-6 h-6 text-white" />,
      },
      {
        title: 'طلاب ذكور',
        value: stats.male,
        subtitle: `${malePercentage}% من الإجمالي`,
        icon: <User className="w-6 h-6 text-white" />,
      },
      {
        title: 'طالبات إناث',
        value: stats.female,
        subtitle: `${femalePercentage}% من الإجمالي`,
        icon: <UserCheck className="w-6 h-6 text-white" />,
      },
      {
        title: 'متوسط العمر',
        value: stats.avgAge,
        subtitle: 'متوسط أعمار الطلاب',
        icon: <Cake className="w-6 h-6 text-white" />,
      },
    ],
    [stats, malePercentage, femalePercentage]
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statsConfig.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
});
StudentStatsCards.displayName = 'StudentStatsCards';

