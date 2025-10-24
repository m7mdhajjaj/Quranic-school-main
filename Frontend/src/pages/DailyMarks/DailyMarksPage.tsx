import { useState, useEffect } from "react";
import DailyMarksSkeleton from "../../components/shared/Skeleton/DailyMarksSkeleton";
import { createSection, updateSection, deleteSection } from "../../Api/sectionApi";
import { createMark } from "../../Api/dailyMarksApi";
import {
  showCenteredSwal,
  showWarningMessage,
} from "../../components/sweetalertUtils";
import {
  showSuccessToast,
  showErrorToast,
} from "../../components/toastUtils";
import { useDailyMarksSocket } from "../../Socket";

// Import refactored components and hooks
import type { Section, Mark, Student } from "./types/dailyMarks";
import { useDailyMarksData } from "./hooks/useDailyMarksData";
import { useSectionsFilter } from "./hooks/useSectionsFilter";
import { MonthYearFilter } from "./components/MonthYearFilter";
import { TeacherView } from "./TeacherView";
import { StudentView } from "./StudentView";
import { AddSectionModal } from "./modals/AddSectionModal";
import { EditSectionModal } from "./modals/EditSectionModal";
import { AddMarkModal } from "./modals/AddMarkModal";
import { UpdateMarkModal } from "./modals/UpdateMarkModal";
import { BulkUpdateModal } from "./modals/BulkUpdateModal";
import { BulkDeleteModal } from "./modals/BulkDeleteModal";

