import React, { useEffect, useState } from "react";
import { getStudentAllMarks, type Exam } from "@/Api/ExamShedule";
import { Calendar, ClipboardList } from "lucide-react";

// Import modals
import { ExamFormModal, MarksModal } from "./modals";

// Import hooks
import {
  useExamActions,
  useMarksModal,
  useMarkActions,
  useTeacherGroups,
  useExamData,
} from "./hooks";

// Import views
import { TeacherView, StudentView, MarksManagement } from "./components";

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

  // حالة الصفحة النشطة
  const [activePage, setActivePage] = useState<"exams" | "marks">("exams");

  // فلاتر البحث (تُرسل للباك إند)
  const [query, setQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [marksFilter, setMarksFilter] = useState("");

  // جلب البيانات مع الفلاتر من الباك إند (بما فيها فلتر العلامات)
  const {
    exams,
    loadingExams,
    examAverages,
    refreshAverageForExam,
    reloadExams,
  } = useExamData(role, {
    search: query,
    date: dateFilter,
    type: typeFilter,
    marksStatus: marksFilter, // إرسال فلتر العلامات للباك إند
  });

  // Modals state
  const [showExamFormModal, setShowExamFormModal] = useState(false);
  const [examFormMode, setExamFormMode] = useState<"add" | "edit">("add");
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
  const { teacherGroups, loadingTeacherGroups } = useTeacherGroups(role);

  // لم نعد بحاجة لمرجع الإلغاء بعد نقل المنطق للهوك

  // استخدام hook للعمليات على الامتحانات
  const {
    handleAddExam: handleAddExamAction,
    handleEditExam: handleEditExamAction,
    handleDeleteExam: handleDeleteExamAction,
  } = useExamActions({
    onExamsChange: reloadExams,
  });

  // ———

  // ——— Wrappers للعمليات على الامتحانات
  const handleFormSubmit = async (examData: any, selectedGroup?: string) => {
    if (examFormMode === "add") {
      // Add mode
      await handleAddExamAction(examData, selectedGroup || "", role);
    } else if (examFormMode === "edit" && editExam) {
      // Edit mode
      await handleEditExamAction({ ...editExam, ...examData });
    }
    setShowExamFormModal(false);
    setEditExam(null);
  };

  const handleDeleteExam = async (examIdRaw: string | number) => {
    const success = await handleDeleteExamAction(examIdRaw);
    if (success) reloadExams();
  };

  // ——— CRUD (Marks)
  const {
    handleAddMark: doAddMarks,
    handleSaveSingleMark: doSaveSingleMark,
    handleDeleteMark: doDeleteMark,
  } = useMarkActions({ refreshAverageForExam, setMarks });

  const handleAddMark = async (e: React.FormEvent) => {
    if (!selectedExam) return;
    const examId = String(selectedExam._id ?? selectedExam.id);
    await doAddMarks(e, { selectedExamId: examId, students, marks });
    closeAndReset();
  };

  const handleDeleteMark = async (
    examIdRaw: string | number,
    studentIdRaw: string | number
  ) => {
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
      className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-slate-50 to-teal-50/20"
      dir="rtl"
      lang="ar">
      
      {/* Header - مثل DailyMarks */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 text-white rounded-b-3xl shadow-xl p-6 pb-8 mb-6">
        <div className="container mx-auto">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* أيقونة */}
            <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl shadow-lg">
              <Calendar className="w-10 h-10 md:w-12 md:h-12" />
            </div>

            {/* العنوان */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-2">
                جدول الامتحانات
              </h1>
              <p className="text-white/80 text-sm md:text-base max-w-2xl mx-auto">
                الامتحانات القادمة تظهر هنا، والنتائج تُعرض بعد التصحيح
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[98%] mx-auto px-4 md:px-6 lg:px-8 pb-12">
        {/* Segmented Control - للمعلمين فقط */}
        {role === "teacher" && (
          <div className="mb-6">
            <div className="inline-flex bg-white rounded-xl shadow-lg border border-slate-200/60 p-1.5">
              {/* زر صفحة الامتحانات */}
              <button
                onClick={() => setActivePage("exams")}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${
                  activePage === "exams"
                    ? "bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 text-white shadow-md"
                    : "bg-transparent hover:bg-emerald-50 text-slate-700 hover:text-emerald-700"
                }`}>
                <Calendar className="w-5 h-5" />
                <span>صفحة الامتحانات</span>
              </button>

              {/* زر صفحة إدارة العلامات */}
              <button
                onClick={() => setActivePage("marks")}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${
                  activePage === "marks"
                    ? "bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 text-white shadow-md"
                    : "bg-transparent hover:bg-emerald-50 text-slate-700 hover:text-emerald-700"
                }`}>
                <ClipboardList className="w-5 h-5" />
                <span>إدارة العلامات</span>
              </button>
            </div>
          </div>
        )}

        {/* عرض المحتوى حسب الصفحة النشطة */}
        {activePage === "exams" ? (
          // صفحة الامتحانات
          role === "student" ? (
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
              marksFilter={marksFilter}
              setMarksFilter={setMarksFilter}
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
              marksFilter={marksFilter}
              setMarksFilter={setMarksFilter}
              teacherGroups={teacherGroups}
              onAddExamClick={() => {
                setExamFormMode("add");
                setEditExam(null);
                setShowExamFormModal(true);
              }}
              onOpenMarks={(ex) => {
                setSelectedExam(ex);
                setShowMarkModal(true);
              }}
              onEditExam={(ex) => {
                setExamFormMode("edit");
                setEditExam({ ...ex });
                setShowExamFormModal(true);
              }}
              onDeleteExam={(id) => handleDeleteExam(id)}
            />
          )
        ) : (
          // صفحة إدارة العلامات
          <MarksManagement teacherGroups={teacherGroups} />
        )}

        {/* ———————————————— مودال: إضافة/تعديل الامتحان ———————————————— */}
        <ExamFormModal
          open={showExamFormModal}
          onClose={() => {
            setShowExamFormModal(false);
            setEditExam(null);
          }}
          onSubmit={handleFormSubmit}
          role={role}
          teacherGroups={teacherGroups}
          loadingTeacherGroups={loadingTeacherGroups}
          initialData={
            editExam
              ? {
                  name: editExam.name,
                  date:
                    typeof editExam.date === "string"
                      ? editExam.date
                      : editExam.date.toISOString(),
                  time: editExam.time,
                  subject: editExam.subject,
                  type: editExam.type,
                  duration: editExam.duration,
                  totalMarks: editExam.totalMarks,
                  passingMarks: editExam.passingMarks,
                  group: editExam.group,
                }
              : undefined
          }
          mode={examFormMode}
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
