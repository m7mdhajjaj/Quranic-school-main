import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTeacherGroups } from "./hooks";
import { GroupsList, StudentsList, StudentFormModal } from "./components";
import { deleteStudent } from "@/Api/studentApi";
import type { Student } from "@/Api/studentApi";

type ViewMode = "groups" | "students";

const TeacherStudentManagement: React.FC = () => {
  const { user } = useAuth();
  const { groups, isLoading, error, refetch: refetchGroups } = useTeacherGroups();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedGroupId = searchParams.get("groupId");
  const selectedGroupName = searchParams.get("groupName") || "";
  const viewMode: ViewMode = selectedGroupId ? "students" : "groups";

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | undefined>(undefined);
  const [isEditMode, setIsEditMode] = useState(false);

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

  const handleGroupClick = (groupId: string, groupName: string) => {
    setSearchParams({ groupId, groupName });
  };

  const handleBack = () => {
    setSearchParams({});
    setSelectedStudent(undefined);
    setIsEditMode(false);
  };

  const handleAddStudent = () => {
    setSelectedStudent(undefined);
    setIsEditMode(false);
    setIsFormOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsEditMode(true);
    setIsFormOpen(true);
  };

  const handleDeleteStudent = async (studentId: string) => {
    try {
      // التحقق من عدد الطلاب قبل الحذف
      const currentStudents = groups?.groups.find(g => g._id === selectedGroupId);
      const willBeEmpty = (currentStudents?.currentStudents || currentStudents?.totalStudents || 0) <= 1;
      
      const result = await deleteStudent(studentId);
      if (result.success) {
        // إذا كانت الحلقة ستصبح فارغة، إظهار رسالة
        if (willBeEmpty) {
          alert("تم حذف الطالب. الحلقة أصبحت فارغة وتم تعطيلها تلقائياً.");
        }
        
        // إعادة تحميل الحلقات والطلاب
        refetchGroups();
        // إعادة تحميل الصفحة لإظهار التحديثات
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        alert(result.message || "فشل في حذف الطالب");
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      alert("حدث خطأ أثناء حذف الطالب");
    }
  };

  const handleFormSuccess = async () => {
    // إعادة تحميل البيانات
    refetchGroups();
    setIsFormOpen(false);
    setSelectedStudent(undefined);
    setIsEditMode(false);
    
    // إعادة تحميل الصفحة لإظهار التحديثات
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  // عرض قائمة الطلاب
  if (viewMode === "students" && selectedGroupId) {
    return (
      <>
        <StudentsList
          groupId={selectedGroupId}
          groupName={selectedGroupName}
          onBack={handleBack}
          onAddStudent={handleAddStudent}
          onEditStudent={handleEditStudent}
          onDeleteStudent={handleDeleteStudent}
        />
        <StudentFormModal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedStudent(undefined);
            setIsEditMode(false);
          }}
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
      onGroupClick={handleGroupClick}
    />
  );
};

export default TeacherStudentManagement;
