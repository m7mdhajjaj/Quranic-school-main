import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  getAllExams,
  createExam,
  updateExam,
  deleteExam,
  getExamMarks,
  getExamAverage,
  bulkSaveMarks,
  updateStudentMark,
  deleteStudentMark,
  getStudentAllMarks,
  type Exam,
  type MarkRow,
  type StudentDoc,
  type ExamAverage,
} from "../Api/examApi";
import { getAllStudents } from "../Api/studentApi";
import Swal from "sweetalert2";
import { useExamScheduleSocket } from "../Socket";



const cn = (...cls: Array<string | false | null | undefined>) =>
  cls.filter(Boolean).join(" ");

const formatAvg = (x: number | null | undefined, digits = 1) =>
  x == null || Number.isNaN(x) ? undefined : x.toFixed(digits);

const safeExamId = (ex: Exam | null | undefined): string | null => {
  if (!ex) return null;
  const val = ex._id ?? ex.id;
  if (val === undefined || val === null) return null;
  return String(val);
};

// التحقق من أن وقت الامتحان ضمن المدى المسموح (09:00 - 19:00)
const isTimeWithinAllowedRange = (timeStr: string): boolean => {
  if (!timeStr) return false;
  const [hStr, mStr] = timeStr.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return false;
  const total = h * 60 + m;
  const MIN = 9 * 60; // 09:00
  const MAX = 19 * 60; // 19:00
  return total >= MIN && total <= MAX;
};

// تنسيق التاريخ من yyyy-mm-dd إلى صيغة عربية أوضح
const formatDateArabic = (dateStr: string): string => {
  if (!dateStr) return dateStr;
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    
    const arabicMonths = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    
    return `${day} ${arabicMonths[month - 1]} ${year}`;
  } catch {
    return dateStr;
  }
};

// تنسيق الوقت إلى نظام 12 ساعة مع صباحاً/مساءً
const formatTime12Arabic = (timeStr: string): string => {
  if (!timeStr) return timeStr;
  const [hStr, mStr] = timeStr.split(":");
  let h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return timeStr;
  const period = h >= 12 ? "مساءً" : "صباحاً";
  h = h % 12;
  if (h === 0) h = 12;
  const mm = String(m).padStart(2, "0");
  return `${h}:${mm} ${period}`;
};

// وظيفة للتعامل مع الأخطاء
const handleFetchError = (error: unknown, message: string) => {
  console.error(`${message}:`, error);
  if (typeof error === "object" && error !== null && "response" in error) {
    const axiosError = error as { response?: { status?: number } };
    if (axiosError.response?.status === 401) {
      // خطأ في المصادقة
      console.warn("Authentication error, redirecting to login...");
    }
  }
};

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
// مكونات صغيرة قابلة لإعادة الاستخدام
// =========================
const Badge: React.FC<{
  intent?: "success" | "muted";
  children?: React.ReactNode;
}> = ({ intent = "muted", children }) => (
  <span
    className={cn(
      "inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-semibold border",
      intent === "success"
        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
        : "bg-gray-100 text-gray-600 border-gray-200"
    )}>
    {children}
  </span>
);

const PillButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "warn" | "danger" | "neutral";
  }
> = ({ variant = "primary", className, children, ...rest }) => {
  const base =
    "px-3 py-1.5 text-sm rounded-lg shadow-sm focus:outline-none focus:ring-2 transition";
  const palette: Record<string, string> = {
    primary:
      "bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-300",
    warn: "bg-amber-500 hover:bg-amber-600 text-white focus:ring-amber-300",
    danger: "bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-300",
    neutral:
      "bg-gray-200 hover:bg-gray-300 text-emerald-700 focus:ring-gray-300",
  };
  return (
    <button className={cn(base, palette[variant], className)} {...rest}>
      {children}
    </button>
  );
};

