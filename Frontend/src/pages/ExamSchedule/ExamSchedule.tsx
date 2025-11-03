import React, { useEffect, useMemo, useState } from "react";
import { getStudentAllMarks, type Exam } from "../../Api/examApi";
import Table from "../../components/UI/Table";
import type { Column } from "../../components/UI/Table";
import "./styles/animations.css";

// Import utility functions and components
import { safeExamId, handleFetchError } from "./utils";

// (components imported below as needed)

// Import modals
import { AddExamModal, EditExamModal, MarksModal } from "./modals";

// Import hooks
import { useExamActions, useMarksModal, useMarkActions, useTeacherGroups, useExamData } from "./hooks";
import { ExamToolbar, ExamActions, SocketIndicator } from "./components";
import { createExamColumns } from "./utils/columns";

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
  // ——— الحالة (State) عبر hook موحد للبيانات
  const role = getUserRole();
  const { exams, loadingExams, examAverages, refreshAverageForExam, reloadExams, isConnected: socketConnected, socketLastUpdate, socketId } = useExamData(role);

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

  // بحث وفرز بسيط
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<"date" | "name">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

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
  const handleAddExam = async (examData: { name: string; date: string; time: string }, selectedGroup: string) => {
    const success = await handleAddExamAction(examData, selectedGroup, role);
    if (success) {
      setShowAddExamModal(false);
    }
  };

  const handleEditExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editExam) return;
    const success = await handleEditExamAction(editExam);
    if (success) {
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
    const examId = safeExamId(selectedExam);
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
          handleFetchError(error, "Error processing student marks");
          setStudentMarks({});
        }
      })();
    } catch (error) {
      console.error("Error in student marks effect:", error);
    }
  }, [role, exams]); // تنفيذ عندما تتغير الامتحانات

  // ——— تصفية/فرز
  const filteredSortedExams = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = exams.filter((ex) =>
      q
        ? String(ex.name ?? "")
            .toLowerCase()
            .includes(q) || String(ex.date ?? "").includes(q)
        : true
    );

    out = out.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "name") {
        return dir * String(a.name).localeCompare(String(b.name));
      }
      // sort by date (fallback to name)
      const da = String(a.date ?? "");
      const db = String(b.date ?? "");
      const comp = da.localeCompare(db);
      if (comp !== 0) return dir * comp;
      return dir * String(a.name).localeCompare(String(b.name));
    });

    return out;
  }, [exams, query, sortKey, sortDir]);

  // ——— تعريف أعمدة الجدول باستخدام المصنع
  const ActionsCell: React.FC<{ exam: Exam }> = ({ exam }) => (
    <ExamActions
      exam={exam}
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
  );

  const columns: Column<Exam>[] = createExamColumns({
    role,
    examAverages,
    studentMarks,
    // الطالب لا يرى أزرار الإجراءات
    ActionsComponent: role === 'student' ? undefined : ActionsCell,
  });

  // ——— واجهة المستخدم
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-white to-teal-50/30"
      dir="rtl"
      lang="ar">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 md:pt-10 pb-12 sm:pb-16 md:pb-20">
        {/* 🔌 Socket Connection Indicator - للمطورين فقط */}
        {import.meta.env.DEV && (
          <SocketIndicator
            isConnected={socketConnected}
            socketId={socketId}
            lastUpdate={socketLastUpdate ? new Date(socketLastUpdate).getTime() : null}
          />
        )}

        {/* العنوان */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-block">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent tracking-tight mb-2">
              جدول الامتحانات
            </h2>
            <div className="h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent rounded-full"></div>
          </div>
          <p className="text-sm sm:text-base text-gray-600 mt-3 max-w-2xl mx-auto">
            الامتحانات القادمة تظهر هنا، والنتائج تُعرض بعد التصحيح.
          </p>
        </div>

        {/* شريط الأدوات */}
        <div className="mb-6">
          <ExamToolbar
            query={query}
            setQuery={setQuery}
            sortKey={sortKey}
            setSortKey={(k) => setSortKey(k)}
            sortDir={sortDir}
            setSortDir={(d) => setSortDir(d)}
            loadingExams={loadingExams}
            role={role}
            teacherGroups={teacherGroups}
            onAddExamClick={() => setShowAddExamModal(true)}
          />
        </div>

        {/* جدول الامتحانات باستخدام المكون القابل لإعادة الاستخدام */}
        <div className="animate-fadeIn">
          <Table
            columns={columns}
            data={filteredSortedExams}
            loading={loadingExams}
            emptyMessage={query ? "لا توجد نتائج" : "لا توجد امتحانات"}
            emptyDescription={
              query
                ? "جرّب البحث بكلمات أخرى"
                : "لم يتم إضافة أي امتحانات بعد"
            }
            emptyIcon="📝"
            hoverable
            striped
            responsive
            bordered
          />
        </div>

      {/* ———————————————— مودال: إضافة امتحان ———————————————— */}
      <AddExamModal
        open={showAddExamModal}
        onClose={() => setShowAddExamModal(false)}
        onSubmit={handleAddExam}
        role={role}
        teacherGroups={teacherGroups}
      />

      {/* ———————————————— مودال: تعديل الامتحان ———————————————— */}
      <EditExamModal
        open={showEditExamModal}
        onClose={() => setShowEditExamModal(false)}
        onSubmit={handleEditExam}
        exam={editExam}
        onExamChange={setEditExam}
        role={role}
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