const DailyMarksPage = () => {
  // Socket Connection Hook
  const { lastUpdate: socketLastUpdate } = useDailyMarksSocket();

  // State for selected student and group
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);

  // Data Hook
  const {
    currentUser,
    students,
    sections,
    marks,
    teacherGroups,
    loading,
    loadingMarks,
    setMarks,
    setSections,
    refetchMarks,
  } = useDailyMarksData(selectedStudentId, selectedGroup);

  // Sections Filter Hook
  const {
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
    getFilteredSections,
    calculateAverages,
  } = useSectionsFilter(sections);

  // Modal States
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
  const [isEditSectionModalOpen, setIsEditSectionModalOpen] = useState(false);
  const [isBulkUpdateModalOpen, setIsBulkUpdateModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isAddMarkModalOpen, setIsAddMarkModalOpen] = useState(false);
  const [isUpdateMarkModalOpen, setIsUpdateMarkModalOpen] = useState(false);

  // Selected Data States
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [editingMark, setEditingMark] = useState<Mark | null>(null);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [selectedSectionsForBulk, setSelectedSectionsForBulk] = useState<string[]>([]);

  // Form States
  const [newSection, setNewSection] = useState<Omit<Section, "_id">>({
    date: new Date().toISOString().split("T")[0],
    memorizationSection: "",
    reviewSection: "",
  });

  const [newMark, setNewMark] = useState({
    reviewMark: 8,
    memorizationMark: 8,
  });

  // Auto-select first group when teacher groups are loaded
  useEffect(() => {
    if (teacherGroups.length > 0 && !selectedGroup) {
      setSelectedGroup(teacherGroups[0]);
    }
  }, [teacherGroups, selectedGroup]);

  // Filter students by selected group
  useEffect(() => {
    if (selectedGroup) {
      const normalizeString = (str: string | undefined | null) => {
        if (!str) return "";
        return str.trim().toLowerCase();
      };
      const normalizedSelectedGroup = normalizeString(selectedGroup);

      const filtered = students.filter(
        (s) => normalizeString(s.group) === normalizedSelectedGroup
      );

      setFilteredStudents(filtered);
      setSelectedStudentId(null);
    } else {
      setFilteredStudents([]);
    }
  }, [selectedGroup, students]);

  // Refetch marks when socket updates
  useEffect(() => {
    if (!socketLastUpdate || !currentUser) return;
    refetchMarks(selectedStudentId || undefined);
  }, [socketLastUpdate, currentUser, selectedStudentId, refetchMarks]);

  // Handler: Add Section
  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedGroup) {
      showWarningMessage("الرجاء اختيار حلقة أولاً", "تنبيه");
      return;
    }

    if (!newSection.reviewSection || !newSection.memorizationSection) {
      showWarningMessage("الرجاء ملء جميع الحقول المطلوبة", "تنبيه");
      return;
    }

    try {
      const sectionData = {
        date: newSection.date,
        reviewSection: newSection.reviewSection,
        memorizationSection: newSection.memorizationSection,
        group: selectedGroup,
        teacher: currentUser
          ? `${currentUser.firstName} ${currentUser.lastName}`
          : "",
      };

      const createdSection = await createSection(sectionData);

      if (createdSection) {
        setSections((prev) => [createdSection, ...prev]);
        setIsAddSectionModalOpen(false);

        setNewSection({
          date: new Date().toISOString().split("T")[0],
          memorizationSection: "",
          reviewSection: "",
        });

        showSuccessToast("✅ تم إضافة المقطع بنجاح!");
      }
    } catch (err: unknown) {
      console.error("Error adding section:", err);
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      showErrorToast(
        `❌ حدث خطأ أثناء إضافة المقطع: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  // Handler: Edit Section
  const handleEditSection = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingSection) return;

    try {
      const updatedSectionData = await updateSection(editingSection._id, {
        date: editingSection.date,
        memorizationSection: editingSection.memorizationSection,
        reviewSection: editingSection.reviewSection,
      });

      setSections((prev) =>
        prev.map((section) =>
          section._id === editingSection._id ? updatedSectionData : section
        ).filter((s): s is Section => s !== null)
      );
      setIsEditSectionModalOpen(false);
      setEditingSection(null);
      showSuccessToast("✅ تم تحديث المقطع بنجاح!");
    } catch (err) {
      console.error("Error updating section:", err);
      showErrorToast("❌ حدث خطأ أثناء تحديث المقطع");
    }
  };

  // Handler: Delete Section
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

    if (!result.isConfirmed) return;

    try {
      await deleteSection(sectionId);

      setSections((prev) => prev.filter((section) => section._id !== sectionId));
      setMarks((prev) =>
        prev.filter((mark) => {
          // Check if mark and sectionId exist
          if (!mark || !mark.sectionId) {
            return false;
          }
          
          if (typeof mark.sectionId === "string") {
            return mark.sectionId !== sectionId;
          } else {
            return mark.sectionId._id !== sectionId;
          }
        })
      );

      showSuccessToast("✅ تم حذف المقطع بنجاح!");
    } catch (err) {
      console.error("Error deleting section:", err);
      showErrorToast("❌ حدث خطأ أثناء حذف المقطع");
    }
  };

  // Handler: Add Mark
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

      const createdMark = await createMark(markData as never);

      setMarks((prev) => [createdMark as never, ...prev]);
      setIsAddMarkModalOpen(false);

      const totalMark =
        (newMark.reviewMark || 0) + (newMark.memorizationMark || 0);
      showSuccessToast(`✅ تم رصد العلامة بنجاح! العلامة: ${totalMark}/20`);
    } catch (err) {
      console.error("Error adding mark:", err);
      showErrorToast("❌ حدث خطأ أثناء إضافة العلامة");
    }
  };

  // Handler: Update Mark
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

      const updatedMark = await createMark(markData as never);

      setMarks((prev) =>
        prev.map((mark) =>
          mark._id === editingMark._id ? (updatedMark as never) : mark
        )
      );
      setIsUpdateMarkModalOpen(false);
      setEditingMark(null);

      const totalMark =
        (newMark.reviewMark || 0) + (newMark.memorizationMark || 0);
      showSuccessToast(`🔄 تم تحديث العلامة بنجاح! العلامة الجديدة: ${totalMark}/20`);
    } catch (err) {
      console.error("Error updating mark:", err);
      showErrorToast("❌ حدث خطأ أثناء تحديث العلامة");
    }
  };

  // Handler: Bulk Update
  const executeBulkUpdate = async (updateData: {
    reviewSection?: string;
    memorizationSection?: string;
  }) => {
    if (selectedSectionsForBulk.length === 0) {
      showWarningMessage("الرجاء اختيار مقطع واحد على الأقل للتحديث", "تنبيه");
      return;
    }

    try {
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

      setSections((prev) =>
        prev.map((section) => {
          const result = results.find((r) => r?._id === section._id);
          return result ? result : section;
        })
      );

      setIsBulkUpdateModalOpen(false);
      setSelectedSectionsForBulk([]);
      showSuccessToast("✅ تم تحديث المقاطع بنجاح!");
    } catch (err) {
      console.error("Error bulk updating sections:", err);
      showErrorToast("❌ حدث خطأ أثناء تحديث المقاطع");
    }
  };

  // Handler: Bulk Delete
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

    if (!result.isConfirmed) return;

    try {
      await Promise.all(
        selectedSectionsForBulk.map((sectionId) => deleteSection(sectionId))
      );

      setSections((prev) =>
        prev.filter((section) => !selectedSectionsForBulk.includes(section._id))
      );

      setMarks((prev) =>
        prev.filter((mark) => {
          // Check if mark and sectionId exist
          if (!mark || !mark.sectionId) {
            return false;
          }
          
          if (typeof mark.sectionId === "string") {
            return !selectedSectionsForBulk.includes(mark.sectionId);
          } else {
            return !selectedSectionsForBulk.includes(mark.sectionId._id);
          }
        })
      );

      setIsBulkDeleteModalOpen(false);
      setSelectedSectionsForBulk([]);
      showSuccessToast("✅ تم حذف المقاطع بنجاح!");
    } catch (err) {
      console.error("Error bulk deleting sections:", err);
      showErrorToast("❌ حدث خطأ أثناء حذف المقاطع");
    }
  };

  // Modal Handlers
  const openAddMarkModal = (section: Section) => {
    setSelectedSection(section);
    setNewMark({
      reviewMark: 8,
      memorizationMark: 8,
    });
    setIsAddMarkModalOpen(true);
  };

  const openUpdateMarkModal = (mark: Mark, section: Section) => {
    setEditingMark(mark);
    setSelectedSection(section);
    setNewMark({
      reviewMark: mark.reviewMark || 8,
      memorizationMark: mark.memorizationMark || 8,
    });
    setIsUpdateMarkModalOpen(true);
  };

  const openEditSectionModal = (section: Section) => {
    setEditingSection({ ...section });
    setIsEditSectionModalOpen(true);
  };

  const toggleSectionSelection = (sectionId: string) => {
    setSelectedSectionsForBulk((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Input Change Handlers
  const handleSectionInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewSection((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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

  const handleMarkInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewMark((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  // Get filtered sections and averages
  const filteredSections = getFilteredSections();
  const averages = calculateAverages(
    marks,
    currentUser?.role === "student" ? currentUser._id : selectedStudentId
  );

  const getSelectedStudent = () => {
    return students.find((s) => s._id === selectedStudentId) || null;
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 py-8 px-4 md:px-6 lg:px-8"
      dir="rtl">
      <div className="w-full max-w-full mx-auto">
        {/* Enhanced Header with animations */}
        <div className="text-center mb-10 animate-fade-in-down">
          <div className="inline-block">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 rounded-2xl shadow-lg mb-4 inline-block">
              <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent mb-4 animate-gradient">
            📚 نظام العلامات اليومية
          </h1>
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-12 h-1 bg-gradient-to-r from-transparent to-emerald-600 rounded-full"></div>
            <div className="w-24 h-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full"></div>
            <div className="w-12 h-1 bg-gradient-to-r from-teal-600 to-transparent rounded-full"></div>
          </div>
          {currentUser && (
            <div className="inline-block">
              <div className="bg-white shadow-lg rounded-2xl px-6 py-4 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                <h2 className="text-lg md:text-xl font-bold text-gray-800 flex items-center justify-center gap-2">
                  {currentUser.role === "student" ? (
                    <>
                      <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-sm">👨‍🎓 طالب</span>
                      <span>{`${currentUser.firstName} ${currentUser.fatherName} ${currentUser.lastName}`}</span>
                    </>
                  ) : (
                    <>
                      <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">👨‍🏫 معلم</span>
                      <span>{`${currentUser.firstName} ${currentUser.lastName}`}</span>
                    </>
                  )}
                </h2>
                {currentUser.role === "student" && (
                  <span className="block text-sm text-gray-600 mt-2 bg-gray-50 px-4 py-1.5 rounded-lg">
                    📚 {currentUser.group}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Month and Year Filter */}
        <MonthYearFilter
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthChange={setSelectedMonth}
          onYearChange={setSelectedYear}
        />

        {loading ? (
          <DailyMarksSkeleton />
        ) : (
          <>
            {/* Render appropriate view based on user role */}
            {currentUser?.role !== "student" ? (
              <TeacherView
                students={students}
                filteredStudents={filteredStudents}
                teacherGroups={teacherGroups}
                selectedGroup={selectedGroup}
                selectedStudentId={selectedStudentId}
                sections={filteredSections}
                marks={marks}
                loadingMarks={loadingMarks}
                averages={averages}
                onGroupChange={setSelectedGroup}
                onStudentSelect={setSelectedStudentId}
                onAddSection={() => setIsAddSectionModalOpen(true)}
                onBulkUpdate={() => setIsBulkUpdateModalOpen(true)}
                onBulkDelete={() => setIsBulkDeleteModalOpen(true)}
                onAddMark={openAddMarkModal}
                onUpdateMark={openUpdateMarkModal}
                onEditSection={openEditSectionModal}
                onDeleteSection={handleDeleteSection}
              />
            ) : (
              <StudentView
                sections={filteredSections}
                marks={marks}
                loadingMarks={loadingMarks}
                averages={averages}
              />
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {currentUser?.role !== "student" && (
        <>
          <AddSectionModal
            isOpen={isAddSectionModalOpen}
            selectedGroup={selectedGroup}
            newSection={newSection}
            onClose={() => setIsAddSectionModalOpen(false)}
            onSubmit={handleAddSection}
            onChange={handleSectionInputChange}
          />

          <EditSectionModal
            isOpen={isEditSectionModalOpen}
            editingSection={editingSection}
            onClose={() => {
              setIsEditSectionModalOpen(false);
              setEditingSection(null);
            }}
            onSubmit={handleEditSection}
            onChange={handleEditSectionInputChange}
          />

          <AddMarkModal
            isOpen={isAddMarkModalOpen}
            selectedSection={selectedSection}
            selectedStudent={getSelectedStudent()}
            newMark={newMark}
            onClose={() => setIsAddMarkModalOpen(false)}
            onSubmit={handleAddMark}
            onChange={handleMarkInputChange}
          />

          <UpdateMarkModal
            isOpen={isUpdateMarkModalOpen}
            selectedSection={selectedSection}
            selectedStudent={getSelectedStudent()}
            editingMark={editingMark}
            newMark={newMark}
            onClose={() => {
              setIsUpdateMarkModalOpen(false);
              setEditingMark(null);
            }}
            onSubmit={handleUpdateMark}
            onChange={handleMarkInputChange}
          />

          <BulkUpdateModal
            isOpen={isBulkUpdateModalOpen}
            sections={filteredSections}
            selectedSectionsForBulk={selectedSectionsForBulk}
            onClose={() => {
              setIsBulkUpdateModalOpen(false);
              setSelectedSectionsForBulk([]);
            }}
            onToggleSection={toggleSectionSelection}
            onSubmit={executeBulkUpdate}
          />

          <BulkDeleteModal
            isOpen={isBulkDeleteModalOpen}
            sections={filteredSections}
            selectedSectionsForBulk={selectedSectionsForBulk}
            onClose={() => {
              setIsBulkDeleteModalOpen(false);
              setSelectedSectionsForBulk([]);
            }}
            onToggleSection={toggleSectionSelection}
            onConfirm={executeBulkDelete}
          />
        </>
      )}

      {/* Global Animations and Styles */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes gradient {
          0%, 100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-fade-in-down {
          animation: fade-in-down 0.6s ease-out;
        }

        .animate-gradient {
          animation: gradient 3s ease infinite;
          background-size: 200% 200%;
        }

        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }

        /* Custom focus styles */
        *:focus {
          outline: 2px solid #10b981;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
};

export default DailyMarksPage;