const TransparentModal: React.FC<{
  open: boolean;
  onClose: () => void;
  maxWidth?: string; // e.g. "max-w-lg", "max-w-2xl"
  children: React.ReactNode;
  cardClassName?: string;
  ariaLabel?: string;
  title?: string;
  icon?: React.ReactNode;
  gradientFrom?: string;
  gradientTo?: string;
}> = ({
  open,
  onClose,
  maxWidth = "max-w-lg",
  children,
  cardClassName,
  ariaLabel,
  title,
  icon,
  gradientFrom = "emerald-500",
  gradientTo = "teal-600",
}) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      role="dialog"
      aria-label={ariaLabel ?? "Modal"}
      aria-modal
      onMouseDown={(e) => {
        // إغلاق عند الضغط خارج البطاقة
        if (e.target === e.currentTarget) onClose();
      }}>
      <div
        className={cn(
          "bg-white rounded-2xl shadow-2xl w-full overflow-hidden animate-fadeIn",
          maxWidth,
          cardClassName
        )}>
        {title && (
          <div
            className={cn(
              "p-6",
              `bg-gradient-to-r from-${gradientFrom} to-${gradientTo}`
            )}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                {icon && (
                  <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    {icon}
                  </div>
                )}
                <h3 className="text-xl font-bold text-white">{title}</h3>
              </div>
              <button
                type="button"
                onClick={onClose}
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
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

const Field: React.FC<{
  label: string;
  children: React.ReactNode;
  htmlFor?: string;
  hint?: string;
  required?: boolean;
}> = ({ label, children, htmlFor, hint, required }) => (
  <div>
    <label htmlFor={htmlFor} className="block mb-1 font-bold text-emerald-700">
      {label} {required ? <span className="text-rose-600">*</span> : null}
    </label>
    {children}
    {hint ? (
      <p className="text-[12px] text-emerald-900/60 mt-1">{hint}</p>
    ) : null}
  </div>
);

// =========================
// المكوّن الرئيسي
// =========================
const ExamSchedule: React.FC = () => {
  // 🔌 Socket Connection
  const { isConnected: socketConnected, lastUpdate: socketLastUpdate, socketId } = useExamScheduleSocket();

  // ——— الحالة (State)
  const [exams, setExams] = useState<Exam[]>([]);
  const [loadingExams, setLoadingExams] = useState(true);

  const [showAddExamModal, setShowAddExamModal] = useState(false);
  const [newExam, setNewExam] = useState({ name: "", date: "", time: "" });

  const [showEditExamModal, setShowEditExamModal] = useState(false);
  const [editExam, setEditExam] = useState<Exam | null>(null);

  // حالات الحلقات للمعلم
  const [teacherGroups, setTeacherGroups] = useState<string[]>([]);
  const [selectedGroupForExam, setSelectedGroupForExam] = useState<string>("");

  const [showMarkModal, setShowMarkModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  const [students, setStudents] = useState<StudentDoc[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [marks, setMarks] = useState<
    Record<string, { mark: string; detail: string }>
  >({});

  // للطالب: خريطة examId -> mark
  const [studentMarks, setStudentMarks] = useState<Record<string, string>>({});

  // للمعلم/الإدمن: examId -> average
  const [examAverages, setExamAverages] = useState<
    Record<string, number | null>
  >({});

  // بحث وفرز بسيط
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<"date" | "name">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // دور المستخدم
  const role = getUserRole();

  // مرجع لمنع تعدد الطلبات عند إغلاق وفتح المودال بسرعة
  const markModalAbortRef = useRef<AbortController | null>(null);

  // helper function للحصول على أسماء المعلم المحتملة
  const getTeacherPossibleNames = useCallback((user: any) => {
    const firstLast = `${user.firstName} ${user.lastName}`.trim();
    const firstFatherLast = `${user.firstName} ${user.fatherName || ""} ${
      user.lastName || ""
    }`
      .trim()
      .replace(/\s+/g, " ");
    return [firstLast, firstFatherLast, user.firstName].filter(
      (name) => name.length > 0
    );
  }, []);

  // helper function للتحقق من تطابق المعلم
  const isTeacherMatch = useCallback(
    (studentTeacher: string, possibleNames: string[]) => {
      const studentTeacherNormalized = studentTeacher
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();
      return possibleNames.some((possibleName) => {
        const normalizedPossible = possibleName.toLowerCase();
        return (
          studentTeacherNormalized === normalizedPossible ||
          studentTeacherNormalized.includes(normalizedPossible) ||
          normalizedPossible.includes(studentTeacherNormalized)
        );
      });
    },
    []
  );

  // ——— مساعدات API
  const fetchExamAverage = async (examId: string): Promise<number | null> => {
    try {
      const data: ExamAverage = await getExamAverage(examId);
      return typeof data?.average === "number" ? data.average : null;
    } catch {
      return null;
    }
  };

  const refreshAverageForExam = async (examId: string) => {
    const avg = await fetchExamAverage(examId);
    setExamAverages((prev) => ({ ...prev, [examId]: avg }));
  };

  const refreshAllAverages = useMemo(
    () => async (list: Exam[]) => {
      // استخدام المتوسط المحفوظ في قاعدة البيانات
      const entries = list.map((ex) => {
        const id = String(ex._id ?? ex.id);
        const avg = ex.examAverage ?? null;
        return [id, avg] as const;
      });
      setExamAverages(Object.fromEntries(entries));

      // إذا كان هناك امتحانات بدون متوسط، جلبه من الـ API
      const examsWithoutAverage = list.filter(
        (ex) => ex.examAverage === null || ex.examAverage === undefined
      );
      if (examsWithoutAverage.length > 0) {
        const fetchedAverages = await Promise.all(
          examsWithoutAverage.map(async (ex) => {
            const id = String(ex._id ?? ex.id);
            const avg = await fetchExamAverage(id);
            return [id, avg] as const;
          })
        );
        setExamAverages((prev) => ({
          ...prev,
          ...Object.fromEntries(fetchedAverages),
        }));
      }
    },
    []
  );

  const fillMarksFromApi = (rows: MarkRow[]) => {
    const obj: Record<string, { mark: string; detail: string }> = {};
    rows.forEach((r) => {
      const student = r.student as StudentDoc;
      const sid = String(student?._id ?? r.student);
      obj[sid] = { mark: String(r.mark ?? ""), detail: String(r.detail ?? "") };
    });
    setMarks(obj);
  };

  // ——— CRUD (Exams)
  const handleAddExam = async (e: React.FormEvent) => {
    e.preventDefault();

    // التحقق من البيانات قبل الإرسال
    if (!newExam.name || !newExam.date || !newExam.time) {
      await Swal.fire({
        icon: "warning",
        title: "تنبيه",
        text: "يرجى ملء جميع الحقول المطلوبة",
        confirmButtonText: "حسناً",
        confirmButtonColor: "#059669",
      });
      return;
    }

    // التحقق من اختيار الحلقة للمعلم
    if (
      role === "teacher" &&
      teacherGroups.length > 0 &&
      !selectedGroupForExam
    ) {
      await Swal.fire({
        icon: "warning",
        title: "تنبيه",
        text: "يرجى اختيار الحلقة",
        confirmButtonText: "حسناً",
        confirmButtonColor: "#059669",
      });
      return;
    }

    // التحقق من وقت الامتحان (من 09:00 إلى 19:00)
    if (!isTimeWithinAllowedRange(newExam.time)) {
      await Swal.fire({
        icon: "warning",
        title: "تنبيه",
        text: "وقت الامتحان يجب أن يكون بين 09:00 صباحاً و 07:00 مساءً",
        confirmButtonText: "حسناً",
        confirmButtonColor: "#059669",
      });
      return;
    }

    // منع إضافة امتحان لنفس الحلقة في نفس اليوم
    const targetGroup = role === "teacher" ? selectedGroupForExam : "";
    const hasSameGroupSameDay = exams.some((ex) => {
      const g1 = String(ex.group ?? "");
      const g2 = String(targetGroup ?? "");
      return String(ex.date ?? "") === String(newExam.date ?? "") && g1 === g2;
    });
    if (hasSameGroupSameDay) {
      await Swal.fire({
        icon: "error",
        title: "غير مسموح",
        text:
          targetGroup
            ? "لا يمكن إضافة امتحان لنفس الحلقة في نفس اليوم"
            : "لا يمكن إضافة امتحان عام لنفس اليوم",
        confirmButtonText: "حسناً",
        confirmButtonColor: "#DC2626",
      });
      return;
    }

    console.log("📤 إرسال بيانات الامتحان:", newExam);
    console.log("📋 الحلقة المختارة:", selectedGroupForExam);

    try {
      // إضافة الحلقة للمعلم
      const examData = {
        ...newExam,
        group: role === "teacher" ? selectedGroupForExam : undefined,
      };

      const added: Exam = await createExam(examData);
      console.log("✅ تم إنشاء الامتحان بنجاح:", added);

      setExams((prev) => {
        const next = [...prev, added];
        setExamAverages((p) => ({
          ...p,
          [String(added._id ?? added.id)]: null,
        }));
        return next;
      });

      // إذا كان المعلم هو من أضاف الامتحان، نضيف العلامات فقط لطلاب الحلقة المختارة
      if (
        role === "teacher" &&
        selectedGroupForExam &&
        teacherGroups.length > 0
      ) {
        try {
          console.log("🔍 جلب طلاب الحلقة:", selectedGroupForExam);

          // جلب جميع الطلاب
          const allStudentsResponse = await getAllStudents();
          const allStudents = allStudentsResponse.success
            ? allStudentsResponse.data || []
            : [];

          // فلترة الطلاب حسب الحلقة المختارة
          const groupStudents = allStudents.filter(
            (student: any) => student.group === selectedGroupForExam
          );

          console.log(
            `✅ عدد الطلاب في الحلقة ${selectedGroupForExam}: ${groupStudents.length}`
          );

          if (groupStudents.length > 0) {
            // إنشاء سجلات علامات فارغة للطلاب
            const marksArray = groupStudents.map((student: any) => ({
              student: student._id,
              mark: null,
              detail: "",
            }));

            const examId = String(added._id ?? added.id);
            await bulkSaveMarks(examId, { marks: marksArray });
            console.log(
              `✅ تم تهيئة الامتحان لـ ${groupStudents.length} طالب من الحلقة`
            );
          }
        } catch (error) {
          console.error("خطأ في تهيئة علامات الطلاب:", error);
        }
      }

      await Swal.fire({
        icon: "success",
        title: "تم بنجاح",
        text: "تم إضافة الامتحان بنجاح",
        confirmButtonText: "حسناً",
        confirmButtonColor: "#059669",
        timer: 2000,
      });

      setShowAddExamModal(false);
      setNewExam({ name: "", date: "", time: "" });
    } catch (error) {
      console.error("❌ Error adding exam:", error);

      // عرض رسالة خطأ واضحة للمستخدم
      let errorMessage = "حدث خطأ أثناء إضافة الامتحان";

      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as any;
        if (axiosError.response?.data?.error) {
          errorMessage = axiosError.response.data.error;
        } else if (axiosError.response?.status === 400) {
          errorMessage =
            "البيانات المدخلة غير صحيحة. تأكد من ملء جميع الحقول بشكل صحيح.";
        }
      }

      await Swal.fire({
        icon: "error",
        title: "خطأ",
        text: errorMessage,
        confirmButtonText: "حسناً",
        confirmButtonColor: "#DC2626",
      });
    }
  };

  const handleEditExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editExam) return;
    const examId = String(editExam._id ?? editExam.id);
    // التحقق من وقت الامتحان (من 09:00 إلى 19:00)
    if (!isTimeWithinAllowedRange(editExam.time)) {
      await Swal.fire({
        icon: "warning",
        title: "تنبيه",
        text: "وقت الامتحان يجب أن يكون بين 09:00 صباحاً و 07:00 مساءً",
        confirmButtonText: "حسناً",
        confirmButtonColor: "#059669",
      });
      return;
    }

    // منع تعديل الامتحان ليصبح مكرر لنفس الحلقة في نفس اليوم
    const hasConflict = exams.some((ex) => {
      const exId = String(ex._id ?? ex.id ?? "");
      if (exId === examId) return false;
      const sameDate = String(ex.date ?? "") === String(editExam.date ?? "");
      const sameGroup = String(ex.group ?? "") === String(editExam.group ?? "");
      return sameDate && sameGroup;
    });
    if (hasConflict) {
      await Swal.fire({
        icon: "error",
        title: "غير مسموح",
        text: editExam.group
          ? "يوجد بالفعل امتحان لهذه الحلقة في هذا اليوم"
          : "يوجد بالفعل امتحان عام في هذا اليوم",
        confirmButtonText: "حسناً",
        confirmButtonColor: "#DC2626",
      });
      return;
    }
    try {
      const updated = await updateExam(examId, editExam);
      setExams((prev) =>
        prev.map((ex) => (String(ex._id ?? ex.id) === examId ? updated : ex))
      );

      await Swal.fire({
        icon: "success",
        title: "تم بنجاح",
        text: "تم تعديل الامتحان بنجاح",
        confirmButtonText: "حسناً",
        confirmButtonColor: "#059669",
        timer: 2000,
      });

      setShowEditExamModal(false);
      setEditExam(null);
    } catch (error) {
      console.error("Error updating exam:", error);
      await Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "حدث خطأ أثناء تعديل الامتحان",
        confirmButtonText: "حسناً",
        confirmButtonColor: "#DC2626",
      });
    }
  };

  const handleDeleteExam = async (examIdRaw: string | number) => {
    const examId = String(examIdRaw);

    const result = await Swal.fire({
      icon: "warning",
      title: "تأكيد الحذف",
      text: "هل أنت متأكد من حذف الامتحان؟ لا يمكن التراجع عن هذا الإجراء!",
      showCancelButton: true,
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
      confirmButtonColor: "#DC2626",
      cancelButtonColor: "#6B7280",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteExam(examId);
      setExams((prev) => prev.filter((e) => String(e._id ?? e.id) !== examId));
      setExamAverages((prev) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [examId]: removed, ...rest } = prev;
        return rest;
      });

      await Swal.fire({
        icon: "success",
        title: "تم الحذف",
        text: "تم حذف الامتحان بنجاح",
        confirmButtonText: "حسناً",
        confirmButtonColor: "#059669",
        timer: 2000,
      });
    } catch (error) {
      console.error("Error deleting exam:", error);
      await Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "حدث خطأ أثناء حذف الامتحان",
        confirmButtonText: "حسناً",
        confirmButtonColor: "#DC2626",
      });
    }
  };

  // ——— CRUD (Marks)
  const handleAddMark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam) return;
    const marksArr = students.map((s) => ({
      student: s._id,
      mark: marks[s._id]?.mark ? Number(marks[s._id].mark) : null,
      detail: marks[s._id]?.detail || "",
    }));
    try {
      const examId = String(selectedExam._id ?? selectedExam.id);
      await bulkSaveMarks(examId, { marks: marksArr });

      await Swal.fire({
        icon: "success",
        title: "تم بنجاح",
        text: "تم حفظ جميع العلامات بنجاح",
        confirmButtonText: "حسناً",
        confirmButtonColor: "#059669",
        timer: 2000,
      });

      setShowMarkModal(false);
      setMarks({});
      setSelectedExam(null);
      refreshAverageForExam(examId);
    } catch (error) {
      console.error("Error saving marks:", error);
      await Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "حدث خطأ أثناء حفظ العلامات",
        confirmButtonText: "حسناً",
        confirmButtonColor: "#DC2626",
      });
    }
  };

  const handleDeleteMark = async (
    examIdRaw: string | number,
    studentIdRaw: string | number
  ) => {
    const examId = String(examIdRaw);
    const studentId = String(studentIdRaw);

    const result = await Swal.fire({
      icon: "warning",
      title: "تأكيد الحذف",
      text: "هل أنت متأكد من حذف العلامة؟",
      showCancelButton: true,
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
      confirmButtonColor: "#DC2626",
      cancelButtonColor: "#6B7280",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteStudentMark(examId, studentId);
      setMarks((prev) => ({ ...prev, [studentId]: { mark: "", detail: "" } }));
      refreshAverageForExam(examId);

      await Swal.fire({
        icon: "success",
        title: "تم الحذف",
        text: "تم حذف العلامة بنجاح",
        confirmButtonText: "حسناً",
        confirmButtonColor: "#059669",
        timer: 1500,
      });
    } catch (error) {
      console.error("Error deleting mark:", error);
      await Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "حدث خطأ أثناء حذف العلامة",
        confirmButtonText: "حسناً",
        confirmButtonColor: "#DC2626",
      });
    }
  };

  // ——— فتح مودال العلامات: جلب الطلاب + علامات الامتحان الحالية
  useEffect(() => {
    if (!showMarkModal || !selectedExam) return;

    // إلغاء أي طلبات سابقة
    markModalAbortRef.current?.abort();
    const ac = new AbortController();
    markModalAbortRef.current = ac;

    (async () => {
      try {
        setLoadingStudents(true);
        const examId = String(selectedExam._id ?? selectedExam.id);

        // 1) الطلاب
        console.log("Fetching students from API...");
        const studentResponse = await getAllStudents();
        let sData = studentResponse.success ? studentResponse.data || [] : [];
        console.log("Students data received:", sData);
        console.log(
          "Number of students:",
          Array.isArray(sData) ? sData.length : "Not an array"
        );

        // فلترة الطلاب حسب حلقة الامتحان المحدد
        if (selectedExam.group) {
          // إذا كان للامتحان حلقة محددة، عرض فقط طلاب هذه الحلقة
          console.log("🔍 فلترة الطلاب حسب حلقة الامتحان:", selectedExam.group);

          sData = sData.filter((student: any) => {
            return student.group === selectedExam.group;
          });

          console.log(
            `✅ عدد الطلاب في حلقة "${selectedExam.group}": ${sData.length}`
          );
        } else if (role === "teacher" && teacherGroups.length > 0) {
          // إذا لم يكن للامتحان حلقة محددة (امتحان قديم)، عرض طلاب جميع حلقات المعلم
          try {
            const userStr = localStorage.getItem("user");
            if (userStr) {
              const currentUser = JSON.parse(userStr);
              const possibleNames = getTeacherPossibleNames(currentUser);

              console.log("🔍 فلترة الطلاب حسب حلقات المعلم:", teacherGroups);

              // فلترة الطلاب الذين ينتمون لحلقات هذا المعلم
              sData = sData.filter((student: any) => {
                const studentGroup = student.group;
                const studentTeacher = student.teacher;

                // التحقق من أن الطالب ينتمي لإحدى حلقات المعلم
                const inTeacherGroup = teacherGroups.includes(studentGroup);

                // أو التحقق من أن معلم الطالب هو نفس المعلم الحالي
                const hasTeacher =
                  studentTeacher &&
                  isTeacherMatch(studentTeacher, possibleNames);

                return inTeacherGroup || hasTeacher;
              });

              console.log(`✅ عدد الطلاب بعد الفلترة: ${sData.length}`);
            }
          } catch (error) {
            console.error("خطأ في فلترة طلاب المعلم:", error);
          }
        }

        if (!ac.signal.aborted) setStudents(Array.isArray(sData) ? sData : []);

        // 2) العلامات الحالية
        try {
          const mData: MarkRow[] = await getExamMarks(examId);
          if (!ac.signal.aborted && Array.isArray(mData))
            fillMarksFromApi(mData);
        } catch {
          // لا يوجد علامات بعد
        }
      } catch (error) {
        console.error("Error fetching students or marks:", error);
        if (!ac.signal.aborted) setStudents([]);
      } finally {
        if (!ac.signal.aborted) setLoadingStudents(false);
      }
    })();

    return () => ac.abort();
  }, [showMarkModal, selectedExam, role, teacherGroups.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // جلب حلقات المعلم من Groups API
  useEffect(() => {
    const fetchTeacherGroups = async () => {
      if (role !== "teacher") {
        setTeacherGroups([]);
        return;
      }

      try {
        const userStr = localStorage.getItem("user");
        if (!userStr) return;

        const currentUser = JSON.parse(userStr);

        console.log("🔍 جلب حلقات المعلم من Groups API...");

        // جلب الحلقات مباشرة من Groups API
        const { getAllGroups } = await import("../Api/groupApi");
        const groupsRes = await getAllGroups();

        if (!groupsRes.success || !Array.isArray(groupsRes.data)) {
          console.error("❌ فشل في جلب الحلقات");
          setTeacherGroups([]);
          return;
        }

        const possibleNames = getTeacherPossibleNames(currentUser);
        console.log("📋 أسماء المعلم المحتملة:", possibleNames);
        console.log("📊 إجمالي الحلقات في النظام:", groupsRes.data.length);

        // فلترة الحلقات التي تخص هذا المعلم
        const teacherGroupsData = groupsRes.data.filter((group: any) => {
          if (!group.teacher) {
            return false;
          }

          const isMatch = isTeacherMatch(group.teacher, possibleNames);
          if (isMatch) {
            console.log(
              `✅ حلقة مطابقة: ${group.name} - معلمها: ${group.teacher}`
            );
          }
          return isMatch;
        });

        const groupNames = teacherGroupsData
          .map((g: any) => g.name)
          .sort((a: string, b: string) => a.localeCompare(b, "ar"));
        console.log(`📋 حلقات المعلم النهائية:`, groupNames);
        setTeacherGroups(groupNames);

        // تحديد أول حلقة تلقائياً للفورم
        if (groupNames.length > 0 && !selectedGroupForExam) {
          setSelectedGroupForExam(groupNames[0]);
        }
      } catch (error) {
        console.error("خطأ في جلب حلقات المعلم:", error);
        setTeacherGroups([]);
      }
    };

    fetchTeacherGroups();
  }, [role]); // eslint-disable-line react-hooks/exhaustive-deps

  // ——— عند التحميل: جلب الامتحانات + المتوسطات
  useEffect(() => {
    const loadExams = async () => {
      setLoadingExams(true);
      try {
        let list: Exam[] = await getAllExams();
        console.log("Fetched exams:", list.length); // لتتبع عدد الامتحانات

        // فلترة الامتحانات للطالب - عرض فقط امتحانات حلقته
        if (role === "student") {
          try {
            const userStr = localStorage.getItem("user");
            if (userStr) {
              const currentUser = JSON.parse(userStr);
              const studentGroup = currentUser.group; // حلقة الطالب

              console.log("👨‍🎓 حلقة الطالب:", studentGroup);

              if (studentGroup) {
                // عرض فقط الامتحانات التي تنتمي لحلقة الطالب أو الامتحانات بدون حلقة محددة
                list = list.filter((exam) => {
                  // إذا لم يكن للامتحان حلقة محددة، يعني للجميع (امتحان إداري)
                  if (!exam.group) return true;

                  // إذا كان للامتحان حلقة محددة، تحقق من تطابقها مع حلقة الطالب
                  return exam.group === studentGroup;
                });

                console.log(
                  `✅ عدد الامتحانات بعد الفلترة للطالب: ${list.length}`
                );
              } else {
                console.warn(
                  "⚠️ الطالب ليس لديه حلقة محددة - لن يرى أي امتحانات خاصة بالحلقات"
                );
                // عرض فقط الامتحانات بدون حلقة (الامتحانات العامة)
                list = list.filter((exam) => !exam.group);
              }
            }
          } catch (error) {
            console.error("خطأ في فلترة امتحانات الطالب:", error);
          }
        }

        // فلترة الامتحانات للمعلم - عرض فقط امتحانات حلقاته
        if (role === "teacher") {
          try {
            const userStr = localStorage.getItem("user");
            if (userStr) {
              const currentUser = JSON.parse(userStr);

              console.log("👨‍🏫 معلم - جلب حلقات المعلم...");

              // جلب الحلقات من Groups API
              const { getAllGroups } = await import("../Api/groupApi");
              const groupsRes = await getAllGroups();

              if (groupsRes.success && Array.isArray(groupsRes.data)) {
                const possibleNames = getTeacherPossibleNames(currentUser);
                console.log("📋 أسماء المعلم المحتملة:", possibleNames);

                // فلترة الحلقات التي تخص هذا المعلم
                const teacherGroupsData = groupsRes.data.filter(
                  (group: any) => {
                    if (!group.teacher) return false;
                    return isTeacherMatch(group.teacher, possibleNames);
                  }
                );

                const teacherGroupNames = teacherGroupsData.map(
                  (g: any) => g.name
                );
                console.log(`📋 حلقات المعلم:`, teacherGroupNames);

                if (teacherGroupNames.length > 0) {
                  // فلترة الامتحانات لتظهر فقط امتحانات حلقات هذا المعلم أو الامتحانات العامة
                  list = list.filter((exam) => {
                    // إذا لم يكن للامتحان حلقة محددة، يعني للجميع (امتحان إداري)
                    if (!exam.group) return true;

                    // إذا كان للامتحان حلقة محددة، تحقق من أنها من حلقات المعلم
                    const match = teacherGroupNames.includes(exam.group);
                    if (match) {
                      console.log(
                        "✅ امتحان مطابق للمعلم:",
                        exam.name,
                        "-",
                        exam.group
                      );
                    }
                    return match;
                  });
                  console.log(`📋 عدد الامتحانات للمعلم: ${list.length}`);
                } else {
                  console.warn("⚠️ المعلم ليس لديه حلقات محددة");
                  // عرض فقط الامتحانات العامة (بدون حلقة)
                  list = list.filter((exam) => !exam.group);
                }
              } else {
                console.error("❌ فشل في جلب الحلقات");
                // عرض فقط الامتحانات العامة
                list = list.filter((exam) => !exam.group);
              }
            }
          } catch (error) {
            console.error("خطأ في فلترة امتحانات المعلم:", error);
          }
        }

        setExams(list);
        await refreshAllAverages(list);
      } catch (error) {
        handleFetchError(error, "Error fetching exams");
        setExams([]);
        setExamAverages({});
      } finally {
        setLoadingExams(false);
      }
    };

    loadExams();
  }, [refreshAllAverages, role, getTeacherPossibleNames, isTeacherMatch]);

  // 🔄 Auto-refresh when socket receives updates
  useEffect(() => {
    if (socketLastUpdate) {
      console.log('🔄 ExamSchedule Socket update received, refreshing exams...');
      const reloadExams = async () => {
        try {
          let list: Exam[] = await getAllExams();
          
          // Apply same filters as initial load
          if (role === "student") {
            const userStr = localStorage.getItem("user");
            if (userStr) {
              const currentUser = JSON.parse(userStr);
              const studentGroup = currentUser.group;
              if (studentGroup) {
                list = list.filter((exam) => !exam.group || exam.group === studentGroup);
              } else {
                list = list.filter((exam) => !exam.group);
              }
            }
          }

          if (role === "teacher") {
            const userStr = localStorage.getItem("user");
            if (userStr) {
              const currentUser = JSON.parse(userStr);
              const { getAllGroups } = await import("../Api/groupApi");
              const groupsRes = await getAllGroups();
              if (groupsRes.success && Array.isArray(groupsRes.data)) {
                const possibleNames = getTeacherPossibleNames(currentUser);
                const teacherGroupsData = groupsRes.data.filter((group: any) => {
                  if (!group.teacher) return false;
                  return isTeacherMatch(group.teacher, possibleNames);
                });
                const teacherGroupNames = teacherGroupsData.map((g: any) => g.name);
                if (teacherGroupNames.length > 0) {
                  list = list.filter((exam) => !exam.group || teacherGroupNames.includes(exam.group));
                } else {
                  list = list.filter((exam) => !exam.group);
                }
              } else {
                list = list.filter((exam) => !exam.group);
              }
            }
          }

          setExams(list);
          await refreshAllAverages(list);
        } catch (error) {
          console.error('Error refreshing exams:', error);
        }
      };
      reloadExams();
    }
  }, [socketLastUpdate, role, getTeacherPossibleNames, isTeacherMatch, refreshAllAverages]);

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

  // ——— مكوّنات عرض صغيرة
  const ResultBadge: React.FC<{ text?: string }> = ({ text }) => (
    <Badge intent={text && text.trim() ? "success" : "muted"}>
      {text && text.trim() ? text : "-"}
    </Badge>
  );

  const AvgBadge: React.FC<{ value: number | null | undefined }> = ({
    value,
  }) => <ResultBadge text={formatAvg(value) ?? ""} />;

  // مكون محسّن لعرض علامة الطالب مع Progress Bar
  const StudentMarkDisplay: React.FC<{ 
    mark: string | undefined; 
    isDesktop?: boolean 
  }> = ({ mark, isDesktop = false }) => {
    if (!mark || mark.trim() === "") {
      return (
        <div className={cn(
          "flex items-center justify-center",
          isDesktop ? "gap-2" : "flex-col gap-1"
        )}>
          <span className="text-gray-400 text-sm font-medium">
            لم يتم التصحيح
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      );
    }

    const markNum = parseFloat(mark);
    const percentage = (markNum / 100) * 100;
    
    // تحديد اللون حسب العلامة
    let colorClasses = {
      bg: "bg-emerald-500",
      text: "text-emerald-700",
      ring: "ring-emerald-200",
      gradient: "from-emerald-400 to-emerald-600"
    };

    if (markNum < 50) {
      colorClasses = {
        bg: "bg-red-500",
        text: "text-red-700",
        ring: "ring-red-200",
        gradient: "from-red-400 to-red-600"
      };
    } else if (markNum < 75) {
      colorClasses = {
        bg: "bg-amber-500",
        text: "text-amber-700",
        ring: "ring-amber-200",
        gradient: "from-amber-400 to-amber-600"
      };
    }

    if (isDesktop) {
      return (
        <div className="flex items-center gap-3 min-w-[120px]">
          <div className="flex flex-col items-center">
            <div className={cn(
              "text-2xl font-bold mb-1",
              colorClasses.text
            )}>
              {markNum}
            </div>
            <div className="text-xs text-gray-500">من 100</div>
          </div>
          <div className="flex-1 min-w-[60px]">
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500 bg-gradient-to-r",
                  colorClasses.gradient
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>
      );
    }

    // Mobile view
    return (
      <div className="w-full space-y-2">
        <div className="flex items-center justify-between">
          <span className={cn("text-xl font-bold", colorClasses.text)}>
            {markNum}
          </span>
          <span className="text-sm text-gray-500">من 100</span>
        </div>
        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 bg-gradient-to-r shadow-sm",
              colorClasses.gradient
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="text-xs text-center text-gray-600">
          {percentage >= 75 ? "ممتاز" : percentage >= 50 ? "جيد" : "يحتاج تحسين"}
        </div>
      </div>
    );
  };

  // ——— واجهة المستخدم
  return (
    <div
      className="max-w-8xl mx-auto px-4 md:px-8 pt-4 md:pt-8 pb-16 md:pb-20"
      dir="rtl"
      lang="ar">
      {/* 🔌 Socket Connection Indicator - للمطورين فقط */}
      {import.meta.env.DEV && (
        <div className="fixed top-20 left-4 z-50">
          <div className="relative group">
            <div
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                socketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-yellow-500'
              }`}
            />
            <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-lg">
              <div className="font-semibold mb-1">
                {socketConnected ? '✓ متصل بالسوكت' : '⚠ غير متصل'}
              </div>
              {socketId && (
                <div className="text-gray-300 text-[10px] mb-1">
                  ID: {socketId.slice(0, 8)}...
                </div>
              )}
              {socketLastUpdate && (
                <div className="text-gray-400 text-[10px]">
                  آخر تحديث: {new Date(socketLastUpdate).toLocaleTimeString('ar-EG')}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* العنوان */}
      <div className="mb-6">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-emerald-700 tracking-tight">
          جدول الامتحانات
        </h2>
        <p className="text-center text-sm text-emerald-900/70 mt-2">
          الامتحانات القادمة تظهر هنا، والنتائج تُعرض بعد التصحيح.
        </p>
      </div>

      {/* شريط الأدوات */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="بحث باسم الامتحان أو التاريخ..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full sm:w-64 border border-emerald-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300"
          />
          <div className="hidden sm:flex items-center gap-1">
            <span className="text-sm text-emerald-800/70">فرز حسب:</span>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as "date" | "name")}
              className="border border-emerald-200 rounded-lg px-2 py-1 bg-white text-sm">
              <option value="date">التاريخ</option>
              <option value="name">الاسم</option>
            </select>
            <button
              className="border border-emerald-200 rounded-lg px-2 py-1 text-sm bg-white"
              onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
              title="عكس اتجاه الفرز">
              {sortDir === "asc" ? "↑" : "↓"}
            </button>
          </div>
        </div>

        {(role === "teacher" || role === "admin") && (
          <div className="flex items-center justify-end gap-2">
            {loadingExams ? (
              // Skeleton placeholder for Add Exam button (sync with table skeleton)
              <div
                className="h-10 w-48 rounded-lg bg-gradient-to-r from-emerald-100 via-emerald-200 to-emerald-100 bg-[length:200%_100%] animate-shimmer"
                aria-hidden="true"
              />
            ) : role === "teacher" && teacherGroups.length === 0 ? (
              <div className="text-amber-600 text-sm flex items-center gap-2">
                <span>⚠️</span>
                <span>لا يوجد لديك حلقات مسجلة</span>
              </div>
            ) : (
              <PillButton
                onClick={() => setShowAddExamModal(true)}
                disabled={role === "teacher" && teacherGroups.length === 0}
              >
                {role === "teacher"
                  ? "إضافة امتحان للحلقة"
                  : "إضافة امتحان لكل الطلاب"}
              </PillButton>
            )}
          </div>
        )}
      </div>

      {/* البطاقة + الجدول */}
      <div className="bg-white/90 backdrop-blur rounded-2xl border border-emerald-100 shadow-[0_10px_30px_rgba(16,185,129,0.08)] overflow-hidden">
        {/* جدول للشاشات المتوسطة فما فوق */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[920px] text-center align-middle">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gradient-to-l from-emerald-600 to-emerald-500 text-white">
                <th className="px-6 py-4 text-base font-bold whitespace-nowrap">اسم الامتحان</th>
                <th className="px-6 py-4 text-base font-bold whitespace-nowrap">الحلقة</th>
                <th className="px-6 py-4 text-base font-bold whitespace-nowrap">التاريخ</th>
                <th className="px-6 py-4 text-base font-bold whitespace-nowrap">الوقت</th>
                <th className="px-6 py-4 text-base font-bold whitespace-nowrap">
                  {role === "teacher" || role === "admin"
                    ? "متوسط العلامات"
                    : "النتيجة"}
                </th>
                {(role === "teacher" || role === "admin") && (
                  <th className="px-6 py-4 text-base font-bold whitespace-nowrap">إجراءات</th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-emerald-50">
              {/* Skeleton with Shimmer */}
              {loadingExams && (
                <>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <tr key={`sk-${i}`} className="animate-fadeIn">
                      <td className="px-4 py-4">
                        <div className="h-4 w-40 mx-auto rounded-lg bg-gradient-to-r from-emerald-100 via-emerald-200 to-emerald-100 bg-[length:200%_100%] animate-shimmer" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-6 w-20 mx-auto rounded-full bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 bg-[length:200%_100%] animate-shimmer" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-4 w-24 mx-auto rounded-lg bg-gradient-to-r from-emerald-100 via-emerald-200 to-emerald-100 bg-[length:200%_100%] animate-shimmer" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-4 w-16 mx-auto rounded-lg bg-gradient-to-r from-emerald-100 via-emerald-200 to-emerald-100 bg-[length:200%_100%] animate-shimmer" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-6 w-12 mx-auto rounded-full bg-gradient-to-r from-emerald-100 via-emerald-200 to-emerald-100 bg-[length:200%_100%] animate-shimmer" />
                      </td>
                      {(role === "teacher" || role === "admin") && (
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <div className="h-8 w-32 rounded-lg bg-gradient-to-r from-emerald-100 via-emerald-200 to-emerald-100 bg-[length:200%_100%] animate-shimmer" />
                            <div className="h-8 w-16 rounded-lg bg-gradient-to-r from-amber-100 via-amber-200 to-amber-100 bg-[length:200%_100%] animate-shimmer" />
                            <div className="h-8 w-14 rounded-lg bg-gradient-to-r from-red-100 via-red-200 to-red-100 bg-[length:200%_100%] animate-shimmer" />
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </>
              )}

              {/* لا يوجد بيانات */}
              {!loadingExams && filteredSortedExams.length === 0 && (
                <tr>
                  <td
                    colSpan={role === "teacher" || role === "admin" ? 6 : 5}
                    className="px-6 py-16">
                    <div className="flex flex-col items-center justify-center text-center animate-fadeIn">
                      <div className="bg-emerald-50 w-20 h-20 rounded-full flex items-center justify-center mb-4">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-10 w-10 text-emerald-400"
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
                      </div>
                      <h3 className="text-xl font-bold text-emerald-700 mb-2">
                        {query ? "لا توجد نتائج" : "لا توجد امتحانات"}
                      </h3>
                      <p className="text-emerald-600/70 text-sm">
                        {query 
                          ? "جرّب البحث بكلمات أخرى"
                          : "لم يتم إضافة أي امتحانات بعد"
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {/* عناصر الجدول */}
              {!loadingExams &&
                filteredSortedExams.map((exam, idx) => {
                  const examId = String(exam._id ?? exam.id ?? "");
                  const zebra = idx % 2 === 0;
                  return (
                    <tr
                      key={examId}
                      className={cn(
                        zebra ? "bg-emerald-50/30" : "bg-white",
                        "hover:bg-emerald-50 transition-colors"
                      )}>
                      <td className="px-6 py-4 font-semibold text-emerald-900 whitespace-nowrap">
                        {exam.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {exam.group ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            <span>📚</span>
                            {exam.group}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-emerald-700 font-medium">
                            {formatDateArabic(exam.date)}
                          </span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-emerald-500"
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
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-emerald-700 font-medium">
                            {formatTime12Arabic(exam.time)}
                          </span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-emerald-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {role === "teacher" || role === "admin" ? (
                          <AvgBadge value={examAverages[examId]} />
                        ) : (
                          <StudentMarkDisplay mark={studentMarks[examId]} isDesktop={true} />
                        )}
                      </td>
                      {(role === "teacher" || role === "admin") && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <PillButton
                              className="whitespace-nowrap"
                              onClick={() => {
                                setSelectedExam(exam);
                                setShowMarkModal(true);
                              }}>
                              إضافة العلامات
                            </PillButton>
                            <PillButton
                              variant="warn"
                              onClick={() => {
                                setEditExam({ ...exam });
                                setShowEditExamModal(true);
                              }}>
                              تعديل
                            </PillButton>
                            <PillButton
                              variant="danger"
                              onClick={() => handleDeleteExam(examId)}>
                              حذف
                            </PillButton>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* بطاقات للموبايل */}
        <div className="md:hidden divide-y divide-emerald-50">
          {loadingExams &&
            Array.from({ length: 5 }).map((_, i) => (
              <div key={`m-sk-${i}`} className="p-4 animate-fadeIn">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 space-y-3">
                    <div className="h-5 w-48 rounded-lg bg-gradient-to-r from-emerald-100 via-emerald-200 to-emerald-100 bg-[length:200%_100%] animate-shimmer" />
                    <div className="h-5 w-24 rounded-full bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 bg-[length:200%_100%] animate-shimmer" />
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-20 rounded-lg bg-gradient-to-r from-emerald-100 via-emerald-200 to-emerald-100 bg-[length:200%_100%] animate-shimmer" />
                      <div className="h-4 w-14 rounded-lg bg-gradient-to-r from-emerald-100 via-emerald-200 to-emerald-100 bg-[length:200%_100%] animate-shimmer" />
                    </div>
                  </div>
                  <div className="h-7 w-12 rounded-full bg-gradient-to-r from-emerald-100 via-emerald-200 to-emerald-100 bg-[length:200%_100%] animate-shimmer" />
                </div>
                {(role === "teacher" || role === "admin") && (
                  <div className="flex gap-2 mt-3">
                    <div className="h-10 flex-1 rounded-lg bg-gradient-to-r from-emerald-100 via-emerald-200 to-emerald-100 bg-[length:200%_100%] animate-shimmer" />
                    <div className="h-10 w-16 rounded-lg bg-gradient-to-r from-amber-100 via-amber-200 to-amber-100 bg-[length:200%_100%] animate-shimmer" />
                    <div className="h-10 w-14 rounded-lg bg-gradient-to-r from-red-100 via-red-200 to-red-100 bg-[length:200%_100%] animate-shimmer" />
                  </div>
                )}
              </div>
            ))}

          {!loadingExams && filteredSortedExams.length === 0 && (
            <div className="p-8 flex flex-col items-center justify-center text-center animate-fadeIn">
              <div className="bg-emerald-50 w-20 h-20 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-emerald-400"
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
              </div>
              <h3 className="text-lg font-bold text-emerald-700 mb-2">
                {query ? "لا توجد نتائج" : "لا توجد امتحانات"}
              </h3>
              <p className="text-emerald-600/70 text-sm">
                {query 
                  ? "جرّب البحث بكلمات أخرى"
                  : "لم يتم إضافة أي امتحانات بعد"
                }
              </p>
            </div>
          )}

          {!loadingExams &&
            filteredSortedExams.map((exam) => {
              const examId = String(exam._id ?? exam.id ?? "");
              return (
                <div key={`m-${examId}`} className="p-4">
                  <div>
                    <div className="text-base font-extrabold text-emerald-900 mb-2">
                      {exam.name}
                    </div>
                    {exam.group && (
                      <div className="mb-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          <span>📚</span>
                          {exam.group}
                        </span>
                      </div>
                    )}
                    <div className="mb-3 text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-emerald-600">📅</span>
                        <span className="text-emerald-800 font-medium">{formatDateArabic(exam.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-600">⏰</span>
                        <span className="text-emerald-800">{formatTime12Arabic(exam.time)}</span>
                      </div>
                    </div>

                    {/* عرض العلامة أو المتوسط */}
                    {role === "teacher" || role === "admin" ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">المتوسط:</span>
                        <AvgBadge value={examAverages[examId]} />
                      </div>
                    ) : (
                      <div className="mt-3 bg-gray-50 rounded-xl p-3">
                        <div className="text-xs text-gray-600 mb-2 font-medium">علامتك:</div>
                        <StudentMarkDisplay mark={studentMarks[examId]} isDesktop={false} />
                      </div>
                    )}
                  </div>

                  {(role === "teacher" || role === "admin") && (
                    <div className="mt-3 flex gap-2">
                      <PillButton
                        className="whitespace-nowrap"
                        onClick={() => {
                          setSelectedExam(exam);
                          setShowMarkModal(true);
                        }}>
                        إضافة العلامات
                      </PillButton>
                      <PillButton
                        variant="warn"
                        onClick={() => {
                          setEditExam({ ...exam });
                          setShowEditExamModal(true);
                        }}>
                        تعديل
                      </PillButton>
                      <PillButton
                        variant="danger"
                        onClick={() => handleDeleteExam(examId)}>
                        حذف
                      </PillButton>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* ———————————————— مودال: إضافة امتحان ———————————————— */}
      <TransparentModal
        open={showAddExamModal}
        onClose={() => setShowAddExamModal(false)}
        maxWidth="max-w-lg"
        ariaLabel="إضافة امتحان جديد"
        title="إضافة امتحان جديد"
        gradientFrom="emerald-500"
        gradientTo="teal-600"
        icon={
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
        }>
        {role === "teacher" && teacherGroups.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-600 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-bold mb-1">ملاحظة:</p>
                <p>سيتم إضافة هذا الامتحان فقط لطلاب الحلقة المحددة أدناه.</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleAddExam} className="space-y-6">
          {/* اسم الامتحان */}
          <div>
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              اسم الامتحان
              <span className="text-rose-600">*</span>
            </label>
            <input
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition duration-200 outline-none"
              type="text"
              value={newExam.name}
              onChange={(e) =>
                setNewExam((p) => ({ ...p, name: e.target.value }))
              }
              placeholder="مثلاً: اختبار القرآن الشهري"
              required
            />
          </div>

          {/* التاريخ والوقت */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
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
                <span className="text-rose-600">*</span>
              </label>
              <input
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition duration-200 outline-none"
                type="date"
                value={newExam.date}
                onChange={(e) =>
                  setNewExam((p) => ({ ...p, date: e.target.value }))
                }
                required
              />
            </div>
            <div>
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                الوقت
                <span className="text-rose-600">*</span>
              </label>
              <input
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition duration-200 outline-none"
                type="time"
                min="09:00"
                max="19:00"
                value={newExam.time}
                onChange={(e) =>
                  setNewExam((p) => ({ ...p, time: e.target.value }))
                }
                required
              />
            </div>
          </div>

          {/* اختيار الحلقة للمعلم */}
          {role === "teacher" && teacherGroups.length > 0 && (
            <div>
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                اختر الحلقة
                <span className="text-rose-600">*</span>
              </label>
              <select
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition duration-200 outline-none bg-white"
                value={selectedGroupForExam}
                onChange={(e) => setSelectedGroupForExam(e.target.value)}
                required>
                {teacherGroups.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={() => setShowAddExamModal(false)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition duration-200 border-2 border-gray-200">
              إلغاء
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium py-3 px-8 rounded-xl transition duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]">
              إضافة الامتحان
            </button>
          </div>
        </form>
      </TransparentModal>

      {/* ———————————————— مودال: تعديل الامتحان ———————————————— */}
      <TransparentModal
        open={
          (role === "teacher" || role === "admin") &&
          showEditExamModal &&
          !!editExam
        }
        onClose={() => setShowEditExamModal(false)}
        maxWidth="max-w-lg"
        ariaLabel="تعديل الامتحان"
        title="تعديل الامتحان"
        gradientFrom="amber-500"
        gradientTo="orange-600"
        icon={
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
        }>
        {editExam ? (
          <form onSubmit={handleEditExam} className="space-y-6">
            {/* اسم الامتحان */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 text-sm font-bold mb-3">
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
                اسم الامتحان
                <span className="text-rose-600">*</span>
              </label>
              <input
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition duration-200 outline-none"
                type="text"
                value={editExam.name}
                onChange={(e) =>
                  setEditExam((p) => (p ? { ...p, name: e.target.value } : p))
                }
                required
              />
            </div>

            {/* التاريخ والوقت */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-gray-700 text-sm font-bold mb-3">
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  التاريخ
                  <span className="text-rose-600">*</span>
                </label>
                <input
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition duration-200 outline-none"
                  type="date"
                  value={editExam.date}
                  onChange={(e) =>
                    setEditExam((p) => (p ? { ...p, date: e.target.value } : p))
                  }
                  required
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-gray-700 text-sm font-bold mb-3">
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  الوقت
                  <span className="text-rose-600">*</span>
                </label>
                <input
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition duration-200 outline-none"
                  type="time"
                  min="09:00"
                  max="19:00"
                  value={editExam.time}
                  onChange={(e) =>
                    setEditExam((p) => (p ? { ...p, time: e.target.value } : p))
                  }
                  required
                />
              </div>
            </div>

            {/* عرض الحلقة فقط للمعلم */}
            {editExam.group && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-sm text-blue-800">
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
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <span className="font-semibold">الحلقة:</span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                    <span>📚</span>
                    {editExam.group}
                  </span>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 mt-8">
              <button
                type="button"
                onClick={() => setShowEditExamModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition duration-200 border-2 border-gray-200">
                إلغاء
              </button>
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-medium py-3 px-8 rounded-xl transition duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]">
                حفظ التعديل
              </button>
            </div>
          </form>
        ) : null}
      </TransparentModal>

      {/* ———————————————— مودال: إدارة العلامات ———————————————— */}
      <TransparentModal
        open={showMarkModal && !!selectedExam}
        onClose={() => setShowMarkModal(false)}
        maxWidth="max-w-4xl"
        ariaLabel="إضافة علامات الطلاب للامتحان">
        <h3 className="text-2xl font-bold mb-6 text-center text-emerald-700 border-b pb-4">
          إضافة علامات للامتحان: {selectedExam?.name}
        </h3>

        {loadingStudents ? (
          <div className="text-center py-8 text-emerald-600">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            جاري تحميل الطلاب...
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-8 text-emerald-600">
            <div className="text-xl mb-2">📋</div>
            لا يوجد طلاب مسجلين في النظام حالياً
          </div>
        ) : (
          <form onSubmit={handleAddMark} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {students.map((student) => {
                const sid = student._id;
                const fullName =
                  student.name ??
                  `${student.firstName ?? ""} ${student.lastName ?? ""}`.trim();
                return (
                  <div
                    key={sid}
                    className="border rounded-xl p-4 bg-emerald-50/80 shadow-sm">
                    <div className="font-bold mb-3 text-emerald-700 text-center">
                      {fullName || "طالب"}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-emerald-700 mb-1">
                          العلامة
                        </label>
                        <input
                          className="w-full border border-emerald-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
                          type="number"
                          min="0"
                          max="100"
                          value={marks[sid]?.mark ?? ""}
                          onChange={(e) =>
                            setMarks((m) => ({
                              ...m,
                              [sid]: {
                                ...(m[sid] ?? { mark: "", detail: "" }),
                                mark: e.target.value,
                              },
                            }))
                          }
                          placeholder="0-100"
                        />
                      </div>

                      {marks[sid]?.mark && (
                        <div className="flex gap-2">
                          <PillButton
                            variant="warn"
                            type="button"
                            className="text-xs flex-1"
                            onClick={async () => {
                              if (!selectedExam) return;
                              const examId = safeExamId(selectedExam);
                              if (!examId) return;
                              const newMark = marks[sid]?.mark ?? "";
                              try {
                                await updateStudentMark(examId, sid, {
                                  mark: newMark ? Number(newMark) : null,
                                  detail: "",
                                });
                                refreshAverageForExam(examId);
                              } catch (error) {
                                console.error(
                                  "Error updating student mark:",
                                  error
                                );
                                await Swal.fire({
                                  icon: "error",
                                  title: "خطأ",
                                  text: "حدث خطأ أثناء حفظ العلامة",
                                  confirmButtonText: "حسناً",
                                  confirmButtonColor: "#DC2626",
                                });
                              }
                            }}>
                            حفظ فردي
                          </PillButton>

                          <PillButton
                            variant="danger"
                            type="button"
                            className="text-xs flex-1"
                            onClick={() => {
                              if (!selectedExam) return;
                              const examId = safeExamId(selectedExam);
                              if (!examId) return;
                              handleDeleteMark(examId, sid);
                            }}>
                            حذف
                          </PillButton>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <PillButton type="submit" className="text-lg px-6 py-3">
                حفظ جميع العلامات
              </PillButton>
              <PillButton
                type="button"
                variant="neutral"
                className="text-lg px-6 py-3"
                onClick={() => {
                  setShowMarkModal(false);
                  setMarks({});
                  setSelectedExam(null);
                }}>
                إلغاء
              </PillButton>
            </div>
          </form>
        )}
      </TransparentModal>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.98);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }

        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ExamSchedule;
