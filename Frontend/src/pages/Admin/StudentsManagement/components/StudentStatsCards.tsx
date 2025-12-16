import React from "react";
import { GraduationCap, User, UserCheck, Cake } from "lucide-react";

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Students */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-white/90 mb-1">إجمالي الطلاب</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-xs text-white/80 mt-1">جميع الطلاب المسجلين</p>
          </div>
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Male Students */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-white/90 mb-1">طلاب ذكور</p>
            <p className="text-2xl font-bold text-white">{stats.male}</p>
            <p className="text-xs text-white/80 mt-1">
              {stats.total > 0 ? Math.round((stats.male / stats.total) * 100) : 0}% من الإجمالي
            </p>
          </div>
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Female Students */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-white/90 mb-1">طالبات إناث</p>
            <p className="text-2xl font-bold text-white">{stats.female}</p>
            <p className="text-xs text-white/80 mt-1">
              {stats.total > 0 ? Math.round((stats.female / stats.total) * 100) : 0}% من الإجمالي
            </p>
          </div>
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <UserCheck className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Average Age */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-white/90 mb-1">متوسط العمر</p>
            <p className="text-2xl font-bold text-white">{stats.avgAge}</p>
            <p className="text-xs text-white/80 mt-1">متوسط أعمار الطلاب</p>
          </div>
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <Cake className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};
