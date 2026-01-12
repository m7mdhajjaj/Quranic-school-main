// ============================================================================
// TimetablePage - الصفحة الرئيسية لجدول الحصص الأسبوعي
// ============================================================================
// هذه الصفحة Router فقط - توجه المستخدم للعرض المناسب حسب دوره

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
    refetchSessions,
  } = useTimetableData();

  // ✅ العمليات (CRUD) - تتواصل مع Backend API (للمعلم فقط)
  const { addSession, editSession, removeSession } = useTimetableActions({
    setSessions,
  });

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

  // Admin - عرض قراءة فقط (مثل الطالب)
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
