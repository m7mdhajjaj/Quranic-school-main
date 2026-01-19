// ============================================================================
// WarningsPage - الصفحة الرئيسية للإنذارات
// ============================================================================

import React, { useCallback, useEffect } from "react";
import { useWarningsData, clearWarningsCache } from "./hooks/useWarningsData";
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
  } = useWarningsData();

  const {
    fetchTeacherStatistics,
    giveWarning,
    deleteWarning,
    deleteWarningById,
  } = useWarningsActions();

  const { selectedGroup, loadingStudents, handleGroupSelect, refreshCurrentGroup, handleBack } = useGroupSelection({
    fetchGroupStudentsWarnings,
    groups,
  });

  // ✅ Silent refresh بعد العمليات - يحدّث البيانات بدون loading
  const handleModalSuccess = useCallback(async () => {
    console.log('🔄 Starting refresh after operation...');
    
    // 1️⃣ مسح الكاش لإجبار تحديث البيانات
    clearWarningsCache();
    
    // 2️⃣ تحديث الحلقة الحالية
    if (selectedGroup) {
      await refreshCurrentGroup();
    }
    
    // 3️⃣ تحديث الإحصائيات
    fetchTeacherStatistics();
    
    console.log('✅ Refresh completed');
  }, [selectedGroup, refreshCurrentGroup, fetchTeacherStatistics]);

  const { showGiveWarningModal, showDeleteWarningModal, showDeleteWarningByIdModal } =
    useWarningsModals({
      giveWarning,
      deleteWarning,
      deleteWarningById,
      selectedGroupName: selectedGroup?.name || "",
      teacherId: user?._id || "",
      onSuccess: handleModalSuccess,
    });

  // ✅ جلب الإحصائيات تلقائياً عند التحميل
  useEffect(() => {
    if (isTeacher && !loading) {
      fetchTeacherStatistics();
    }
  }, [isTeacher, loading, fetchTeacherStatistics]);

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
