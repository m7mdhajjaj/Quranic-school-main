// ============================================================================
// StudentView - عرض الطالب للإنذارات
// ============================================================================

import React, { useMemo } from 'react';
import type { StudentViewProps } from '../types/warnings';
import { EmptyState } from '@/components/UI/EmptyState';
import { Card } from '@/components/UI/Card';
import {
  getWarningColor,
  getWarningIcon,
  getWarningLabel,
  getWarningDescription,
  formatArabicDate,
} from '../types/Constans';

// ✅ Constants extracted outside component for performance
const ANIMATION_DELAYS = [
  '',
  'animate-delay-100',
  'animate-delay-200',
  'animate-delay-300',
  'animate-delay-400',
] as const;

export const StudentView: React.FC<StudentViewProps> = React.memo(({ warnings, loading }) => {
  // ✅ Memoize has warnings check
  const hasWarnings = useMemo(() => warnings.length > 0, [warnings.length]);
  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 via-gray-50 to-slate-100 p-4 md:p-8"
      dir="rtl"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-down">
          <div className="inline-block p-4 bg-gradient-to-br from-red-500 to-rose-500 rounded-2xl shadow-xl mb-4">
            <span className="text-5xl">⚠️</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent mb-4">
            إنذاراتي
          </h1>
          <p className="text-gray-600 text-lg font-medium">
            عرض جميع الإنذارات والتنبيهات الخاصة بك
          </p>
        </div>

        {/* Warnings List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 h-48 flex flex-col justify-between animate-pulse">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-3">
                    <div className="h-6 w-1/3 bg-gray-200 rounded" />
                    <div className="h-4 w-2/3 bg-gray-200 rounded" />
                  </div>
                </div>
                <div className="h-16 bg-gray-200 rounded-lg mt-4" />
              </div>
            ))}
          </div>
        ) : hasWarnings ? (
          <div className="space-y-4">
            {warnings.map((warning, index) => {
              const delayClass = ANIMATION_DELAYS[index % ANIMATION_DELAYS.length];
              return (
                <div
                  key={warning._id}
                  className={`animate-fade-in-up ${delayClass}`}
                >
                  <Card
                    className={`bg-gradient-to-r ${getWarningColor(
                      warning.type
                    )} text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-102 border-2 border-white/50`}
                    padding="lg"
                  >
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
                              المعلم: {warning.teacherId?.firstName}{' '}
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
                </div>
              );
            })}
          </div>
        ) : (
          <div className="animate-fade-in">
            <EmptyState
              icon="✅"
              title="لا توجد إنذارات"
              description="استمر في التفوق والالتزام! 🌟"
            />
          </div>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // ✅ Custom comparison for performance
  return prevProps.warnings.length === nextProps.warnings.length;
});
