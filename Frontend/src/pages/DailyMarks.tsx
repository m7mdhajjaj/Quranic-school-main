import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DailyMarksSkeleton } from "../components/Loading/LoadingSkeleton";
import { getStudentsByTeacher } from "../Api/studentApi";
import { getTeacherById } from "../Api/teacherApi";
import {
  getAllSections,
  createSection,
  updateSection,
  deleteSection,
} from "../Api/sectionApi";
import { getStudentMarks, createMark } from "../Api/markApi";
import {
  showCenteredSwal,
  showSuccessMessage,
  showWarningMessage,
  showErrorMessage,
} from "../utils/sweetalertUtils";
import { useDailyMarksSocket } from "../Socket";

// Interface for Student data from backend
interface Student {
  _id: string;
  studentId: number;
  firstName: string;
  fatherName: string;
  lastName: string;
  group: string;
  teacher: string;
}

// Interface for Teacher data from backend
interface Teacher {
  _id: string;
  teacherId: number;
  firstName: string;
  lastName: string;
  groups: string[];
  role: string;
}

// Interface for logged-in user
interface LoggedInUser {
  _id: string;
  firstName: string;
  lastName?: string;
  fatherName?: string;
  group?: string;
  groups?: string[];
  role: string;
}

// Interface for Section data (assignments for all students)
interface Section {
  _id: string;
  date: string;
  memorizationSection: string;
  reviewSection: string;
  group?: string;
  teacher?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Interface for Mark data (individual student grades)
interface Mark {
  _id: string;
  studentId:
    | {
        _id: string;
        firstName: string;
        fatherName: string;
        lastName: string;
        group: string;
      }
    | string;
  sectionId:
    | {
        _id: string;
        date: string;
        memorizationSection: string;
        reviewSection: string;
      }
    | string;
  reviewMark: number | null;
  memorizationMark: number | null;
  createdAt?: string;
  updatedAt?: string;
}

const DailyMarks = () => {
  const navigate = useNavigate();

  // استخدام نظام Socket الجديد مع Heartbeat تلقائي كل 30 ثانية
  const {
    isConnected: socketConnected,
    lastUpdate: socketLastUpdate,
    socketId,
  } = useDailyMarksSocket();

  // State for students, sections, and marks
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [teacherGroups, setTeacherGroups] = useState<string[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);

  // State for UI
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null
  );
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
  const [isEditSectionModalOpen, setIsEditSectionModalOpen] = useState(false);
  const [isBulkUpdateModalOpen, setIsBulkUpdateModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isAddMarkModalOpen, setIsAddMarkModalOpen] = useState(false);
  const [isUpdateMarkModalOpen, setIsUpdateMarkModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [editingMark, setEditingMark] = useState<Mark | null>(null);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [selectedSectionsForBulk, setSelectedSectionsForBulk] = useState<
    string[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMarks, setLoadingMarks] = useState<boolean>(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1
  ); // Current month (1-12)
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  ); // Current year

  // 🔧 Developer Mode State (يتفعل بالضغط على d ثلاث مرات)
  const [developerMode, setDeveloperMode] = useState<boolean>(false);
  const [dKeyPressCount, setDKeyPressCount] = useState<number>(0);
  const [lastDKeyPress, setLastDKeyPress] = useState<number>(0);

  // Current logged-in user state
  const [currentUser, setCurrentUser] = useState<LoggedInUser | null>(null);

  // New section and mark state
  const [newSection, setNewSection] = useState<Omit<Section, "_id">>({
    date: new Date().toISOString().split("T")[0],
    memorizationSection: "",
    reviewSection: "",
  });

  const [newMark, setNewMark] = useState({
    reviewMark: 8,
    memorizationMark: 8,
  });

