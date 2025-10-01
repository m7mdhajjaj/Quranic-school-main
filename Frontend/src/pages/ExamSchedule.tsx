import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * ExamSchedule.tsx — نسخة كاملة
 *
 * الميزات:
 * - جدول امتحانات مع تصميم لطيف (سطور متناوبة + ترويسة ثابتة)
 * - بطاقات للموبايل
 * - مودالات شفافة (الخلفية تبقى ظاهرة) لإضافة/تعديل الامتحان وإدارة العلامات
 * - جلب الطلاب عند فتح مودال العلامات + تعبئة العلامات الحالية تلقائياً
 * - حفظ علامات كل الطلاب دفعة واحدة (متوافق مع bulkWrite بالباكند)
 * - تعديل/حذف علامة طالب واحد
 * - إظهار متوسط علامات جميع الطلاب لكل امتحان (للمعلم/المشرف) عبر مسار /average
 * - إظهار نتيجة الطالب الفردية (للطلاب) عبر مسار /student/:id
 * - حالات تحميل (Skeleton) + حالات عدم وجود بيانات
 * - تحسينات صغيرة: بحث/فرز/تصفية بسيطة
 *
 * ملاحظات:
 * - يعتمد على Tailwind CSS.
 * - يعتمد على API endpoints التالية:
 *   GET  /api/exams
 *   POST /api/exams
 *   PUT  /api/exams/:examId
 *   DELETE /api/exams/:examId
 *
 *   GET  /api/students
 *
 *   GET  /api/exam-marks/:examId               -> كل العلامات لامتحان
 *   GET  /api/exam-marks/:examId/average       -> { average, count }
 *   POST /api/exam-marks/:examId               -> { marks: [{ student, mark, detail }] }
 *   PUT  /api/exam-marks/:examId/:studentId
 *   DELETE /api/exam-marks/:examId/:studentId
 */

// =========================
// إعدادات وروابط API
// =========================
const API_URL = "http://localhost:5005/api/exams";
const STUDENTS_URL = "http://localhost:5005/api/students";
const EXAM_MARKS_URL = "http://localhost:5005/api/exam-marks";

// حصول على توكن المستخدم
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: token ? `Bearer ${token}` : "",
    "Content-Type": "application/json",
  };
};

// =========================
// الأنواع (Types)
// =========================
interface Exam {
  _id?: string;
  id?: number;
  name: string;
  date: string; // ISO (yyyy-mm-dd) أو نص
  time: string; // HH:mm
  result?: string; // للطالب فقط (غير مستخدمة للمعلم)
}

interface StudentDoc {
  _id: string;
  firstName?: string;
  lastName?: string;
  name?: string; // بعض الأنظمة قد ترسل حقل name موحّد
}

interface MarkRow {
  _id?: string;
  exam: string | Exam;
  student: string | StudentDoc;
  mark: string | number | null;
  detail?: string;
}

// =========================
// أدوات مساعدة
// =========================
const isNumberLike = (v: unknown) => {
  if (v === null || v === undefined) return false;
  const s = String(v).trim();
  if (s === "") return false;
  const n = Number(s);
  return Number.isFinite(n);
};

