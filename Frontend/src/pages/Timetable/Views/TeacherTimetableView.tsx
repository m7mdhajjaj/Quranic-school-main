// ============================================================================
// TeacherTimetableView - عرض الجدول للمعلم
// ============================================================================
// المعلم يمكنه إضافة/تعديل/حذف مواعيد حلقاته فقط

import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import type { Session, SessionFormData } from "../types/timetable.types";
import { useViewMode } from "../hooks";
import { SessionModal } from "../components/SessionModal";
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
  const [searchParams, setSearchParams] = useSearchParams();

  // ✅ التحقق من وجود طلب إضافة/تعديل جلسة من الرابط
  useEffect(() => {
    if (loading) return;

    const addSession = searchParams.get('addSession');
    const editSessionId = searchParams.get('editSession');
    const sectionId = searchParams.get('sectionId');
    const urlSessionType = searchParams.get('sessionType');
    
    // الحالة 1: تعديل جلسة مباشرة بالـ ID
    if (editSessionId) {
      const sessionToEdit = sessions.find(s => s._id === editSessionId);
      if (sessionToEdit) {
        setEditingSession(sessionToEdit);
        setIsModalOpen(true);
      }
      return;
    }

    // الحالة 2: إضافة/تعديل عبر sectionId
    if (sectionId) {
      const matchingSessions = sessions.filter(s => s.sectionId === sectionId);
      
      if (matchingSessions.length >= 1) {
        // يوجد جلسة مرتبطة - فتح التعديل
        let targetSession = matchingSessions[0];
        if (urlSessionType && matchingSessions.length > 1) {
          const specificMatch = matchingSessions.find(s => s.sessionType === urlSessionType);
          if (specificMatch) targetSession = specificMatch;
        }
        setEditingSession(targetSession);
        setIsModalOpen(true);
      } else if (addSession === 'true') {
        // لا يوجد جلسة مرتبطة - فتح إضافة جديدة
        setEditingSession(null);
        setIsModalOpen(true);
      }
    }
  }, [searchParams, sessions, loading]);



  const handleOpenEditModal = (session: Session) => {
    setEditingSession(session);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSession(null);
  };

  const handleSubmit = async (formData: SessionFormData, sessionId?: string) => {
    // Inject sectionId from URL if adding
    if (!sessionId) {
      const urlSectionId = searchParams.get('sectionId');
      if (urlSectionId) {
        formData.sectionId = urlSectionId;
      }
      
      // Inject sessionType from URL if not set (or override?? Usually form data has priority, but initial state should be set correctly)
      // Actually formData comes from the modal, which should be initialized with URL param.
      // But let's fallback just in case:
      // const urlSessionType = searchParams.get('sessionType');
      // if (!formData.sessionType && urlSessionType) {
      //   formData.sessionType = urlSessionType as any;
      // }
    }

    const success = sessionId 
      ? await onEditSession(sessionId, formData)
      : await onAddSession(formData);
    
    if (success) {
      handleCloseModal();
      // Remove query params after successful add/edit to clean up URL
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.delete('addSession');
        newParams.delete('editSession');
        newParams.delete('sectionId');
        newParams.delete('groupName');
        newParams.delete('sessionType'); // Clear this too
        return newParams;
      });
    }
    return success;
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 via-gray-50 to-slate-100 p-4 md:p-6 lg:p-8"
      dir="rtl"
      lang="ar">
      <div className="w-full mx-auto">
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

          {/* زر إضافة موعد - تمت إزالته بناءً على الطلب */}
          {/* <Button
            onClick={handleOpenAddModal}
            variant="primary"
            size="lg">
            ➕ إضافة موعد حلقة
          </Button> */}
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
        onClose={() => {
          handleCloseModal();
          // Remove query params if they exist (both add and edit)
          if (searchParams.get('addSession') || searchParams.get('editSession')) {
            setSearchParams({});
          }
        }}
        onSubmit={handleSubmit}
        editingSession={editingSession}
        role="teacher"
      />
    </div>
  );
};