  // 🔧 Developer Mode: تفعيل وضع المطور بالضغط على d ثلاث مرات
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'd') {
        const now = Date.now();
        
        // إذا مرت أكثر من 2 ثانية، نعيد العداد
        if (now - lastDKeyPress > 2000) {
          setDKeyPressCount(1);
        } else {
          setDKeyPressCount(prev => prev + 1);
        }
        
        setLastDKeyPress(now);
        
        // إذا ضغط d ثلاث مرات خلال ثانيتين
        if (dKeyPressCount + 1 >= 3 && now - lastDKeyPress <= 2000) {
          setDeveloperMode(prev => !prev);
          setDKeyPressCount(0);
          
          // صوت تفعيل/إلغاء
          const audio = new Audio(developerMode ? '/sounds/error.wav' : '/sounds/successful.mp3');
          audio.volume = 0.3;
          audio.play().catch(() => {});
          
          console.log(developerMode ? '🔧 Developer Mode: OFF' : '🔧 Developer Mode: ON');
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [dKeyPressCount, lastDKeyPress, developerMode]);

  // Fetch current user and data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get current user from localStorage
        const userJson = localStorage.getItem("user");

        if (!userJson) {
          // If no user is logged in, redirect to login page
          navigate("/login");
          return;
        }

        const user = JSON.parse(userJson);
        setCurrentUser(user);

        // Fetch sections based on user role
        const sectionsData = await getAllSections();

        // If user is a student, filter sections by their group
        if (user.role === "student") {
          const userGroup = user.group;
          const filteredSections = Array.isArray(sectionsData)
            ? sectionsData.filter((s: any) => s.group === userGroup)
            : [];
          setSections(filteredSections);
          console.log(
            "Loaded sections for student's group:",
            userGroup,
            filteredSections
          );
        } else {
          // For teachers/admins, sections will be filtered later by selected group
          setSections(Array.isArray(sectionsData) ? sectionsData : []);
        }

        // If user is a teacher, fetch students by teacher name and teacher's groups
        if (user.role === "teacher" || user.role === "admin") {
          const teacherName = `${user.firstName} ${user.lastName}`;

          // Fetch teacher's full details to get groups
          const teacherResponse = await getTeacherById(user._id);
          if (teacherResponse.success && teacherResponse.data?.groups) {
            const groups = teacherResponse.data.groups.map((g) => g.name);
            setTeacherGroups(groups);
            console.log("Teacher groups:", groups);
          }

          // Fetch students
          const studentsResponse = await getStudentsByTeacher(teacherName);
          const students =
            studentsResponse.success && Array.isArray(studentsResponse.data)
              ? studentsResponse.data
              : [];
          setStudents(students);
          console.log("Loaded students:", students);
          // Don't set filteredStudents here, let the useEffect handle it
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Auto-select first group when teacher groups are loaded
  useEffect(() => {
    if (teacherGroups.length > 0 && !selectedGroup) {
      console.log("Auto-selecting first group:", teacherGroups[0]);
      setSelectedGroup(teacherGroups[0]);
    }
  }, [teacherGroups, selectedGroup]);

  // Filter students by selected group
  useEffect(() => {
    if (selectedGroup) {
      console.log("Filtering students for group:", selectedGroup);
      console.log("All students:", students);

      // Normalize strings for comparison (trim and compare)
      const normalizeString = (str: string | undefined | null) => {
        if (!str) return "";
        return str.trim().toLowerCase();
      };
      const normalizedSelectedGroup = normalizeString(selectedGroup);

      const filtered = students.filter(
        (s) => normalizeString(s.group) === normalizedSelectedGroup
      );

      console.log("Filtered students:", filtered);
      setFilteredStudents(filtered);
      // Reset selected student when group changes
      setSelectedStudentId(null);
    } else {
      setFilteredStudents([]);
    }
  }, [selectedGroup, students]);

  // Fetch sections for selected group (only for teachers/admins)
  useEffect(() => {
    const fetchSectionsForGroup = async () => {
      if (!selectedGroup || !currentUser) return;

      // Only fetch sections for teachers/admins, students already have their sections filtered
      if (currentUser.role !== "teacher" && currentUser.role !== "admin")
        return;

      try {
        const sectionsData = await getAllSections();

        // Filter sections by group - only show sections for the selected group
        const filteredSections = Array.isArray(sectionsData)
          ? sectionsData.filter((s: any) => s.group === selectedGroup)
          : [];

        setSections(filteredSections);
        console.log(
          "Loaded sections for group:",
          selectedGroup,
          filteredSections
        );
      } catch (err) {
        console.error("Error fetching sections for group:", err);
      }
    };

    fetchSectionsForGroup();
  }, [selectedGroup, currentUser]);

  // Fetch marks based on user role
  useEffect(() => {
    if (!currentUser) return;

    const fetchMarks = async () => {
      setLoadingMarks(true);
      try {
        if (currentUser.role === "student") {
          // For students, fetch only their marks
          const marksData = await getStudentMarks(currentUser._id);
          setMarks(Array.isArray(marksData) ? marksData : []);
        } else if (selectedStudentId) {
          // For teachers with selected student
          const marksData = await getStudentMarks(selectedStudentId);
          setMarks(Array.isArray(marksData) ? marksData : []);
        } else {
          // For teachers initially, don't fetch any marks until a student is selected
          setMarks([]);
        }
      } catch (err) {
        console.error("Error fetching marks:", err);
      } finally {
        setLoadingMarks(false);
      }
    };

    fetchMarks();
  }, [currentUser, selectedStudentId]);

  // إعادة جلب البيانات عند تحديث Socket
  useEffect(() => {
    if (!socketLastUpdate || !currentUser) return;

    console.log('🔄 Socket update detected in DailyMarks, refetching marks...');
    
    const refetchMarks = async () => {
      try {
        if (currentUser.role === "student") {
          const marksData = await getStudentMarks(currentUser._id);
          setMarks(Array.isArray(marksData) ? marksData : []);
        } else if (selectedStudentId) {
          const marksData = await getStudentMarks(selectedStudentId);
          setMarks(Array.isArray(marksData) ? marksData : []);
        }
      } catch (err) {
        console.error("Error refetching marks after socket update:", err);
      }
    };

    refetchMarks();
  }, [socketLastUpdate, currentUser, selectedStudentId]);

  // Open the add mark modal
  const openAddMarkModal = (section: Section) => {
    setSelectedSection(section);
    setNewMark({
      reviewMark: 8,
      memorizationMark: 8,
    });
    setIsAddMarkModalOpen(true);
  };

  // Open the update mark modal
  const openUpdateMarkModal = (mark: Mark, section: Section) => {
    setEditingMark(mark);
    setSelectedSection(section);
    setNewMark({
      reviewMark: mark.reviewMark || 8,
      memorizationMark: mark.memorizationMark || 8,
    });
    setIsUpdateMarkModalOpen(true);
  };

  // Handle adding new section
  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    //....
    // Validate that a group is selected
    if (!selectedGroup) {
      showWarningMessage("الرجاء اختيار حلقة أولاً", "تنبيه");
      return;
    }

    // Validate required fields
    if (!newSection.reviewSection || !newSection.memorizationSection) {
      showWarningMessage("الرجاء ملء جميع الحقول المطلوبة", "تنبيه");
      return;
    }

    console.log("📝 Current user:", currentUser);
    console.log("📝 Selected group:", selectedGroup);
    console.log("📝 New section data:", newSection);

    try {
      // Add group and teacher info to the section
      const sectionData = {
        date: newSection.date,
        reviewSection: newSection.reviewSection,
        memorizationSection: newSection.memorizationSection,
        group: selectedGroup,
        teacher: currentUser
          ? `${currentUser.firstName} ${currentUser.lastName}`
          : "",
      };

      console.log("📤 Sending section data:", sectionData);
      const createdSection = await createSection(sectionData);
      console.log("✅ Section created:", createdSection);

      if (createdSection) {
        setSections((prev) => [createdSection, ...prev]);
        setIsAddSectionModalOpen(false);

        // Reset form
        setNewSection({
          date: new Date().toISOString().split("T")[0],
          memorizationSection: "",
          reviewSection: "",
        });

        showSuccessMessage("تم إضافة المقطع بنجاح!", "نجاح");
      }
    } catch (err: any) {
      console.error("❌ Error adding section:", err);
      console.error("❌ Error response:", err.response?.data);
      showErrorMessage(
        `حدث خطأ أثناء إضافة المقطع: ${
          err.response?.data?.message || err.message
        }`,
        "خطأ"
      );
    }
  };

  // Handle adding new mark
  const handleAddMark = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStudentId || !selectedSection) return;

    try {
      const markData = {
        studentId: selectedStudentId,
        sectionId: selectedSection._id,
        reviewMark: newMark.reviewMark,
        memorizationMark: newMark.memorizationMark,
      };

      const createdMark = await createMark(markData as any);

      // Update marks array with new mark
      setMarks((prev) => [createdMark as any, ...prev]);
      setIsAddMarkModalOpen(false);
      
      // تشغيل صوت النجاح
      const audio = new Audio('/sounds/successful.mp3');
      audio.play().catch(err => console.log('Error playing sound:', err));
      
      // عرض رسالة نجاح مع toast
      const totalMark = (newMark.reviewMark || 0) + (newMark.memorizationMark || 0);
      showSuccessMessage(
        `تم رصد العلامة بنجاح!\nالعلامة: ${totalMark}/20`,
        "✅ تم الرصد",
        undefined,
        "top-end",
        true // toast mode
      );
    } catch (err) {
      console.error("Error adding mark:", err);
      
      // تشغيل صوت الخطأ
      const audio = new Audio('/sounds/error.wav');
      audio.play().catch(err => console.log('Error playing sound:', err));
      
      showErrorMessage("حدث خطأ أثناء إضافة العلامة", "❌ خطأ");
    }
  };

  // Handle updating existing mark
  const handleUpdateMark = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingMark || !selectedStudentId || !selectedSection) return;

    try {
      const markData = {
        studentId: selectedStudentId,
        sectionId: selectedSection._id,
        reviewMark: newMark.reviewMark,
        memorizationMark: newMark.memorizationMark,
      };

      const updatedMark = await createMark(markData as any);

      // Update marks array with updated mark
      setMarks((prev) =>
        prev.map((mark) =>
          mark._id === editingMark._id ? (updatedMark as any) : mark
        )
      );
      setIsUpdateMarkModalOpen(false);
      setEditingMark(null);
      
      // تشغيل صوت النجاح
      const audio = new Audio('/sounds/successful.mp3');
      audio.play().catch(err => console.log('Error playing sound:', err));
      
      // عرض رسالة نجاح مع toast
      const totalMark = (newMark.reviewMark || 0) + (newMark.memorizationMark || 0);
      showSuccessMessage(
        `تم تحديث العلامة بنجاح!\nالعلامة الجديدة: ${totalMark}/20`,
        "🔄 تم التحديث",
        undefined,
        "top-end",
        true // toast mode
      );
    } catch (err) {
      console.error("Error updating mark:", err);
      
      // تشغيل صوت الخطأ
      const audio = new Audio('/sounds/error.wav');
      audio.play().catch(err => console.log('Error playing sound:', err));
      
      showErrorMessage("حدث خطأ أثناء تحديث العلامة", "❌ خطأ");
    }
  };

  // Handle input changes for new section
  const handleSectionInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewSection((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle editing section
  const handleEditSection = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingSection) return;

    try {
      const updatedSectionData = await updateSection(editingSection._id, {
        date: editingSection.date,
        memorizationSection: editingSection.memorizationSection,
        reviewSection: editingSection.reviewSection,
      });

      // Update sections array with edited section
      setSections((prev) =>
        prev.map((section) =>
          section._id === editingSection._id ? updatedSectionData : section
        )
      );
      setIsEditSectionModalOpen(false);
      setEditingSection(null);
      showSuccessMessage("تم تحديث المقطع بنجاح!", "نجاح");
    } catch (err) {
      console.error("Error updating section:", err);
      showErrorMessage("حدث خطأ أثناء تحديث المقطع", "خطأ");
    }
  };

  // Handle deleting section
  const handleDeleteSection = async (sectionId: string) => {
    const result = await showCenteredSwal({
      title: "تأكيد الحذف",
      text: "هل أنت متأكد من حذف هذا المقطع؟ سيتم حذف جميع العلامات المرتبطة به.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await deleteSection(sectionId);

      // Remove section from sections array
      setSections((prev) =>
        prev.filter((section) => section._id !== sectionId)
      );

      // Remove related marks
      setMarks((prev) =>
        prev.filter((mark) => {
          if (typeof mark.sectionId === "string") {
            return mark.sectionId !== sectionId;
          } else {
            return mark.sectionId._id !== sectionId;
          }
        })
      );

      showSuccessMessage("تم حذف المقطع بنجاح!", "نجاح");
    } catch (err) {
      console.error("Error deleting section:", err);
      showErrorMessage("حدث خطأ أثناء حذف المقطع", "خطأ");
    }
  };

  // Open edit section modal
  const openEditSectionModal = (section: Section) => {
    setEditingSection({ ...section });
    setIsEditSectionModalOpen(true);
  };

  // Handle bulk update sections - opens modal to select sections
  const handleBulkUpdateSections = () => {
    setIsBulkUpdateModalOpen(true);
  };

  // Handle bulk delete sections - opens modal to select sections
  const handleBulkDeleteSections = () => {
    setIsBulkDeleteModalOpen(true);
  };

  // Handle bulk delete execution
  const executeBulkDelete = async () => {
    if (selectedSectionsForBulk.length === 0) {
      showWarningMessage("الرجاء اختيار مقطع واحد على الأقل للحذف", "تنبيه");
      return;
    }

    const result = await showCenteredSwal({
      title: "تأكيد الحذف الجماعي",
      text: `هل أنت متأكد من حذف ${selectedSectionsForBulk.length} مقطع؟ سيتم حذف جميع العلامات المرتبطة بهم.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، احذف الكل",
      cancelButtonText: "إلغاء",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      // Delete each selected section
      await Promise.all(
        selectedSectionsForBulk.map((sectionId) => deleteSection(sectionId))
      );

      // Remove sections from state
      setSections((prev) =>
        prev.filter((section) => !selectedSectionsForBulk.includes(section._id))
      );

      // Remove related marks
      setMarks((prev) =>
        prev.filter((mark) => {
          if (typeof mark.sectionId === "string") {
            return !selectedSectionsForBulk.includes(mark.sectionId);
          } else {
            return !selectedSectionsForBulk.includes(mark.sectionId._id);
          }
        })
      );

      setIsBulkDeleteModalOpen(false);
      setSelectedSectionsForBulk([]);
      showSuccessMessage("تم حذف المقاطع بنجاح!", "نجاح");
    } catch (err) {
      console.error("Error bulk deleting sections:", err);
      showErrorMessage("حدث خطأ أثناء حذف المقاطع", "خطأ");
    }
  };

  // Handle bulk update execution
  const executeBulkUpdate = async (updateData: {
    reviewSection?: string;
    memorizationSection?: string;
  }) => {
    if (selectedSectionsForBulk.length === 0) {
      showWarningMessage("الرجاء اختيار مقطع واحد على الأقل للتحديث", "تنبيه");
      return;
    }

    try {
      // Update each selected section
      const updatePromises = selectedSectionsForBulk.map(async (sectionId) => {
        const sectionToUpdate = sections.find((s) => s._id === sectionId);
        if (!sectionToUpdate) return null;

        const updatedData = {
          date: sectionToUpdate.date,
          reviewSection:
            updateData.reviewSection || sectionToUpdate.reviewSection,
          memorizationSection:
            updateData.memorizationSection ||
            sectionToUpdate.memorizationSection,
        };

        return updateSection(sectionId, updatedData);
      });

      const results = await Promise.all(updatePromises);

      // Update sections in state
      setSections((prev) =>
        prev.map((section) => {
          const result = results.find((r) => r?._id === section._id);
          return result ? result : section;
        })
      );

      setIsBulkUpdateModalOpen(false);
      setSelectedSectionsForBulk([]);
      showSuccessMessage("تم تحديث المقاطع بنجاح!", "نجاح");
    } catch (err) {
      console.error("Error bulk updating sections:", err);
      showErrorMessage("حدث خطأ أثناء تحديث المقاطع", "خطأ");
    }
  };

  // Toggle section selection for bulk operations
  const toggleSectionSelection = (sectionId: string) => {
    setSelectedSectionsForBulk((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Handle input changes for editing section
  const handleEditSectionInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditingSection((prev) =>
      prev
        ? {
            ...prev,
            [name]: value,
          }
        : null
    );
  };

  // Handle input changes for new mark
  const handleMarkInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewMark((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  // Filter sections by selected month and year
  const getFilteredSections = () => {
    return sections.filter((section) => {
      const sectionDate = new Date(section.date);
      const sectionMonth = sectionDate.getMonth() + 1; // getMonth() returns 0-11, so add 1
      const sectionYear = sectionDate.getFullYear();
      return sectionMonth === selectedMonth && sectionYear === selectedYear;
    });
  };

  // Handle month change
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(Number(e.target.value));
  };

  // Handle year change
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(Number(e.target.value));
  };

  // Get unique group names for the current teacher
  const getTeacherGroups = () => {
    // Use teacher's groups from database if available, otherwise fallback to student groups
    if (teacherGroups.length > 0) {
      return teacherGroups.sort();
    }
    const uniqueGroups = Array.from(new Set(students.map((s) => s.group)));
    return uniqueGroups.sort();
  };

  // Calculate averages for the selected month and year
  const calculateAverages = () => {
    const filteredSections = getFilteredSections();

    if (filteredSections.length === 0) {
      return {
        reviewAverage: 0,
        memorizationAverage: 0,
        overallAverage: 0,
        totalMarks: 0,
      };
    }

    // For students, use currentUser._id; for teachers, use selectedStudentId
    const targetStudentId =
      currentUser?.role === "student" ? currentUser._id : selectedStudentId;

    if (!targetStudentId) {
      return {
        reviewAverage: 0,
        memorizationAverage: 0,
        overallAverage: 0,
        totalMarks: 0,
      };
    }

    const relevantMarks = marks.filter((mark) => {
      const markSectionId =
        typeof mark.sectionId === "string"
          ? mark.sectionId
          : mark.sectionId._id;

      const markStudentId =
        typeof mark.studentId === "string"
          ? mark.studentId
          : mark.studentId._id;

      return (
        markStudentId === targetStudentId &&
        filteredSections.some((section) => section._id === markSectionId)
      );
    });

    if (relevantMarks.length === 0) {
      return {
        reviewAverage: 0,
        memorizationAverage: 0,
        overallAverage: 0,
        totalMarks: 0,
      };
    }

    const reviewMarks = relevantMarks
      .filter((mark) => mark.reviewMark !== null)
      .map((mark) => mark.reviewMark || 0);
    const memorizationMarks = relevantMarks
      .filter((mark) => mark.memorizationMark !== null)
      .map((mark) => mark.memorizationMark || 0);

    const reviewAverage =
      reviewMarks.length > 0
        ? reviewMarks.reduce((sum, mark) => sum + mark, 0) / reviewMarks.length
        : 0;
    const memorizationAverage =
      memorizationMarks.length > 0
        ? memorizationMarks.reduce((sum, mark) => sum + mark, 0) /
          memorizationMarks.length
        : 0;

    // Overall average out of 100 (combining both review and memorization)
    const overallAverage = ((reviewAverage + memorizationAverage) / 2) * 10; // Convert to percentage

    return {
      reviewAverage: Number(reviewAverage.toFixed(2)),
      memorizationAverage: Number(memorizationAverage.toFixed(2)),
      overallAverage: Number(overallAverage.toFixed(2)),
      totalMarks: relevantMarks.length,
    };
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4"
      dir="rtl">
      <div className="container mx-auto">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800">
              نظام العلامات اليومية
            </h1>
            
            {/* Socket Connection Indicator - يظهر فقط في وضع المطور */}
            {developerMode && (
              <div className="relative group">
                <div
                  className={`w-3 h-3 rounded-full ${
                    socketConnected ? "bg-green-500" : "bg-yellow-500"
                  } animate-pulse`}
                  title={socketConnected ? "متصل" : "غير متصل"}
                />
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  <div className="text-center">
                    <div className="font-semibold mb-1">
                      {socketConnected ? "✓ متصل بالسوكت" : "⚠ غير متصل"}
                    </div>
                    {socketId && (
                      <div className="text-gray-300 text-xs">ID: {socketId.substring(0, 8)}...</div>
                    )}
                    {socketLastUpdate && (
                      <div className="text-gray-300 text-xs mt-1">
                        آخر تحديث: {new Date(socketLastUpdate).toLocaleTimeString('ar-EG')}
                      </div>
                    )}
                    <div className="text-gray-400 text-xs mt-2 pt-2 border-t border-gray-700">
                      🔧 وضع المطور • اضغط d×3 للإلغاء
                    </div>
                  </div>
                  {/* Arrow */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
                </div>
              </div>
            )}
          </div>
          <div className="w-24 h-1 bg-emerald-600 mx-auto mb-6"></div>
          {currentUser && (
            <h2 className="text-xl text-gray-700">
              {currentUser.role === "student"
                ? `الطالب: ${currentUser.firstName} ${currentUser.fatherName} ${currentUser.lastName}`
                : `المعلم: ${currentUser.firstName} ${currentUser.lastName}`}
              {currentUser.role === "student" && (
                <span className="block text-sm text-gray-500 mt-1">
                  {currentUser.group}
                </span>
              )}
            </h2>
          )}
        </div>

        {/* Month and Year Filter */}
        <div className="mb-6 flex justify-center">
          <div className="bg-white rounded-xl shadow-md p-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
              فلترة العلامات حسب الشهر والسنة
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  اختر الشهر:
                </label>
                <select
                  value={selectedMonth}
                  onChange={handleMonthChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value={1}>يناير (1)</option>
                  <option value={2}>فبراير (2)</option>
                  <option value={3}>مارس (3)</option>
                  <option value={4}>أبريل (4)</option>
                  <option value={5}>مايو (5)</option>
                  <option value={6}>يونيو (6)</option>
                  <option value={7}>يوليو (7)</option>
                  <option value={8}>أغسطس (8)</option>
                  <option value={9}>سبتمبر (9)</option>
                  <option value={10}>أكتوبر (10)</option>
                  <option value={11}>نوفمبر (11)</option>
                  <option value={12}>ديسمبر (12)</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  اختر السنة:
                </label>
                <select
                  value={selectedYear}
                  onChange={handleYearChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value={2023}>2023</option>
                  <option value={2024}>2024</option>
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <DailyMarksSkeleton />
        ) : (
          <>
            {/* Teacher View */}
            {currentUser?.role !== "student" ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Student List Card */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden lg:col-span-1">
                  <div className="bg-gradient-to-r from-emerald-600 to-teal-500 py-4 px-6">
                    <h2 className="text-xl font-bold text-white">
                      قائمة الطلاب
                    </h2>
                  </div>

                  {/* Group Filter */}
                  <div className="p-4 border-b bg-gray-50">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      اختر الحلقة:
                    </label>
                    <select
                      value={selectedGroup}
                      onChange={(e) => setSelectedGroup(e.target.value)}
                      className="w-full shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500">
                      {getTeacherGroups().length === 0 ? (
                        <option value="">لا توجد حلقات</option>
                      ) : (
                        getTeacherGroups().map((groupName) => (
                          <option key={groupName} value={groupName}>
                            {groupName}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div className="p-4 max-h-80 overflow-y-auto">
                    {getTeacherGroups().length === 0 ? (
                      <p className="text-center text-gray-500 py-4">
                        لا توجد حلقات مسجلة لك
                      </p>
                    ) : filteredStudents.length === 0 ? (
                      <p className="text-center text-gray-500 py-4">
                        لا يوجد طلاب في حلقة {selectedGroup}
                      </p>
                    ) : (
                      <ul className="divide-y divide-gray-200">
                        {filteredStudents
                          .sort((a, b) =>
                            `${a.firstName} ${a.lastName}`.localeCompare(
                              `${b.firstName} ${b.lastName}`
                            )
                          )
                          .map((student) => (
                            <li key={student._id} className="py-3">
                              <button
                                onClick={() =>
                                  setSelectedStudentId(student._id)
                                }
                                className={`w-full text-right py-2 px-4 rounded-lg transition ${
                                  selectedStudentId === student._id
                                    ? "bg-emerald-100 text-emerald-800 font-bold"
                                    : "hover:bg-gray-100"
                                }`}>
                                <div className="flex flex-col">
                                  <span>
                                    {`${student.firstName} ${student.fatherName} ${student.lastName}`}
                                  </span>
                                  <span className="text-xs text-gray-500 mt-1">
                                    {student.group}
                                  </span>
                                </div>
                              </button>
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                  <div className="p-4 bg-gray-50 space-y-3">
                    <button
                      onClick={() => setIsAddSectionModalOpen(true)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition shadow-md flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 ml-2"
                        viewBox="0 0 20 20"
                        fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      إضافة مقطع للحلقة المختارة
                    </button>

                    <button
                      onClick={() => handleBulkUpdateSections()}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition shadow-md flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 ml-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      تحديث المقطع لجميع الطلاب
                    </button>

                    <button
                      onClick={() => handleBulkDeleteSections()}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition shadow-md flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 ml-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      حذف المقطع لجميع الطلاب
                    </button>
                  </div>
                </div>

                {/* Student Details and Marks */}
                <div className="lg:col-span-2">
                  {selectedStudentId ? (
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 py-4 px-6">
                        <h2 className="text-xl font-bold text-white">
                          علامات الطالب:{" "}
                          {students.find((s) => s._id === selectedStudentId)
                            ? `${
                                students.find(
                                  (s) => s._id === selectedStudentId
                                )?.firstName
                              } ${
                                students.find(
                                  (s) => s._id === selectedStudentId
                                )?.fatherName
                              } ${
                                students.find(
                                  (s) => s._id === selectedStudentId
                                )?.lastName
                              }`
                            : "غير معروف"}
                        </h2>
                        {students.find((s) => s._id === selectedStudentId) && (
                          <p className="text-white text-sm mt-1">
                            الحلقة:{" "}
                            {
                              students.find((s) => s._id === selectedStudentId)
                                ?.group
                            }
                          </p>
                        )}
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-100">
                            <tr className="text-right">
                              <th className="py-3 px-4 text-sm font-medium text-gray-600">
                                التاريخ
                              </th>
                              <th className="py-3 px-4 text-sm font-medium text-gray-600">
                                مقطع المراجعة
                              </th>
                              <th className="py-3 px-4 text-sm font-medium text-gray-600">
                                علامة المراجعة
                              </th>
                              <th className="py-3 px-4 text-sm font-medium text-gray-600">
                                مقطع الحفظ
                              </th>
                              <th className="py-3 px-4 text-sm font-medium text-gray-600">
                                علامة الحفظ
                              </th>
                              <th className="py-3 px-4 text-sm font-medium text-gray-600">
                                الإجراءات
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {loadingMarks ? (
                              <tr>
                                <td
                                  colSpan={5}
                                  className="py-4 px-4 text-center">
                                  <p className="text-sm text-gray-500">
                                    جاري تحميل العلامات...
                                  </p>
                                </td>
                              </tr>
                            ) : sections.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={6}
                                  className="py-8 text-center text-gray-500">
                                  لا توجد مقاطع مضافة بعد
                                </td>
                              </tr>
                            ) : getFilteredSections().length === 0 ? (
                              <tr>
                                <td
                                  colSpan={6}
                                  className="py-8 text-center text-gray-500">
                                  لا توجد مقاطع في الشهر والسنة المحددة
                                </td>
                              </tr>
                            ) : (
                              getFilteredSections().map((section) => {
                                const mark = marks.find((m) => {
                                  const markStudentId =
                                    typeof m.studentId === "string"
                                      ? m.studentId
                                      : m.studentId._id;

                                  if (typeof m.sectionId === "string") {
                                    return (
                                      markStudentId === selectedStudentId &&
                                      m.sectionId === section._id
                                    );
                                  } else {
                                    return (
                                      markStudentId === selectedStudentId &&
                                      m.sectionId._id === section._id
                                    );
                                  }
                                });

                                return (
                                  <tr
                                    key={section._id}
                                    className="hover:bg-gray-50">
                                    <td className="py-4 px-4 text-sm text-gray-700">
                                      {new Date(
                                        section.date
                                      ).toLocaleDateString("en-GB", {
                                        year: "numeric",
                                        month: "2-digit",
                                        day: "2-digit",
                                      })}
                                    </td>
                                    <td className="py-4 px-4 text-sm text-gray-700">
                                      <span>{section.reviewSection}</span>
                                    </td>
                                    <td className="py-4 px-4">
                                      {mark ? (
                                        <div className="flex items-center">
                                          <span
                                            className={`font-semibold ${
                                              (mark.reviewMark || 0) >= 9
                                                ? "text-emerald-600"
                                                : (mark.reviewMark || 0) >= 7
                                                ? "text-amber-600"
                                                : "text-red-600"
                                            }`}>
                                            {mark.reviewMark}/10
                                          </span>
                                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
                                            <div
                                              className={`h-full ${
                                                (mark.reviewMark || 0) >= 9
                                                  ? "bg-emerald-500"
                                                  : (mark.reviewMark || 0) >= 7
                                                  ? "bg-amber-500"
                                                  : "bg-red-500"
                                              }`}
                                              style={{
                                                width: `${
                                                  (mark.reviewMark || 0) * 10
                                                }%`,
                                              }}></div>
                                          </div>
                                        </div>
                                      ) : (
                                        <span className="text-gray-400">-</span>
                                      )}
                                    </td>
                                    <td className="py-4 px-4 text-sm text-gray-700">
                                      <span>{section.memorizationSection}</span>
                                    </td>
                                    <td className="py-4 px-4">
                                      {mark ? (
                                        <div className="flex items-center">
                                          <span
                                            className={`font-semibold ${
                                              (mark.memorizationMark || 0) >= 9
                                                ? "text-emerald-600"
                                                : (mark.memorizationMark ||
                                                    0) >= 7
                                                ? "text-amber-600"
                                                : "text-red-600"
                                            }`}>
                                            {mark.memorizationMark}/10
                                          </span>
                                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
                                            <div
                                              className={`h-full ${
                                                (mark.memorizationMark || 0) >=
                                                9
                                                  ? "bg-emerald-500"
                                                  : (mark.memorizationMark ||
                                                      0) >= 7
                                                  ? "bg-amber-500"
                                                  : "bg-red-500"
                                              }`}
                                              style={{
                                                width: `${
                                                  (mark.memorizationMark || 0) *
                                                  10
                                                }%`,
                                              }}></div>
                                          </div>
                                        </div>
                                      ) : (
                                        <span className="text-gray-400">-</span>
                                      )}
                                    </td>
                                    <td className="py-4 px-4">
                                      <div className="flex items-center space-x-2">
                                        {mark ? (
                                          <button
                                            onClick={() =>
                                              openUpdateMarkModal(mark, section)
                                            }
                                            className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg text-sm font-medium transition"
                                            title="تحديث العلامة">
                                            تحديث العلامة
                                          </button>
                                        ) : (
                                          <button
                                            onClick={() =>
                                              openAddMarkModal(section)
                                            }
                                            className="text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-lg text-sm font-medium transition"
                                            title="إضافة علامة">
                                            إضافة علامة
                                          </button>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Averages Section for Teacher View */}
                      {selectedStudentId &&
                        getFilteredSections().length > 0 && (
                          <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-t">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
                              معدلات الشهر المحدد
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Review Average */}
                              <div className="bg-white rounded-lg p-4 shadow-sm border-r-4 border-emerald-500">
                                <h4 className="text-sm font-semibold text-gray-600 mb-1">
                                  معدل المراجعة
                                </h4>
                                <div className="text-2xl font-bold text-emerald-600">
                                  {calculateAverages().reviewAverage}/10
                                </div>
                                <div className="text-xs text-gray-500">
                                  من {calculateAverages().totalMarks} علامة
                                </div>
                              </div>

                              {/* Memorization Average */}
                              <div className="bg-white rounded-lg p-4 shadow-sm border-r-4 border-amber-500">
                                <h4 className="text-sm font-semibold text-gray-600 mb-1">
                                  معدل الحفظ
                                </h4>
                                <div className="text-2xl font-bold text-amber-600">
                                  {calculateAverages().memorizationAverage}/10
                                </div>
                                <div className="text-xs text-gray-500">
                                  من {calculateAverages().totalMarks} علامة
                                </div>
                              </div>

                              {/* Overall Average */}
                              <div className="bg-white rounded-lg p-4 shadow-sm border-r-4 border-blue-500">
                                <h4 className="text-sm font-semibold text-gray-600 mb-1">
                                  المعدل الإجمالي
                                </h4>
                                <div className="text-2xl font-bold text-blue-600">
                                  {calculateAverages().overallAverage}/100
                                </div>
                                <div className="text-xs text-gray-500">
                                  الحفظ + المراجعة
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl shadow-md p-8 text-center flex flex-col items-center justify-center h-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-16 w-16 text-gray-300 mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      <h3 className="text-xl font-bold text-gray-500 mb-2">
                        الرجاء اختيار طالب
                      </h3>
                      <p className="text-gray-400">
                        اختر طالباً من القائمة لعرض علاماته
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Student View */
              <div className="grid grid-cols-1 gap-6">
                {/* Student Marks */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-600 to-teal-500 py-4 px-6 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">علاماتي</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr className="text-right">
                          <th className="py-3 px-4 text-sm font-medium text-gray-600">
                            التاريخ
                          </th>
                          <th className="py-3 px-4 text-sm font-medium text-gray-600">
                            مقطع المراجعة
                          </th>
                          <th className="py-3 px-4 text-sm font-medium text-gray-600">
                            علامة المراجعة
                          </th>
                          <th className="py-3 px-4 text-sm font-medium text-gray-600">
                            مقطع الحفظ
                          </th>
                          <th className="py-3 px-4 text-sm font-medium text-gray-600">
                            علامة الحفظ
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {loadingMarks ? (
                          <tr>
                            <td colSpan={5} className="py-4 px-4 text-center">
                              <p className="text-sm text-gray-500">
                                جاري تحميل العلامات...
                              </p>
                            </td>
                          </tr>
                        ) : sections.length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="py-8 text-center text-gray-500">
                              لا توجد مقاطع مضافة بعد
                            </td>
                          </tr>
                        ) : getFilteredSections().length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="py-8 text-center text-gray-500">
                              لا توجد مقاطع في الشهر والسنة المحددة
                            </td>
                          </tr>
                        ) : (
                          getFilteredSections().map((section) => {
                            const mark = marks.find((m) => {
                              if (typeof m.sectionId === "string") {
                                return m.sectionId === section._id;
                              } else {
                                return m.sectionId._id === section._id;
                              }
                            });

                            return (
                              <tr
                                key={section._id}
                                className="hover:bg-gray-50">
                                <td className="py-4 px-4 text-sm text-gray-700">
                                  {new Date(section.date).toLocaleDateString(
                                    "en-GB",
                                    {
                                      year: "numeric",
                                      month: "2-digit",
                                      day: "2-digit",
                                    }
                                  )}
                                </td>
                                <td className="py-4 px-4 text-sm text-gray-700">
                                  <div className="flex items-center">
                                    <span>{section.reviewSection}</span>
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  {mark ? (
                                    <div className="flex items-center">
                                      <span
                                        className={`font-semibold ${
                                          (mark.reviewMark || 0) >= 9
                                            ? "text-emerald-600"
                                            : (mark.reviewMark || 0) >= 7
                                            ? "text-amber-600"
                                            : "text-red-600"
                                        }`}>
                                        {mark.reviewMark}/10
                                      </span>
                                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
                                        <div
                                          className={`h-full ${
                                            (mark.reviewMark || 0) >= 9
                                              ? "bg-emerald-500"
                                              : (mark.reviewMark || 0) >= 7
                                              ? "bg-amber-500"
                                              : "bg-red-500"
                                          }`}
                                          style={{
                                            width: `${
                                              (mark.reviewMark || 0) * 10
                                            }%`,
                                          }}></div>
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                                <td className="py-4 px-4 text-sm text-gray-700">
                                  <div className="flex items-center">
                                    <span>{section.memorizationSection}</span>
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  {mark ? (
                                    <div className="flex items-center">
                                      <span
                                        className={`font-semibold ${
                                          (mark.memorizationMark || 0) >= 9
                                            ? "text-emerald-600"
                                            : (mark.memorizationMark || 0) >= 7
                                            ? "text-amber-600"
                                            : "text-red-600"
                                        }`}>
                                        {mark.memorizationMark}/10
                                      </span>
                                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
                                        <div
                                          className={`h-full ${
                                            (mark.memorizationMark || 0) >= 9
                                              ? "bg-emerald-500"
                                              : (mark.memorizationMark || 0) >=
                                                7
                                              ? "bg-amber-500"
                                              : "bg-red-500"
                                          }`}
                                          style={{
                                            width: `${
                                              (mark.memorizationMark || 0) * 10
                                            }%`,
                                          }}></div>
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Averages Section for Student View */}
                  {getFilteredSections().length > 0 && (
                    <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-t">
                      <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
                        معدلاتي للشهر المحدد
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Review Average */}
                        <div className="bg-white rounded-lg p-4 shadow-sm border-r-4 border-emerald-500">
                          <h4 className="text-sm font-semibold text-gray-600 mb-1">
                            معدل المراجعة
                          </h4>
                          <div className="text-2xl font-bold text-emerald-600">
                            {calculateAverages().reviewAverage}/10
                          </div>
                          <div className="text-xs text-gray-500">
                            من {calculateAverages().totalMarks} علامة
                          </div>
                        </div>

                        {/* Memorization Average */}
                        <div className="bg-white rounded-lg p-4 shadow-sm border-r-4 border-amber-500">
                          <h4 className="text-sm font-semibold text-gray-600 mb-1">
                            معدل الحفظ
                          </h4>
                          <div className="text-2xl font-bold text-amber-600">
                            {calculateAverages().memorizationAverage}/10
                          </div>
                          <div className="text-xs text-gray-500">
                            من {calculateAverages().totalMarks} علامة
                          </div>
                        </div>

                        {/* Overall Average */}
                        <div className="bg-white rounded-lg p-4 shadow-sm border-r-4 border-blue-500">
                          <h4 className="text-sm font-semibold text-gray-600 mb-1">
                            المعدل الإجمالي
                          </h4>
                          <div className="text-2xl font-bold text-blue-600">
                            {calculateAverages().overallAverage}/100
                          </div>
                          <div className="text-xs text-gray-500">
                            الحفظ + المراجعة
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Section Modal - Only for teachers */}
      {isAddSectionModalOpen && currentUser?.role !== "student" && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn">
            {/* Gradient Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    إضافة مقطع جديد
                  </h3>
                </div>
                <button
                  onClick={() => setIsAddSectionModalOpen(false)}
                  className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <p className="text-white/90 text-sm mt-2">
                الحلقة: {selectedGroup}
              </p>
            </div>

            <form onSubmit={handleAddSection} className="p-6">
              {/* Date Field */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-gray-700 text-sm font-bold mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  التاريخ
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={newSection.date}
                  onChange={handleSectionInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition duration-200 outline-none"
                  required
                />
              </div>

              {/* Review Section */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-emerald-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  <h4 className="text-md font-bold text-emerald-700">
                    معلومات المراجعة
                  </h4>
                </div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  مقطع المراجعة
                </label>
                <input
                  type="text"
                  id="reviewSection"
                  name="reviewSection"
                  placeholder="مثال: البقرة (1-10)"
                  value={newSection.reviewSection}
                  onChange={handleSectionInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition duration-200 outline-none"
                  required
                />
              </div>

              {/* Memorization Section */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-amber-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-amber-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h4 className="text-md font-bold text-amber-600">
                    معلومات الحفظ
                  </h4>
                </div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  مقطع الحفظ
                </label>
                <input
                  type="text"
                  id="memorizationSection"
                  name="memorizationSection"
                  placeholder="مثال: البقرة (11-15)"
                  value={newSection.memorizationSection}
                  onChange={handleSectionInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition duration-200 outline-none"
                  required
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setIsAddSectionModalOpen(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition duration-200 border-2 border-gray-200">
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium py-3 px-8 rounded-xl transition duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]">
                  إضافة المقطع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Section Modal - Only for teachers */}
      {isEditSectionModalOpen &&
        editingSection &&
        currentUser?.role !== "student" && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn">
              {/* Gradient Header */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      تعديل المقطع
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setIsEditSectionModalOpen(false);
                      setEditingSection(null);
                    }}
                    className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <form onSubmit={handleEditSection} className="p-6">
                {/* Date Field */}
                <div className="mb-6">
                  <label className="flex items-center gap-2 text-gray-700 text-sm font-bold mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    التاريخ
                  </label>
                  <input
                    type="date"
                    id="edit-date"
                    name="date"
                    value={editingSection.date}
                    onChange={handleEditSectionInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition duration-200 outline-none"
                    required
                  />
                </div>

                {/* Review Section */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-emerald-200">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-emerald-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                    <h4 className="text-md font-bold text-emerald-700">
                      معلومات المراجعة
                    </h4>
                  </div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    مقطع المراجعة
                  </label>
                  <input
                    type="text"
                    id="edit-reviewSection"
                    name="reviewSection"
                    placeholder="مثال: البقرة (1-10)"
                    value={editingSection.reviewSection}
                    onChange={handleEditSectionInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition duration-200 outline-none"
                    required
                  />
                </div>

                {/* Memorization Section */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-amber-200">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-amber-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <h4 className="text-md font-bold text-amber-600">
                      معلومات الحفظ
                    </h4>
                  </div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    مقطع الحفظ
                  </label>
                  <input
                    type="text"
                    id="edit-memorizationSection"
                    name="memorizationSection"
                    placeholder="مثال: البقرة (11-15)"
                    value={editingSection.memorizationSection}
                    onChange={handleEditSectionInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition duration-200 outline-none"
                    required
                  />
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditSectionModalOpen(false);
                      setEditingSection(null);
                    }}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition duration-200 border-2 border-gray-200">
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-3 px-8 rounded-xl transition duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]">
                    حفظ التعديل
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      {/* Add Mark Modal - Only for teachers */}
      {isAddMarkModalOpen &&
        selectedSection &&
        currentUser?.role !== "student" && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  إضافة علامة للطالب:{" "}
                  {students.find((s) => s._id === selectedStudentId)
                    ? `${
                        students.find((s) => s._id === selectedStudentId)
                          ?.firstName
                      } ${
                        students.find((s) => s._id === selectedStudentId)
                          ?.lastName
                      }`
                    : "غير معروف"}
                </h3>
                <button
                  onClick={() => setIsAddMarkModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleAddMark}>
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h4 className="font-bold text-gray-700 mb-2">
                    معلومات المقطع:
                  </h4>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold">التاريخ:</span>{" "}
                    {new Date(selectedSection.date).toLocaleDateString(
                      "en-GB",
                      {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      }
                    )}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold">مقطع المراجعة:</span>{" "}
                    {selectedSection.reviewSection}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">مقطع الحفظ:</span>{" "}
                    {selectedSection.memorizationSection}
                  </p>
                </div>

                {/* Review Mark Input */}
                <div className="mb-6">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="reviewMark">
                    علامة المراجعة (6-10)
                  </label>
                  <div className="flex items-center mb-2">
                    <input
                      type="range"
                      id="reviewMark"
                      name="reviewMark"
                      min="6"
                      max="10"
                      step="0.5"
                      value={newMark.reviewMark}
                      onChange={handleMarkInputChange}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                    <span className="mr-2 font-bold text-emerald-700 min-w-[50px] text-center">
                      {newMark.reviewMark}/10
                    </span>
                  </div>

                  <div
                    className={`h-1.5 w-full rounded-full mt-2 ${
                      newMark.reviewMark >= 9
                        ? "bg-emerald-500"
                        : newMark.reviewMark >= 7
                        ? "bg-amber-500"
                        : "bg-red-500"
                    }`}></div>
                </div>

                {/* Memorization Mark Input */}
                <div className="mb-6">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="memorizationMark">
                    علامة الحفظ (6-10)
                  </label>
                  <div className="flex items-center mb-2">
                    <input
                      type="range"
                      id="memorizationMark"
                      name="memorizationMark"
                      min="6"
                      max="10"
                      step="0.5"
                      value={newMark.memorizationMark}
                      onChange={handleMarkInputChange}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                    <span className="mr-2 font-bold text-emerald-700 min-w-[50px] text-center">
                      {newMark.memorizationMark}/10
                    </span>
                  </div>

                  <div
                    className={`h-1.5 w-full rounded-full mt-2 ${
                      newMark.memorizationMark >= 9
                        ? "bg-emerald-500"
                        : newMark.memorizationMark >= 7
                        ? "bg-amber-500"
                        : "bg-red-500"
                    }`}></div>
                </div>

                {/* Action buttons */}
                <div className="flex justify-between mt-8">
                  <button
                    type="button"
                    onClick={() => setIsAddMarkModalOpen(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-6 rounded-lg transition">
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-8 rounded-lg transition shadow-md">
                    إضافة العلامات
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      {/* Update Mark Modal - Only for teachers */}
      {isUpdateMarkModalOpen &&
        selectedSection &&
        editingMark &&
        currentUser?.role !== "student" && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  تحديث علامة الطالب:{" "}
                  {students.find((s) => s._id === selectedStudentId)
                    ? `${
                        students.find((s) => s._id === selectedStudentId)
                          ?.firstName
                      } ${
                        students.find((s) => s._id === selectedStudentId)
                          ?.lastName
                      }`
                    : "غير معروف"}
                </h3>
                <button
                  onClick={() => {
                    setIsUpdateMarkModalOpen(false);
                    setEditingMark(null);
                  }}
                  className="text-gray-500 hover:text-gray-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleUpdateMark}>
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h4 className="font-bold text-gray-700 mb-2">
                    معلومات المقطع:
                  </h4>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold">التاريخ:</span>{" "}
                    {new Date(selectedSection.date).toLocaleDateString(
                      "en-GB",
                      {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      }
                    )}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold">مقطع المراجعة:</span>{" "}
                    {selectedSection.reviewSection}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">مقطع الحفظ:</span>{" "}
                    {selectedSection.memorizationSection}
                  </p>
                </div>

                {/* Review Mark Input */}
                <div className="mb-6">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="updateReviewMark">
                    علامة المراجعة (6-10)
                  </label>
                  <div className="flex items-center mb-2">
                    <input
                      type="range"
                      id="updateReviewMark"
                      name="reviewMark"
                      min="6"
                      max="10"
                      step="0.5"
                      value={newMark.reviewMark}
                      onChange={handleMarkInputChange}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <span className="mr-2 font-bold text-blue-700 min-w-[50px] text-center">
                      {newMark.reviewMark}/10
                    </span>
                  </div>

                  <div
                    className={`h-1.5 w-full rounded-full mt-2 ${
                      newMark.reviewMark >= 9
                        ? "bg-emerald-500"
                        : newMark.reviewMark >= 7
                        ? "bg-amber-500"
                        : "bg-red-500"
                    }`}></div>
                </div>

                {/* Memorization Mark Input */}
                <div className="mb-6">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="updateMemorizationMark">
                    علامة الحفظ (6-10)
                  </label>
                  <div className="flex items-center mb-2">
                    <input
                      type="range"
                      id="updateMemorizationMark"
                      name="memorizationMark"
                      min="6"
                      max="10"
                      step="0.5"
                      value={newMark.memorizationMark}
                      onChange={handleMarkInputChange}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <span className="mr-2 font-bold text-blue-700 min-w-[50px] text-center">
                      {newMark.memorizationMark}/10
                    </span>
                  </div>

                  <div
                    className={`h-1.5 w-full rounded-full mt-2 ${
                      newMark.memorizationMark >= 9
                        ? "bg-emerald-500"
                        : newMark.memorizationMark >= 7
                        ? "bg-amber-500"
                        : "bg-red-500"
                    }`}></div>
                </div>

                {/* Action buttons */}
                <div className="flex justify-between mt-8">
                  <button
                    type="button"
                    onClick={() => {
                      setIsUpdateMarkModalOpen(false);
                      setEditingMark(null);
                    }}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-6 rounded-lg transition">
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-8 rounded-lg transition shadow-md">
                    تحديث العلامات
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      {/* Bulk Update Modal */}
      {isBulkUpdateModalOpen && currentUser?.role !== "student" && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fadeIn">
            {/* Gradient Header */}
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    تحديث المقاطع لجميع الطلاب
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setIsBulkUpdateModalOpen(false);
                    setSelectedSectionsForBulk([]);
                  }}
                  className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const updateData = {
                  reviewSection:
                    (formData.get("reviewSection") as string) || undefined,
                  memorizationSection:
                    (formData.get("memorizationSection") as string) ||
                    undefined,
                };
                executeBulkUpdate(updateData);
              }}
              className="p-6">
              {/* Section Selection */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <h4 className="text-md font-bold text-gray-700">
                    اختر المقاطع المراد تحديثها:
                  </h4>
                </div>
                <div className="max-h-60 overflow-y-auto border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
                  {getFilteredSections().map((section) => (
                    <label
                      key={section._id}
                      className="flex items-center mb-3 p-3 bg-white rounded-lg cursor-pointer hover:bg-purple-50 transition border border-gray-100">
                      <input
                        type="checkbox"
                        checked={selectedSectionsForBulk.includes(section._id)}
                        onChange={() => toggleSectionSelection(section._id)}
                        className="ml-3 w-4 h-4 accent-purple-600"
                      />
                      <span className="text-sm text-gray-700">
                        {new Date(section.date).toLocaleDateString("en-GB")} -
                        مراجعة: {section.reviewSection} - حفظ:{" "}
                        {section.memorizationSection}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Update Fields */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-emerald-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  <h4 className="text-md font-bold text-emerald-700">
                    معلومات المراجعة
                  </h4>
                </div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  مقطع المراجعة الجديد (اتركه فارغاً للاحتفاظ بالقيمة الحالية)
                </label>
                <input
                  type="text"
                  name="reviewSection"
                  placeholder="مثال: البقرة (1-10)"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition duration-200 outline-none"
                />
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-amber-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-amber-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h4 className="text-md font-bold text-amber-600">
                    معلومات الحفظ
                  </h4>
                </div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  مقطع الحفظ الجديد (اتركه فارغاً للاحتفاظ بالقيمة الحالية)
                </label>
                <input
                  type="text"
                  name="memorizationSection"
                  placeholder="مثال: البقرة (11-15)"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition duration-200 outline-none"
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setIsBulkUpdateModalOpen(false);
                    setSelectedSectionsForBulk([]);
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition duration-200 border-2 border-gray-200">
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-medium py-3 px-8 rounded-xl transition duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]">
                  تحديث المقاطع المحددة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Delete Modal */}
      {isBulkDeleteModalOpen && currentUser?.role !== "student" && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fadeIn">
            {/* Gradient Header */}
            <div className="bg-gradient-to-r from-red-500 to-rose-600 p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    حذف المقاطع لجميع الطلاب
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setIsBulkDeleteModalOpen(false);
                    setSelectedSectionsForBulk([]);
                  }}
                  className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Section Selection */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <h4 className="text-md font-bold text-gray-700">
                    اختر المقاطع المراد حذفها:
                  </h4>
                </div>
                <div className="max-h-60 overflow-y-auto border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
                  {getFilteredSections().map((section) => (
                    <label
                      key={section._id}
                      className="flex items-center mb-3 p-3 bg-white rounded-lg cursor-pointer hover:bg-red-50 transition border border-gray-100">
                      <input
                        type="checkbox"
                        checked={selectedSectionsForBulk.includes(section._id)}
                        onChange={() => toggleSectionSelection(section._id)}
                        className="ml-3 w-4 h-4 accent-red-600"
                      />
                      <span className="text-sm text-gray-700">
                        {new Date(section.date).toLocaleDateString("en-GB")} -
                        مراجعة: {section.reviewSection} - حفظ:{" "}
                        {section.memorizationSection}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-xl p-5 mb-6">
                <div className="flex items-start gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <div>
                    <p className="text-red-800 font-bold mb-1">تحذير هام!</p>
                    <p className="text-red-700 text-sm">
                      سيتم حذف جميع العلامات المرتبطة بالمقاطع المحددة نهائياً.
                      هذا الإجراء لا يمكن التراجع عنه.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setIsBulkDeleteModalOpen(false);
                    setSelectedSectionsForBulk([]);
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition duration-200 border-2 border-gray-200">
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={executeBulkDelete}
                  className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-medium py-3 px-8 rounded-xl transition duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]">
                  حذف المقاطع المحددة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyMarks;
