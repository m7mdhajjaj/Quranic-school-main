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

// =========================
// إعدادات API تم نقلها إلى Api/examApi.ts
// =========================

// =========================
// الأنواع (Types) تم نقلها إلى Api/examApi.ts
// =========================

// =========================
// أدوات مساعدة
// =========================

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
}> = ({
  open,
  onClose,
  maxWidth = "max-w-lg",
  children,
  cardClassName,
  ariaLabel,
}) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 bg-transparent flex items-center justify-center z-50"
      role="dialog"
      aria-label={ariaLabel ?? "Modal"}
      aria-modal
      onMouseDown={(e) => {
        // إغلاق عند الضغط خارج البطاقة
        if (e.target === e.currentTarget) onClose();
      }}>
      <div
        className={cn(
          "bg-white/90 backdrop-blur rounded-2xl border shadow-2xl p-6 w-full",
          maxWidth,
          cardClassName ?? "border-emerald-200"
        )}>
        {children}
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
      const entries = await Promise.all(
        list.map(async (ex) => {
          const id = String(ex._id ?? ex.id);
          const avg = await fetchExamAverage(id);
          return [id, avg] as const;
        })
      );
      setExamAverages(Object.fromEntries(entries));
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
      alert("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    // التحقق من اختيار الحلقة للمعلم
    if (
      role === "teacher" &&
      teacherGroups.length > 0 &&
      !selectedGroupForExam
    ) {
      alert("يرجى اختيار الحلقة");
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

      alert(errorMessage);
    }
  };

  const handleEditExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editExam) return;
    const examId = String(editExam._id ?? editExam.id);
    try {
      const updated = await updateExam(examId, editExam);
      setExams((prev) =>
        prev.map((ex) => (String(ex._id ?? ex.id) === examId ? updated : ex))
      );
      setShowEditExamModal(false);
      setEditExam(null);
    } catch (error) {
      console.error("Error updating exam:", error);
    }
  };

  const handleDeleteExam = async (examIdRaw: string | number) => {
    const examId = String(examIdRaw);
    if (!window.confirm("هل أنت متأكد من حذف الامتحان؟")) return;
    try {
      await deleteExam(examId);
      setExams((prev) => prev.filter((e) => String(e._id ?? e.id) !== examId));
      setExamAverages((prev) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [examId]: removed, ...rest } = prev;
        return rest;
      });
    } catch (error) {
      console.error("Error deleting exam:", error);
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
      setShowMarkModal(false);
      setMarks({});
      setSelectedExam(null);
      refreshAverageForExam(examId);
    } catch (error) {
      console.error("Error saving marks:", error);
    }
  };

  const handleDeleteMark = async (
    examIdRaw: string | number,
    studentIdRaw: string | number
  ) => {
    const examId = String(examIdRaw);
    const studentId = String(studentIdRaw);
    if (!window.confirm("هل أنت متأكد من حذف العلامة؟")) return;
    try {
      await deleteStudentMark(examId, studentId);
      setMarks((prev) => ({ ...prev, [studentId]: { mark: "", detail: "" } }));
      refreshAverageForExam(examId);
    } catch (error) {
      console.error("Error deleting mark:", error);
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

  // ——— واجهة المستخدم
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6" dir="rtl" lang="ar">
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
            {role === "teacher" && teacherGroups.length === 0 ? (
              <div className="text-amber-600 text-sm flex items-center gap-2">
                <span>⚠️</span>
                <span>لا يوجد لديك حلقات مسجلة</span>
              </div>
            ) : (
              <PillButton
                onClick={() => setShowAddExamModal(true)}
                disabled={role === "teacher" && teacherGroups.length === 0}>
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
        <div className="hidden md:block overflow-auto">
          <table className="min-w-full text-center align-middle">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gradient-to-l from-emerald-600 to-emerald-500 text-white">
                <th className="px-4 py-3 text-sm font-bold">اسم الامتحان</th>
                <th className="px-4 py-3 text-sm font-bold">الحلقة</th>
                <th className="px-4 py-3 text-sm font-bold">التاريخ</th>
                <th className="px-4 py-3 text-sm font-bold">الوقت</th>
                <th className="px-4 py-3 text-sm font-bold">
                  {role === "teacher" || role === "admin"
                    ? "متوسط العلامات"
                    : "النتيجة"}
                </th>
                {(role === "teacher" || role === "admin") && (
                  <th className="px-4 py-3 text-sm font-bold">إجراءات</th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-emerald-50">
              {/* Skeleton */}
              {loadingExams && (
                <>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <tr key={`sk-${i}`} className="animate-pulse">
                      <td className="px-4 py-4">
                        <div className="h-3.5 w-40 mx-auto rounded bg-emerald-100" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-3.5 w-32 mx-auto rounded bg-emerald-100" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-3.5 w-24 mx-auto rounded bg-emerald-100" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-3.5 w-16 mx-auto rounded bg-emerald-100" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-6 w-10 mx-auto rounded-full bg-emerald-100" />
                      </td>
                      {(role === "teacher" || role === "admin") && (
                        <td className="px-4 py-4">
                          <div className="h-8 w-28 mx-auto rounded bg-emerald-100" />
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
                    className="px-6 py-10 text-emerald-700/70">
                    لا توجد امتحانات مطابقة لبحثك.
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
                      <td className="px-4 py-3 font-semibold text-emerald-900">
                        {exam.name}
                      </td>
                      <td className="px-4 py-3">
                        {exam.group ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            <span>📚</span>
                            {exam.group}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-emerald-800">
                        {exam.date}
                      </td>
                      <td className="px-4 py-3 text-emerald-800">
                        {exam.time}
                      </td>
                      <td className="px-4 py-3">
                        {role === "teacher" || role === "admin" ? (
                          <AvgBadge value={examAverages[examId]} />
                        ) : (
                          <ResultBadge text={studentMarks[examId] ?? ""} />
                        )}
                      </td>
                      {(role === "teacher" || role === "admin") && (
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <PillButton
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
            Array.from({ length: 3 }).map((_, i) => (
              <div key={`m-sk-${i}`} className="p-4 animate-pulse">
                <div className="h-4 w-48 rounded bg-emerald-100 mb-3" />
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-3 w-20 rounded bg-emerald-100" />
                  <div className="h-3 w-14 rounded bg-emerald-100" />
                </div>
              </div>
            ))}

          {!loadingExams && filteredSortedExams.length === 0 && (
            <div className="p-6 text-center text-emerald-700/70">
              لا توجد امتحانات حالياً.
            </div>
          )}

          {!loadingExams &&
            filteredSortedExams.map((exam) => {
              const examId = String(exam._id ?? exam.id ?? "");
              return (
                <div key={`m-${examId}`} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-base font-extrabold text-emerald-900">
                        {exam.name}
                      </div>
                      {exam.group && (
                        <div className="mt-2">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            <span>📚</span>
                            {exam.group}
                          </span>
                        </div>
                      )}
                      <div className="mt-1 text-sm text-emerald-800/80">
                        <span className="ml-2">📅 {exam.date}</span>
                        <span>⏰ {exam.time}</span>
                      </div>
                    </div>
                    {role === "teacher" || role === "admin" ? (
                      <AvgBadge value={examAverages[examId]} />
                    ) : (
                      <ResultBadge text={studentMarks[examId] ?? ""} />
                    )}
                  </div>

                  {(role === "teacher" || role === "admin") && (
                    <div className="mt-3 flex gap-2">
                      <PillButton
                        className="flex-1"
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
        ariaLabel="إضافة امتحان جديد">
        <h3 className="text-2xl font-extrabold mb-6 text-center text-emerald-700 border-b pb-4 tracking-wide">
          إضافة امتحان جديد
        </h3>

        {role === "teacher" && teacherGroups.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <span className="text-blue-600 text-xl">ℹ️</span>
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">ملاحظة:</p>
                <p>سيتم إضافة هذا الامتحان فقط لطلاب الحلقة المحددة أدناه.</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleAddExam} className="space-y-5">
          <Field label="اسم الامتحان" required>
            <input
              className="w-full border border-emerald-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-lg bg-emerald-50 placeholder:text-emerald-400"
              type="text"
              value={newExam.name}
              onChange={(e) =>
                setNewExam((p) => ({ ...p, name: e.target.value }))
              }
              placeholder="مثلاً اختبار القرآن"
              required
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="التاريخ" required>
              <input
                className="w-full border border-emerald-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-lg bg-emerald-50"
                type="date"
                value={newExam.date}
                onChange={(e) =>
                  setNewExam((p) => ({ ...p, date: e.target.value }))
                }
                required
              />
            </Field>
            <Field label="الوقت" required>
              <input
                className="w-full border border-emerald-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-lg bg-emerald-50"
                type="time"
                value={newExam.time}
                onChange={(e) =>
                  setNewExam((p) => ({ ...p, time: e.target.value }))
                }
                required
              />
            </Field>
          </div>

          {/* اختيار الحلقة للمعلم */}
          {role === "teacher" && teacherGroups.length > 0 && (
            <Field label="اختر الحلقة" required>
              <select
                className="w-full border border-emerald-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-lg bg-emerald-50"
                value={selectedGroupForExam}
                onChange={(e) => setSelectedGroupForExam(e.target.value)}
                required>
                {teacherGroups.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </Field>
          )}

          <div className="flex justify-between pt-2">
            <PillButton type="submit">حفظ</PillButton>
            <PillButton
              type="button"
              variant="neutral"
              onClick={() => setShowAddExamModal(false)}>
              إلغاء
            </PillButton>
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
        cardClassName="border-yellow-200"
        ariaLabel="تعديل الامتحان">
        {editExam ? (
          <>
            <h3 className="text-2xl font-extrabold mb-6 text-center text-yellow-700 border-b pb-4 tracking-wide">
              تعديل الامتحان
            </h3>
            <form onSubmit={handleEditExam} className="space-y-5">
              <Field label="اسم الامتحان" required>
                <input
                  className="w-full border border-yellow-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-lg bg-yellow-50 placeholder:text-yellow-400"
                  type="text"
                  value={editExam.name}
                  onChange={(e) =>
                    setEditExam((p) => (p ? { ...p, name: e.target.value } : p))
                  }
                  required
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="التاريخ" required>
                  <input
                    className="w-full border border-yellow-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-lg bg-yellow-50"
                    type="date"
                    value={editExam.date}
                    onChange={(e) =>
                      setEditExam((p) =>
                        p ? { ...p, date: e.target.value } : p
                      )
                    }
                    required
                  />
                </Field>
                <Field label="الوقت" required>
                  <input
                    className="w-full border border-yellow-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-lg bg-yellow-50"
                    type="time"
                    value={editExam.time}
                    onChange={(e) =>
                      setEditExam((p) =>
                        p ? { ...p, time: e.target.value } : p
                      )
                    }
                    required
                  />
                </Field>
              </div>

              {/* عرض الحلقة فقط للمعلم */}
              {editExam.group && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-sm text-blue-800">
                    <span className="font-semibold">الحلقة:</span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                      <span>📚</span>
                      {editExam.group}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-2">
                <PillButton type="submit" variant="warn">
                  حفظ التعديل
                </PillButton>
                <PillButton
                  type="button"
                  variant="neutral"
                  onClick={() => setShowEditExamModal(false)}>
                  إلغاء
                </PillButton>
              </div>
            </form>
          </>
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
    </div>
  );
};

export default ExamSchedule;
