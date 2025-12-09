import React from "react";
import { FaUserGraduate, FaUsers, FaChartBar, FaClock } from "react-icons/fa";

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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-500 mb-1">إجمالي الطلاب</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-400 mt-1">جميع الطلاب المسجلين</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
            <FaUserGraduate className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Male Students */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-500 mb-1">طلاب ذكور</p>
            <p className="text-2xl font-bold text-gray-900">{stats.male}</p>
            <p className="text-xs text-gray-400 mt-1">
              {stats.total > 0 ? Math.round((stats.male / stats.total) * 100) : 0}% من الإجمالي
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
            <FaUsers className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Female Students */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-500 mb-1">طالبات إناث</p>
            <p className="text-2xl font-bold text-gray-900">{stats.female}</p>
            <p className="text-xs text-gray-400 mt-1">
              {stats.total > 0 ? Math.round((stats.female / stats.total) * 100) : 0}% من الإجمالي
            </p>
          </div>
          <div className="w-12 h-12 bg-pink-50 rounded-lg flex items-center justify-center">
            <FaChartBar className="w-6 h-6 text-pink-600" />
          </div>
        </div>
      </div>

      {/* Average Age */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-500 mb-1">متوسط العمر</p>
            <p className="text-2xl font-bold text-gray-900">{stats.avgAge}</p>
            <p className="text-xs text-gray-400 mt-1">متوسط أعمار الطلاب</p>
          </div>
          <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
            <FaClock className="w-6 h-6 text-amber-600" />
          </div>
        </div>
      </div>
    </div>
  );
};
