import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Search,
  BookOpen,
  Calendar,
  ArrowRight,
  ChevronRight,
  CheckSquare,
  Square,
  ClipboardList,
} from "lucide-react";
import {
  getTeacherGroupsForMarks,
  getAllExams,
  type TeacherGroup,
  type TeacherGroupStudent,
  type Exam as ExamType,
} from "@/Api/ExamShedule";
import { getExamMarks } from "@/Api/ExamShedule";
import { showSuccessToast, showErrorToast } from "@/utils/toastUtils";
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
  const [editingMarkId, setEditingMarkId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(
    new Set()
  );
  const [isDeleting, setIsDeleting] = useState(false);

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
      showErrorToast("حدث خطأ أثناء جلب بيانات الحلقات");
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
      showErrorToast("حدث خطأ أثناء جلب الامتحانات");
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
        showErrorToast("لم يتم العثور على الحلقة");
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
    } catch (error) {
      console.error("Error fetching students and marks:", error);
      showErrorToast("حدث خطأ أثناء جلب البيانات");
      setStudents([]);
      setMarks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMark = async (studentId: string, studentName: string) => {
    if (!selectedExam) return;

    try {
      const response = await api.post(`/exam-schedule/marks`, {
        examId: selectedExam._id,
        studentId,
        mark: 0,
      });

      // تحديث فوري للواجهة
      const newMark: Mark = {
        _id: response.data.mark?._id || response.data._id,
        studentId,
        studentName,
        mark: 0,
        examId: String(selectedExam._id),
      };
      setMarks((prevMarks) => [...prevMarks, newMark]);
      showSuccessToast("تم إضافة العلامة بنجاح");
    } catch (error) {
      console.error("Error adding mark:", error);
      showErrorToast("حدث خطأ أثناء إضافة العلامة");
    }
  };

  const handleUpdateMark = async (markId: string, newMark: number) => {
    if (
      !selectedExam ||
      newMark < 0 ||
      newMark > (selectedExam.totalMarks || 100)
    ) {
      showErrorToast(
        `العلامة يجب أن تكون بين 0 و ${selectedExam?.totalMarks || 100}`
      );
      return;
    }

    // تحديث فوري للواجهة (Optimistic Update)
    const previousMarks = [...marks];
    setMarks(
      marks.map((m) => (m._id === markId ? { ...m, mark: newMark } : m))
    );
    setEditingMarkId(null);

    try {
      await api.put(`/exam-schedule/marks/${markId}`, { mark: newMark });
      showSuccessToast("تم تحديث العلامة بنجاح");
    } catch (error) {
      console.error("Error updating mark:", error);
      // إرجاع التغيير في حالة الخطأ
      setMarks(previousMarks);
      showErrorToast("حدث خطأ أثناء تحديث العلامة");
    }
  };

  const handleDeleteMark = async (markId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه العلامة؟")) return;

    // حذف فوري من الواجهة (Optimistic Delete)
    const previousMarks = [...marks];
    setMarks(marks.filter((m) => m._id !== markId));

    try {
      await api.delete(`/exam-schedule/marks/${markId}`);
      showSuccessToast("تم حذف العلامة بنجاح");
    } catch (error) {
      console.error("Error deleting mark:", error);
      // إرجاع التغيير في حالة الخطأ
      setMarks(previousMarks);
      showErrorToast("حدث خطأ أثناء حذف العلامة");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedStudents.size === 0) {
      showErrorToast("الرجاء اختيار علامات للحذف");
      return;
    }

    if (!confirm(`هل أنت متأكد من حذف ${selectedStudents.size} علامة؟`)) return;

    if (!selectedExam) return;

    setIsDeleting(true);
    const previousMarks = [...marks];
    const studentIdsArray = Array.from(selectedStudents);

    // حذف فوري
    setMarks(marks.filter((m) => !selectedStudents.has(m.studentId)));
    setSelectedStudents(new Set());

    try {
      await api.post(`/exam-schedule/marks/bulk-delete`, {
        examId: selectedExam._id,
        studentIds: studentIdsArray,
      });
      showSuccessToast(`تم حذف ${studentIdsArray.length} علامة بنجاح`);
    } catch (error) {
      console.error("Error bulk deleting marks:", error);
      setMarks(previousMarks);
      showErrorToast("حدث خطأ أثناء حذف العلامات");
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
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-lg p-6">
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
              setViewMode("groups");
              setSelectedGroup("");
              setSelectedExam(null);
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
                  setViewMode("exams");
                  setSelectedExam(null);
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
                <div className="bg-gradient-to-l from-emerald-500 to-teal-600 p-6">
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
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ابحث عن طالب..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
              />
            </div>

            {/* Bulk Actions */}
            {selectedStudents.size > 0 && (
              <div
                className="flex items-center justify-between bg-emerald-50 p-3 rounded-lg"
                dir="rtl">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-700">
                    تم اختيار {selectedStudents.size} طالب
                  </span>
                </div>
                <button
                  onClick={handleBulkDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-lg transition-colors text-sm font-medium">
                  <Trash2 className="w-4 h-4" />
                  {isDeleting ? "جاري الحذف..." : "حذف المحدد"}
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
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">
                    الإجراءات
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
                    const studentMark = getStudentMark(student._id);
                    const isEditing = editingMarkId === studentMark?._id;

                    return (
                      <tr
                        key={student._id}
                        className={`border-b border-gray-100 hover:bg-emerald-50/50 transition-colors ${
                          selectedStudents.has(student._id)
                            ? "bg-emerald-100/50"
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
                              <CheckSquare className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <Square className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                        </td>

                        {/* اسم الطالب */}
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {student.name}
                        </td>

                        {/* الحلقة */}
                        <td className="px-6 py-4 text-sm text-gray-700 text-center">
                          {student.group}
                        </td>

                        {/* العلامة */}
                        <td className="px-6 py-4 text-center">
                          {studentMark ? (
                            isEditing ? (
                              <input
                                type="number"
                                min={0}
                                max={selectedExam.totalMarks}
                                value={editValue}
                                onChange={(e) =>
                                  setEditValue(Number(e.target.value))
                                }
                                className="w-20 px-3 py-2 border-2 border-emerald-500 rounded-lg text-center focus:ring-2 focus:ring-emerald-100 outline-none"
                                autoFocus
                              />
                            ) : (
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-lg font-bold text-sm ${
                                  studentMark.mark >=
                                  (selectedExam.totalMarks || 100) * 0.5
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}>
                                {studentMark.mark} /{" "}
                                {selectedExam.totalMarks || 100}
                              </span>
                            )
                          ) : (
                            <span className="text-gray-400 text-sm">
                              لم يتم الإدخال
                            </span>
                          )}
                        </td>

                        {/* الإجراءات */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {studentMark ? (
                              isEditing ? (
                                <>
                                  <button
                                    onClick={() =>
                                      handleUpdateMark(
                                        studentMark._id!,
                                        editValue
                                      )
                                    }
                                    className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                                    title="حفظ">
                                    <Save className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setEditingMarkId(null)}
                                    className="p-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                                    title="إلغاء">
                                    <X className="w-4 h-4" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditingMarkId(studentMark._id!);
                                      setEditValue(studentMark.mark);
                                    }}
                                    className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                                    title="تعديل">
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteMark(studentMark._id!)
                                    }
                                    className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                                    title="حذف">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )
                            ) : (
                              <button
                                onClick={() =>
                                  handleAddMark(student._id, student.name)
                                }
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors text-sm font-medium">
                                <Plus className="w-4 h-4" />
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
        </div>
      )}
    </div>
  );
};

export default MarksManagement;
