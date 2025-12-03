// ============================================================================
// WarningsPage - الصفحة الرئيسية للإنذارات
// ============================================================================

import React from "react";
import { useWarningsSocket } from "@/Socket/useWarningsSocket";
import { useWarningsData } from "./hooks/useWarningsData";
import { useWarningsActions } from "./hooks/useWarningsActions";
import { useGroupSelection } from "./hooks/useGroupSelection";
import { useWarningsModals } from "./hooks/useWarningsModals";
import { TeacherView } from "./components/views/TeacherView";
import { StudentView } from "./components/views/StudentView";

const WarningsPage = () => {
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

  const { selectedGroup, handleGroupSelect, handleBack } = useGroupSelection({
    fetchGroupStudentsWarnings,
  });

  const { showGiveWarningModal, showDeleteWarningModal, showDeleteWarningByIdModal } =
    useWarningsModals({
      giveWarning,
      deleteWarning,
      deleteWarningById,
      selectedGroupName: selectedGroup?.name || "",
      teacherId: user?._id || "",
      onSuccess: () => {
        if (selectedGroup) {
          handleGroupSelect(selectedGroup);
        }
      },
    });

  // جلب الإحصائيات تلقائياً عند التحميل
  React.useEffect(() => {
    if (isTeacher && !loading) {
      fetchTeacherStatistics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTeacher, loading]);

  // Socket للتحديثات الفورية - مباشرة من مجلد Socket
  useWarningsSocket(
    // عند إنشاء إنذار جديد
    (newWarning) => {
      console.log("New warning received:", newWarning);
      if (isStudent && newWarning.studentId._id === user?._id) {
        setWarnings((prev) => [newWarning, ...prev]);
      } else if (
        isTeacher &&
        selectedGroup &&
        newWarning.groupId._id === selectedGroup._id
      ) {
        handleGroupSelect(selectedGroup);
      }
    },
    // عند حذف إنذار
    (deletedWarningId) => {
      console.log("Warning deleted:", deletedWarningId);
      setWarnings((prev) => prev.filter((w) => w._id !== deletedWarningId));
      // إعادة تحميل الإحصائيات بعد الحذف
      if (isTeacher) {
        fetchTeacherStatistics();
      }
    },
    // عند تحديث الإحصائيات
    (updatedStatistics) => {
      console.log("Statistics updated:", updatedStatistics);
      fetchTeacherStatistics();
    },
    // عند تحديث حالة طالب
    (data) => {
      console.log("Student status updated:", data);
      // إعادة تحميل الطلاب إذا كان المعلم يشاهد حلقة
      if (isTeacher && selectedGroup) {
        handleGroupSelect(selectedGroup);
      }
    }
  );

  // عرض واجهة المعلم
  if (isTeacher) {
    return (
      <TeacherView
        groups={groups}
        loading={loading}
        selectedGroup={selectedGroup}
        onGroupSelect={handleGroupSelect}
        onBack={handleBack}
        statistics={statistics}
        onGiveWarning={showGiveWarningModal}
        onDeleteWarning={showDeleteWarningModal}
        onDeleteWarningById={showDeleteWarningByIdModal}
      />
    );
  }

  // عرض واجهة الطالب
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
