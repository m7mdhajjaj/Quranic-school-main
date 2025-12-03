// ============================================================================
// WarningsPage - الصفحة الرئيسية للإنذارات
// ============================================================================

import React, { useCallback, useEffect } from "react";
import { useWarningsSocket } from "@/Socket/useWarningsSocket";
import { useWarningsData } from "./hooks/useWarningsData";
import { useWarningsActions } from "./hooks/useWarningsActions";
import { useGroupSelection } from "./hooks/useGroupSelection";
import { useWarningsModals } from "./hooks/useWarningsModals";
import { TeacherView } from "./components/views/TeacherView";
import { StudentView } from "./components/views/StudentView";

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
    fetchTeacherStatistics,
    giveWarning,
    deleteWarning,
    deleteWarningById,
  } = useWarningsActions(refetchData);

  const { selectedGroup, loadingStudents, handleGroupSelect, handleBack } = useGroupSelection({
    fetchGroupStudentsWarnings,
  });

  // ✅ Memoize onSuccess callback
  const handleModalSuccess = useCallback(() => {
    if (selectedGroup) {
      handleGroupSelect(selectedGroup);
    }
  }, [selectedGroup, handleGroupSelect]);

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

  // ✅ Memoize socket callbacks for performance
  const handleNewWarning = useCallback((newWarning: any) => {
    console.log("✅ New warning received:", newWarning);
    if (isStudent && newWarning.studentId._id === user?._id) {
      setWarnings((prev) => [newWarning, ...prev]);
    } else if (
      isTeacher &&
      selectedGroup &&
      newWarning.groupId._id === selectedGroup._id
    ) {
      handleGroupSelect(selectedGroup);
    }
  }, [isStudent, isTeacher, user?._id, selectedGroup, setWarnings, handleGroupSelect]);

  const handleWarningDeleted = useCallback((deletedWarningId: string) => {
    console.log("🗑️ Warning deleted:", deletedWarningId);
    setWarnings((prev) => prev.filter((w) => w._id !== deletedWarningId));
    if (isTeacher) {
      fetchTeacherStatistics();
    }
  }, [isTeacher, setWarnings, fetchTeacherStatistics]);

  const handleStatisticsUpdated = useCallback((updatedStatistics: any) => {
    console.log("📊 Statistics updated:", updatedStatistics);
    fetchTeacherStatistics();
  }, [fetchTeacherStatistics]);

  const handleStudentStatusUpdated = useCallback((data: any) => {
    console.log("👨‍🎓 Student status updated:", data);
    if (isTeacher && selectedGroup) {
      handleGroupSelect(selectedGroup);
    }
  }, [isTeacher, selectedGroup, handleGroupSelect]);

  // Socket للتحديثات الفورية - مباشرة من مجلد Socket
  useWarningsSocket(
    handleNewWarning,
    handleWarningDeleted,
    handleStatisticsUpdated,
    handleStudentStatusUpdated
  );

  // ✅ عرض واجهة المعلم
  if (isTeacher) {
    return (
      <TeacherView
        groups={groups}
        loading={loading}
        loadingStudents={loadingStudents}
        selectedGroup={selectedGroup}
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
    return <StudentView warnings={warnings} />;
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
