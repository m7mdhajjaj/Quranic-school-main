// ============================================================================
// TeacherTimetableView - عرض الجدول للمعلم
// ============================================================================
// المعلم يمكنه إضافة/تعديل/حذف مواعيد حلقاته فقط

import React, { useState } from "react";
import type { Session, SessionFormData } from "../types/timetable.types";
import { useViewMode } from "../hooks";
import { SessionModal } from "../Model/SessionModal";
import { AdvancedTimetableView } from "../DisplayType/AdvancedTimetableView";
import { WeeklyGridView } from "../DisplayType/WeeklyGridView";
import PageHeader from "@/components/UI/PageHeader";
import { Button } from "@/components/UI/Button";
import { Alert } from "@/components/UI/Alert";
import { Calendar, Grid3x3, List } from "lucide-react";

interface TeacherTimetableViewProps {
  sessions: Session[];
  loading: boolean;
  error: string | null;
  teacherGroups: string[];
  onAddSession: (formData: SessionFormData) => Promise<boolean>;
  onEditSession: (sessionId: string, formData: SessionFormData) => Promise<boolean>;
  onDeleteSession: (session: Session) => Promise<boolean>;
  refetchSessions: () => void;
}

export const TeacherTimetableView: React.FC<TeacherTimetableViewProps> = ({
  sessions,
  loading,
  error,
  teacherGroups,
  onAddSession,
  onEditSession,
  onDeleteSession,
  refetchSessions,
}) => {
  const { viewMode, setViewMode } = useViewMode('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);

  const handleOpenAddModal = () => {
    setEditingSession(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (session: Session) => {
    setEditingSession(session);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSession(null);
  };

  const handleSubmit = async (formData: SessionFormData, sessionId?: string) => {
    const success = sessionId 
      ? await onEditSession(sessionId, formData)
      : await onAddSession(formData);
    
    if (success) {
      handleCloseModal();
      refetchSessions();
    }
    return success;
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 via-gray-50 to-slate-100 p-4 md:p-6 lg:p-8"
      dir="rtl"
      lang="ar">
      <div className="max-w-7xl mx-auto">
        {/* رأس الصفحة */}
        <PageHeader
          title="جدول الحصص الأسبوعي"
          subtitle="إدارة مواعيد حلقاتك - كل خانة تمثل نصف ساعة"
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

        {/* شريط التحكم العلوي */}
        <div className="flex items-center justify-between mb-6">
          {/* أزرار تبديل العرض */}
          <div className="flex gap-2 bg-white rounded-lg p-1 shadow-md">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                viewMode === 'grid'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}>
              <Grid3x3 size={18} />
              <span className="text-sm font-medium">شبكة أسبوعية</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                viewMode === 'cards'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}>
              <List size={18} />
              <span className="text-sm font-medium">بطاقات متقدمة</span>
            </button>
          </div>

          {/* زر إضافة موعد */}
          <Button
            onClick={handleOpenAddModal}
            variant="primary"
            size="lg">
            ➕ إضافة موعد حلقة
          </Button>
        </div>

       
        {/* الجدول */}
        {viewMode === 'grid' ? (
          <WeeklyGridView
            sessions={sessions}
            loading={loading}
            role="teacher"
            onEdit={handleOpenEditModal}
            onDelete={onDeleteSession}
          />
        ) : (
          <AdvancedTimetableView
            sessions={sessions}
            loading={loading}
            role="teacher"
            onEdit={handleOpenEditModal}
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
              لم يتم إضافة مواعيد لحلقاتك بعد من قبل الإدارة.
            </Alert>
          </div>
        )}
      </div>

      {/* Modal إضافة/تعديل موعد */}
      <SessionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        editingSession={editingSession}
        role="teacher"
        teacherGroups={teacherGroups}
        sessions={sessions}
      />
    </div>
  );
};