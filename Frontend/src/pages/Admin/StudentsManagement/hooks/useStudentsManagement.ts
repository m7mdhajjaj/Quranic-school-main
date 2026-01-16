import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getAllStudents,
  deleteStudent,
  type Student as ApiStudent,
} from "@/Api/studentApi";
import {
  showCenteredSwal,
  showWarningMessage,
  showErrorMessage,
} from "@/utils/sweetalertUtils";
import { showSuccessToast } from "@/utils/toastUtils";

type Student = ApiStudent;
type SortField = "studentId" | "firstName" | "age" | "group";
type SortOrder = "asc" | "desc";

interface Group {
  id: string;
  name: string;
  number: number;
}

interface UseStudentsManagementProps {
  teacherGroups: Group[];
  selectedGroup: string;
}

export const useStudentsManagement = ({
  teacherGroups,
  selectedGroup,
}: UseStudentsManagementProps) => {
  // Core States
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGender, setSelectedGender] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Sorting States
  const [sortField] = useState<SortField>("studentId");
  const [sortOrder] = useState<SortOrder>("asc");

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedGender !== "all") count++;
    if (searchTerm) count++;
    return count;
  }, [selectedGender, searchTerm]);

  // Fetch students
  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getAllStudents();

      if (result.success && result.data) {
        const cleanedStudents = result.data.map((student) => ({
          ...student,
          firstName: student.firstName || "",
          lastName: student.lastName || "",
          fatherName: student.fatherName || "",
          idNumber: student.idNumber || "",
          teacher: student.teacher || "غير محدد",
          group: student.group || "غير محدد",
          gender: student.gender || "غير محدد",
          age: student.age || 0,
        }));

        setStudents(cleanedStudents);
        setError(null);
      } else {
        throw new Error(result.message || "البيانات المستلمة غير صحيحة");
      }
    } catch (error: unknown) {
      console.error("❌ خطأ في تحميل الطلاب:", error);
      let errorMessage = "حدث خطأ في تحميل البيانات";

      if (error instanceof Error) {
        errorMessage = error.message || "خطأ غير محدد";
      }

      setError(errorMessage);
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Filter students by selected group
  useEffect(() => {
    if (!selectedGroup || teacherGroups.length === 0) {
      setFilteredStudents([]);
      return;
    }

    const filtered = students.filter(
      (student) => student.group === selectedGroup
    );
    setFilteredStudents(filtered);
  }, [students, selectedGroup, teacherGroups]);

  // Apply filters and search
  const processedStudents = useMemo(() => {
    let result = [...filteredStudents];

    // Apply gender filter
    if (selectedGender !== "all") {
      result = result.filter((s) => s.gender === selectedGender);
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.firstName?.toLowerCase().includes(term) ||
          s.lastName?.toLowerCase().includes(term) ||
          s.fatherName?.toLowerCase().includes(term) ||
          s.idNumber?.toString().includes(term) ||
          s.studentId?.toString().includes(term)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue: string | number = "";
      let bValue: string | number = "";

      switch (sortField) {
        case "studentId":
          aValue = a.studentId || 0;
          bValue = b.studentId || 0;
          break;
        case "firstName":
          aValue = a.firstName || "";
          bValue = b.firstName || "";
          break;
        case "age":
          aValue = a.age || 0;
          bValue = b.age || 0;
          break;
        case "group":
          aValue = a.group || "";
          bValue = b.group || "";
          break;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue, "ar")
          : bValue.localeCompare(aValue, "ar");
      }

      return sortOrder === "asc"
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

    return result;
  }, [filteredStudents, selectedGender, searchTerm, sortField, sortOrder]);

  // Statistics for selected group
  const stats = useMemo(() => {
    const maleCount = filteredStudents.filter((s) => s.gender === "ذكر").length;
    const femaleCount = filteredStudents.filter(
      (s) => s.gender === "أنثى"
    ).length;
    const avgAge =
      filteredStudents.length > 0
        ? (
            filteredStudents.reduce((sum, s) => sum + (s.age || 0), 0) /
            filteredStudents.length
          ).toFixed(1)
        : 0;

    return {
      total: filteredStudents.length,
      male: maleCount,
      female: femaleCount,
      avgAge,
    };
  }, [filteredStudents]);

  // Handle add student
  const handleAddStudent = () => {
    setIsEditMode(false);
    setSelectedStudent(null);
    setIsFormVisible(true);
  };

  // Handle edit student
  const handleEditStudent = (student: Student) => {
    // Check if student belongs to teacher's group
    if (!teacherGroups.some((g) => g.name === student.group)) {
      showWarningMessage("لا يمكنك تعديل طالب من حلقة أخرى", "تحذير");
      return;
    }

    setIsEditMode(true);
    setSelectedStudent(student);
    setIsFormVisible(true);
  };

  // Handle delete student
  const handleDeleteStudent = async (student: Student) => {
    // Check if student belongs to teacher's group
    if (!teacherGroups.some((g) => g.name === student.group)) {
      showWarningMessage("لا يمكنك حذف طالب من حلقة أخرى", "تحذير");
      return;
    }

    const result = await showCenteredSwal({
      title: "تأكيد الحذف",
      text: `هل أنت متأكد من حذف الطالب ${student.firstName} ${student.lastName}؟`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
    });

    if (result.isConfirmed) {
      try {
        const deleteResult = await deleteStudent(student._id);
        if (deleteResult.success) {
          showSuccessToast("✅ تم حذف الطالب بنجاح");
          fetchStudents();
        } else {
          throw new Error(deleteResult.message);
        }
      } catch (error) {
        console.error("Error deleting student:", error);
        showErrorMessage("حدث خطأ أثناء حذف الطالب", "خطأ");
      }
    }
  };

  // Handle form close
  const handleFormClose = () => {
    setIsFormVisible(false);
    setIsEditMode(false);
    setSelectedStudent(null);
  };

  // Handle form submit
  const handleFormSubmit = () => {
    fetchStudents();
    handleFormClose();
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedGender("all");
    setShowFilters(false);
  };

  return {
    // States
    students,
    processedStudents,
    isLoading,
    error,
    stats,
    // Filter states
    searchTerm,
    setSearchTerm,
    selectedGender,
    setSelectedGender,
    showFilters,
    setShowFilters,
    activeFiltersCount,
    // Form states
    isFormVisible,
    isEditMode,
    selectedStudent,
    // Handlers
    fetchStudents,
    handleAddStudent,
    handleEditStudent,
    handleDeleteStudent,
    handleFormClose,
    handleFormSubmit,
    resetFilters,
  };
};