const toNumberOrNull = (v: unknown): number | null => {
  if (!isNumberLike(v)) return null;
  return Number(v);
};

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
const handleFetchError = (error: any, message: string) => {
  console.error(`${message}:`, error);
  if (error.response?.status === 401) {
    // خطأ في المصادقة
    console.warn("Authentication error, redirecting to login...");
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

  const [showMarkModal, setShowMarkModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  const [students, setStudents] = useState<StudentDoc[]>([]);
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

  // ——— مساعدات API
  const fetchExamAverage = async (examId: string): Promise<number | null> => {
    try {
      const res = await fetch(`${EXAM_MARKS_URL}/${examId}/average`);
      if (!res.ok) return null;
      const data = await res.json(); // { average, count }
      const avg = typeof data?.average === "number" ? data.average : null;
      return avg;
    } catch {
      return null;
    }
  };

  const refreshAverageForExam = async (examId: string) => {
    const avg = await fetchExamAverage(examId);
    setExamAverages((prev) => ({ ...prev, [examId]: avg }));
  };

  const refreshAllAverages = async (list: Exam[]) => {
    const entries = await Promise.all(
      list.map(async (ex) => {
        const id = String(ex._id ?? ex.id);
        const avg = await fetchExamAverage(id);
        return [id, avg] as const;
      })
    );
    setExamAverages(Object.fromEntries(entries));
  };

  const fillMarksFromApi = (rows: MarkRow[]) => {
    const obj: Record<string, { mark: string; detail: string }> = {};
    rows.forEach((r) => {
      const sid = String((r.student as any)?._id ?? r.student);
      obj[sid] = { mark: String(r.mark ?? ""), detail: String(r.detail ?? "") };
    });
    setMarks(obj);
  };

  // ——— CRUD (Exams)
  const handleAddExam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newExam),
      });
      if (res.ok) {
        const added: Exam = await res.json();
        setExams((prev) => {
          const next = [...prev, added];
          setExamAverages((p) => ({
            ...p,
            [String(added._id ?? added.id)]: null,
          }));
          return next;
        });
        setShowAddExamModal(false);
        setNewExam({ name: "", date: "", time: "" });
      }
    } catch {}
  };

  const handleEditExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editExam) return;
    const examId = String(editExam._id ?? editExam.id);
    try {
      await fetch(`${API_URL}/${examId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editExam),
      });
      setExams((prev) =>
        prev.map((ex) => (String(ex._id ?? ex.id) === examId ? editExam : ex))
      );
      setShowEditExamModal(false);
      setEditExam(null);
    } catch {}
  };

  const handleDeleteExam = async (examIdRaw: string | number) => {
    const examId = String(examIdRaw);
    if (!window.confirm("هل أنت متأكد من حذف الامتحان؟")) return;
    try {
      await fetch(`${API_URL}/${examId}`, { method: "DELETE" });
      setExams((prev) => prev.filter((e) => String(e._id ?? e.id) !== examId));
      setExamAverages((prev) => {
        const { [examId]: _, ...rest } = prev;
        return rest;
      });
    } catch {}
  };

  // ——— CRUD (Marks)
  const handleAddMark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam) return;
    const marksArr = students.map((s) => ({
      student: s._id,
      mark: marks[s._id]?.mark ?? "",
      detail: marks[s._id]?.detail ?? "",
    }));
    try {
      const examId = String(selectedExam._id ?? selectedExam.id);
      await fetch(`${EXAM_MARKS_URL}/${examId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marks: marksArr }),
      });
      setShowMarkModal(false);
      setMarks({});
      setSelectedExam(null);
      refreshAverageForExam(examId);
    } catch {}
  };

  const handleDeleteMark = async (
    examIdRaw: string | number,
    studentIdRaw: string | number
  ) => {
    const examId = String(examIdRaw);
    const studentId = String(studentIdRaw);
    if (!window.confirm("هل أنت متأكد من حذف العلامة؟")) return;
    try {
      await fetch(`${EXAM_MARKS_URL}/${examId}/${studentId}`, {
        method: "DELETE",
      });
      setMarks((prev) => ({ ...prev, [studentId]: { mark: "", detail: "" } }));
      refreshAverageForExam(examId);
    } catch {}
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
        const examId = String(selectedExam._id ?? selectedExam.id);

        // 1) الطلاب
        const sRes = await fetch(STUDENTS_URL, { signal: ac.signal });
        const sData: StudentDoc[] = await sRes.json();
        if (!ac.signal.aborted) setStudents(Array.isArray(sData) ? sData : []);

        // 2) العلامات الحالية
        const mRes = await fetch(`${EXAM_MARKS_URL}/${examId}`, {
          signal: ac.signal,
        });
        if (mRes.ok) {
          const mData: MarkRow[] = await mRes.json();
          if (!ac.signal.aborted && Array.isArray(mData))
            fillMarksFromApi(mData);
        }
      } catch {
        // تجاهل الأخطاء (إغلاق مفاجئ مثلًا)
      }
    })();

    return () => ac.abort();
  }, [showMarkModal, selectedExam]);

  // ——— عند التحميل: جلب الامتحانات + المتوسطات
  useEffect(() => {
    setLoadingExams(true);
    (async () => {
      try {
        const res = await fetch(API_URL, {
          headers: getAuthHeaders(),
        });

        if (!res.ok) {
          console.error("Server responded with error:", res.status);
          setExams([]);
          return;
        }

        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        console.log("Fetched exams:", list.length); // لتتبع عدد الامتحانات
        setExams(list);
        await refreshAllAverages(list);
      } catch (error) {
        handleFetchError(error, "Error fetching exams");
        setExams([]);
        setExamAverages({});
      } finally {
        setLoadingExams(false);
      }
    })();
  }, []);

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
          const res = await fetch(`${EXAM_MARKS_URL}/student/${sid}`, {
            headers: getAuthHeaders(),
          });

          if (!res.ok) {
            console.error("Error fetching student marks:", res.status);
            return;
          }

          const data = await res.json();
          console.log("Student marks data received:", typeof data);

          const rows = Array.isArray(data) ? data : [];
          const map: Record<string, string> = {};

          rows.forEach((r) => {
            const exId = String((r.exam as any)?._id ?? (r as any).exam ?? "");
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
              onChange={(e) => setSortKey(e.target.value as any)}
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
            <PillButton onClick={() => setShowAddExamModal(true)}>
              إضافة امتحان لكل الطلاب
            </PillButton>
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
                    colSpan={role === "teacher" || role === "admin" ? 5 : 4}
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
        maxWidth="max-w-3xl"
        ariaLabel="إضافة علامات الطلاب للامتحان">
        <h3 className="text-xl font-bold mb-6 text-center text-blue-700 border-b pb-3">
          إضافة علامات الطلاب للامتحان
        </h3>

        <div className="fixed inset-0 bg-emerald-100/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/95 rounded-2xl shadow-2xl p-6 w-full max-w-md border border-emerald-200 overflow-y-auto max-h-[80vh]">
            <h3 className="text-xl font-bold mb-4 text-center text-emerald-700">
              إضافة علامة للامتحان
            </h3>
            <form onSubmit={handleAddMark} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {students.map((student) => {
                  const sid = student._id;
                  const fullName =
                    student.name ??
                    `${student.firstName ?? ""} ${
                      student.lastName ?? ""
                    }`.trim();
                  return (
                    <div
                      key={sid}
                      className="border rounded-xl p-4 bg-emerald-50/80 shadow-sm">
                      <div className="font-bold mb-2 text-emerald-700 text-lg">
                        {fullName || "طالب"}
                      </div>

                      <Field label="العلامة">
                        <input
                          className="w-full border border-emerald-300 rounded-lg px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-lg bg-white placeholder:text-emerald-400"
                          type="text"
                          inputMode="decimal"
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
                          placeholder="مثلاً 85"
                        />
                      </Field>

                      <Field label="تفاصيل / ملاحظة">
                        <input
                          className="w-full border border-emerald-300 rounded-lg px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-lg bg-white placeholder:text-emerald-400"
                          type="text"
                          value={marks[sid]?.detail ?? ""}
                          onChange={(e) =>
                            setMarks((m) => ({
                              ...m,
                              [sid]: {
                                ...(m[sid] ?? { mark: "", detail: "" }),
                                detail: e.target.value,
                              },
                            }))
                          }
                          placeholder="اختياري"
                        />
                      </Field>

                      <div className="flex gap-2 mt-2">
                        <PillButton
                          variant="warn"
                          type="button"
                          onClick={async () => {
                            if (!selectedExam) return;
                            const examId = safeExamId(selectedExam);
                            if (!examId) return;
                            const newMark = marks[sid]?.mark ?? "";
                            const newDetail = marks[sid]?.detail ?? "";
                            try {
                              await fetch(
                                `${EXAM_MARKS_URL}/${examId}/${sid}`,
                                {
                                  method: "PUT",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                    mark: newMark,
                                    detail: newDetail,
                                  }),
                                }
                              );
                              refreshAverageForExam(examId);
                            } catch {}
                          }}>
                          تعديل سريع
                        </PillButton>

                        <PillButton
                          variant="danger"
                          type="button"
                          onClick={() => {
                            if (!selectedExam) return;
                            const examId = safeExamId(selectedExam);
                            if (!examId) return;
                            handleDeleteMark(examId, sid);
                          }}>
                          حذف العلامة
                        </PillButton>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between mt-4">
                <PillButton type="submit">حفظ جميع العلامات</PillButton>
                <PillButton
                  type="button"
                  variant="neutral"
                  onClick={() => setShowMarkModal(false)}>
                  إلغاء
                </PillButton>
              </div>
            </form>
          </div>
        </div>
      </TransparentModal>
    </div>
  );
};

export default ExamSchedule;
