import React from "react";
import { FaUserGraduate } from "react-icons/fa";
import { Card } from "../UI";

interface Group {
  id: string;
  name: string;
  number: number;
}

interface MyStudentsPageHeaderProps {
  teacherGroups: Group[];
  selectedGroup: string;
  onGroupChange: (group: string) => void;
  totalStudents: number;
  isConnected: boolean;
  socketId?: string;
  lastUpdate?: Date | null;
}

export const MyStudentsPageHeader: React.FC<MyStudentsPageHeaderProps> = ({
  teacherGroups,
  selectedGroup,
  onGroupChange,
  totalStudents,
  isConnected,
  socketId,
  lastUpdate,
}) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FaUserGraduate className="text-emerald-600" />
            إدارة الطلاب
          </h1>
          <p className="text-gray-600 mt-2">إدارة طلاب حلقاتك</p>
        </div>

        {/* Socket Connection Status */}
        <div
          className="flex items-center gap-1.5 cursor-help"
          title={
            isConnected
              ? `💓 Heartbeat نشط (كل 30 ثانية)\nSocket ID: ${
                  socketId || "N/A"
                }\nآخر تحديث: ${
                  lastUpdate?.toLocaleTimeString("ar-SA") || "لا يوجد"
                }`
              : "Socket غير متصل - وضع التحديث التلقائي"
          }>
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-500" : "bg-yellow-500"
            } animate-pulse`}></div>
          <span
            className={`text-xs font-medium ${
              isConnected ? "text-green-600" : "text-yellow-600"
            }`}>
            {isConnected ? "💓 متصل مباشرة" : "تحديث تلقائي"}
          </span>
        </div>
      </div>

      {/* Group Filter */}
      {teacherGroups.length > 0 && (
        <Card variant="default" padding="lg" className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            اختر الحلقة
          </label>
          <select
            value={selectedGroup}
            onChange={(e) => onGroupChange(e.target.value)}
            title="اختر الحلقة"
            aria-label="اختر الحلقة"
            className="w-full md:w-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all">
            {teacherGroups.map((group) => (
              <option key={group.id} value={group.name}>
                {group.name}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-2">
            {totalStudents} طالب في هذه الحلقة
          </p>
        </Card>
      )}

      {/* No Groups Message */}
      {teacherGroups.length === 0 && (
        <Card
          variant="outlined"
          padding="lg"
          className="mb-6 border-yellow-200 bg-yellow-50">
          <p className="text-yellow-800 text-center">
            ⚠️ لم يتم تعيين أي حلقات لك. يرجى التواصل مع المدير.
          </p>
        </Card>
      )}
    </div>
  );
};
