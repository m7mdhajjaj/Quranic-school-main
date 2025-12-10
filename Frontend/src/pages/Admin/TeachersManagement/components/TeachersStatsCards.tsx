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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-500 mb-1">إجمالي المعلمين</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-400 mt-1">جميع المعلمين</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
            <UserCog className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Male Teachers */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-500 mb-1">معلمين ذكور</p>
            <p className="text-2xl font-bold text-gray-900">{stats.male}</p>
            <p className="text-xs text-gray-400 mt-1">
              {stats.total > 0 ? Math.round((stats.male / stats.total) * 100) : 0}% من الإجمالي
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
            <User className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Female Teachers */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-500 mb-1">معلمات إناث</p>
            <p className="text-2xl font-bold text-gray-900">{stats.female}</p>
            <p className="text-xs text-gray-400 mt-1">
              {stats.total > 0 ? Math.round((stats.female / stats.total) * 100) : 0}% من الإجمالي
            </p>
          </div>
          <div className="w-12 h-12 bg-pink-50 rounded-lg flex items-center justify-center">
            <UserCheck className="w-6 h-6 text-pink-600" />
          </div>
        </div>
      </div>

      {/* Teachers with Groups */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-500 mb-1">معلمين بحلقات</p>
            <p className="text-2xl font-bold text-gray-900">{stats.withGroups || 0}</p>
            <p className="text-xs text-gray-400 mt-1">
              {stats.total > 0 ? Math.round(((stats.withGroups || 0) / stats.total) * 100) : 0}% من الإجمالي
            </p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-emerald-600" />
          </div>
        </div>
      </div>

      {/* Teachers without Groups */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-500 mb-1">معلمين بلا حلقات</p>
            <p className="text-2xl font-bold text-gray-900">{stats.withoutGroups || 0}</p>
            <p className="text-xs text-gray-400 mt-1">
              {stats.total > 0 ? Math.round(((stats.withoutGroups || 0) / stats.total) * 100) : 0}% من الإجمالي
            </p>
          </div>
          <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
            <UserX className="w-6 h-6 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Average Age */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-500 mb-1">متوسط العمر</p>
            <p className="text-2xl font-bold text-gray-900">{stats.avgAge}</p>
            <p className="text-xs text-gray-400 mt-1">متوسط الأعمار</p>
          </div>
          <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
            <Cake className="w-6 h-6 text-amber-600" />
          </div>
        </div>
      </div>
    </div>
  );
};
