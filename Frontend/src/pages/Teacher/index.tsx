import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  useTeacherGroups,
  useStudentManagement,
  useTeacherNavigation,
} from "./hooks";
import { GroupsList, StudentsList } from "./components";

const TeacherStudentManagement: React.FC = () => {
  const { user } = useAuth();
  const {
    groups,
    isLoading,
    error,
    refetch: refetchGroups,
  } = useTeacherGroups();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Navigation logic
  const {
    selectedGroupId,
    selectedGroupName,
    viewMode,
    navigateToGroup,
    navigateToGroups,
  } = useTeacherNavigation();

  // Student management logic
  const { handleEditStudent, handleDeleteStudent } = useStudentManagement({
    onRefetchGroups: () => {
      refetchGroups();
      setRefreshTrigger((prev) => prev + 1);
    },
    selectedGroupId,
    groups: groups?.groups,
  });

  // التحقق من أن المستخدم معلم
  if (!user || user.role !== "teacher") {
    return (
      <div
        className="min-h-screen p-4 md:p-6 flex items-center justify-center"
        dir="rtl">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 max-w-md">
          <h3 className="font-semibold text-red-900 mb-2">غير مصرح لك</h3>
          <p className="text-red-700">هذه الصفحة متاحة للمعلمين فقط</p>
        </div>
      </div>
    );
  }

  // عرض قائمة الطلاب
  if (viewMode === "students" && selectedGroupId) {
    return (
      <StudentsList
        groupId={selectedGroupId}
        groupName={selectedGroupName}
        onBack={navigateToGroups}
        refreshTrigger={refreshTrigger}
        onEditStudent={handleEditStudent}
        onDeleteStudent={handleDeleteStudent}
        userRole={user?.role}
      />
    );
  }

  // عرض قائمة الحلقات
  return (
    <GroupsList
      groups={groups || undefined}
      isLoading={isLoading}
      error={error}
      refetch={refetchGroups}
      onGroupClick={navigateToGroup}
    />
  );
};

export default TeacherStudentManagement;
