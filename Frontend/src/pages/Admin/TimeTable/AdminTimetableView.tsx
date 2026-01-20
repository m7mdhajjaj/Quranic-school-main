// ============================================================================
// AdminTimetableView - عرض الجدول للإداري (إدارة كاملة)
// ============================================================================

import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import type { Session, SessionFormData } from "../../Timetable/types/timetable.types";
import { useViewMode } from "../../Timetable/hooks";
import { AdvancedTimetableView } from "../../Timetable/DisplayType/AdvancedTimetableView";
import { WeeklyGridView } from "../../Timetable/DisplayType/WeeklyGridView";
import { SessionModal } from "../../Timetable/components/SessionModal";
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
  const [showModal, setShowModal] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Modal handlers with useCallback for performance
  const openAddModal = useCallback(() => {
    setEditingSession(null);
    setShowModal(true);
  }, []);

  const openEditModal = useCallback((session: Session) => {
    setEditingSession(session);
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setEditingSession(null);
  }, []);

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
        openEditModal(sessionToEdit);
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
        openEditModal(targetSession);
      } else if (addSession === 'true') {
        openAddModal();
      }
    } else if (addSession === 'true') {
      openAddModal();
    }
  }, [searchParams, openAddModal, sessions, openEditModal, loading]);

  // التعامل مع إضافة/تعديل موعد - with useCallback for performance
  const handleSubmitSession = useCallback(async (formData: SessionFormData, sessionId?: string) => {
    const result = sessionId
      ? await onEditSession(sessionId, formData)
      : await onAddSession(formData);

    if (result) {
      closeModal();
    }

    return result;
  }, [onEditSession, onAddSession, closeModal]);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-slate-50 to-teal-50/20 p-4 md:p-6 lg:p-8"
      dir="rtl"
      lang="ar">
      <div className="max-w-[98%] mx-auto">
        {/* رأس الصفحة */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 rounded-2xl shadow-xl p-5 mb-6 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 backdrop-blur-sm rounded-xl shadow-sm">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">📅 جدول الحصص الأسبوعي - لوحة الإدارة</h1>
              <p className="text-white/70 text-sm mt-0.5">إدارة جميع مواعيد الحلقات - كل خانة تمثل نصف ساعة</p>
            </div>
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

        {/* أزرار التحكم */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
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
              <span className="text-sm font-medium">شبكة أسبوعية</span>
            </button>
           
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                viewMode === 'cards'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="عرض البطاقات المتقدم">
              <List size={18} />
              <span className="text-sm font-medium">بطاقات متقدمة</span>
            </button>
          </div>

          <Button
            leftIcon={<Plus className="w-5 h-5" />}
            onClick={openAddModal}
            size="lg">
            إضافة موعد حلقة
          </Button>
        </div>

        {/* عرض الجدول */}
        {viewMode === 'grid' ? (
          <WeeklyGridView
            sessions={sessions}
            loading={loading}
            role="admin"
            onEdit={openEditModal}
            onDelete={onDeleteSession}
          />
        ) : (
          <AdvancedTimetableView
            sessions={sessions}
            loading={loading}
            role="admin"
            onEdit={openEditModal}
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
        onClose={() => {
          closeModal();
           // Remove query params if they exist
           if (searchParams.get('addSession')) {
            setSearchParams({});
          }
        }}
        onSubmit={handleSubmitSession}
        editingSession={editingSession}
        role="admin"
      />
    </div>
  );
};
