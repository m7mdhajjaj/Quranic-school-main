import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Users,
  Save,
  Search,
  BookOpen,
  Calendar,
  ArrowRight,
  ChevronRight,
  CheckSquare,
  Square,
  ClipboardList,
  AlertTriangle,
} from "lucide-react";
import {
  getTeacherGroupsForMarks,
  getAllExams,
  type TeacherGroup,
  type TeacherGroupStudent,
  type Exam as ExamType,
} from "@/Api/ExamShedule";
import { getExamMarks } from "@/Api/ExamShedule";
import { showSuccessToast } from "@/utils/toastUtils";
import { showErrorMessage } from "@/utils/sweetalertUtils";
import api from "@/Api/api";

// استخدام نوع Student من ExamSchedule API
type Student = TeacherGroupStudent & { group?: string };

interface Mark {
  _id?: string;
  studentId: string;
  studentName: string;
  mark: number;
  examId: string;
}

// نوع للعلامات المحلية (قبل الحفظ)
interface LocalMark {
  studentId: string;
  mark: string; // نص لأن الحقل input
  originalMark: number | null; // العلامة الأصلية من السيرفر
  hasExistingMark: boolean; // هل لديه علامة في السيرفر
}

// استخدام الأنواع من API
type Exam = ExamType;
type GroupCard = TeacherGroup;

interface MarksManagementProps {
  teacherGroups?: string[]; // Optional - not used anymore
}

type ViewMode = "groups" | "exams" | "students";

