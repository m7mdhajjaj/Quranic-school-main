import React from 'react';
import { AlertCircle, CalendarDays, TrendingUp } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  unit: string;
  subtitle: string;
  icon: any;
  colorClasses: {
    wrapper: string;
    border: string;
    iconBg: string;
    iconText: string;
    badgeBg: string;
    badgeBorder: string;
    badgeText: string;
    titleText: string;
    valueGradient: string;
    unitText: string;
    subtitleText: string;
  };
  extraContent?: React.ReactNode;
}

const StatCard = ({ 
  title, 
  value, 
  unit, 
  subtitle, 
  icon: Icon, 
  colorClasses,
  extraContent
}: StatCardProps) => (
  <div className={`group relative overflow-hidden bg-gradient-to-br ${colorClasses.wrapper} rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border ${colorClasses.border}`}>
    <div className="absolute top-0 left-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-500">
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-50 bg-white`}></div>
    </div>
    
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 bg-gradient-to-br ${colorClasses.iconBg} backdrop-blur-sm rounded-2xl`}>
          <Icon className={`w-6 h-6 ${colorClasses.iconText}`} />
        </div>
        <div className={`px-3 py-1 ${colorClasses.badgeBg} rounded-full border ${colorClasses.badgeBorder}`}>
          <span className={`text-xs font-bold ${colorClasses.badgeText}`}>{title}</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <p className={`text-sm font-semibold ${colorClasses.titleText}`}>{subtitle}</p>
        <div className="flex items-baseline gap-2">
          <span className={`text-4xl font-black bg-gradient-to-br ${colorClasses.valueGradient} bg-clip-text text-transparent`}>
            {value}
          </span>
          <span className={`text-sm ${colorClasses.unitText} font-semibold`}>{unit}</span>
        </div>
        {extraContent}
      </div>
    </div>
  </div>
);

export const TotalAbsenceCard = ({ count, label }: { count: number; label: string }) => (
  <StatCard
    title="الغياب"
    value={count}
    unit="يوم"
    subtitle={label}
    icon={AlertCircle}
    colorClasses={{
      wrapper: "from-rose-50 via-pink-50 to-red-100",
      border: "border-rose-200",
      iconBg: "from-rose-500/10 to-pink-500/10",
      iconText: "text-rose-600",
      badgeBg: "bg-rose-100",
      badgeBorder: "border-rose-200",
      badgeText: "text-rose-700",
      titleText: "text-rose-700",
      valueGradient: "from-rose-600 to-pink-600",
      unitText: "text-rose-500",
      subtitleText: "text-rose-600/70"
    }}
    extraContent={<p className="text-xs text-rose-600/70 font-medium">{count === 0 ? "سجل نظيف! 👏" : "انتبه لعدد أيام الغياب"}</p>}
  />
);

export const WeeklyStatsCard = ({ totalDays, absenceCount, label = "إجمالي المقاطع" }: { totalDays: number; absenceCount: number; label?: string }) => (
  <StatCard
    title="المقاطع"
    value={totalDays}
    unit="حصة"
    subtitle={label}
    icon={CalendarDays}
    colorClasses={{
      wrapper: "from-emerald-50 via-teal-50 to-cyan-100",
      border: "border-emerald-200",
      iconBg: "from-emerald-500/10 to-teal-500/10",
      iconText: "text-emerald-600",
      badgeBg: "bg-emerald-100",
      badgeBorder: "border-emerald-200",
      badgeText: "text-emerald-700",
      titleText: "text-emerald-700",
      valueGradient: "from-emerald-600 via-teal-700 to-slate-700",
      unitText: "text-emerald-500",
      subtitleText: "text-emerald-600/70"
    }}
    extraContent={
      <>
        {absenceCount > 0 && (
           <div className="flex items-center gap-2 mt-1">
             <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
               {absenceCount} غيابات
             </span>
           </div>
        )}
        <p className="text-xs text-emerald-600/70 font-medium mt-1">عدد أيام الدوام المقررة</p>
      </>
    }
  />
);

export const AbsenceRateCard = ({ rate, absenceCount, totalDays }: { rate: number; absenceCount: number; totalDays: number }) => (
  <StatCard
    title="النسبة"
    value={rate.toFixed(1)}
    unit="%"
    subtitle="نسبة الغياب"
    icon={TrendingUp}
    colorClasses={{
      wrapper: "from-amber-50 via-yellow-50 to-orange-100",
      border: "border-amber-200",
      iconBg: "from-amber-500/10 to-orange-500/10",
      iconText: "text-amber-600",
      badgeBg: "bg-amber-100",
      badgeBorder: "border-amber-200",
      badgeText: "text-amber-700",
      titleText: "text-amber-700",
      valueGradient: "from-amber-600 to-orange-600",
      unitText: "text-amber-500",
      subtitleText: "text-amber-600/70"
    }}
    extraContent={
      <>
        <p className="text-xs text-amber-600/70 font-medium">
          {absenceCount} غياب من أصل {totalDays} حصة
        </p>
        <div className="mt-3 w-full bg-amber-200/50 rounded-full h-2.5 overflow-hidden shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-full transition-all duration-1000 shadow-lg"
            style={{ width: `${Math.min(rate, 100)}%` }}
          ></div>
        </div>
      </>
    }
  />
);
