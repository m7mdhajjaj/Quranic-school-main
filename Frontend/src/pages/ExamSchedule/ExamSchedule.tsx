import React, { useEffect, useState } from "react";
import { getStudentAllMarks, type Exam } from "@/Api/exam.api";
import PageHeader from "@/components/UI/PageHeader";
import { Calendar } from "lucide-react";
import "./styles/animations.css";

// Import modals
import { ExamFormModal, MarksModal } from "./modals";

// Import hooks
import { useExamActions, useMarksModal, useMarkActions, useTeacherGroups, useExamData } from "./hooks";

// Import views
import { TeacherView, StudentView } from "./components";

// =========================
// Helper Functions
// =========================

const getUserRole = (): "student" | "teacher" | "admin" => {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return "student";
    const parsed = JSON.parse(raw);
    return (parsed?.role as "student" | "teacher" | "admin") ?? "student";
  } catch {
    return "student";
  }
};

// =========================
// المكوّن الرئيسي
// =========================
const ExamSchedule: React.FC = () => {
  // ——— الحالة (State)
  const role = getUserRole();
  
  // فلاتر البحث (تُرسل للباك إند)
  const [query, setQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  // جلب البيانات مع الفلاتر من الباك إند
  const { exams, loadingExams, examAverages, refreshAverageForExam, reloadExams } = useExamData(role, {
    search: query,
    date: dateFilter,
    type: typeFilter,
  });

  // Modals state
  const [showAddExamModal, setShowAddExamModal] = useState(false);
  const [showEditExamModal, setShowEditExamModal] = useState(false);
  const [editExam, setEditExam] = useState<Exam | null>(null);

  // إدارة مودال العلامات (hook)
  const {
    showMarkModal,
    setShowMarkModal,
    selectedExam,
    setSelectedExam,
    students,
    loadingStudents,
    marks,
    setMarks,
    closeAndReset,
  } = useMarksModal();

  // للطالب: خريطة examId -> mark
  const [studentMarks, setStudentMarks] = useState<Record<string, string>>({});

  // حلقات المعلم (hook)
  const { teacherGroups } = useTeacherGroups(role);

  // لم نعد بحاجة لمرجع الإلغاء بعد نقل المنطق للهوك

  // استخدام hook للعمليات على الامتحانات
  const { 
    handleAddExam: handleAddExamAction, 
    handleEditExam: handleEditExamAction, 
    handleDeleteExam: handleDeleteExamAction 
  } = useExamActions({
    onExamsChange: reloadExams,
  });

  // ———

  // ——— Wrappers للعمليات على الامتحانات
  const handleFormSubmit = async (examData: any, selectedGroup?: string) => {
    if (showAddExamModal) {
      // Add mode
      await handleAddExamAction(examData, selectedGroup || '', role);
      setShowAddExamModal(false);
    } else if (showEditExamModal && editExam) {
      // Edit mode
      await handleEditExamAction({ ...editExam, ...examData });
      setShowEditExamModal(false);
      setEditExam(null);
    }
  };

  const handleDeleteExam = async (examIdRaw: string | number) => {
    const success = await handleDeleteExamAction(examIdRaw);
    if (success) reloadExams();
  };

  // ——— CRUD (Marks)
  const { handleAddMark: doAddMarks, handleSaveSingleMark: doSaveSingleMark, handleDeleteMark: doDeleteMark } = useMarkActions({ refreshAverageForExam, setMarks });

  const handleAddMark = async (e: React.FormEvent) => {
    if (!selectedExam) return;
    const examId = String(selectedExam._id ?? selectedExam.id);
    await doAddMarks(e, { selectedExamId: examId, students, marks });
    closeAndReset();
  };

  const handleDeleteMark = async (examIdRaw: string | number, studentIdRaw: string | number) => {
    await doDeleteMark(String(examIdRaw), String(studentIdRaw));
  };

  // حفظ علامة طالب واحدة من داخل مودال العلامات
  const handleSaveSingleMark = async (studentId: string, fullName: string) => {
    if (!selectedExam) return;
    const examId = String(selectedExam._id ?? selectedExam.id);
    if (!examId) return;
    const newMark = marks[studentId]?.mark ?? "";
    await doSaveSingleMark({ examId, studentId, fullName, mark: newMark });
  };

  // إلغاء مودال العلامات وإعادة تعيين الحالة
  const handleCancelMarksModal = () => closeAndReset();

  // منطق جلب الطلاب والعلامات نُقل إلى useMarksModal

  // منطق حلقات المعلم نُقل إلى useTeacherGroups

  // منطق جلب الامتحانات والمتوسطات والفلترة تم نقله إلى useExamData (مع تحديث تلقائي عند أحداث السوكت)

  // ——— الطالب: جلب علاماته الشخصية
  useEffect(() => {
    if (role !== "student") return;
    if (!exams.length) return; // لا داعي للتنفيذ إذا لم تكن هناك امتحانات

    try {
      const raw = localStorage.getItem("user");
      if (!raw) return;
      let userData;
      try {
        userData = JSON.parse(raw);
      } catch (e) {
        console.error("Failed to parse user data:", e);
        return;
      }

      const sid = userData?._id;
      if (!sid) {
        console.error("No student ID found in user data");
        return;
      }

      console.log("Fetching marks for student:", sid);

      (async () => {
        try {
          const data = await getStudentAllMarks(sid);
          console.log("Student marks data received:", typeof data);

          const rows = Array.isArray(data) ? data : [];
          const map: Record<string, string> = {};

          rows.forEach((r) => {
            const examData = r.exam as Exam;
            const exId = String(examData?._id ?? examData?.id ?? "");
            if (exId) {
              map[exId] = String(r.mark ?? "");
              console.log(`Mark for exam ${exId}: ${map[exId]}`);
            }
          });

          setStudentMarks(map);
        } catch (error) {
          console.error("Error processing student marks:", error);
          setStudentMarks({});
        }
      })();
    } catch (error) {
      console.error("Error in student marks effect:", error);
    }
  }, [role, exams]); // تنفيذ عندما تتغير الامتحانات



  // ——— واجهة المستخدم
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-white to-teal-50/30"
      dir="rtl"
      lang="ar">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 md:pt-10 pb-12 sm:pb-16 md:pb-20">
        
        {/* العنوان */}
        <PageHeader
          title="جدول الامتحانات"
          subtitle="الامتحانات القادمة تظهر هنا، والنتائج تُعرض بعد التصحيح."
          icon={<Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-white" />}
        />

        {/* واجهة المعلم أو الطالب */}
        {role === 'student' ? (
          <StudentView
            exams={exams}
            loadingExams={loadingExams}
            studentMarks={studentMarks}
            query={query}
            setQuery={setQuery}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
          />
        ) : (
          <TeacherView
            exams={exams}
            loadingExams={loadingExams}
            examAverages={examAverages}
            query={query}
            setQuery={setQuery}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            teacherGroups={teacherGroups}
            onAddExamClick={() => setShowAddExamModal(true)}
            onOpenMarks={(ex) => {
              setSelectedExam(ex);
              setShowMarkModal(true);
            }}
            onEditExam={(ex) => {
              setEditExam({ ...ex });
              setShowEditExamModal(true);
            }}
            onDeleteExam={(id) => handleDeleteExam(id)}
          />
        )}

      {/* ———————————————— مودال: إضافة/تعديل الامتحان ———————————————— */}
      <ExamFormModal
        open={showAddExamModal || showEditExamModal}
        onClose={() => {
          setShowAddExamModal(false);
          setShowEditExamModal(false);
          setEditExam(null);
        }}
        onSubmit={handleFormSubmit}
        role={role}
        teacherGroups={teacherGroups}
        initialData={editExam ? {
          name: editExam.name,
          date: typeof editExam.date === 'string' ? editExam.date : editExam.date.toISOString(),
          time: editExam.time,
          subject: editExam.subject,
          type: editExam.type,
          duration: editExam.duration,
          totalMarks: editExam.totalMarks,
          passingMarks: editExam.passingMarks,
          group: editExam.group,
        } : undefined}
        mode={showAddExamModal ? 'add' : 'edit'}
      />

      {/* ———————————————— مودال: إدارة العلامات ———————————————— */}
      <MarksModal
        open={showMarkModal}
        onClose={() => setShowMarkModal(false)}
        onCancel={handleCancelMarksModal}
        selectedExam={selectedExam}
        loading={loadingStudents}
        students={students}
        marks={marks}
        setMarks={setMarks}
        onSubmitAll={handleAddMark}
        onSaveSingleMark={handleSaveSingleMark}
        onDeleteMark={handleDeleteMark}
      />
      </div>
    </div>
  );
};

export default ExamSchedule;
