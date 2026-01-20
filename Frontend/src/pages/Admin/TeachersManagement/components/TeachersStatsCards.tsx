import React from "react";
import { UserCog, User, UserCheck, Cake, Users, UserX } from "lucide-react";

interface TeacherStatsCardsProps {
  stats: {
    total: number;
    male: number;
    female: number;
    avgAge: string | number;
    withGroups?: number;
    withoutGroups?: number;
  };
}

export const TeacherStatsCards: React.FC<TeacherStatsCardsProps> = ({
  stats,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {/* Total Teachers */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-white/90 mb-1">إجمالي المعلمين</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-xs text-white/80 mt-1">جميع المعلمين</p>
          </div>
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <UserCog className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Male Teachers */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-white/90 mb-1">معلمين ذكور</p>
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

      {/* Female Teachers */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-white/90 mb-1">معلمات إناث</p>
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

      {/* Teachers with Groups */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-white/90 mb-1">معلمين بحلقات</p>
            <p className="text-2xl font-bold text-white">{stats.withGroups || 0}</p>
            <p className="text-xs text-white/80 mt-1">
              {stats.total > 0 ? Math.round(((stats.withGroups || 0) / stats.total) * 100) : 0}% من الإجمالي
            </p>
          </div>
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Teachers without Groups */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-white/90 mb-1">معلمين بلا حلقات</p>
            <p className="text-2xl font-bold text-white">{stats.withoutGroups || 0}</p>
            <p className="text-xs text-white/80 mt-1">
              {stats.total > 0 ? Math.round(((stats.withoutGroups || 0) / stats.total) * 100) : 0}% من الإجمالي
            </p>
          </div>
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <UserX className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Average Age */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-white/90 mb-1">متوسط العمر</p>
            <p className="text-2xl font-bold text-white">{stats.avgAge}</p>
            <p className="text-xs text-white/80 mt-1">متوسط الأعمار</p>
          </div>
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <Cake className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};
