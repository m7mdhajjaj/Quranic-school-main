// ============================================================================
// StatisticsPanel Component - لوحة الإحصائيات
// ============================================================================

import type { StatisticsPanelProps } from "../types/warnings";
import { Card } from "@/components/UI/Card";
import { StatCard } from "@/components/UI/StatCard";
import {
  getWarningLabel,
  getWarningIcon,
  formatArabicDate,
} from "../utils/warningHelpers";
import { BarChart3, Users, AlertTriangle, XCircle } from "lucide-react";

export const StatisticsPanel: React.FC<StatisticsPanelProps> = ({
  statistics,
  onClose,
}) => {
  return (
    <Card className="mb-8 border-2 border-blue-200 shadow-2xl" padding="lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          📊 إحصائيات الإنذارات
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-2xl hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
          aria-label="إغلاق">
          ✕
        </button>
      </div>

      {/* الإحصائيات الرئيسية */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="إجمالي الإنذارات"
          value={statistics.totalWarnings}
          icon={<AlertTriangle className="w-6 h-6" />}
          color="blue"
        />

        <StatCard
          title="طلاب لديهم إنذارات"
          value={statistics.studentsWithWarnings}
          icon={<Users className="w-6 h-6" />}
          color="purple"
        />

        <StatCard
          title="تنبيهات"
          value={statistics.warningsCount.warning}
          icon={<span className="text-2xl">⚠️</span>}
          color="amber"
        />

        <StatCard
          title="طلاب مفصولين"
          value={statistics.expelledStudents}
          icon={<XCircle className="w-6 h-6" />}
          color="red"
        />
      </div>

      {/* توزيع الإنذارات */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* الإنذارات حسب النوع */}
        <Card variant="elevated" padding="md" className="bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800 mb-3">
            الإنذارات حسب النوع
          </h3>
          <div className="space-y-2">
            {Object.entries(statistics.warningsCount).map(([type, count]) => (
              <div key={type} className="flex justify-between items-center">
                <span className="text-gray-700 flex items-center gap-2">
                  <span>{getWarningIcon(type)}</span>
                  <span>{getWarningLabel(type)}:</span>
                </span>
                <span className="font-bold text-blue-600">{count}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* أكثر الأسباب تكراراً */}
        <Card variant="elevated" padding="md" className="bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800 mb-3">
            أكثر الأسباب تكراراً
          </h3>
          <div className="space-y-2">
            {statistics.topReasons.length > 0 ? (
              statistics.topReasons.map((reason, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-700 text-sm truncate flex-1">
                    {index + 1}. {reason._id}
                  </span>
                  <span className="font-bold text-blue-600 ml-2">
                    {reason.count}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">لا توجد بيانات</p>
            )}
          </div>
        </Card>
      </div>

      {/* الإنذارات حسب الحلقة */}
      <Card variant="elevated" padding="md" className="bg-gray-50 mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-3">
          الإنذارات حسب الحلقة
        </h3>
        <div className="grid md:grid-cols-3 gap-3">
          {statistics.warningsByGroup.length > 0 ? (
            statistics.warningsByGroup.map((group, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-3 flex justify-between items-center shadow-sm">
                <span className="text-gray-700 font-medium">
                  📚 {group._id}
                </span>
                <span className="font-bold text-blue-600">{group.count}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm col-span-3">لا توجد بيانات</p>
          )}
        </div>
      </Card>

      {/* آخر الإنذارات */}
      <Card variant="elevated" padding="md" className="bg-gray-50">
        <h3 className="text-lg font-bold text-gray-800 mb-3">آخر 5 إنذارات</h3>
        <div className="space-y-2">
          {statistics.recentWarnings.length > 0 ? (
            statistics.recentWarnings.map((warning) => (
              <Card
                key={warning._id}
                variant="default"
                padding="sm"
                className="bg-white">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">
                      {warning.studentId.firstName} {warning.studentId.lastName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {getWarningLabel(warning.type)} - {warning.reason}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {warning.groupId.name} •{" "}
                      {formatArabicDate(warning.createdAt)}
                    </div>
                  </div>
                  <span className="text-2xl">
                    {getWarningIcon(warning.type)}
                  </span>
                </div>
              </Card>
            ))
          ) : (
            <p className="text-gray-500 text-sm">لا توجد إنذارات</p>
          )}
        </div>
      </Card>
    </Card>
  );
};
