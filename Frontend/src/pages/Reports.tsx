import { useState, useEffect } from "react";
import MarksBarChart from "../components/MarksBarChart";

const Reports = () => {
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string>("teacher");

  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        setUserRole(user.role || "teacher");
      } catch {
        setUserRole("teacher");
      }
    }
  }, []);
///aaxas
  return (
    <div className="container mx-auto py-8" dir="rtl">
      <h1 className="text-2xl font-bold mb-6 text-center">الحلقات</h1>
      <div className="bg-white rounded-xl shadow-md p-4 mb-8 max-w-md mx-auto">
        <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
          فلترة حسب الشهر والسنة
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              اختر الشهر (اختياري):
            </label>
            <select
              value={selectedMonth ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedMonth(val ? Number(val) : null);
              }}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="">آخر 6 أشهر</option>
              <option value={1}>يناير (1)</option>
              <option value={2}>فبراير (2)</option>
              <option value={3}>مارس (3)</option>
              <option value={4}>أبريل (4)</option>
              <option value={5}>مايو (5)</option>
              <option value={6}>يونيو (6)</option>
              <option value={7}>يوليو (7)</option>
              <option value={8}>أغسطس (8)</option>
              <option value={9}>سبتمبر (9)</option>
              <option value={10}>أكتوبر (10)</option>
              <option value={11}>نوفمبر (11)</option>
              <option value={12}>ديسمبر (12)</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              اختر السنة (اختياري):
            </label>
            <select
              value={selectedYear ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedYear(val ? Number(val) : null);
              }}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="">آخر 6 أشهر</option>
              <option value={2023}>2023</option>
              <option value={2024}>2024</option>
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
            </select>
          </div>
        </div>
      </div>
      {/* يمكنك هنا عرض النتائج حسب الفلترة */}
      <div className="bg-white rounded-xl shadow-md p-6 max-w-2xl mx-auto mt-8">
        {userRole === "student" ? (
          <>
            <h2 className="text-lg font-bold mb-4 text-center">علاماتي</h2>
            {selectedMonth && selectedYear ? (
              <MarksBarChart
                labels={[`${selectedMonth}/${selectedYear}`]}
                data={[7.5]} // بيانات تجريبية لعلامات الطالب
              />
            ) : (
              <MarksBarChart
                labels={[
                  "4/2025",
                  "5/2025",
                  "6/2025",
                  "7/2025",
                  "8/2025",
                  "9/2025",
                ]}
                data={[7.2, 7.8, 8.0, 7.5, 8.1, 7.9]} // بيانات تجريبية لعلامات الطالب
              />
            )}
            <div className="text-center mt-4 text-gray-500 text-sm">
              {selectedMonth && selectedYear
                ? `* يتم عرض علاماتك للشهر المحدد.`
                : `* يتم عرض علاماتك لآخر 6 أشهر.`}
            </div>
          </>
        ) : (
          <>
            <h2 className="text-lg font-bold mb-4 text-center">
              متوسط العلامات لجميع الطلاب
            </h2>
            {selectedMonth && selectedYear ? (
              <MarksBarChart
                labels={[`${selectedMonth}/${selectedYear}`]}
                data={[8.1]}
              />
            ) : (
              <MarksBarChart
                labels={[
                  "4/2025",
                  "5/2025",
                  "6/2025",
                  "7/2025",
                  "8/2025",
                  "9/2025",
                ]}
                data={[7.8, 8.2, 7.5, 8.0, 7.9, 8.1]}
              />
            )}
            <div className="text-center mt-4 text-gray-500 text-sm">
              {selectedMonth && selectedYear
                ? `* يتم عرض متوسط العلامات لجميع الطلاب للشهر المحدد.`
                : `* يتم عرض متوسط العلامات لجميع الطلاب لآخر 6 أشهر.`}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Reports;
