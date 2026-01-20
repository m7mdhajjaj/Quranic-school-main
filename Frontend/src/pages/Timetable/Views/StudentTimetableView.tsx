// ============================================================================
// StudentTimetableView - عرض الجدول للطالب (قراءة فقط)
// ============================================================================

import React, { useState } from "react";
import type { Session } from "../types/timetable.types";
import { AdvancedTimetableView } from "../DisplayType/AdvancedTimetableView";
import { WeeklyGridView } from "../DisplayType/WeeklyGridView";
import { Alert } from "@/components/UI/Alert";
import { Button } from "@/components/UI/Button";
import { Calendar, Grid3x3, List } from "lucide-react";

interface StudentTimetableViewProps {
  sessions: Session[];
  loading: boolean;
  error: string | null;
  refetchSessions: () => void;
}

export const StudentTimetableView: React.FC<StudentTimetableViewProps> = ({
  sessions,
  loading,
  error,
  refetchSessions,
}) => {
  const [viewMode, setViewMode] = useState<'monthly' | 'weekly'>('weekly');

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-slate-50 to-teal-50/20 p-4 md:p-6 lg:p-8"
      dir="rtl"
      lang="ar">
      <div className="max-w-[98%] mx-auto">
        {/* رأس الصفحة */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 rounded-2xl shadow-xl p-6 border border-white/10">
            <div className="flex items-center gap-4">
              <div className="bg-white/15 backdrop-blur-sm p-3 rounded-xl">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  📅 مواعيد حلقتي
                </h1>
                <p className="text-white/70 text-sm mt-1">
                  عرض مواعيد حلقتك والمقاطع المطلوبة
                </p>
              </div>
            </div>
          </div>
          
          {/* أزرار التبديل بين العروض */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => setViewMode('weekly')}
              className={`
                flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base
                transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5
                ${viewMode === 'weekly' 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white scale-105' 
                  : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200'
                }
              `}>
              <Grid3x3 className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>الجدول الأسبوعي</span>
            </button>
            
            <button
              onClick={() => setViewMode('monthly')}
              className={`
                flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base
                transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5
                ${viewMode === 'monthly' 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white scale-105' 
                  : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200'
                }
              `}>
              <List className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>التقويم الشهري</span>
            </button>
          </div>
        </div>

        {/* رسالة الخطأ */}
        {error && (
          <Alert
            variant="danger"
            title="خطأ في تحميل البيانات"
            className="mb-6">
            <p>{error}</p>
            <Button
              size="sm"
              variant="secondary"
              onClick={refetchSessions}
              className="mt-3">
              إعادة المحاولة
            </Button>
          </Alert>
        )}

        {/* الجدول - حسب الوضع المختار */}
        {viewMode === 'weekly' ? (
          <WeeklyGridView
            sessions={sessions}
            loading={loading}
            role="student"
          />
        ) : (
          <AdvancedTimetableView
            sessions={sessions}
            loading={loading}
            role="student"
          />
        )}

        {/* معلومات إضافية */}
        {sessions.length === 0 && !loading && (
          <div className="mt-6 text-center">
            <Alert
              variant="info"
              title="لا توجد مواعيد"
              className="max-w-2xl mx-auto">
              لم يتم تحديد مواعيد لحلقتك بعد. يرجى التواصل مع معلمك.
            </Alert>
          </div>
        )}
      </div>
    </div>
  );
};
