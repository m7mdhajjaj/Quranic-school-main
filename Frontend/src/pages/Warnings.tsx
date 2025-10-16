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
}

interface Group {
  _id: string;
  name: string;
  students: Student[];
}

const Warnings = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [loading, setLoading] = useState(true);

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
            return {
              ...student,
              warningsCount: studentWarnings.length,
            };
          } catch (err) {
            console.error(
              `Error fetching warnings for student ${student._id}:`,
              err
            );
            return {
              ...student,
              warningsCount: 0,
            };
          }
        })
      );

      setSelectedGroup({ ...group, students: studentsWithWarnings });
    } catch (error) {
      console.error("Error fetching students:", error);
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
          title: "تم بنجاح!",
          text: `تم إعطاء ${getWarningLabel(type)} للطالب`,
          confirmButtonColor: "#10b981",
        });

        // إعادة تحميل البيانات
        if (selectedGroup) {
          handleGroupSelect(selectedGroup);
        }
      } catch (error) {
        console.error("Error giving warning:", error);
        Swal.fire({
          icon: "error",
          title: "خطأ",
          text: "حدث خطأ أثناء إعطاء الإنذار",
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
            </div>

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
                      <h3 className="text-xl font-bold text-gray-800">
                        {student.firstName} {student.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        عدد الإنذارات: {student.warningsCount || 0}
                      </p>
                    </div>
                  </div>

                  {/* أزرار الإنذارات */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => giveWarning(student, "warning")}
                      className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg font-medium hover:scale-105 transition-transform">
                      ⚠️ تنبيه
                    </button>
                    <button
                      onClick={() => giveWarning(student, "first")}
                      className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:scale-105 transition-transform">
                      🔴 إنذار أول
                    </button>
                    <button
                      onClick={() => giveWarning(student, "second")}
                      className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium hover:scale-105 transition-transform">
                      🔴🔴 إنذار ثاني
                    </button>
                    <button
                      onClick={() => giveWarning(student, "third")}
                      className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-medium hover:scale-105 transition-transform">
                      🔴🔴🔴 إنذار ثالث
                    </button>
                    <button
                      onClick={() => giveWarning(student, "expulsion")}
                      className="px-4 py-2 bg-gradient-to-r from-gray-800 to-black text-white rounded-lg font-medium hover:scale-105 transition-transform">
                      ❌ فصل
                    </button>
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
