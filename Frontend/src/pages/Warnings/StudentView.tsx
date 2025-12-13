// ============================================================================
// StudentView - عرض الطالب للإنذارات
// ============================================================================

import type { StudentViewProps } from "./types/warnings";
import { EmptyState } from "@/components/UI/EmptyState";
import { Card } from "@/components/UI/Card";
import {
  getWarningColor,
  getWarningIcon,
  getWarningLabel,
  getWarningDescription,
  formatArabicDate,
} from "./utils/warningHelpers";

export const StudentView: React.FC<StudentViewProps> = ({
  warnings,
  loading,
}) => {
  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 via-gray-50 to-slate-100 p-4 md:p-8"
      dir="rtl">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            ⚠️ إنذاراتي
          </h1>
          <p className="text-gray-600 text-lg">
            عرض جميع الإنذارات والتنبيهات الخاصة بك
          </p>
        </div>

        {/* Warnings List */}
        {warnings.length > 0 ? (
          <div className="space-y-4">
            {warnings.map((warning) => (
              <Card
                key={warning._id}
                className={`bg-gradient-to-r ${getWarningColor(
                  warning.type
                )} text-white shadow-lg`}
                padding="lg">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-4xl">
                        {getWarningIcon(warning.type)}
                      </span>
                      <h3 className="text-2xl font-bold">
                        {getWarningLabel(warning.type)}
                      </h3>
                    </div>
                    <p className="text-lg mb-2 opacity-90">
                      {getWarningDescription(warning.type)}
                    </p>
                    <div className="bg-white/20 rounded-lg p-3 mb-3 backdrop-blur-sm">
                      <p className="font-medium">السبب:</p>
                      <p className="text-sm opacity-90">{warning.reason}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm opacity-80">
                      <span className="flex items-center gap-1">
                        <span>📚</span>
                        <span>الحلقة: {warning.groupId?.name}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span>👨‍🏫</span>
                        <span>
                          المعلم: {warning.teacherId?.firstName}{" "}
                          {warning.teacherId?.lastName}
                        </span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span>📅</span>
                        <span>
                          التاريخ: {formatArabicDate(warning.createdAt)}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="✅"
            title="لا توجد إنذارات"
            description="استمر في التفوق والالتزام! 🌟"
          />
        )}
      </div>
    </div>
  );
};
