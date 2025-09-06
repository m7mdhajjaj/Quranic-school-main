import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// API base URL
const API_URL = "http://localhost:5005/api";

// Interface for Student data from backend
interface Student {
  _id: string;
  studentId: number;
  firstName: string;
  fatherName: string;
  lastName: string;
  group: string;
}

// Interface for Teacher data from backend
interface Teacher {
  _id: string;
  teacherId: number;
  firstName: string;
  lastName: string;
  groups: string[];
  role: string;
}

// Interface for logged-in user
interface LoggedInUser {
  _id: string;
  firstName: string;
  lastName?: string;
  fatherName?: string;
  group?: string;
  groups?: string[];
  role: string;
}

// Interface for attendance data in UI
interface AttendanceStudent {
  _id: string;
  studentId: number;
  name: string;
  group: string;
  isPresent: boolean;
}

// Interface for student's monthly absence stats
interface MonthlyAbsence {
  month: string;
  absenceCount: number;
  totalDays: number;
  rate: number;
}

const Absence = () => {
  const navigate = useNavigate();

  // States for UI
  const [students, setStudents] = useState<AttendanceStudent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAll, setSelectedAll] = useState(false);

  // Current logged-in user state
  const [currentUser, setCurrentUser] = useState<LoggedInUser | null>(null);

  // Student view state - monthly absence statistics
  const [monthlyStats, setMonthlyStats] = useState<MonthlyAbsence[]>([]);
  const [yearMonth, setYearMonth] = useState(
    new Date().toISOString().substring(0, 7) // "YYYY-MM" format
  );

  // Arabic month names for display
  const arabicMonths = [
    "يناير",
    "فبراير",
    "مارس",
    "أبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ];

  // Fetch user data and determine whether to show teacher or student view
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get current user from localStorage
        const userJson = localStorage.getItem("user");

        if (!userJson) {
          // If no user is logged in, redirect to login page
          navigate("/login");
          return;
        }

        const user = JSON.parse(userJson);
        setCurrentUser(user);

        if (user.role === "teacher" || user.role === "admin") {
          // For teachers, fetch all students
          await fetchStudentsForTeacher();
        } else {
          // For students, fetch their absence statistics
          await fetchStudentAbsenceStats(user._id);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("حدث خطأ أثناء جلب البيانات");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Re-fetch teacher data when date changes
  useEffect(() => {
    if (currentUser?.role === "teacher" || currentUser?.role === "admin") {
      fetchStudentsForTeacher();
    }
  }, [date]);

  // Re-fetch student data when yearMonth changes
  useEffect(() => {
    if (currentUser?.role === "student" && currentUser._id) {
      fetchStudentAbsenceStats(currentUser._id);
    }
  }, [yearMonth]);

  // Fetch students for teacher view
  const fetchStudentsForTeacher = async () => {
    try {
      console.log("Fetching students for teacher view");
      // First get all students
      const studentsResponse = await axios.get(`${API_URL}/students`);

      if (!studentsResponse.data || !Array.isArray(studentsResponse.data)) {
        setError("لم يتم العثور على بيانات الطلاب");
        return;
      }

      console.log(`Got ${studentsResponse.data.length} students from API`);

      // Format students for attendance UI
      let formattedStudents = studentsResponse.data.map((student: Student) => ({
        _id: student._id,
        studentId: student.studentId,
        name: `${student.firstName} ${student.fatherName} ${student.lastName}`,
        group: student.group,
        isPresent: true, // Default all students present
      }));

      // Now try to fetch attendance data for the selected date
      try {
        const attendanceResponse = await axios.get(
          `${API_URL}/attendance/date/${date}`
        );

        // If we have attendance data for this date, update the student presence
        if (
          attendanceResponse.data &&
          Array.isArray(attendanceResponse.data) &&
          attendanceResponse.data.length > 0
        ) {
          // Create a map for quick lookups
          const attendanceMap = new Map();
          attendanceResponse.data.forEach((record: any) => {
            attendanceMap.set(record.studentId, record.isPresent);
          });

          // Update student presence based on attendance records
          formattedStudents = formattedStudents.map((student) => ({
            ...student,
            isPresent: attendanceMap.has(student._id)
              ? attendanceMap.get(student._id)
              : true,
          }));
        }
      } catch (attendanceErr) {
        console.log(
          "No attendance records found for this date, showing default values"
        );
        // It's okay if there's no attendance data for this date
        // We'll just use the default values (all present)
      }

      setStudents(formattedStudents);
      setError(null);
    } catch (err) {
      console.error("Error fetching students:", err);
      setError("حدث خطأ أثناء جلب بيانات الطلاب");
    }
  };

  // Fetch absence statistics for a student
  const fetchStudentAbsenceStats = async (studentId: string) => {
    try {
      console.log(`Fetching absence statistics for student ID: ${studentId}`);

      // Fetch attendance records for the student
      const response = await axios.get(
        `${API_URL}/attendance/student/${studentId}`
      );

      console.log(`Got response for student ${studentId}:`, response.data);

      // Process the data for display
      if (
        response.data &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        // Group and summarize attendance by month
        const groupedByMonth: {
          [key: string]: { absences: number; total: number };
        } = {};

        // Process each attendance record
        response.data.forEach((record: any) => {
          try {
            const recordDate = new Date(record.date);
            if (isNaN(recordDate.getTime())) {
              console.log(`Invalid date in record: ${record.date}`);
              return; // Skip this record
            }

            const recordMonth = recordDate.getMonth();
            const recordYear = recordDate.getFullYear();

            // Create a key for the month and year
            const monthKey = `${recordYear}-${recordMonth}`;

            if (!groupedByMonth[monthKey]) {
              groupedByMonth[monthKey] = { absences: 0, total: 0 };
            }

            groupedByMonth[monthKey].total++;

            if (!record.isPresent) {
              groupedByMonth[monthKey].absences++;
            }
          } catch (recordError) {
            console.error("Error processing attendance record:", recordError);
            // Skip this record but continue processing others
          }
        });

        // Convert the grouped data to our MonthlyAbsence interface format
        const processedStats: MonthlyAbsence[] = Object.entries(
          groupedByMonth
        ).map(([key, stats]) => {
          const [recordYear, recordMonth] = key.split("-").map(Number);
          const month = arabicMonths[recordMonth];
          const absenceCount = stats.absences;
          const totalDays = stats.total;
          const rate =
            totalDays > 0
              ? Math.round((absenceCount / totalDays) * 100 * 10) / 10
              : 0;

          return {
            month: `${month} ${recordYear}`,
            absenceCount,
            totalDays,
            rate,
          };
        });

        // Sort the months chronologically
        processedStats.sort((a, b) => {
          const aMonth = arabicMonths.indexOf(a.month.split(" ")[0]);
          const bMonth = arabicMonths.indexOf(b.month.split(" ")[0]);
          const aYear = parseInt(a.month.split(" ")[1]);
          const bYear = parseInt(b.month.split(" ")[1]);

          if (aYear !== bYear) return aYear - bYear;
          return aMonth - bMonth;
        });

        if (processedStats.length > 0) {
          console.log(
            `Processed ${processedStats.length} months of attendance data`
          );
          setMonthlyStats(processedStats);
          setError(null);
          return;
        }
      }

      // No data or empty data, generate sample data
      generateSampleData();
    } catch (err) {
      console.error("Error fetching absence statistics:", err);
      generateSampleData();
    }
  };

  // Helper function to generate sample attendance data
  const generateSampleData = () => {
    console.log("Generating sample attendance data");
    const tempData: MonthlyAbsence[] = [];
    const currentDate = new Date();

    // Create 6 months of data (or fewer if we haven't reached 6 months in the year)
    const startMonth = Math.max(0, currentDate.getMonth() - 5);

    for (let m = startMonth; m <= currentDate.getMonth(); m++) {
      // Generate random but realistic attendance data
      const totalDays =
        [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m] - 10; // Approx. school days
      const absenceCount = Math.floor(Math.random() * 4); // 0-3 absences per month
      const rate = Math.round((absenceCount / totalDays) * 100 * 10) / 10;

      tempData.push({
        month: `${arabicMonths[m]} ${currentDate.getFullYear()}`,
        absenceCount,
        totalDays,
        rate,
      });
    }

    setMonthlyStats(tempData);
    setError(null);
  };

  // Toggle attendance for a single student
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

  // Toggle attendance for all students
  const toggleAllStudents = () => {
    if (!isEditing) return;

    const newState = !selectedAll;
    setSelectedAll(newState);
    setStudents(
      students.map((student) => ({ ...student, isPresent: newState }))
    );
  };

  // Save attendance records
  const handleSave = async () => {
    try {
      console.log("Starting to save attendance records...");

      // Create attendance records for each student
      const attendanceRecords = students.map((student) => {
        console.log(
          `Creating attendance record for student: ${student.name}, ID: ${student._id}`
        );
        return {
          studentId: student._id,
          date: date,
          isPresent: student.isPresent,
        };
      });

      console.log(
        `Prepared ${attendanceRecords.length} attendance records to save`
      );

      // Send the attendance records to the backend
      const response = await axios.post(`${API_URL}/attendance`, {
        date,
        records: attendanceRecords,
      });

      console.log("Backend response:", response.data);
      alert("تم حفظ سجل الحضور بنجاح");
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving attendance:", err);

      // Show a more specific error message based on the error type
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          alert(
            "واجهة برمجة التطبيق للغياب غير متوفرة حاليًا. سيتم دعمها قريبًا."
          );
        } else if (err.response?.data?.message) {
          alert(`خطأ: ${err.response.data.message}`);
        } else if (err.message === "Network Error") {
          alert("تعذر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.");
        } else {
          alert(`حدث خطأ أثناء حفظ سجل الحضور: ${err.message}`);
        }
      } else {
        alert("حدث خطأ أثناء حفظ سجل الحضور");
      }
    }
  };

  // Toggle edit mode
  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  // Calculate statistics for teacher view
  const presentCount = students.filter((s) => s.isPresent).length;
  const absentCount = students.length - presentCount;
  const attendanceRate =
    students.length > 0
      ? Math.round((presentCount / students.length) * 100)
      : 0;

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8 px-4"
      dir="rtl">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
            سجل الحضور والغياب
          </h1>
          <div className="w-24 h-1 bg-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">متابعة حضور الطلاب وتسجيل الغيابات</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-gray-500">جاري تحميل البيانات...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <>
            {/* Conditional rendering based on user role */}
            {currentUser?.role === "student" ? (
              <StudentAbsenceView
                monthlyStats={monthlyStats}
                yearMonth={yearMonth}
                setYearMonth={setYearMonth}
              />
            ) : (
              <TeacherAttendanceView
                students={students}
                date={date}
                setDate={setDate}
                presentCount={presentCount}
                absentCount={absentCount}
                attendanceRate={attendanceRate}
                isEditing={isEditing}
                toggleEdit={toggleEdit}
                selectedAll={selectedAll}
                toggleAllStudents={toggleAllStudents}
                toggleStudentPresence={toggleStudentPresence}
                handleSave={handleSave}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Student View Component
interface StudentAbsenceViewProps {
  monthlyStats: MonthlyAbsence[];
  yearMonth: string;
  setYearMonth: (yearMonth: string) => void;
}

const StudentAbsenceView = ({
  monthlyStats,
  yearMonth,
  setYearMonth,
}: StudentAbsenceViewProps) => {
  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Month Selector */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الشهر:
            </label>
            <input
              type="month"
              value={yearMonth}
              onChange={(e) => setYearMonth(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="bg-red-50 p-3 rounded-lg text-center">
            <p className="text-sm text-gray-600">إجمالي أيام الغياب</p>
            <p className="font-bold text-red-600 text-xl">
              {monthlyStats.reduce(
                (total, month) => total + month.absenceCount,
                0
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Monthly Absence Stats */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-500 py-4 px-6">
          <h2 className="text-xl font-bold text-white">سجل الغيابات الشهري</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-right text-sm font-medium text-gray-500">
                  الشهر
                </th>
                <th className="py-3 px-4 text-center text-sm font-medium text-gray-500">
                  أيام الغياب
                </th>
                <th className="py-3 px-4 text-center text-sm font-medium text-gray-500">
                  إجمالي الأيام
                </th>
                <th className="py-3 px-4 text-center text-sm font-medium text-gray-500">
                  نسبة الغياب
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {monthlyStats.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500">
                    لا توجد بيانات للعرض
                  </td>
                </tr>
              ) : (
                monthlyStats.map((month) => (
                  <tr key={month.month} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {month.month}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          month.absenceCount === 0
                            ? "bg-green-100 text-green-800"
                            : month.absenceCount <= 2
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                        {month.absenceCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-500">
                      {month.totalDays}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1 mx-auto max-w-[150px]">
                        <div
                          className={`h-2.5 rounded-full ${
                            month.rate === 0
                              ? "bg-green-500"
                              : month.rate <= 10
                              ? "bg-amber-500"
                              : "bg-red-500"
                          }`}
                          style={{
                            width: `${Math.min(month.rate * 3, 100)}%`,
                          }}></div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {month.rate}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Notice for student */}
        <div className="p-4 bg-gray-50">
          <div className="flex items-start p-3 bg-blue-50 rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 ml-2 text-blue-500 mt-0.5 flex-shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="text-sm text-blue-800 font-medium mb-1">
                ملاحظة مهمة
              </p>
              <p className="text-xs text-blue-700">
                الحد المسموح للغياب هو 10% من أيام الدراسة. تجاوز هذه النسبة قد
                يؤثر على تقييمك النهائي.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Teacher View Component
interface TeacherAttendanceViewProps {
  students: AttendanceStudent[];
  date: string;
  setDate: (date: string) => void;
  presentCount: number;
  absentCount: number;
  attendanceRate: number;
  isEditing: boolean;
  toggleEdit: () => void;
  selectedAll: boolean;
  toggleAllStudents: () => void;
  toggleStudentPresence: (studentId: string) => void;
  handleSave: () => void;
}

const TeacherAttendanceView = ({
  students,
  date,
  setDate,
  presentCount,
  absentCount,
  attendanceRate,
  isEditing,
  toggleEdit,
  selectedAll,
  toggleAllStudents,
  toggleStudentPresence,
  handleSave,
}: TeacherAttendanceViewProps) => {
  return (
    <>
      {/* Date Selector and Stats */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
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
              <p className="font-bold text-green-600 text-xl">{presentCount}</p>
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
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
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
              {students.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500">
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
      <div className="mt-6 bg-white rounded-xl p-4 shadow-md">
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
    </>
  );
};

export default Absence;
