import { useState } from "react";

const Timetable = () => {
  const days = [
    "السبت",
    "الأحد",
    "الاثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
    "الجمعة",
  ];

  // ساعات اليوم من 12 ظهراً حتى 7 مساءً (نصف ساعة لكل خانة)
  const hours: string[] = [];
  for (let h = 12; h <= 19; h++) {
    let displayHour = h;
    if (h > 12) displayHour = h - 12;
    hours.push(`${displayHour}:00`);
    if (h < 19) hours.push(`${displayHour}:30`);
  }

  const [showForm, setShowForm] = useState(false);
  const [selectedDay, setSelectedDay] = useState(days[0]);
  const [selectedHour, setSelectedHour] = useState(hours[0]);
  const [note, setNote] = useState("");

  // Detect user role from localStorage
  const user = localStorage.getItem("user");
  let role = "student";
  if (user) {
    try {
      role = JSON.parse(user).role || "student";
    } catch {}
  }

  return (
    <div className="overflow-auto p-4" dir="rtl">
      <h2 className="text-2xl font-bold mb-4 text-center">
        جدول الحصص الأسبوعي
      </h2>
      {(role === "teacher" || role === "admin") && (
        <div className="flex justify-center gap-4 mb-4">
          <button
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded shadow"
            onClick={() => setShowForm(true)}>
            إضافة موعد
          </button>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow"
            onClick={() => setShowForm(true)}>
            تعديل موعد
          </button>
          <button
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded shadow"
            onClick={() => alert("حذف موعد (يرجى ربطه بمنطق الحذف لاحقاً)")}>
            حذف موعد
          </button>
        </div>
      )}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4 text-center">
              إضافة موعد جديد
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                // هنا ممكن تضيف منطق الحفظ
                alert(
                  `تم إضافة موعد: ${selectedDay} - ${selectedHour} - ${note}`
                );
                setShowForm(false);
                setNote("");
              }}>
              <div className="mb-3">
                <label className="block mb-1 font-bold">اليوم</label>
                <select
                  className="w-full border rounded px-2 py-1"
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}>
                  {days.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="block mb-1 font-bold">الوقت</label>
                <select
                  className="w-full border rounded px-2 py-1"
                  value={selectedHour}
                  onChange={(e) => setSelectedHour(e.target.value)}>
                  {hours.map((hour) => (
                    <option key={hour} value={hour}>
                      {hour}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="block mb-1 font-bold">ملاحظة</label>
                <input
                  className="w-full border rounded px-2 py-1"
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="مثلاً اسم الحلقة أو ملاحظة..."
                />
              </div>
              <div className="flex justify-between mt-4">
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded shadow">
                  حفظ
                </button>
                <button
                  type="button"
                  className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded shadow"
                  onClick={() => setShowForm(false)}>
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="flex justify-center">
        <div className="bg-white rounded shadow p-4">
          <table className="min-w-max border text-center" dir="rtl">
            <thead>
              <tr>
                <th className="border px-2 py-1 bg-emerald-100">اليوم/الوقت</th>
                {hours.map((h) => (
                  <th
                    key={h}
                    className="border px-2 py-1 text-xs bg-emerald-50">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map((day) => (
                <tr key={day}>
                  <td className="border px-2 py-1 font-bold bg-emerald-50">
                    {day}
                  </td>
                  {hours.map((h) => (
                    <td
                      key={h + day}
                      className="border px-1 py-1 min-w-[40px] h-8 bg-white"></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 text-center text-sm text-gray-700">
            <p className="text-gray-600">كل خانة تمثل نصف ساعة.</p>
            <p className="text-gray-600">الدوام يظهر في المربعات الملونة.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timetable;
