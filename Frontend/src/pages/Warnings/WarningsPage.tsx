// ============================================================================
// WarningsPage - الصفحة الرئيسية للإنذارات
// ============================================================================

import React, { useCallback, useEffect } from "react";
// import { useWarningsSocket } from "@/Socket/useWarningsSocket";
import { socketManager } from "@/Socket/SocketManager";
import { useWarningsData } from "./hooks/useWarningsData";
import { useWarningsActions } from "./hooks/useWarningsActions";
import { useGroupSelection } from "./hooks/useGroupSelection";
import { useWarningsModals } from "./hooks/useWarningsModals";
import { TeacherView } from "./views/TeacherView";
import { StudentView } from "./views/StudentView";

const WarningsPage: React.FC = () => {

  const {
    user,
    groups,
    warnings,
    loading,
    isTeacher,
    isStudent,
    refetchData,
    fetchGroupStudentsWarnings,
    setWarnings,
  } = useWarningsData();

  const {
    statistics,
    loadingStatistics,
    fetchTeacherStatistics,
    giveWarning,
    deleteWarning,
    deleteWarningById,
  } = useWarningsActions(refetchData);

  const { selectedGroup, loadingStudents, handleGroupSelect, refreshCurrentGroup, handleBack } = useGroupSelection({
    fetchGroupStudentsWarnings,
    groups,
  });

  // ✅ Memoize onSuccess callback - Optimized
  const handleModalSuccess = useCallback(() => {
    // Socket.IO سيقوم بالتحديث التلقائي لكل شيء:
    // - warningCreated → يحدث قائمة الطلاب المفصولين
    // - warningDeleted → يحدث قائمة الطلاب المفصولين
    // - statisticsUpdated → يحدث الإحصائيات
    
    // تحديث قائمة طلاب الحلقة فقط (باقي التحديثات عبر Socket)
    // ✅ استخدام refreshCurrentGroup بدلاً من handleGroupSelect لمنع الوميض
    refreshCurrentGroup();
  }, [refreshCurrentGroup]);

  const { showGiveWarningModal, showDeleteWarningModal, showDeleteWarningByIdModal } =
    useWarningsModals({
      giveWarning,
      deleteWarning,
      deleteWarningById,
      selectedGroupName: selectedGroup?.name || "",
      teacherId: user?._id || "",
      onSuccess: handleModalSuccess,
    });

  // ✅ جلب الإحصائيات تلقائياً عند التحميل - استخدام useEffect مباشرة
  useEffect(() => {
    if (isTeacher && !loading) {
      fetchTeacherStatistics();
    }
  }, [isTeacher, loading, fetchTeacherStatistics]);

  // ✅ Optimized socket callbacks - Reduced API calls and console logs
  const handleNewWarning = useCallback((newWarning: any) => {
    if (isStudent && newWarning.studentId._id === user?._id) {
      setWarnings((prev) => [newWarning, ...prev]);
    } else if (
      isTeacher &&
      selectedGroup &&
      newWarning.groupId._id === selectedGroup._id
    ) {
      // ✅ استخدام refreshCurrentGroup بدلاً من handleGroupSelect لمنع الوميض
      refreshCurrentGroup();
    }
  }, [isStudent, isTeacher, user?._id, selectedGroup, setWarnings, refreshCurrentGroup]);

  const handleWarningDeleted = useCallback((deletedWarningId: string) => {
    setWarnings((prev) => prev.filter((w) => w._id !== deletedWarningId));
    // Socket statisticsUpdated event will handle the rest
  }, [setWarnings]);

  const handleStatisticsUpdated = useCallback((updatedStatistics: any) => {
    // Single call to update statistics
    fetchTeacherStatistics();
  }, [fetchTeacherStatistics]);

  const handleStudentStatusUpdated = useCallback((data: any) => {
    // No action needed - updates handled by other events
  }, []);

  // Socket للتحديثات الفورية - مباشرة من مجلد Socket

  // ❌ REMOVED: Real-time user status updates
  // المشكلة: كان يسبب استدعاءات API متكررة بشكل مفرط
  // الحل: تحديث حالة المستخدم يتم التعامل معه في مكان آخر (Avatar component)
  // لا حاجة لإعادة تحميل كل بيانات الحلقة عند كل تغيير في حالة المستخدم

  // ✅ عرض واجهة المعلم
  if (isTeacher) {
    return (
      <TeacherView
          groups={groups}
          loading={loading}
          loadingStudents={loadingStudents}
          selectedGroup={selectedGroup}
          statistics={statistics}
          loadingStatistics={loadingStatistics}
          onGroupSelect={handleGroupSelect}
          onBack={handleBack}
          onGiveWarning={showGiveWarningModal}
          onDeleteWarning={showDeleteWarningModal}
          onDeleteWarningById={showDeleteWarningByIdModal}
        />
    );
  }

  // ✅ عرض واجهة الطالب
  if (isStudent) {
    return <StudentView warnings={warnings} loading={loading} />;
  }

  // غير مصرح
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-6xl mb-4">🚫</div>
        <p className="text-gray-600 text-lg">غير مصرح لك بالوصول لهذه الصفحة</p>
      </div>
    </div>
  );
};

export default WarningsPage;
