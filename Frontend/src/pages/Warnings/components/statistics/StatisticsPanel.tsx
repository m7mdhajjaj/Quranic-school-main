// ============================================================================
// StatisticsPanel Component - لوحة الإحصائيات
// ============================================================================

import type { StatisticsPanelProps } from '../../types/warnings';
import { Card } from '@/components/UI/Card';
import { StatCard } from '@/components/UI/StatCard';
import {
  getWarningLabel,
  formatArabicDate,
} from '../../types/Constans';
import { BarChart3, Users, AlertTriangle, XCircle, ShieldAlert, AlertOctagon, Ban } from 'lucide-react';
import '../../styles/animations.css';

// ✅ Modern icon mapping
const getWarningIcon = (type: string) => {
  switch (type) {
    case 'warning':
      return '⚠️';
    case 'first':
      return <ShieldAlert className="w-4 h-4" />;
    case 'second':
      return <AlertOctagon className="w-4 h-4" />;
    case 'third':
      return <Ban className="w-4 h-4" />;
    default:
      return '⚠️';
  }
};

export const StatisticsPanel: React.FC<StatisticsPanelProps> = ({
  statistics,
}) => {
  return (
    <Card className="mb-8 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 border-2 border-blue-200/50 shadow-2xl backdrop-blur-sm relative overflow-hidden" padding="lg">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 animate-pulse"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl shadow-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            📊 إحصائيات الإنذارات
          </h2>
        </div>

        {/* الإحصائيات الرئيسية */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="animate-fade-in-up animate-delay-100">
            <StatCard
              title="إجمالي الإنذارات"
              value={statistics.totalWarnings}
              icon={<AlertTriangle className="w-6 h-6" />}
              color="blue"
            />
          </div>

          <div className="animate-fade-in-up animate-delay-200">
            <StatCard
              title="طلاب لديهم إنذارات"
              value={statistics.studentsWithWarnings}
              icon={<Users className="w-6 h-6" />}
              color="purple"
            />
          </div>

          <div className="animate-fade-in-up animate-delay-300">
            <StatCard
              title="تنبيهات"
              value={statistics.warningsCount.warning}
              icon={<span className="text-2xl">⚠️</span>}
              color="amber"
            />
          </div>

          <div className="animate-fade-in-up animate-delay-400">
            <StatCard
              title="طلاب مفصولين"
              value={statistics.expelledStudents}
              icon={<XCircle className="w-6 h-6" />}
              color="red"
            />
          </div>
        </div>

        {/* توزيع الإنذارات */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* الإنذارات حسب النوع */}
          <Card variant="elevated" padding="md" className="bg-gradient-to-br from-white to-blue-50/50 border border-blue-100 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
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
          <Card variant="elevated" padding="md" className="bg-gradient-to-br from-white to-purple-50/50 border border-purple-100 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
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
                className="bg-white rounded-lg p-3 flex justify-between items-center shadow-sm"
              >
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
                className="bg-white"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">
                      {warning.studentId.firstName} {warning.studentId.lastName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {getWarningLabel(warning.type)} - {warning.reason}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {warning.groupId.name} •{' '}
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
      </div>
    </Card>
  );
};
