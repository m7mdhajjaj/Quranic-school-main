import { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import axios from "axios";

// API base URL
const API_URL = "http://localhost:5005/api";

interface DbStudent {
  _id: string;
  studentId: number;
  firstName: string;
  fatherName: string;
  lastName: string;
  group: string;
  // يمكن إضافة المزيد من الحقول حسب الحاجة
}

interface AttendanceStudent {
  _id: string;
  studentId: number;
  name: string;
  group: string;
  isPresent: boolean;
}

const Absence = () => {
  const [students, setStudents] = useState<AttendanceStudent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAll, setSelectedAll] = useState(false);

  // جلب بيانات الطلاب من قاعدة البيانات
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });

    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/students`);

        // تحويل بيانات الطلاب إلى الشكل المطلوب في واجهة المستخدم
        const formattedStudents = response.data.map((student: DbStudent) => ({
          _id: student._id,
          studentId: student.studentId,
          name: `${student.firstName} ${student.fatherName} ${student.lastName}`,
          group: student.group,
          isPresent: true, // افتراضياً الطلاب حاضرين
        }));

        setStudents(formattedStudents);
        setError(null);
      } catch (err) {
        console.error("فشل في جلب بيانات الطلاب:", err);
        setError("حدث خطأ أثناء جلب بيانات الطلاب");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const toggleStudentPresence = (studentId: string) => {
    if (!isEditing) return;

    setStudents(
      students.map((student) =>
        student._id === studentId
          ? { ...student, isPresent: !student.isPresent }
          : student
      )
    );
  };

  const toggleAllStudents = () => {
    if (!isEditing) return;

    const newState = !selectedAll;
    setSelectedAll(newState);
    setStudents(
      students.map((student) => ({ ...student, isPresent: newState }))
    );
  };

  const handleSave = async () => {
    try {
      // هنا يمكن إضافة استدعاء API لحفظ بيانات الحضور والغياب
      // مثال:
      // await axios.post(`${API_URL}/attendance`, {
      //   date,
      //   records: students.map(student => ({
      //     studentId: student.studentId,
      //     isPresent: student.isPresent
      //   }))
      // });

      // في الوقت الحالي سنكتفي بعرض رسالة نجاح
      alert("تم حفظ سجل الحضور بنجاح");
      setIsEditing(false);
    } catch (err) {
      console.error("فشل في حفظ سجل الحضور:", err);
      alert("حدث خطأ أثناء حفظ سجل الحضور");
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  // Calculate statistics
  const presentCount = students.filter((s) => s.isPresent).length;
  const absentCount = students.length - presentCount;
  const attendanceRate = Math.round((presentCount / students.length) * 100);

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8 px-4"
      dir="rtl">
      <div className="container mx-auto">
        <div className="text-center mb-8" data-aos="fade-down">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
            سجل الحضور والغياب
          </h1>
          <div className="w-24 h-1 bg-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">متابعة حضور الطلاب وتسجيل الغيابات</p>
        </div>

        {/* Date Selector and Stats */}
        <div
          className="bg-white rounded-xl shadow-md p-6 mb-6"
          data-aos="fade-up">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                التاريخ:
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">الحضور</p>
                <p className="font-bold text-green-600 text-xl">
                  {presentCount}
                </p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">الغياب</p>
                <p className="font-bold text-red-600 text-xl">{absentCount}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">نسبة الحضور</p>
                <p className="font-bold text-blue-600 text-xl">
                  {attendanceRate}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Students Attendance Table */}
        <div
          className="bg-white rounded-xl shadow-md overflow-hidden"
          data-aos="fade-up"
          data-aos-delay="100">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-500 py-4 px-6 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">قائمة الطلاب</h2>
            <button
              onClick={toggleEdit}
              className={`px-4 py-1 rounded-full text-sm ${
                isEditing ? "bg-red-100 text-red-700" : "bg-white/20 text-white"
              }`}>
              {isEditing ? "إلغاء التعديل" : "تعديل السجل"}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-right text-sm font-medium text-gray-500">
                    رقم الطالب
                  </th>
                  <th className="py-3 px-4 text-right text-sm font-medium text-gray-500">
                    اسم الطالب
                  </th>
                  <th className="py-3 px-4 text-right text-sm font-medium text-gray-500">
                    الحلقة
                  </th>
                  <th className="py-3 px-6 text-center text-sm font-medium text-gray-500">
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={selectedAll}
                        onChange={toggleAllStudents}
                        className={`w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 ${
                          !isEditing && "opacity-60 cursor-not-allowed"
                        }`}
                        disabled={!isEditing}
                      />
                      <span className="mr-2">الحضور</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="text-center py-4 text-gray-500">
                      جاري تحميل بيانات الطلاب...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={3} className="text-center py-4 text-red-500">
                      {error}
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-4 text-gray-500">
                      لا يوجد طلاب مسجلين
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr
                      key={student._id}
                      className={`hover:bg-gray-50 ${
                        isEditing ? "cursor-pointer" : ""
                      }`}
                      onClick={() => toggleStudentPresence(student._id)}>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {student.studentId}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {student.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {student.group}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={student.isPresent}
                          onChange={() => toggleStudentPresence(student._id)}
                          className={`w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 ${
                            !isEditing && "opacity-60 cursor-not-allowed"
                          }`}
                          disabled={!isEditing}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div className="p-4 bg-gray-50 flex justify-center">
            <button
              onClick={handleSave}
              disabled={!isEditing}
              className={`bg-emerald-600 text-white px-8 py-2 rounded-lg shadow-md flex items-center ${
                !isEditing
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:bg-emerald-700"
              }`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-2"
                viewBox="0 0 20 20"
                fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              حفظ السجل
            </button>
          </div>
        </div>

        {/* Instructions Card */}
        <div
          className="mt-6 bg-white rounded-xl p-4 shadow-md"
          data-aos="fade-up"
          data-aos-delay="200">
          <h3 className="font-bold text-gray-700 mb-2 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 ml-1 text-amber-500"
              viewBox="0 0 20 20"
              fill="currentColor">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            تعليمات:
          </h3>
          <ul className="text-gray-600 text-sm mr-6 list-disc space-y-1">
            <li>انقر على "تعديل السجل" لتحديث حالة حضور الطلاب</li>
            <li>يمكن النقر على صف الطالب لتغيير حالة حضوره</li>
            <li>
              استخدم خانة الاختيار العلوية لتحديد أو إلغاء تحديد جميع الطلاب
            </li>
            <li>تأكد من حفظ التغييرات بعد الانتهاء</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Absence;
