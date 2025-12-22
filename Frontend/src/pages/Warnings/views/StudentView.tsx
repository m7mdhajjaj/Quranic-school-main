// ============================================================================
// StudentView - عرض الطالب للإنذارات
// ============================================================================

import React from 'react';
import type { StudentViewProps } from '../types/warnings';
import { Card } from '@/components/UI/Card';
import PageHeader from '@/components/UI/PageHeader';
import {
  getWarningLabel,
  getWarningDescription,
  formatArabicDate,
} from '../types/Constans';
import {
  ShieldAlert,
  CheckCircle,
  Calendar,
  Users,
  User,
  AlertTriangle,
} from 'lucide-react';
import { useStudentView } from '../hooks/useStudentView';
import {
  ANIMATION_DELAYS,
  LOADING_SKELETON_COUNT,
  EMPTY_STATES,
} from '../types/viewsConstants';
import { getWarningIcon } from './warningIconHelper';

export const StudentView: React.FC<StudentViewProps> = React.memo(
  ({ warnings, loading }) => {
    const { hasWarnings } = useStudentView({ warnings });

    return (
      <div
        className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-teal-50/40 to-cyan-50/50 p-4 md:p-8"
        dir="rtl"
      >
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header - يعتمد على PageHeader للمطابقة مع باقي الصفحات */}
          <PageHeader
            title="إنذاراتي"
            subtitle="عرض وتنظيم كل التنبيهات الخاصة بك"
            icon={<ShieldAlert className="w-6 h-6" />}
          />

          {/* Warnings List */}
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: LOADING_SKELETON_COUNT.warnings }).map(
                (_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl p-5 shadow-md border border-gray-100 animate-pulse"
                  >
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-xl flex-shrink-0" />
                      <div className="flex-1 space-y-3">
                        <div className="h-5 w-1/3 bg-gray-200 rounded-lg" />
                        <div className="h-4 w-2/3 bg-gray-200 rounded" />
                        <div className="h-14 bg-gray-200 rounded-xl mt-3" />
                        <div className="grid grid-cols-3 gap-2 mt-3">
                          <div className="h-4 bg-gray-200 rounded" />
                          <div className="h-4 bg-gray-200 rounded" />
                          <div className="h-4 bg-gray-200 rounded" />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          ) : hasWarnings ? (
            <div className="space-y-4">
              {warnings.map((warning, index) => {
                const delayClass =
                  ANIMATION_DELAYS[index % ANIMATION_DELAYS.length];
                return (
                  <div
                    key={warning._id}
                    className={`animate-fade-in-up ${delayClass}`}
                  >
                    <Card
                      className="relative overflow-hidden bg-gradient-to-r from-[#f4fff7] via-[#d8f7e7] to-[#b7ecd4] text-emerald-900 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.01] border border-emerald-100 rounded-3xl ring-1 ring-emerald-100/40"
                      padding="lg"
                    >
                      {/* Decorative soft glow */}
                      <div className="absolute inset-0 opacity-30 pointer-events-none bg-[radial-gradient(circle_at_30%_20%,#ffffff,transparent_45%)]" />
                      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_80%_10%,#ffffff,transparent_40%)]" />

                      <div className="relative z-10 space-y-4">
                        {/* Top Row */}
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div className="inline-flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-sm border border-emerald-100">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shadow-inner text-emerald-800">
                              {getWarningIcon(warning.type)}
                            </div>
                            <div className="flex flex-col text-emerald-900">
                              <span className="text-xs text-emerald-700">
                                تنبيه
                              </span>
                              <span className="text-lg font-bold leading-tight">
                                {getWarningLabel(warning.type)}
                              </span>
                            </div>
                          </div>

                          <span className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-md px-3 py-2 rounded-full border border-emerald-100 text-sm font-semibold text-emerald-800">
                            <Calendar className="w-4 h-4" />
                            {formatArabicDate(warning.createdAt)}
                          </span>
                        </div>

                        {/* Description */}
                        <div className="flex items-center gap-2 bg-white/70 backdrop-blur-md rounded-2xl px-4 py-3 text-emerald-900 shadow-sm border border-emerald-100">
                          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600" />
                          <p className="text-sm font-medium leading-relaxed text-emerald-900">
                            {getWarningDescription(warning.type)}
                          </p>
                        </div>

                        {/* Reason */}
                        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-emerald-100 shadow-inner">
                          <p className="text-xs uppercase tracking-wide text-emerald-700 mb-1">
                            السبب
                          </p>
                          <p className="text-base font-semibold text-emerald-900 leading-relaxed">
                            {warning.reason}
                          </p>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-xl px-3 py-2 border border-emerald-100 shadow-sm text-emerald-900">
                            <Users className="w-4 h-4 flex-shrink-0 text-emerald-700" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-emerald-700 mb-0.5">
                                الحلقة
                              </p>
                              <p className="text-sm font-semibold truncate text-emerald-900">
                                {warning.groupId?.name}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-xl px-3 py-2 border border-emerald-100 shadow-sm text-emerald-900">
                            <User className="w-4 h-4 flex-shrink-0 text-emerald-700" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-emerald-700 mb-0.5">
                                المعلم
                              </p>
                              <p className="text-sm font-semibold truncate text-emerald-900">
                                {warning.teacherId?.firstName}{' '}
                                {warning.teacherId?.lastName}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-xl px-3 py-2 border border-emerald-100 shadow-sm text-emerald-900">
                            <Calendar className="w-4 h-4 flex-shrink-0 text-emerald-700" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-emerald-700 mb-0.5">
                                التاريخ
                              </p>
                              <p className="text-sm font-semibold truncate text-emerald-900">
                                {formatArabicDate(warning.createdAt)}
                              </p>
                            </div>
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
              <div className="bg-white rounded-2xl p-10 text-center shadow-lg border-2 border-emerald-100">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg mb-5">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {EMPTY_STATES.noWarnings.title}
                </h3>
                <p className="text-gray-600">
                  {EMPTY_STATES.noWarnings.description}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // ✅ Custom comparison for performance
    return prevProps.warnings.length === nextProps.warnings.length;
  }
);

StudentView.displayName = 'StudentView';
