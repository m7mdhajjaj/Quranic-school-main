// ============================================================================
// StudentView - عرض الطالب للإنذارات
// ============================================================================

import React from 'react';
import type { StudentViewProps } from '../types/warnings';
import { Card } from '@/components/UI/Card';
import {
  getWarningColor,
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
import { ANIMATION_DELAYS, LOADING_SKELETON_COUNT, EMPTY_STATES } from '../types/viewsConstants';
import { getWarningIcon } from './warningIconHelper';

export const StudentView: React.FC<StudentViewProps> = React.memo(
  ({ warnings, loading }) => {
    const { hasWarnings } = useStudentView({ warnings });

    return (
      <div
        className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8"
        dir="rtl"
      >
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header - Modern & Clean */}
          <div className="text-center mb-12 animate-fade-in-down">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-rose-600 rounded-3xl shadow-2xl mb-6 transform hover:scale-105 transition-transform duration-300">
              <ShieldAlert className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 bg-clip-text text-transparent mb-3 tracking-tight">
              إنذاراتي
            </h1>
            <p className="text-gray-600 text-lg font-medium max-w-md mx-auto">
              عرض شامل لجميع الإنذارات والتنبيهات الخاصة بك
            </p>
          </div>

          {/* Warnings List */}
          {loading ? (
            <div className="space-y-5">
              {Array.from({ length: LOADING_SKELETON_COUNT.warnings }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-gray-100 animate-pulse"
                >
                  <div className="flex gap-5">
                    <div className="w-14 h-14 bg-gray-200 rounded-2xl flex-shrink-0" />
                    <div className="flex-1 space-y-4">
                      <div className="h-7 w-1/3 bg-gray-200 rounded-lg" />
                      <div className="h-5 w-2/3 bg-gray-200 rounded" />
                      <div className="h-20 bg-gray-200 rounded-xl mt-4" />
                      <div className="flex gap-3 mt-4">
                        <div className="h-5 w-32 bg-gray-200 rounded" />
                        <div className="h-5 w-32 bg-gray-200 rounded" />
                        <div className="h-5 w-32 bg-gray-200 rounded" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : hasWarnings ? (
            <div className="space-y-5">
              {warnings.map((warning, index) => {
                const delayClass =
                  ANIMATION_DELAYS[index % ANIMATION_DELAYS.length];
                return (
                  <div
                    key={warning._id}
                    className={`animate-fade-in-up ${delayClass}`}
                  >
                    <Card
                      className={`relative overflow-hidden bg-gradient-to-br ${getWarningColor(
                        warning.type
                      )} text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border-0`}
                      padding="lg"
                    >
                      {/* Decorative pattern overlay */}
                      <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
                        <div className="absolute inset-0 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
                      </div>

                      <div className="relative z-10">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            {/* Warning Header */}
                            <div className="flex items-center gap-4 mb-4">
                              <div className="flex-shrink-0 w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                {getWarningIcon(warning.type)}
                              </div>
                              <div>
                                <h3 className="text-2xl font-bold mb-1">
                                  {getWarningLabel(warning.type)}
                                </h3>
                                <p className="text-sm opacity-90">
                                  {getWarningDescription(warning.type)}
                                </p>
                              </div>
                            </div>

                            {/* Reason Box */}
                            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 mb-4 border border-white/20">
                              <div className="flex items-start gap-2 mb-2">
                                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <p className="font-semibold text-sm">السبب:</p>
                              </div>
                              <p className="text-sm leading-relaxed opacity-95 pr-6">
                                {warning.reason}
                              </p>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2">
                                <Users className="w-4 h-4 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs opacity-75 mb-0.5">
                                    الحلقة
                                  </p>
                                  <p className="text-sm font-medium truncate">
                                    {warning.groupId?.name}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2">
                                <User className="w-4 h-4 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs opacity-75 mb-0.5">
                                    المعلم
                                  </p>
                                  <p className="text-sm font-medium truncate">
                                    {warning.teacherId?.firstName}{' '}
                                    {warning.teacherId?.lastName}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2">
                                <Calendar className="w-4 h-4 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs opacity-75 mb-0.5">
                                    التاريخ
                                  </p>
                                  <p className="text-sm font-medium truncate">
                                    {formatArabicDate(warning.createdAt)}
                                  </p>
                                </div>
                              </div>
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
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 text-center shadow-lg border border-gray-100">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-3xl shadow-lg mb-6">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  {EMPTY_STATES.noWarnings.title}
                </h3>
                <p className="text-gray-600 text-lg">
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
