import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import api from "../Api/api";
import Swal from "sweetalert2";
import { useWarningsSocket } from "../Socket/useWarningsSocket";
import { getAllStudents } from "../Api/studentApi";

interface Warning {
  _id: string;
  studentId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  teacherId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  groupId: {
    _id: string;
    name: string;
  };
  type: "warning" | "first" | "second" | "third" | "expulsion";
  reason: string;
  date: string;
  createdAt: string;
}

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  warningsCount?: number;
  existingWarningTypes?: string[]; // أنواع الإنذارات الموجودة مسبقاً
  allWarnings?: any[]; // جميع الإنذارات والتنبيهات مع تفاصيلها
}

interface Group {
  _id: string;
  name: string;
  students: Student[];
}

interface TeacherStatistics {
  totalWarnings: number;
  warningsCount: {
    warning: number;
    first: number;
    second: number;
    third: number;
    expulsion: number;
  };
  studentsWithWarnings: number;
  expelledStudents: number;
  topReasons: Array<{ _id: string; count: number }>;
  warningsByGroup: Array<{ _id: string; count: number }>;
  recentWarnings: Warning[];
}

const Warnings = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<TeacherStatistics | null>(null);
  const [showStatistics, setShowStatistics] = useState(false);
  const [loadingStatistics, setLoadingStatistics] = useState(false);

  const isTeacher = user?.role === "teacher";
  const isStudent = user?.role === "student";

  // Socket للتحديثات الفورية
  useWarningsSocket(
    (newWarning) => {
      // عند إضافة إنذار جديد
      console.log("New warning received:", newWarning);
      if (isStudent && newWarning.studentId._id === user?._id) {
        // إذا كان الطالب هو المستلم، أضف الإنذار للقائمة
        setWarnings((prev) => [newWarning, ...prev]);
      } else if (
        isTeacher &&
        selectedGroup &&
        newWarning.groupId._id === selectedGroup._id
      ) {
        // إذا كان المعلم في صفحة الحلقة، قم بتحديث عدد الإنذارات
        handleGroupSelect(selectedGroup);
      }
    },
    (deletedWarningId) => {
      // عند حذف إنذار
      console.log("Warning deleted:", deletedWarningId);
      setWarnings((prev) => prev.filter((w) => w._id !== deletedWarningId));
    }
  );

  // جلب الحلقات للمعلم أو الإنذارات للطالب
  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (isTeacher) {
        // جلب جميع الطلاب
        const studentsRes = await getAllStudents();
        const allStudents =
          studentsRes.success && Array.isArray(studentsRes.data)
            ? studentsRes.data
            : [];

        console.log("📊 إجمالي الطلاب:", allStudents.length);

        // فلترة الطلاب حسب المعلم الحالي
        const teacherName = `${user?.firstName} ${user?.lastName}`.trim();
        console.log("👨‍🏫 اسم المعلم:", teacherName);

        const teacherStudents = allStudents.filter((student: any) => {
          const studentTeacher = student.teacher?.trim() || "";
          return studentTeacher.toLowerCase() === teacherName.toLowerCase();
        });

        console.log("👨‍🎓 طلاب المعلم:", teacherStudents.length);

        // تجميع الطلاب حسب الحلقة
        const groupsMap = new Map<string, any[]>();
        teacherStudents.forEach((student: any) => {
          const groupName = student.group || "بدون حلقة";
          if (!groupsMap.has(groupName)) {
            groupsMap.set(groupName, []);
          }
          groupsMap.get(groupName)?.push({
            _id: student._id,
            firstName: student.firstName,
            lastName: student.lastName,
            warningsCount: 0,
          });
        });

        // تحويل الـ Map إلى مصفوفة من الحلقات
        const groupsList = Array.from(groupsMap.entries()).map(
          ([groupName, students]) => ({
            _id: groupName,
            name: groupName,
            students: students,
          })
        );

        console.log("📚 الحلقات:", groupsList);
        setGroups(groupsList);
      } else if (isStudent) {
        // جلب إنذارات الطالب
        const response = await api.get(`/warnings/student/${user?._id}`);
        console.log("Warnings response:", response.data);
        // البيانات تأتي مباشرة في response.data
        const warningsData = response.data || [];
        setWarnings(Array.isArray(warningsData) ? warningsData : []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "حدث خطأ أثناء تحميل البيانات",
      });
    } finally {
      setLoading(false);
    }
  };

  // جلب طلاب الحلقة عند اختيارها
  const handleGroupSelect = async (group: Group) => {
    try {
      setSelectedGroup(group);

      // جلب عدد الإنذارات لكل طالب في الحلقة
      const studentsWithWarnings = await Promise.all(
        group.students.map(async (student) => {
          try {
            const warningsRes = await api.get(
              `/warnings/student/${student._id}`
            );
            const studentWarnings = Array.isArray(warningsRes.data)
              ? warningsRes.data
              : [];

            // استخراج أنواع الإنذارات الموجودة (ما عدا التنبيه)
            const existingTypes = studentWarnings
              .map((w: any) => w.type)
              .filter((type: string) => type !== "warning");

            return {
              ...student,
              warningsCount: studentWarnings.length,
              existingWarningTypes: existingTypes,
              allWarnings: studentWarnings, // حفظ جميع الإنذارات والتنبيهات
            };
          } catch (err) {
            console.error(
              `Error fetching warnings for student ${student._id}:`,
              err
            );
            return {
              ...student,
              warningsCount: 0,
              existingWarningTypes: [],
              allWarnings: [],
            };
          }
        })
      );

      setSelectedGroup({ ...group, students: studentsWithWarnings });
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  // جلب إحصائيات المعلم
  const fetchTeacherStatistics = async () => {
    try {
      setLoadingStatistics(true);
      const response = await api.get("/warnings/statistics/teacher");
      setStatistics(response.data);
      setShowStatistics(true);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "حدث خطأ أثناء جلب الإحصائيات",
      });
    } finally {
      setLoadingStatistics(false);
    }
  };

  // إعطاء إنذار للطالب
  const giveWarning = async (
    student: Student,
    type: "warning" | "first" | "second" | "third" | "expulsion"
  ) => {
    const result = await Swal.fire({
      title: getWarningTitle(type),
      html: `
        <div class="text-right" dir="rtl">
          <p class="text-lg mb-4">هل أنت متأكد من إعطاء <strong>${getWarningLabel(
            type
          )}</strong> للطالب:</p>
          <p class="text-xl font-bold text-blue-600">${student.firstName} ${
        student.lastName
      }</p>
          <p class="text-sm text-gray-600 mt-4">${getWarningDescription(
            type
          )}</p>
          <textarea id="reason" class="swal2-textarea mt-4 w-full" placeholder="اكتب سبب الإنذار..." rows="3"></textarea>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، أعطِ الإنذار",
      cancelButtonText: "إلغاء",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      preConfirm: () => {
        const reason = (
          document.getElementById("reason") as HTMLTextAreaElement
        )?.value;
        if (!reason || reason.trim() === "") {
          Swal.showValidationMessage("يرجى كتابة سبب الإنذار");
          return false;
        }
        return reason;
      },
    });

    if (result.isConfirmed && result.value) {
      // عرض رسالة تحميل مع أيقونة متحركة
      Swal.fire({
        title: "جاري إضافة الإنذار...",
        html: `
          <div class="text-center py-4" dir="rtl">
            <div class="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600 mb-4"></div>
            <p class="text-lg text-gray-700 font-medium">الرجاء الانتظار قليلاً...</p>
            <p class="text-sm text-gray-500 mt-2">جاري حفظ البيانات</p>
          </div>
        `,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
      });

      try {
        await api.post("/warnings", {
          studentId: student._id,
          teacherId: user?._id,
          groupName: selectedGroup?.name, // إرسال اسم الحلقة بدلاً من ID
          type,
          reason: result.value,
        });

        Swal.fire({
          icon: "success",
          title: "✅ تم بنجاح!",
          html: `
            <div class="text-center" dir="rtl">
              <p class="text-lg text-gray-700">تم إعطاء <strong class="text-red-600">${getWarningLabel(
                type
              )}</strong> للطالب</p>
              <p class="text-sm text-gray-500 mt-2">${student.firstName} ${
            student.lastName
          }</p>
            </div>
          `,
          confirmButtonColor: "#10b981",
          confirmButtonText: "حسناً",
          timer: 3000,
        });

        // إعادة تحميل البيانات
        if (selectedGroup) {
          handleGroupSelect(selectedGroup);
        }
      } catch (error: any) {
        console.error("Error giving warning:", error);

        // عرض رسالة مخصصة إذا كان الإنذار موجود مسبقاً
        const errorMessage =
          error?.response?.data?.message || "حدث خطأ أثناء إعطاء الإنذار";

        Swal.fire({
          icon: "error",
          title: "خطأ",
          text: errorMessage,
          confirmButtonColor: "#dc2626",
        });
      }
    }
  };

  // حذف إنذار (للمعلم فقط)
  const deleteWarning = async (student: Student, warningType: string) => {
    const result = await Swal.fire({
      title: "⚠️ حذف الإنذار",
      html: `
        <div class="text-right" dir="rtl">
          <p class="text-lg mb-4">هل أنت متأكد من حذف <strong class="text-red-600">${getWarningLabel(
            warningType
          )}</strong>؟</p>
          <p class="text-xl font-bold text-blue-600 mb-4">${
            student.firstName
          } ${student.lastName}</p>
          <p class="text-sm text-yellow-600 bg-yellow-50 p-3 rounded-lg">
            ⚠️ تحذير: سيتم حذف الإنذار نهائياً ولن يمكن استرجاعه
          </p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، احذف الإنذار",
      cancelButtonText: "إلغاء",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
    });

    if (result.isConfirmed) {
      // عرض loading
      Swal.fire({
        title: "جاري حذف الإنذار...",
        html: `
          <div class="text-center py-4" dir="rtl">
            <div class="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600 mb-4"></div>
            <p class="text-lg text-gray-700 font-medium">الرجاء الانتظار...</p>
          </div>
        `,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
      });

      try {
        // جلب إنذارات الطالب للعثور على الإنذار المطلوب
        const warningsRes = await api.get(`/warnings/student/${student._id}`);
        const studentWarnings = Array.isArray(warningsRes.data)
          ? warningsRes.data
          : [];

        // العثور على الإنذار من النوع المحدد
        const warningToDelete = studentWarnings.find(
          (w: any) => w.type === warningType
        );

        if (!warningToDelete) {
          Swal.fire({
            icon: "error",
            title: "خطأ",
            text: "لم يتم العثور على الإنذار",
            confirmButtonColor: "#dc2626",
          });
          return;
        }

        // حذف الإنذار
        await api.delete(`/warnings/${warningToDelete._id}`);

        Swal.fire({
          icon: "success",
          title: "✅ تم الحذف!",
          html: `
            <div class="text-center" dir="rtl">
              <p class="text-lg text-gray-700">تم حذف <strong class="text-red-600">${getWarningLabel(
                warningType
              )}</strong> بنجاح</p>
              <p class="text-sm text-gray-500 mt-2">${student.firstName} ${
            student.lastName
          }</p>
            </div>
          `,
          confirmButtonColor: "#10b981",
          confirmButtonText: "حسناً",
          timer: 3000,
        });

        // إعادة تحميل البيانات
        if (selectedGroup) {
          handleGroupSelect(selectedGroup);
        }
      } catch (error: any) {
        console.error("Error deleting warning:", error);

        const errorMessage =
          error?.response?.data?.message || "حدث خطأ أثناء حذف الإنذار";

        Swal.fire({
          icon: "error",
          title: "خطأ",
          text: errorMessage,
          confirmButtonColor: "#dc2626",
        });
      }
    }
  };

  // حذف إنذار/تنبيه محدد بالـ ID (للتنبيهات المتعددة)
  const deleteWarningById = async (warningId: string, student: Student) => {
    // جلب بيانات الإنذار/التنبيه
    const warning = student.allWarnings?.find((w: any) => w._id === warningId);

    if (!warning) {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "لم يتم العثور على التنبيه",
        confirmButtonColor: "#dc2626",
      });
      return;
    }

    const result = await Swal.fire({
      title: "⚠️ حذف التنبيه",
      html: `
        <div class="text-right" dir="rtl">
          <p class="text-lg mb-4">هل أنت متأكد من حذف هذا التنبيه؟</p>
          <p class="text-xl font-bold text-blue-600 mb-2">${
            student.firstName
          } ${student.lastName}</p>
          <div class="bg-yellow-50 p-3 rounded-lg text-right mb-4">
            <p class="text-sm text-gray-700"><strong>السبب:</strong> ${
              warning.reason
            }</p>
            <p class="text-xs text-gray-500 mt-1">
              التاريخ: ${new Date(warning.createdAt).toLocaleDateString(
                "ar-SA"
              )}
            </p>
          </div>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
    });

    if (result.isConfirmed) {
      // عرض loading
      Swal.fire({
        title: "جاري الحذف...",
        html: `
          <div class="text-center py-4" dir="rtl">
            <div class="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-600 mb-4"></div>
            <p class="text-lg text-gray-700 font-medium">الرجاء الانتظار...</p>
          </div>
        `,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
      });

      try {
        await api.delete(`/warnings/${warningId}`);

        Swal.fire({
          icon: "success",
          title: "✅ تم الحذف!",
          text: "تم حذف التنبيه بنجاح",
          confirmButtonColor: "#10b981",
          confirmButtonText: "حسناً",
          timer: 2000,
        });

        // إعادة تحميل البيانات
        if (selectedGroup) {
          handleGroupSelect(selectedGroup);
        }
      } catch (error: any) {
        console.error("Error deleting warning:", error);

        const errorMessage =
          error?.response?.data?.message || "حدث خطأ أثناء حذف التنبيه";

        Swal.fire({
          icon: "error",
          title: "خطأ",
          text: errorMessage,
          confirmButtonColor: "#dc2626",
        });
      }
    }
  };

  // دوال مساعدة للنصوص
  const getWarningTitle = (type: string) => {
    const titles = {
      warning: "⚠️ إعطاء تنبيه",
      first: "🔴 الإنذار الأول",
      second: "🔴🔴 الإنذار الثاني",
      third: "🔴🔴🔴 الإنذار الثالث",
      expulsion: "❌ فصل نهائي",
    };
    return titles[type as keyof typeof titles];
  };

  const getWarningLabel = (type: string) => {
    const labels = {
      warning: "تنبيه",
      first: "الإنذار الأول",
      second: "الإنذار الثاني",
      third: "الإنذار الثالث",
      expulsion: "فصل نهائي",
    };
    return labels[type as keyof typeof labels];
  };

  const getWarningDescription = (type: string) => {
    const descriptions = {
      warning: "⚠️ تنبيه فقط - تحذير من الإنذار في المرة القادمة",
      first: "🚫 يُفصل من الحلقة ليوم واحد",
      second: "🚫 يُفصل من الحلقة لمدة أسبوع + يُحرم من الأنشطة لمدة شهر",
      third: "🚫 يُفصل من الحلقة لمدة أسبوع + يُحرم من الأنشطة بشكل نهائي",
      expulsion: "❌ يُفصل من الحلقة ولا يعود نهائياً",
    };
    return descriptions[type as keyof typeof descriptions];
  };

  const getWarningColor = (type: string) => {
    const colors = {
      warning: "from-yellow-400 to-orange-500",
      first: "from-orange-500 to-red-500",
      second: "from-red-500 to-red-600",
      third: "from-red-600 to-red-700",
      expulsion: "from-gray-800 to-black",
    };
    return colors[type as keyof typeof colors];
  };

  const getWarningIcon = (type: string) => {
    const icons = {
      warning: "⚠️",
      first: "🔴",
      second: "🔴🔴",
      third: "🔴🔴🔴",
      expulsion: "❌",
    };
    return icons[type as keyof typeof icons];
  };

  // عرض واجهة المعلم
  if (isTeacher) {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">جاري التحميل...</p>
          </div>
        </div>
      );
    }

    // عرض الحلقات
    if (!selectedGroup) {
      return (
        <div
          className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-4 md:p-8"
          dir="rtl">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                📋 إدارة الإنذارات
              </h1>
              <p className="text-gray-600 text-lg">
                اختر الحلقة لعرض الطلاب وإدارة الإنذارات
              </p>

              {/* زر الإحصائيات */}
              <button
                onClick={fetchTeacherStatistics}
                disabled={loadingStatistics}
                className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:scale-105 transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2 mx-auto">
                {loadingStatistics ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>جاري التحميل...</span>
                  </>
                ) : (
                  <>📊 عرض الإحصائيات</>
                )}
              </button>
            </div>

            {/* عرض الإحصائيات */}
            {showStatistics && statistics && (
              <div className="bg-white rounded-2xl shadow-2xl p-6 mb-8 border-2 border-blue-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    📊 إحصائيات الإنذارات
                  </h2>
                  <button
                    onClick={() => setShowStatistics(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl">
                    ✕
                  </button>
                </div>

                {/* الإحصائيات الرئيسية */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {statistics.totalWarnings}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      إجمالي الإنذارات
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {statistics.studentsWithWarnings}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      طلاب لديهم إنذارات
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-yellow-600">
                      {statistics.warningsCount.warning}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">تنبيهات</div>
                  </div>

                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-red-600">
                      {statistics.expelledStudents}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      طلاب مفصولين
                    </div>
                  </div>
                </div>

                {/* توزيع الإنذارات */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {/* الإنذارات حسب النوع */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-lg font-bold text-gray-800 mb-3">
                      الإنذارات حسب النوع
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">⚠️ تنبيهات:</span>
                        <span className="font-bold text-yellow-600">
                          {statistics.warningsCount.warning}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">🔴 إنذار أول:</span>
                        <span className="font-bold text-orange-600">
                          {statistics.warningsCount.first}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">🔴🔴 إنذار ثاني:</span>
                        <span className="font-bold text-red-600">
                          {statistics.warningsCount.second}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">
                          🔴🔴🔴 إنذار ثالث:
                        </span>
                        <span className="font-bold text-red-700">
                          {statistics.warningsCount.third}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">❌ فصل نهائي:</span>
                        <span className="font-bold text-gray-800">
                          {statistics.warningsCount.expulsion}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* أكثر الأسباب تكراراً */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-lg font-bold text-gray-800 mb-3">
                      أكثر الأسباب تكراراً
                    </h3>
                    <div className="space-y-2">
                      {statistics.topReasons.length > 0 ? (
                        statistics.topReasons.map((reason, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center">
                            <span className="text-gray-700 text-sm truncate">
                              {index + 1}. {reason._id}
                            </span>
                            <span className="font-bold text-blue-600">
                              {reason.count}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">لا توجد بيانات</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* الإنذارات حسب الحلقة */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">
                    الإنذارات حسب الحلقة
                  </h3>
                  <div className="grid md:grid-cols-3 gap-3">
                    {statistics.warningsByGroup.length > 0 ? (
                      statistics.warningsByGroup.map((group, index) => (
                        <div
                          key={index}
                          className="bg-white rounded-lg p-3 flex justify-between items-center shadow-sm">
                          <span className="text-gray-700 font-medium">
                            📚 {group._id}
                          </span>
                          <span className="font-bold text-blue-600">
                            {group.count}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">لا توجد بيانات</p>
                    )}
                  </div>
                </div>

                {/* آخر الإنذارات */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">
                    آخر 5 إنذارات
                  </h3>
                  <div className="space-y-2">
                    {statistics.recentWarnings.length > 0 ? (
                      statistics.recentWarnings.map((warning) => (
                        <div
                          key={warning._id}
                          className="bg-white rounded-lg p-3 shadow-sm">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-medium text-gray-800">
                                {warning.studentId.firstName}{" "}
                                {warning.studentId.lastName}
                              </div>
                              <div className="text-sm text-gray-600">
                                {getWarningLabel(warning.type)} -{" "}
                                {warning.reason}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {warning.groupId.name} •{" "}
                                {new Date(warning.createdAt).toLocaleDateString(
                                  "ar-SA"
                                )}
                              </div>
                            </div>
                            <span className="text-2xl">
                              {getWarningIcon(warning.type)}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">لا توجد إنذارات</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Groups Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => (
                <button
                  key={group._id}
                  onClick={() => handleGroupSelect(group)}
                  className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  <div className="text-center">
                    <div className="text-5xl mb-4">📚</div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      {group.name}
                    </h3>
                    <p className="text-gray-600">
                      {group.students?.length || 0} طالب
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {groups.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-gray-500 text-lg">لا توجد حلقات مسجلة</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    // عرض طلاب الحلقة المختارة
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-4 md:p-8"
        dir="rtl">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSelectedGroup(null)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                <span className="text-2xl">→</span>
                <span className="font-medium">رجوع</span>
              </button>
              <div className="text-center flex-1">
                <h1 className="text-3xl font-bold text-gray-800">
                  {selectedGroup.name}
                </h1>
                <p className="text-gray-600 mt-2">
                  {selectedGroup.students?.length || 0} طالب
                </p>
              </div>
              <div className="w-20"></div>
            </div>
          </div>

          {/* Students List */}
          <div className="grid grid-cols-1 gap-4">
            {selectedGroup.students?.map((student) => (
              <div
                key={student._id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  {/* معلومات الطالب */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {student.firstName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-gray-800">
                          {student.firstName} {student.lastName}
                        </h3>
                        {/* عرض الإنذارات الموجودة */}
                        {student.existingWarningTypes &&
                          student.existingWarningTypes.length > 0 && (
                            <div className="flex gap-1 flex-wrap">
                              {student.existingWarningTypes.includes(
                                "first"
                              ) && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
                                  <span>🔴 إنذار 1</span>
                                  <button
                                    onClick={() =>
                                      deleteWarning(student, "first")
                                    }
                                    className="ml-1 hover:bg-orange-200 rounded-full p-0.5 transition-colors"
                                    title="حذف الإنذار">
                                    ✕
                                  </button>
                                </div>
                              )}
                              {student.existingWarningTypes.includes(
                                "second"
                              ) && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                                  <span>🔴🔴 إنذار 2</span>
                                  <button
                                    onClick={() =>
                                      deleteWarning(student, "second")
                                    }
                                    className="ml-1 hover:bg-red-200 rounded-full p-0.5 transition-colors"
                                    title="حذف الإنذار">
                                    ✕
                                  </button>
                                </div>
                              )}
                              {student.existingWarningTypes.includes(
                                "third"
                              ) && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-red-200 text-red-800 text-xs rounded-full font-medium">
                                  <span>🔴🔴🔴 إنذار 3</span>
                                  <button
                                    onClick={() =>
                                      deleteWarning(student, "third")
                                    }
                                    className="ml-1 hover:bg-red-300 rounded-full p-0.5 transition-colors"
                                    title="حذف الإنذار">
                                    ✕
                                  </button>
                                </div>
                              )}
                              {student.existingWarningTypes.includes(
                                "expulsion"
                              ) && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-gray-800 text-white text-xs rounded-full font-medium">
                                  <span>❌ مفصول</span>
                                  <button
                                    onClick={() =>
                                      deleteWarning(student, "expulsion")
                                    }
                                    className="ml-1 hover:bg-gray-700 rounded-full p-0.5 transition-colors"
                                    title="حذف الفصل">
                                    ✕
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                      </div>
                      <p className="text-sm text-gray-600">
                        إجمالي الإنذارات والتنبيهات:{" "}
                        {student.warningsCount || 0}
                      </p>

                      {/* عرض التنبيهات */}
                      {student.allWarnings &&
                        student.allWarnings.filter(
                          (w: any) => w.type === "warning"
                        ).length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-500 mb-1">
                              التنبيهات (
                              {
                                student.allWarnings.filter(
                                  (w: any) => w.type === "warning"
                                ).length
                              }
                              ):
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {student.allWarnings
                                .filter((w: any) => w.type === "warning")
                                .map((warning: any, index: number) => (
                                  <div
                                    key={warning._id}
                                    className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium group">
                                    <span>⚠️ تنبيه {index + 1}</span>
                                    <button
                                      onClick={() =>
                                        deleteWarningById(warning._id, student)
                                      }
                                      className="ml-1 hover:bg-yellow-200 rounded-full p-0.5 transition-colors opacity-0 group-hover:opacity-100"
                                      title={`حذف: ${warning.reason}`}>
                                      ✕
                                    </button>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>

                  {/* أزرار الإنذارات */}
                  <div className="flex flex-wrap gap-2">
                    {/* التنبيه - يمكن إعطاؤه أكثر من مرة */}
                    <button
                      onClick={() => giveWarning(student, "warning")}
                      className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg font-medium hover:scale-105 transition-transform">
                      ⚠️ تنبيه
                    </button>

                    {/* الإنذار الأول - مرة واحدة فقط */}
                    {!student.existingWarningTypes?.includes("first") ? (
                      <button
                        onClick={() => giveWarning(student, "first")}
                        className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:scale-105 transition-transform">
                        🔴 إنذار أول
                      </button>
                    ) : (
                      <button
                        disabled
                        className="px-4 py-2 bg-gray-400 text-white rounded-lg font-medium cursor-not-allowed opacity-50">
                        🔴 تم الإنذار
                      </button>
                    )}

                    {/* الإنذار الثاني - مرة واحدة فقط */}
                    {!student.existingWarningTypes?.includes("second") ? (
                      <button
                        onClick={() => giveWarning(student, "second")}
                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium hover:scale-105 transition-transform">
                        🔴🔴 إنذار ثاني
                      </button>
                    ) : (
                      <button
                        disabled
                        className="px-4 py-2 bg-gray-400 text-white rounded-lg font-medium cursor-not-allowed opacity-50">
                        🔴🔴 تم الإنذار
                      </button>
                    )}

                    {/* الإنذار الثالث - مرة واحدة فقط */}
                    {!student.existingWarningTypes?.includes("third") ? (
                      <button
                        onClick={() => giveWarning(student, "third")}
                        className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-medium hover:scale-105 transition-transform">
                        🔴🔴🔴 إنذار ثالث
                      </button>
                    ) : (
                      <button
                        disabled
                        className="px-4 py-2 bg-gray-400 text-white rounded-lg font-medium cursor-not-allowed opacity-50">
                        🔴🔴🔴 تم الإنذار
                      </button>
                    )}

                    {/* الفصل النهائي - مرة واحدة فقط */}
                    {!student.existingWarningTypes?.includes("expulsion") ? (
                      <button
                        onClick={() => giveWarning(student, "expulsion")}
                        className="px-4 py-2 bg-gradient-to-r from-gray-800 to-black text-white rounded-lg font-medium hover:scale-105 transition-transform">
                        ❌ فصل
                      </button>
                    ) : (
                      <button
                        disabled
                        className="px-4 py-2 bg-gray-400 text-white rounded-lg font-medium cursor-not-allowed opacity-50">
                        ❌ تم الفصل
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedGroup.students?.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👨‍🎓</div>
              <p className="text-gray-500 text-lg">
                لا يوجد طلاب في هذه الحلقة
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // عرض واجهة الطالب
  if (isStudent) {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">جاري التحميل...</p>
          </div>
        </div>
      );
    }

    return (
      <div
        className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-4 md:p-8"
        dir="rtl">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              ⚠️ إنذاراتي
            </h1>
            <p className="text-gray-600 text-lg">
              عرض جميع الإنذارات والتنبيهات الخاصة بك
            </p>
          </div>

          {/* Warnings List */}
          <div className="space-y-4">
            {warnings.map((warning) => (
              <div
                key={warning._id}
                className={`bg-gradient-to-r ${getWarningColor(
                  warning.type
                )} rounded-2xl shadow-lg p-6 text-white`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-4xl">
                        {getWarningIcon(warning.type)}
                      </span>
                      <h3 className="text-2xl font-bold">
                        {getWarningLabel(warning.type)}
                      </h3>
                    </div>
                    <p className="text-lg mb-2 opacity-90">
                      {getWarningDescription(warning.type)}
                    </p>
                    <div className="bg-white/20 rounded-lg p-3 mb-3">
                      <p className="font-medium">السبب:</p>
                      <p className="text-sm opacity-90">{warning.reason}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm opacity-80">
                      <span>📚 الحلقة: {warning.groupId?.name}</span>
                      <span>
                        👨‍🏫 المعلم: {warning.teacherId?.firstName}{" "}
                        {warning.teacherId?.lastName}
                      </span>
                      <span>
                        📅 التاريخ:{" "}
                        {new Date(warning.createdAt).toLocaleDateString(
                          "ar-SA"
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {warnings.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
              <div className="text-6xl mb-4">✅</div>
              <p className="text-gray-600 text-lg font-medium">
                لا توجد إنذارات
              </p>
              <p className="text-gray-500 text-sm mt-2">
                استمر في التفوق والالتزام! 🌟
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // إذا لم يكن معلم أو طالب
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-6xl mb-4">🚫</div>
        <p className="text-gray-600 text-lg">غير مصرح لك بالوصول لهذه الصفحة</p>
      </div>
    </div>
  );
};

export default Warnings;