const MarksManagement: React.FC<MarksManagementProps> = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("groups");
  const [groupsData, setGroupsData] = useState<GroupCard[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(
    new Set()
  );
  const [isDeleting, setIsDeleting] = useState(false);

  // 🆕 State للعلامات المحلية والتغييرات
  const [localMarks, setLocalMarks] = useState<Record<string, LocalMark>>({});
  const [isSaving, setIsSaving] = useState(false);
  const originalMarksRef = useRef<Record<string, number | null>>({});

  // 🆕 حساب إذا كان هناك تغييرات غير محفوظة
  const hasUnsavedChanges = useCallback(() => {
    for (const studentId in localMarks) {
      const local = localMarks[studentId];
      const originalMark = originalMarksRef.current[studentId];
      const currentMark = local.mark === "" ? null : Number(local.mark);
      
      if (currentMark !== originalMark) {
        return true;
      }
    }
    return false;
  }, [localMarks]);

  // 🆕 تحذير عند محاولة الخروج مع وجود تغييرات
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = "لديك تغييرات غير محفوظة. هل أنت متأكد من المغادرة؟";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // جلب بيانات الحلقات عند التحميل
  useEffect(() => {
    fetchGroupsData();
  }, []);

  // جلب الامتحانات للحلقة المختارة
  useEffect(() => {
    if (selectedGroup && viewMode === "exams") {
      fetchExamsForGroup(selectedGroup);
    }
  }, [selectedGroup, viewMode]);

  // جلب الطلاب والعلامات عند اختيار امتحان
  useEffect(() => {
    if (selectedExam && viewMode === "students") {
      fetchStudentsAndMarks();
    }
  }, [selectedExam, viewMode]);

  const fetchGroupsData = async () => {
    try {
      setLoading(true);
      console.log("📊 Fetching teacher groups...");
      const response = await getTeacherGroupsForMarks();
      console.log("✅ Teacher groups received:", response);

      // response.data.groups من Backend
      const groups = response?.data?.groups || [];
      console.log("📚 Groups count:", groups.length);

      // التأكد من وجود مصفوفة students لكل حلقة
      const groupsWithStudents = groups.map((g: any) => ({
        ...g,
        students: g.students || [],
      }));

      if (groupsWithStudents.length === 0) {
        console.log("⚠️ No groups found");
        setGroupsData([]);
      } else {
        console.log(
          "✅ Groups with students:",
          groupsWithStudents.map((g: any) => ({
            name: g.name,
            studentsCount: g.students?.length || 0,
          }))
        );
        setGroupsData(groupsWithStudents);
      }
    } catch (error) {
      console.error("❌ Error fetching groups data:", error);
      showErrorMessage("خطأ", "حدث خطأ أثناء جلب بيانات الحلقات");
      setGroupsData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchExamsForGroup = async (group: string) => {
    try {
      setLoading(true);
      const allExams = await getAllExams({ group });
      setExams(allExams.filter((exam) => exam.group === group));
    } catch (error) {
      console.error("Error fetching exams:", error);
      showErrorMessage("خطأ", "حدث خطأ أثناء جلب الامتحانات");
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsAndMarks = async () => {
    if (!selectedExam) return;

    try {
      setLoading(true);
      const examId = String(selectedExam._id);

      // جلب الطلاب من الحلقة المحددة والعلامات
      const selectedGroupData = groupsData.find(
        (g) => g.name === selectedExam.group
      );

      console.log("📚 Selected group data:", selectedGroupData);
      console.log("📚 Selected exam group:", selectedExam.group);

      if (!selectedGroupData) {
        showErrorMessage("خطأ", "لم يتم العثور على الحلقة");
        setLoading(false);
        return;
      }

      // جلب العلامات
      const marksData = await getExamMarks(examId);
      console.log("📝 Marks data:", marksData);

      // التأكد من وجود مصفوفة الطلاب
      const groupStudents = selectedGroupData.students || [];
      console.log("👥 Group students:", groupStudents);

      // استخدام الطلاب من بيانات الحلقة
      const studentsWithGroup = groupStudents.map((s: any) => ({
        _id: s._id,
        studentId: s.studentId,
        name: s.name || `${s.firstName || ""} ${s.lastName || ""}`.trim(),
        firstName: s.firstName || "",
        lastName: s.lastName || "",
        group: selectedGroupData.name,
      }));

      setStudents(studentsWithGroup);

      // تحويل العلامات إلى الصيغة المطلوبة
      const formattedMarks = Array.isArray(marksData)
        ? marksData.map((m: any) => ({
            _id: m._id,
            studentId:
              typeof m.student === "string" ? m.student : m.student?._id,
            studentName: typeof m.student === "object" ? m.student?.name : "",
            mark: Number(m.mark) || 0,
            examId: examId,
          }))
        : [];

      setMarks(formattedMarks);

      // 🆕 تهيئة العلامات المحلية
      const newLocalMarks: Record<string, LocalMark> = {};
      const newOriginalMarks: Record<string, number | null> = {};

      studentsWithGroup.forEach((student: any) => {
        const existingMark = formattedMarks.find(
          (m: any) => m.studentId === student._id
        );
        
        newLocalMarks[student._id] = {
          studentId: student._id,
          mark: existingMark ? String(existingMark.mark) : "",
          originalMark: existingMark ? existingMark.mark : null,
          hasExistingMark: !!existingMark,
        };
        
        newOriginalMarks[student._id] = existingMark ? existingMark.mark : null;
      });

      setLocalMarks(newLocalMarks);
      originalMarksRef.current = newOriginalMarks;
    } catch (error) {
      console.error("Error fetching students and marks:", error);
      showErrorMessage("خطأ", "حدث خطأ أثناء جلب البيانات");
      setStudents([]);
      setMarks([]);
      setLocalMarks({});
      originalMarksRef.current = {};
    } finally {
      setLoading(false);
    }
  };

  // 🆕 تحديث العلامة المحلية
  const handleLocalMarkChange = (studentId: string, value: string) => {
    // السماح فقط بالأرقام والفراغ
    if (value !== "" && !/^\d*$/.test(value)) return;
    
    // التحقق من الحد الأقصى
    const maxMark = selectedExam?.totalMarks || 100;
    if (value !== "" && Number(value) > maxMark) {
      value = String(maxMark);
    }

    setLocalMarks((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        mark: value,
      },
    }));
  };

  // 🆕 حفظ جميع العلامات
  const handleSaveAllMarks = async () => {
    if (!selectedExam || !hasUnsavedChanges()) return;

    setIsSaving(true);
    
    try {
      const examId = String(selectedExam._id);
      const marksToSave: Array<{ student: string; mark: number }> = [];

      // جمع العلامات التي تغيرت فقط
      for (const studentId in localMarks) {
        const local = localMarks[studentId];
        const originalMark = originalMarksRef.current[studentId];
        const currentMark = local.mark === "" ? null : Number(local.mark);

        // فقط إذا تغيرت العلامة
        if (currentMark !== originalMark && currentMark !== null) {
          marksToSave.push({
            student: studentId,
            mark: currentMark,
          });
        }
      }

      if (marksToSave.length === 0) {
        showSuccessToast("لا توجد تغييرات للحفظ");
        setIsSaving(false);
        return;
      }

      console.log("💾 Saving marks:", marksToSave);

      // إرسال العلامات للسيرفر
      await api.post(`/exam-schedule/marks/bulk/${examId}`, {
        marks: marksToSave,
      });

      // تحديث الأصلي بالقيم الجديدة
      const newOriginalMarks = { ...originalMarksRef.current };
      marksToSave.forEach((m) => {
        newOriginalMarks[m.student] = m.mark;
      });
      originalMarksRef.current = newOriginalMarks;

      // تحديث localMarks
      setLocalMarks((prev) => {
        const updated = { ...prev };
        marksToSave.forEach((m) => {
          if (updated[m.student]) {
            updated[m.student] = {
              ...updated[m.student],
              originalMark: m.mark,
              hasExistingMark: true,
            };
          }
        });
        return updated;
      });

      showSuccessToast(`تم حفظ ${marksToSave.length} علامة بنجاح`);
    } catch (error) {
      console.error("Error saving marks:", error);
      showErrorMessage("خطأ", "حدث خطأ أثناء حفظ العلامات");
    } finally {
      setIsSaving(false);
    }
  };

  // 🆕 التحقق قبل تغيير الصفحة
  const handleNavigateWithCheck = (callback: () => void) => {
    if (hasUnsavedChanges()) {
      if (confirm("لديك تغييرات غير محفوظة. هل تريد المتابعة بدون حفظ؟")) {
        callback();
      }
    } else {
      callback();
    }
  };

  const handleBulkDelete = async () => {
    if (selectedStudents.size === 0) {
      showErrorMessage("خطأ", "الرجاء اختيار علامات للحذف");
      return;
    }

    // فقط الطلاب الذين لديهم علامات محفوظة
    const studentsWithMarks = Array.from(selectedStudents).filter(
      (id) => localMarks[id]?.hasExistingMark
    );

    if (studentsWithMarks.length === 0) {
      showErrorMessage("خطأ", "لا توجد علامات محفوظة للحذف");
      return;
    }

    if (!confirm(`هل أنت متأكد من حذف ${studentsWithMarks.length} علامة؟`)) return;

    if (!selectedExam) return;

    setIsDeleting(true);

    try {
      await api.post(`/exam-schedule/marks/bulk-delete`, {
        examId: selectedExam._id,
        studentIds: studentsWithMarks,
      });

      // تحديث الحالة المحلية
      const newLocalMarks = { ...localMarks };
      const newOriginalMarks = { ...originalMarksRef.current };
      
      studentsWithMarks.forEach((id) => {
        if (newLocalMarks[id]) {
          newLocalMarks[id] = {
            ...newLocalMarks[id],
            mark: "",
            originalMark: null,
            hasExistingMark: false,
          };
        }
        newOriginalMarks[id] = null;
      });

      setLocalMarks(newLocalMarks);
      originalMarksRef.current = newOriginalMarks;
      setSelectedStudents(new Set());

      showSuccessToast(`تم حذف ${studentsWithMarks.length} علامة بنجاح`);
    } catch (error) {
      console.error("Error bulk deleting marks:", error);
      showErrorMessage("خطأ", "حدث خطأ أثناء حذف العلامات");
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleStudentSelection = (studentId: string) => {
    const newSelection = new Set(selectedStudents);
    if (newSelection.has(studentId)) {
      newSelection.delete(studentId);
    } else {
      newSelection.add(studentId);
    }
    setSelectedStudents(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedStudents.size === filteredStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(filteredStudents.map((s) => s._id)));
    }
  };

  const getStudentMark = (studentId: string) => {
    return marks.find((m) => m.studentId === studentId);
  };

  // فلترة محسّنة للأداء
  const filteredStudents = React.useMemo(() => {
    if (!searchQuery.trim()) return students;
    const query = searchQuery.toLowerCase().trim();
    return students.filter((student) => {
      const fullName = student.name.toLowerCase();
      return fullName.includes(query);
    });
  }, [students, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header with Breadcrumb */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Users className="w-8 h-8" />
          إدارة علامات الطلاب
        </h2>
        <p className="text-emerald-50 mt-2">
          إدخال وتعديل وحذف علامات الطلاب لكل حلقة
        </p>

        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 mt-4 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20">
          <button
            onClick={() => {
              handleNavigateWithCheck(() => {
                setViewMode("groups");
                setSelectedGroup("");
                setSelectedExam(null);
                setLocalMarks({});
                originalMarksRef.current = {};
              });
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-all text-white font-medium text-sm">
            <BookOpen className="w-4 h-4" />
            الحلقات
          </button>
          {selectedGroup && (
            <>
              <ChevronRight className="w-5 h-5 text-white/60" />
              <button
                onClick={() => {
                  handleNavigateWithCheck(() => {
                    setViewMode("exams");
                    setSelectedExam(null);
                    setLocalMarks({});
                    originalMarksRef.current = {};
                  });
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-all text-white font-medium text-sm">
                <Calendar className="w-4 h-4" />
                {selectedGroup}
              </button>
            </>
          )}
          {selectedExam && (
            <>
              <ChevronRight className="w-5 h-5 text-white/60" />
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/30 rounded-lg text-white font-bold text-sm">
                <ClipboardList className="w-4 h-4" />
                {selectedExam.name}
              </div>
            </>
          )}
        </div>

        {/* 🆕 تحذير التغييرات غير المحفوظة */}
        {viewMode === "students" && hasUnsavedChanges() && (
          <div className="mt-4 flex items-center gap-2 bg-amber-500/20 border border-amber-400/50 rounded-lg px-4 py-2 text-amber-100">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm font-medium">لديك تغييرات غير محفوظة</span>
          </div>
        )}
      </div>

      {/* View: Groups Cards */}
      {viewMode === "groups" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-600">جاري التحميل...</p>
            </div>
          ) : groupsData.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">
                لا توجد حلقات متاحة
              </p>
              <p className="text-gray-400 text-sm mt-2">
                يرجى التأكد من أن لديك حلقات مسجلة
              </p>
            </div>
          ) : (
            groupsData.map((groupCard) => (
              <div
                key={groupCard.name}
                onClick={() => {
                  setSelectedGroup(groupCard.name);
                  setViewMode("exams");
                }}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 overflow-hidden group"
                dir="rtl">
                <div className="bg-gradient-to-l from-emerald-600 via-teal-700 to-slate-700 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {groupCard.name}
                        </h3>
                        <p className="text-emerald-50 text-sm">حلقة قرآنية</p>
                      </div>
                    </div>
                    <ArrowRight
                      className="w-6 h-6 text-white group-hover:-translate-x-1 transition-transform"
                      style={{ transform: "rotate(180deg)" }}
                    />
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    {/* عدد الطلاب */}
                    <div className="text-center">
                      <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Users className="w-7 h-7 text-emerald-600" />
                      </div>
                      <p className="text-sm text-gray-600 mb-1">الطلاب</p>
                      <p className="text-2xl font-bold text-emerald-600">
                        {groupCard.totalStudents}
                      </p>
                    </div>

                    {/* عدد الامتحانات */}
                    <div className="text-center">
                      <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Calendar className="w-7 h-7 text-blue-600" />
                      </div>
                      <p className="text-sm text-gray-600 mb-1">الامتحانات</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {groupCard.examCount}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* View: Exams List */}
      {viewMode === "exams" && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-emerald-600" />
            امتحانات {selectedGroup}
          </h3>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
            </div>
          ) : exams.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">لا توجد امتحانات في هذه الحلقة</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exams.map((exam) => (
                <div
                  key={exam._id}
                  onClick={() => {
                    setSelectedExam(exam);
                    setViewMode("students");
                  }}
                  className="border-2 border-gray-200 rounded-xl p-4 hover:border-emerald-500 hover:shadow-lg transition-all cursor-pointer group"
                  dir="rtl">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 text-right">
                      <h4 className="font-bold text-gray-800 group-hover:text-emerald-600 transition-colors">
                        {exam.name}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(exam.date).toLocaleDateString("ar", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          timeZone: "Asia/Jerusalem"
                        })}
                      </p>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg font-medium">
                          الدرجة: {exam.totalMarks}
                        </span>
                      </div>
                    </div>
                    <ArrowRight
                      className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 group-hover:-translate-x-1 transition-all"
                      style={{ transform: "rotate(180deg)" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* View: Students Table */}
      {viewMode === "students" && selectedExam && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-200 space-y-4">
            {/* Search + Save Button */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="ابحث عن طالب..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
                />
              </div>
              
              {/* 🆕 زر حفظ الكل */}
              <button
                onClick={handleSaveAllMarks}
                disabled={!hasUnsavedChanges() || isSaving}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${
                  hasUnsavedChanges()
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                <Save className="w-5 h-5" />
                {isSaving ? "جاري الحفظ..." : "حفظ الكل"}
              </button>
            </div>

            {/* Bulk Actions */}
            {selectedStudents.size > 0 && (
              <div
                className="flex items-center justify-between bg-red-50 p-3 rounded-lg"
                dir="rtl">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium text-red-700">
                    تم اختيار {selectedStudents.size} طالب
                  </span>
                </div>
                <button
                  onClick={handleBulkDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-lg transition-colors text-sm font-medium">
                  {isDeleting ? "جاري الحذف..." : "حذف العلامات المحددة"}
                </button>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-emerald-50 border-b-2 border-emerald-200">
                  <th className="px-4 py-3 text-center w-12">
                    <button
                      onClick={toggleSelectAll}
                      className="p-1 hover:bg-emerald-100 rounded transition-colors"
                      title="تحديد الكل">
                      {selectedStudents.size === filteredStudents.length &&
                      filteredStudents.length > 0 ? (
                        <CheckSquare className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                    اسم الطالب
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">
                    الحلقة
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">
                    العلامة (من {selectedExam.totalMarks || 100})
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-gray-500">
                      جاري التحميل...
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-gray-500">
                      لا يوجد طلاب في هذه الحلقة
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student, index) => {
                    const localMark = localMarks[student._id];
                    const currentValue = localMark?.mark ?? "";
                    const originalValue = localMark?.originalMark;
                    const hasChanged = currentValue !== "" 
                      ? Number(currentValue) !== originalValue 
                      : originalValue !== null;

                    return (
                      <tr
                        key={student._id}
                        className={`border-b border-gray-100 hover:bg-emerald-50/50 transition-colors ${
                          selectedStudents.has(student._id)
                            ? "bg-red-100/50"
                            : hasChanged
                            ? "bg-amber-50/50"
                            : index % 2 === 0
                            ? "bg-white"
                            : "bg-gray-50/30"
                        }`}>
                        {/* Checkbox */}
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => toggleStudentSelection(student._id)}
                            className="p-1 hover:bg-emerald-100 rounded transition-colors">
                            {selectedStudents.has(student._id) ? (
                              <CheckSquare className="w-5 h-5 text-red-600" />
                            ) : (
                              <Square className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                        </td>

                        {/* اسم الطالب */}
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          <div className="flex items-center gap-2">
                            {student.name}
                            {hasChanged && (
                              <span className="w-2 h-2 rounded-full bg-amber-500" title="تم التعديل"></span>
                            )}
                          </div>
                        </td>

                        {/* الحلقة */}
                        <td className="px-6 py-4 text-sm text-gray-700 text-center">
                          {student.group}
                        </td>

                        {/* 🆕 العلامة - حقل إدخال مباشر */}
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={currentValue}
                              onChange={(e) => handleLocalMarkChange(student._id, e.target.value)}
                              placeholder="—"
                              className={`w-20 px-3 py-2 border-2 rounded-lg text-center outline-none transition-all ${
                                hasChanged
                                  ? "border-amber-400 bg-amber-50 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                                  : "border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                              }`}
                            />
                            <span className="text-gray-400 text-sm">
                              / {selectedExam.totalMarks || 100}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarksManagement;
