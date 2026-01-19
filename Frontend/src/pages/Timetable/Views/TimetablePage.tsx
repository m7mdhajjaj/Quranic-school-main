// ============================================================================
// TimetablePage - الصفحة الرئيسية لجدول الحصص الأسبوعي
// ============================================================================
// هذه الصفحة Router فقط - توجه المستخدم للعرض المناسب حسب دوره

import React from "react";
import { useTimetableData, useTimetableActions } from "../hooks";
import { StudentTimetableView, TeacherTimetableView } from ".";

const TimetablePage = () => {
  // ✅ جلب البيانات من Backend
  const {
    sessions,
    setSessions,
    loading,
    error,
    teacherGroups,
    role,
    user,
    refetchSessions,
  } = useTimetableData();

  // ✅ العمليات (CRUD) - تتواصل مع Backend API (للمعلم فقط)
  // ✅ Optimistic Updates: التحديث الفوري مع rollback عند الخطأ
  const { addSession, editSession, removeSession } = useTimetableActions({
    setSessions,
    refetchSessions,
  });

  // ✅ فلترة الحصص لمساعد المعلم - يرى فقط حلقاته
  const filteredSessions = React.useMemo(() => {
    if (role === "teacherAssistant" && user?.groups && user.groups.length > 0) {
      // فلترة الحصص حسب الحلقات التابعة لمساعد المعلم
      return sessions.filter((session) => {
        // التحقق من groupId أو groupName أو note
        const sessionGroup = session.groupId || session.groupName || session.note;
        return user.groups.some((g: string) => 
          g === sessionGroup || 
          session.note?.includes(g) || 
          session.groupName === g
        );
      });
    }
    return sessions;
  }, [sessions, role, user?.groups]);

  // ✅ توجيه حسب الدور - كل دور له عرض خاص
  if (role === "student") {
    return (
      <StudentTimetableView
        sessions={sessions}
        loading={loading}
        error={error}
        refetchSessions={refetchSessions}
      />
    );
  }

  if (role === "teacher") {
    return (
      <TeacherTimetableView
        sessions={sessions}
        loading={loading}
        error={error}
        teacherGroups={teacherGroups}
        onAddSession={addSession}
        onEditSession={editSession}
        onDeleteSession={removeSession}
        refetchSessions={refetchSessions}
      />
    );
  }

  // ✅ مساعد المعلم - عرض قراءة فقط للحلقات التابعة له
  if (role === "teacherAssistant") {
    return (
      <StudentTimetableView
        sessions={filteredSessions}
        loading={loading}
        error={error}
        refetchSessions={refetchSessions}
      />
    );
  }

  // Admin/Secretary - عرض قراءة فقط (جميع الحصص)
  return (
    <StudentTimetableView
      sessions={sessions}
      loading={loading}
      error={error}
      refetchSessions={refetchSessions}
    />
  );
};

export default TimetablePage;
