// components/TeacherDailyView.tsx
import { memo, useState, useEffect, useCallback } from "react";
import {
  getGroupDailyPoints,
  resetStudentDailyPoints,
} from "@/Api/pointsGameApi";
import { LoadingSpinner } from "@/components/UI/LoadingSpinner";
import type {
  TeacherDailyViewProps,
  StudentDailyInfo,
} from "../types/pointsGame.types";
import { RotateCcw, Trophy, Calendar, AlertTriangle } from "lucide-react";

export const TeacherDailyView = memo(
  ({ groups, selectedGroupId, onGroupChange }: TeacherDailyViewProps) => {
    const [students, setStudents] = useState<StudentDailyInfo[]>([]);
    const [loading, setLoading] = useState(false);
    const [resettingId, setResettingId] = useState<string | null>(null);
    const [confirmResetId, setConfirmResetId] = useState<string | null>(null);
    const [message, setMessage] = useState<{
      type: "success" | "error";
      text: string;
    } | null>(null);

    // تحميل نقاط الطلاب اليومية
    const loadDailyPoints = useCallback(async () => {
      if (!selectedGroupId) return;
      setLoading(true);
      try {
        const response = await getGroupDailyPoints(selectedGroupId);
        setStudents(response.data || []);
      } catch (error) {
        console.error("خطأ في تحميل النقاط اليومية:", error);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    }, [selectedGroupId]);

    useEffect(() => {
      loadDailyPoints();
    }, [loadDailyPoints]);

    // تصفير نقاط طالب
    const handleResetPoints = useCallback(
      async (studentId: string, studentName: string) => {
        setResettingId(studentId);
        setConfirmResetId(null);
        try {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const dateStr = today.toISOString().split("T")[0];
          await resetStudentDailyPoints(studentId, dateStr);
          setMessage({
            type: "success",
            text: `تم تصفير نقاط ${studentName} بنجاح ✓`,
          });
          // إعادة تحميل البيانات
          await loadDailyPoints();
        } catch (error: any) {
          const errMsg = error?.message || "حدث خطأ أثناء تصفير النقاط";
          setMessage({ type: "error", text: errMsg });
        } finally {
          setResettingId(null);
          setTimeout(() => setMessage(null), 3000);
        }
      },
      [loadDailyPoints],
    );

    // إجمالي النقاط
    const totalGroupPoints = students.reduce(
      (sum, s) => sum + s.totalPoints,
      0,
    );
    const studentsWithData = students.filter((s) => s.hasData).length;

    return (
      <div className="space-y-4 sm:space-y-6">
        {/* اختيار الحلقة */}
        {groups.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 px-5 py-3">
              <label
                htmlFor="daily-group-select"
                className="block text-sm font-bold text-white">
                🏫 اختر الحلقة
              </label>
            </div>
            <div className="p-4">
              <select
                id="daily-group-select"
                value={selectedGroupId}
                onChange={(e) => onGroupChange(e.target.value)}
                className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all text-right bg-white">
                {groups.map((group) => (
                  <option key={group._id} value={group._id}>
                    {group.name} ({group.totalStudents} طالب)
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* رسالة التأكيد */}
        {message && (
          <div
            className={`p-3 rounded-xl text-sm font-bold text-center transition-all ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}>
            {message.text}
          </div>
        )}

        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-3 text-center">
            <div className="text-2xl font-black text-emerald-600">
              {students.length}
            </div>
            <div className="text-xs text-gray-500 mt-1">طالب</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-3 text-center">
            <div className="text-2xl font-black text-blue-600">
              {studentsWithData}
            </div>
            <div className="text-xs text-gray-500 mt-1">سجّلوا اليوم</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-3 text-center">
            <div className="text-2xl font-black text-amber-600">
              {totalGroupPoints}
            </div>
            <div className="text-xs text-gray-500 mt-1">إجمالي النقاط</div>
          </div>
        </div>

        {/* قائمة الطلاب */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-white" />
              <h2 className="text-sm font-bold text-white">نقاط اليوم</h2>
            </div>
            <span className="text-xs text-white/70">
              {new Date().toLocaleDateString("ar-SA", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>

          <div className="p-4">
            {loading ? (
              <LoadingSpinner
                size="lg"
                color="emerald"
                text="جاري تحميل نقاط الطلاب..."
                showIcon={true}
              />
            ) : students.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-gray-600 text-lg font-bold">لا يوجد طلاب</p>
                <p className="text-gray-500 text-sm mt-2">
                  اختر حلقة تحتوي على طلاب
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {students.map((student, index) => (
                  <div
                    key={student.studentId}
                    className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl transition-all duration-200 ${
                      student.totalPoints > 0
                        ? index < 3
                          ? "bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200/60"
                          : "bg-emerald-50/50 border border-emerald-100"
                        : "bg-gray-50 border border-gray-100"
                    }`}>
                    {/* الترتيب */}
                    <div className="flex-shrink-0">
                      <div
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-black text-sm sm:text-base ${
                          index === 0 && student.totalPoints > 0
                            ? "bg-gradient-to-br from-yellow-300 to-yellow-500 text-yellow-900"
                            : index === 1 && student.totalPoints > 0
                              ? "bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800"
                              : index === 2 && student.totalPoints > 0
                                ? "bg-gradient-to-br from-orange-300 to-orange-500 text-orange-900"
                                : "bg-gray-200 text-gray-600"
                        }`}>
                        {index + 1}
                      </div>
                    </div>

                    {/* أيقونة */}
                    <div className="text-xl sm:text-2xl">
                      {student.totalPoints > 0 ? (
                        <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />
                      ) : (
                        <span className="text-gray-300">👤</span>
                      )}
                    </div>

                    {/* الاسم */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm sm:text-base text-gray-800 truncate">
                        {student.name}
                      </h3>
                      <span
                        className={`text-xs ${
                          student.hasData ? "text-emerald-600" : "text-gray-400"
                        }`}>
                        {student.hasData ? "✓ سجّل اليوم" : "لم يسجّل بعد"}
                      </span>
                    </div>

                    {/* النقاط */}
                    <div className="text-left flex-shrink-0 ml-2">
                      <div
                        className={`text-xl sm:text-2xl font-black ${
                          student.totalPoints > 0
                            ? "text-emerald-600"
                            : "text-gray-300"
                        }`}>
                        {student.totalPoints}
                      </div>
                      <div className="text-[10px] text-gray-500">نقطة</div>
                    </div>

                    {/* زر التصفير */}
                    {student.hasData && (
                      <div className="flex-shrink-0">
                        {confirmResetId === student.studentId ? (
                          <div className="flex gap-1">
                            <button
                              onClick={() =>
                                handleResetPoints(
                                  student.studentId,
                                  student.name,
                                )
                              }
                              disabled={resettingId === student.studentId}
                              className="px-2 py-1 text-xs font-bold bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50">
                              {resettingId === student.studentId
                                ? "..."
                                : "تأكيد"}
                            </button>
                            <button
                              onClick={() => setConfirmResetId(null)}
                              className="px-2 py-1 text-xs font-bold bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors">
                              إلغاء
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmResetId(student.studentId)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="تصفير النقاط">
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* تنبيه */}
        <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200/60">
          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-700">
            تصفير النقاط سيحذف جميع بيانات الطالب لهذا اليوم نهائياً ولا يمكن
            التراجع عنه.
          </p>
        </div>
      </div>
    );
  },
);

TeacherDailyView.displayName = "TeacherDailyView";
