import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { 
  useTeacherGroups, 
  useStudentManagement, 
  useTeacherNavigation 
} from "./hooks";
import { GroupsList, StudentsList, StudentFormModal } from "./components";
import type { Student } from "@/Api/studentApi";

const TeacherStudentManagement: React.FC = () => {
  const { user } = useAuth();
  const { groups, isLoading, error, refetch: refetchGroups } = useTeacherGroups();
  
  // Navigation logic
  const {
    selectedGroupId,
    selectedGroupName,
    viewMode,
    navigateToGroup,
    navigateToGroups,
  } = useTeacherNavigation();

  // Student management logic
  const {
    isFormOpen,
    selectedStudent,
    isEditMode,
    handleAddStudent,
    handleEditStudent,
    handleDeleteStudent,
    handleFormSuccess,
    closeForm,
  } = useStudentManagement({
    onRefetchGroups: refetchGroups,
    selectedGroupId,
    groups: groups?.groups,
  });

  // التحقق من أن المستخدم معلم
  if (!user || user.role !== "teacher") {
    return (
      <div className="min-h-screen p-4 md:p-6 flex items-center justify-center" dir="rtl">
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
      <>
        <StudentsList
          groupId={selectedGroupId}
          groupName={selectedGroupName}
          onBack={navigateToGroups}
          onAddStudent={handleAddStudent}
          onEditStudent={handleEditStudent}
          onDeleteStudent={handleDeleteStudent}
        />
        <StudentFormModal
          isOpen={isFormOpen}
          onClose={closeForm}
          onSuccess={handleFormSuccess}
          student={isEditMode ? selectedStudent : undefined}
          defaultGroup={selectedGroupName}
          restrictToGroup={selectedGroupName}
        />
      </>
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
