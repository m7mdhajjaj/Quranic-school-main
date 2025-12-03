// ============================================================================
// GroupStatisticsModal - نافذة إحصائيات الحلقة
// ============================================================================

import React from "react";
import { Card } from "@/components/UI/Card";
import { X, Users, AlertTriangle, TrendingUp } from "lucide-react";
import { getWarningLabel, getWarningIcon } from "../../types/Constans";

interface GroupStatistics {
  groupName: string;
  totalStudents: number;
  studentsWithWarnings: number;
  totalWarnings: number;
  warningsByType: {
    warning: number;
    first: number;
    second: number;
    third: number;
    expulsion: number;
  };
  topStudents: {
    name: string;
    warningsCount: number;
  }[];
}

interface GroupStatisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  statistics: GroupStatistics | null;
}

export const GroupStatisticsModal: React.FC<GroupStatisticsModalProps> = ({
  isOpen,
  onClose,
  statistics,
}) => {
  if (!isOpen || !statistics) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-auto animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
        dir="rtl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-3xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">إحصائيات الحلقة</h2>
              <p className="text-blue-100 text-sm">{statistics.groupName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            title="إغلاق"
            aria-label="إغلاق النافذة"
            className="p-2 hover:bg-white/20 rounded-xl transition-colors duration-200">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* الإحصائيات الرئيسية */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200" padding="md">
              <div className="text-center">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-blue-600">
                  {statistics.totalStudents}
                </p>
                <p className="text-sm text-gray-600">إجمالي الطلاب</p>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200" padding="md">
              <div className="text-center">
                <AlertTriangle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-purple-600">
                  {statistics.studentsWithWarnings}
                </p>
                <p className="text-sm text-gray-600">طلاب لديهم إنذارات</p>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200" padding="md">
              <div className="text-center">
                <span className="text-4xl mx-auto mb-2 block">⚠️</span>
                <p className="text-3xl font-bold text-amber-600">
                  {statistics.totalWarnings}
                </p>
                <p className="text-sm text-gray-600">إجمالي الإنذارات</p>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200" padding="md">
              <div className="text-center">
                <span className="text-4xl mx-auto mb-2 block">✅</span>
                <p className="text-3xl font-bold text-green-600">
                  {statistics.totalStudents - statistics.studentsWithWarnings}
                </p>
                <p className="text-sm text-gray-600">طلاب بدون إنذارات</p>
              </div>
            </Card>
          </div>

          {/* الإنذارات حسب النوع */}
          <Card className="bg-gradient-to-br from-gray-50 to-gray-100" padding="lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>📊</span>
              توزيع الإنذارات حسب النوع
            </h3>
            <div className="space-y-3">
              {Object.entries(statistics.warningsByType).map(([type, count]) => (
                <div
                  key={type}
                  className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getWarningIcon(type)}</span>
                    <span className="font-medium text-gray-700">
                      {getWarningLabel(type)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 px-4 py-1 rounded-full">
                      <span className="font-bold text-blue-600">{count}</span>
                    </div>
                    {count > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-gray-500">
                          {Math.round((count / statistics.totalWarnings) * 100)}%
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* أكثر الطلاب إنذارات */}
          {statistics.topStudents.length > 0 && (
            <Card className="bg-gradient-to-br from-red-50 to-orange-100" padding="lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>🎯</span>
                الطلاب الأكثر إنذارات
              </h3>
              <div className="space-y-2">
                {statistics.topStudents.map((student, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-700">
                        {student.name}
                      </span>
                    </div>
                    <div className="bg-red-100 px-4 py-1 rounded-full">
                      <span className="font-bold text-red-600">
                        {student.warningsCount} إنذار
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 p-4 rounded-b-3xl border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl">
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
