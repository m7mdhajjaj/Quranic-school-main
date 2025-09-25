import { useState, useEffect } from "react";

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
  for (let h = 12; h <= 21; h++) {
    let displayHour = h;
    if (h > 12) displayHour = h - 12;
    hours.push(`${displayHour}:00`);
    if (h < 21) hours.push(`${displayHour}:30`);
  }

  // حلقات الحفظ (مواعيد الحلقات)
  const [sessions, setSessions] = useState<
    {
      _id?: string;
      day: string;
      startHour: string;
      endHour: string;
      note: string;
    }[]
  >([]);
  // API base
  const API = `${
    import.meta.env.VITE_API_URL || "http://localhost:5005"
  }/api/sessions`;

  // Fetch sessions from backend
  useEffect(() => {
    fetch(API)
      .then((res) => res.json())
      .then((data) => setSessions(data))
      .catch(() => setSessions([]));
  }, []);

  const [showForm, setShowForm] = useState(false);
  const [selectedDay, setSelectedDay] = useState(days[0]);
  const [startHour, setStartHour] = useState(hours[0]);
  const [endHour, setEndHour] = useState(hours[1]);
  const [note, setNote] = useState("");
  const [editIdx, setEditIdx] = useState<number | null>(null);

  // Detect user role from localStorage
  const user = localStorage.getItem("user");
  let role = "student";
  if (user) {
    try {
      role = JSON.parse(user).role || "student";
    } catch {}
  }

  // إضافة حلقة جديدة
  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    const startIdx = hours.indexOf(startHour);
    const endIdx = hours.indexOf(endHour);
    if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
      alert("يجب أن تكون ساعة الانتهاء بعد ساعة الابتداء.");
      return;
    }
    const sessionData = { day: selectedDay, startHour, endHour, note };
    if (editIdx !== null && sessions[editIdx]?._id) {
      // تعديل جلسة موجودة
      const id = sessions[editIdx]._id;
      const res = await fetch(`${API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionData),
      });
      if (res.ok) {
        const updated = await res.json();
        setSessions((prev) =>
          prev.map((s, idx) => (idx === editIdx ? updated : s))
        );
      }
    } else {
      // إضافة جلسة جديدة
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionData),
      });
      if (res.ok) {
        const added = await res.json();
        setSessions((prev) => [...prev, added]);
      }
    }
    setShowForm(false);
    setNote("");
    setEditIdx(null);
  };

  // حذف جلسة
  const handleDeleteSession = async (idx: number) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه الحلقة؟")) return;
    const id = sessions[idx]?._id;
    if (id) {
      const res = await fetch(`${API}/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSessions((prev) => prev.filter((_, i) => i !== idx));
      }
    }
  };

  // فتح نافذة التعديل
  const handleEditSession = (idx: number) => {
    const s = sessions[idx];
    setSelectedDay(s.day);
    setStartHour(s.startHour);
    setEndHour(s.endHour);
    setNote(s.note);
    setEditIdx(idx);
    setShowForm(true);
  };

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
            إضافة موعد حلقة
          </button>
        </div>
      )}
      {showForm && (
        <div className="fixed inset-0 bg-emerald-100 bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/90 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-emerald-200">
            <h3 className="text-xl font-bold mb-6 text-center text-emerald-700 border-b pb-3">
              إضافة موعد حلقة
            </h3>
            <form onSubmit={handleAddSession}>
              <div className="mb-3">
                <label className="block mb-1 font-bold text-emerald-700">
                  اليوم
                </label>
                <select
                  className="w-full border border-emerald-300 rounded-lg px-2 py-2 bg-emerald-50"
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}>
                  {days.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3 flex gap-2">
                <div className="flex-1">
                  <label className="block mb-1 font-bold text-emerald-700">
                    ساعة الابتداء
                  </label>
                  <select
                    className="w-full border border-emerald-300 rounded-lg px-2 py-2 bg-emerald-50"
                    value={startHour}
                    onChange={(e) => setStartHour(e.target.value)}>
                    {hours.map((hour, idx) => (
                      <option key={hour} value={hour}>
                        {hour}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block mb-1 font-bold text-emerald-700">
                    ساعة الانتهاء
                  </label>
                  <select
                    className="w-full border border-emerald-300 rounded-lg px-2 py-2 bg-emerald-50"
                    value={endHour}
                    onChange={(e) => setEndHour(e.target.value)}>
                    {hours.map((hour, idx) => (
                      <option key={hour} value={hour}>
                        {hour}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mb-3">
                <label className="block mb-1 font-bold text-emerald-700">
                  ملاحظة
                </label>
                <input
                  className="w-full border border-emerald-300 rounded-lg px-2 py-2 bg-emerald-50"
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
                  className="bg-gray-300 hover:bg-gray-400 text-emerald-700 font-bold py-2 px-4 rounded shadow"
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
                  {hours.map((h, hourIdx) => {
                    // Find if a session covers this slot
                    const sessionIdx = sessions.findIndex(
                      (s) =>
                        s.day === day &&
                        hours.indexOf(s.startHour) <= hourIdx &&
                        hourIdx < hours.indexOf(s.endHour)
                    );
                    const session =
                      sessionIdx !== -1 ? sessions[sessionIdx] : null;
                    // Stronger yellow color
                    const sessionCellClass = session
                      ? "border px-1 py-1 min-w-[40px] h-8 bg-yellow-300 text-yellow-900 font-bold relative text-center"
                      : "border px-1 py-1 min-w-[40px] h-8 bg-white text-center";
                    // Only show name/buttons in first cell, but color all cells
                    const isFirstCell =
                      session && hours.indexOf(session.startHour) === hourIdx;
                    return (
                      <td key={h + day} className={sessionCellClass}>
                        {session ? (
                          isFirstCell ? (
                            <div className="flex flex-col items-center justify-center h-full">
                              <span className="w-full text-center">
                                {session.note
                                  ? `${session.note} (${session.startHour} - ${session.endHour})`
                                  : `حلقة (${session.startHour} - ${session.endHour})`}
                              </span>
                              {(role === "teacher" || role === "admin") && (
                                <div className="flex gap-1 mt-1 justify-center">
                                  <button
                                    className="bg-yellow-500 hover:bg-yellow-600 text-xs text-yellow-900 font-bold py-1 px-2 rounded shadow"
                                    onClick={() =>
                                      handleEditSession(sessionIdx)
                                    }>
                                    تعديل
                                  </button>
                                  <button
                                    className="bg-red-500 hover:bg-red-600 text-xs text-white font-bold py-1 px-2 rounded shadow"
                                    onClick={() =>
                                      handleDeleteSession(sessionIdx)
                                    }>
                                    حذف
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : null
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 text-center text-sm text-gray-700">
            <p className="text-gray-600">كل خانة تمثل نصف ساعة.</p>
            <p className="text-gray-600">الحلقات تظهر باللون الأصفر.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timetable;
