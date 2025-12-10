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
    loadingStatistics,
    fetchTeacherStatistics,
    giveWarning,
    deleteWarning,
    deleteWarningById,
  } = useWarningsActions(refetchData);

  const { selectedGroup, loadingStudents, handleGroupSelect, handleBack } = useGroupSelection({
    fetchGroupStudentsWarnings,
  });

  // ✅ Memoize onSuccess callback - Optimized
  const handleModalSuccess = useCallback(() => {
    // Socket.IO سيقوم بالتحديث التلقائي لكل شيء:
    // - warningCreated → يحدث قائمة الطلاب المفصولين
    // - warningDeleted → يحدث قائمة الطلاب المفصولين
    // - statisticsUpdated → يحدث الإحصائيات
    
    // تحديث قائمة طلاب الحلقة فقط (باقي التحديثات عبر Socket)
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

  // ✅ Optimized socket callbacks - Reduced API calls and console logs
  const handleNewWarning = useCallback((newWarning: any) => {
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

  // معالجة انتهاء الفصل المؤقت
  const handleSuspensionExpired = useCallback((data: any) => {
    console.log("⏰ Suspension expired notification:", data);
    
    // إعادة تحميل الإحصائيات
    if (isTeacher) {
      fetchTeacherStatistics();
    }
    
    // إعادة تحميل الحلقة المحددة
    if (selectedGroup) {
      handleGroupSelect(selectedGroup);
    }

    // إظهار إشعار
    import('@/components/utils/toastUtils').then(({ showSuccessToast }) => {
      showSuccessToast(data.message || 'تم إعادة طالب إلى حلقته');
    });
  }, [isTeacher, selectedGroup, fetchTeacherStatistics, handleGroupSelect]);

  // معالجة استعادة الطالب
  const handleSuspensionRestored = useCallback((data: any) => {
    console.log("✅ Suspension restored notification:", data);
    
    // إظهار إشعار للطالب
    import('@/components/utils/toastUtils').then(({ showSuccessToast }) => {
      showSuccessToast(data.message || 'تمت إعادتك إلى حلقتك');
    });
    
    // إعادة تحميل بيانات الطالب
    if (isStudent) {
      refetchData();
    }
  }, [isStudent, refetchData]);

  // Socket للتحديثات الفورية - مباشرة من مجلد Socket


  // Real-time user status updates (للطلاب في الحلقة)
  useEffect(() => {
    if (!isTeacher) return;

    const handleUserStatusChange = (data: {
      userId: string;
      isActive: boolean;
      lastSeen?: string;
    }) => {
      console.log("👤 User status changed in warnings:", data);
      
      // إذا كانت الحلقة محددة، تحديث حالة الطالب
      if (selectedGroup) {
        handleGroupSelect(selectedGroup);
      }
    };

    const socket = socketManager.getSocket();
    if (socket) {
      socket.on("userStatusChange", handleUserStatusChange);
    }

    return () => {
      const socket = socketManager.getSocket();
      if (socket) {
        socket.off("userStatusChange", handleUserStatusChange);
      }
    };
  }, [isTeacher, selectedGroup, handleGroupSelect]);

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
