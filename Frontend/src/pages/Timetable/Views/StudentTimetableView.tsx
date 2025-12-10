// ============================================================================
// StudentTimetableView - عرض الجدول للطالب (قراءة فقط)
// ============================================================================

import React from "react";
import type { Session } from "../types/timetable.types";
import { AdvancedTimetableView } from "../components/DisplayType/AdvancedTimetableView";
import PageHeader from "@/components/UI/PageHeader";
import { Alert } from "@/components/UI/Alert";
import { Button } from "@/components/UI/Button";
import { Calendar } from "lucide-react";

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
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 md:p-6 lg:p-8"
      dir="rtl"
      lang="ar">
      <div className="max-w-7xl mx-auto">
        {/* رأس الصفحة */}
        <PageHeader
          title="جدول الحصص الأسبوعي"
          subtitle="عرض مواعيد حلقتك - كل خانة تمثل نصف ساعة"
          icon={<Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-white" />}
        />

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

        {/* الجدول - للطالب بدون أزرار تعديل */}
        <AdvancedTimetableView
          sessions={sessions}
          loading={loading}
          role="student"
        />

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
