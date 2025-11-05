import React from "react";
import { FaUsers, FaUserGraduate } from "react-icons/fa";
import type { GroupStats } from "../types";

interface GroupsStatsCardsProps {
  stats: GroupStats;
}

export const GroupsStatsCards: React.FC<GroupsStatsCardsProps> = ({
  stats,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {/* إجمالي الحلقات */}
      <div className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-blue-500 hover:shadow-xl transition-all duration-300 hover:scale-105">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-600 font-medium mb-1">
              إجمالي الحلقات
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalGroups}
            </p>
          </div>
          <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-md">
            <FaUsers className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* إجمالي الطلاب المشتركين */}
      <div className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-amber-500 hover:shadow-xl transition-all duration-300 hover:scale-105">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-600 font-medium mb-1">
              إجمالي الطلاب
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalStudents}
            </p>
          </div>
          <div className="p-3 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg shadow-md">
            <FaUserGraduate className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* الحلقات الممتلئة */}
      <div className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-green-500 hover:shadow-xl transition-all duration-300 hover:scale-105">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-600 font-medium mb-1">
              حلقات ممتلئة
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.fullGroups}
            </p>
          </div>
          <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-lg shadow-md">
            <svg
              className="w-6 h-6 text-white"
              fill="currentColor"
              viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* حلقات فارغة */}
      <div className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-purple-500 hover:shadow-xl transition-all duration-300 hover:scale-105">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-600 font-medium mb-1">
              حلقات فارغة
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.emptyGroups}
            </p>
          </div>
          <div className="p-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg shadow-md">
            <svg
              className="w-6 h-6 text-white"
              fill="currentColor"
              viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* السعة الإجمالية */}
      <div className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-orange-500 hover:shadow-xl transition-all duration-300 hover:scale-105">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-600 font-medium mb-1">
              السعة الإجمالية
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalCapacity}
            </p>
          </div>
          <div className="p-3 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg shadow-md">
            <svg
              className="w-6 h-6 text-white"
              fill="currentColor"
              viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* المقاعد المتاحة */}
      <div className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-cyan-500 hover:shadow-xl transition-all duration-300 hover:scale-105">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-600 font-medium mb-1">
              مقاعد متاحة
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.availableSeats}
            </p>
          </div>
          <div className="p-3 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg shadow-md">
            <svg
              className="w-6 h-6 text-white"
              fill="currentColor"
              viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
              <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
