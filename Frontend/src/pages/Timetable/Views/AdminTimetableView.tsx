// ============================================================================
// AdminTimetableView - عرض الجدول للإداري (إدارة كاملة)
// ============================================================================

import React from "react";
import { useDisableBodyScroll } from "@/hooks/useDisableBodyScroll";
import type { Session, SessionFormData } from "../types/timetable.types";
import { useViewMode, useSessionModal } from "../hooks";
import { AdvancedTimetableView } from "../components/AdvancedTimetableView";
import { WeeklyGridView } from "../components/WeeklyGridView";
import { SessionModal } from "../components/SessionModal";
import PageHeader from "@/components/UI/PageHeader";
import { Button } from "@/components/UI/Button";
import { Alert } from "@/components/UI/Alert";
import { Calendar, Plus, Grid3x3, List } from "lucide-react";

interface AdminTimetableViewProps {
  sessions: Session[];
  loading: boolean;
  error: string | null;
  onAddSession: (formData: SessionFormData) => Promise<boolean>;
  onEditSession: (sessionId: string, formData: SessionFormData) => Promise<boolean>;
  onDeleteSession: (session: Session) => Promise<boolean>;
  refetchSessions: () => void;
}

export const AdminTimetableView: React.FC<AdminTimetableViewProps> = ({
  sessions,
  loading,
  error,
  onAddSession,
  onEditSession,
  onDeleteSession,
  refetchSessions,
}) => {
  const { viewMode, setViewMode } = useViewMode('grid');
  const { showModal, editingSession, openAddModal, openEditModal, closeModal } = useSessionModal();

  // تعطيل scroll الصفحة عند فتح الـ Modal
  useDisableBodyScroll(showModal);

  // التعامل مع إضافة/تعديل موعد
  const handleSubmitSession = async (formData: Session, sessionId?: string) => {
    const result = sessionId
      ? await onEditSession(sessionId, formData)
      : await onAddSession(formData);

    if (result) {
      closeModal();
    }

    return result;
  };

  // استخدام الدوال من useSessionModal
  const handleEditClick = openEditModal;
  const handleAddClick = openAddModal;
  const handleCloseModal = closeModal;

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 md:p-6 lg:p-8"
      dir="rtl"
      lang="ar">
      <div className="max-w-7xl mx-auto">
        {/* رأس الصفحة */}
        <PageHeader
          title="جدول الحصص الأسبوعي - لوحة الإدارة"
          subtitle="إدارة جميع مواعيد الحلقات - كل خانة تمثل نصف ساعة"
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

        {/* أزرار التحكم */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <Button
            leftIcon={<Plus className="w-5 h-5" />}
            onClick={handleAddClick}
            size="lg">
            إضافة موعد حلقة
          </Button>

          {/* أزرار تبديل العرض */}
          <div className="flex gap-2 bg-white rounded-lg p-1 shadow-md">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                viewMode === 'grid'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="عرض الشبكة الأسبوعية">
              <Grid3x3 size={18} />
              <span className="text-sm font-medium hidden sm:inline">شبكة أسبوعية</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                viewMode === 'cards'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="عرض البطاقات">
              <List size={18} />
              <span className="text-sm font-medium hidden sm:inline">بطاقات</span>
            </button>
          </div>
        </div>

        {/* عرض الجدول */}
        {viewMode === 'grid' ? (
          <WeeklyGridView
            sessions={sessions}
            loading={loading}
            role="admin"
            onEdit={handleEditClick}
            onDelete={onDeleteSession}
          />
        ) : (
          <AdvancedTimetableView
            sessions={sessions}
            loading={loading}
            role="admin"
            onEdit={handleEditClick}
            onDelete={onDeleteSession}
          />
        )}

        {/* معلومات إضافية */}
        {sessions.length === 0 && !loading && (
          <div className="mt-6 text-center">
            <Alert
              variant="info"
              title="لا توجد مواعيد"
              className="max-w-2xl mx-auto">
              لم يتم إضافة مواعيد بعد. ابدأ بإضافة موعد جديد.
            </Alert>
          </div>
        )}
      </div>

      {/* نافذة إضافة/تعديل الموعد */}
      <SessionModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmitSession}
        editingSession={editingSession}
        role="admin"
        sessions={sessions}
      />
    </div>
  );
};
