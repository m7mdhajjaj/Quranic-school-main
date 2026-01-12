// ============================================================================
// SessionModal - نافذة إضافة/تعديل موعد الحلقة
// ============================================================================
// ⚠️ النظام الجديد: يعتمد على sessionDate (التاريخ المحدد)

import React from "react";
import { Modal } from "@/components/UI/Modal";
import { Button } from "@/components/UI/Button";
import type {
  Session,
  SessionFormData,
  UserRole,
} from "../types/timetable.types";
import { isSummerTime, getTodayDate } from "../utils";
import { Calendar, Clock, UserCircle, BookOpen, RotateCcw, BookMarked, GraduationCap, CalendarCheck, TimerIcon, Sparkles, Sun, Snowflake } from "lucide-react";
import { useSessionModalController } from "../hooks";

interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: SessionFormData, sessionId?: string) => Promise<boolean>;
  editingSession: Session | null;
  role: UserRole;
}

export const SessionModal: React.FC<SessionModalProps> = (props) => {
  const {
    isOpen, editingSession, role
  } = props;

  // ✅ استخدام الهوك المجمع لفصل المنطق (Controller)
  const {
    formData,
    setFormData,
    hours,
    bookedHours,
    handleStartHourChange,
    handleDateChange,
    selectedDayName,
    duration,
    teachers,
    loadingTeachers,
    selectedTeacher,
    loading,
    handleSubmit,
    handleClose,
  } = useSessionModalController({
    isOpen: props.isOpen,
    onClose: props.onClose,
    onSubmit: props.onSubmit,
    editingSession: props.editingSession,
    role: props.role
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editingSession ? "✏️ تعديل موعد حلقة" : "➕ إضافة موعد حلقة"}
      size="4xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* محتوى المودال */}
        <div className="space-y-6 max-h-[calc(80vh-120px)] overflow-y-auto px-1 scrollbar-hide">
          <div className="space-y-6">
            {/* 1️⃣ قسم معلومات المعلم (للمدير فقط) */}
            {role === "admin" && (
              <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 rounded-xl p-5 border-2 border-emerald-300 shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-base font-bold text-emerald-900 mb-4 flex items-center gap-2">
                  <GraduationCap className="w-6 h-6 text-emerald-600" />
                  1️⃣ اختر المعلّم
                </h3>

                {/* اختيار المعلم */}
                <div className="mb-4">
                  <label className="block text-sm font-bold text-emerald-900 mb-3">
                    اختر المعلم *
                  </label>
                  {loadingTeachers ? (
                    <div className="flex items-center justify-center p-8 bg-emerald-50 rounded-lg border-2 border-emerald-300">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                      <span className="mr-3 text-emerald-700">جاري تحميل المعلمين...</span>
                    </div>
                  ) : (
                    <select
                      value={formData.teacherId}
                      onChange={(e) => {
                        const newTeacherId = e.target.value;
                        setFormData({ ...formData, teacherId: newTeacherId });
                      }}
                      aria-label="اختر المعلم"
                      className="w-full px-4 py-3 border-2 border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-base bg-white hover:border-emerald-400 transition-colors">
                      <option value="">-- اختر المعلم --</option>
                      {teachers.map((teacher) => (
                        <option key={teacher._id} value={teacher._id}>
                          {teacher.firstName} {teacher.lastName}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* عرض بطاقة المعلم المختار */}
                {selectedTeacher && (
                  <div className="mb-4 flex items-center justify-between p-4 bg-gradient-to-r from-white to-emerald-50 rounded-lg border-2 border-emerald-400 shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-100 p-2 rounded-full">
                        <GraduationCap className="w-8 h-8 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-bold text-emerald-900">
                          {selectedTeacher.firstName} {selectedTeacher.lastName}
                        </p>
                        <p className="text-xs text-emerald-600">معلم مسؤول</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-emerald-600 font-medium">نشط</span>
                      <span className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse shadow-lg" title="نشط"></span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2️⃣ قسم اختيار التاريخ والأوقات */}
            <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-xl p-5 border-2 border-green-300 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-green-900 flex items-center gap-2">
                  <CalendarCheck className="w-6 h-6 text-green-600" />
                  {role === "admin" ? "2️⃣ اختر التاريخ والأوقات" : "1️⃣ اختر التاريخ والأوقات"}
                </h3>
                {/* عرض التوقيت الحالي */}
                <div className="flex flex-col items-end gap-1 bg-gradient-to-r from-white to-green-50 px-4 py-2 rounded-lg border-2 border-green-400 shadow-sm">
                  <span className="text-xs font-bold text-green-900 flex items-center gap-1">
                    {isSummerTime() ? <><Sun className="w-3 h-3" /> توقيت صيفي</> : <><Snowflake className="w-3 h-3" /> توقيت شتوي</>}
                  </span>
                  <span className="text-[10px] text-green-600">
                    {isSummerTime() ? '12:00 PM - 9:00 PM' : '11:00 AM - 8:00 PM'}
                  </span>
                </div>
              </div>
              
              {/* ⚠️ اختيار التاريخ (بدلاً من اليوم) */}
              {!formData.sectionId && (
              <div className="mb-5">
                <label htmlFor="session-date-input" className="block text-sm font-bold text-green-900 mb-3">
                  التاريخ *
                  {formData.sectionId && (
                    <span className="text-xs font-normal text-red-500 bg-red-50 px-2 py-0.5 rounded-full mr-2">
                      (مرتبط بتاريخ المقطع)
                    </span>
                  )}
                </label>
                <div className="flex items-center gap-4">
                  <input
                    id="session-date-input"
                    type="date"
                    value={formData.sessionDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    disabled={!!formData.sectionId}
                    min={getTodayDate()}
                    aria-label="اختر تاريخ الحصة"
                    className={`flex-1 px-4 py-3 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base bg-white hover:border-green-400 transition-colors ${
                      formData.sectionId ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  />
                  {/* عرض اسم اليوم المختار */}
                  {selectedDayName && (
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-3 rounded-lg font-bold text-base shadow-lg flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      {selectedDayName}
                    </div>
                  )}
                </div>
              </div>
              )}

              {/* Time Picker أفقي */}
              <div className="space-y-5">
                {/* وقت البداية */}
                <div>
                  <label className="block text-sm font-bold text-green-900 mb-3 flex items-center gap-2">
                    <TimerIcon className="w-5 h-5 text-emerald-600" />
                    وقت البداية
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-2 max-h-56 overflow-y-auto p-3 bg-gradient-to-br from-white to-green-50 rounded-lg border-2 border-green-300 scrollbar-hide">
                    {hours.map((hour) => {
                      const isBooked = bookedHours.includes(hour);
                      return (
                        <button
                          key={hour}
                          type="button"
                          onClick={() => !isBooked && handleStartHourChange(hour)}
                          disabled={isBooked}
                          className={`px-2 py-3 rounded-lg font-bold transition-all min-w-0 text-center ${
                            formData.startHour === hour
                              ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg scale-105 text-sm border-2 border-green-400'
                              : isBooked
                              ? 'bg-red-100 text-red-400 cursor-not-allowed opacity-60 line-through text-xs border border-red-200'
                              : 'bg-white text-gray-700 hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 hover:text-green-700 border-2 border-gray-200 hover:border-green-300 text-xs'
                          }`}
                          title={isBooked ? '🚫 محجوز' : ''}>
                          <div className="flex flex-col leading-tight">
                            <span className="block">{hour.split(' ')[0]}</span>
                            <span className="block text-[10px]">{hour.split(' ')[1]}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* وقت النهاية */}
                <div>
                  <label className="block text-sm font-bold text-green-900 mb-3 flex items-center gap-2">
                    <TimerIcon className="w-5 h-5 text-teal-600" />
                    وقت النهاية
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-2 max-h-56 overflow-y-auto p-3 bg-gradient-to-br from-white to-teal-50 rounded-lg border-2 border-teal-300 scrollbar-hide">
                    {hours.map((hour) => {
                      const isBooked = bookedHours.includes(hour);
                      const isBeforeStart = hours.indexOf(hour) <= hours.indexOf(formData.startHour);
                      const isDisabled = isBooked || isBeforeStart;
                      
                      return (
                        <button
                          key={hour}
                          type="button"
                          onClick={() => !isDisabled && setFormData({ ...formData, endHour: hour })}
                          disabled={isDisabled}
                          className={`px-2 py-3 rounded-lg font-bold transition-all min-w-0 text-center ${
                            formData.endHour === hour
                              ? 'bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-lg scale-105 text-sm border-2 border-teal-400'
                              : isBooked
                              ? 'bg-red-100 text-red-400 cursor-not-allowed opacity-60 line-through text-xs border border-red-200'
                              : isBeforeStart
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50 text-xs'
                              : 'bg-white text-gray-700 hover:bg-gradient-to-br hover:from-teal-50 hover:to-cyan-50 hover:text-teal-700 border-2 border-gray-200 hover:border-teal-300 text-xs'
                          }`}
                          title={isBooked ? '🚫 محجوز' : isBeforeStart ? 'قبل وقت البداية' : ''}>
                          <div className="flex flex-col leading-tight">
                            <span className="block">{hour.split(' ')[0]}</span>
                            <span className="block text-[10px]">{hour.split(' ')[1]}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* عرض المدة المحسوبة */}
                {duration && (
                  <div className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 rounded-lg border-2 border-emerald-400 shadow-md">
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm font-bold text-emerald-900">
                      المدة: {duration.displayText}
                    </span>
                  </div>
                )}

                {/* رسالة تأكيد الوقت في وضع التعديل */}
                {editingSession && formData.startHour === editingSession.startHour && formData.endHour === editingSession.endHour && (
                  <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border-2 border-emerald-400 shadow-sm">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm text-emerald-700">
                      الوقت المحدد هو نفس الوقت المحجوز حالياً للحلقة
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 3️⃣ قسم نوع الحصة والملاحظات */}
            <div className="bg-gradient-to-br from-lime-50 via-green-50 to-emerald-50 rounded-xl p-5 border-2 border-lime-300 shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-base font-bold text-green-900 mb-4 flex items-center gap-2">
                <BookMarked className="w-6 h-6 text-green-600" />
                {role === "admin" ? "3️⃣ نوع الحصة والملاحظات" : "2️⃣ نوع الحصة والملاحظات"}
              </h3>

              {/* نوع الحصة */}
              {(role === "teacher" || role === "admin") && (
                <div>
                  <label className="block text-sm font-bold text-green-900 mb-3">
                    نوع الحصة *
                    {formData.sectionId && (
                      <span className="text-xs font-normal text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mr-2">
                        (محدد تلقائياً من المقطع)
                      </span>
                    )}
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, sessionType: "hifz" })}
                      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl font-bold transition-all border-2 ${
                        formData.sessionType === "hifz"
                          ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white border-emerald-400 shadow-xl scale-105'
                          : 'bg-white text-green-700 border-green-200 hover:bg-gradient-to-br hover:from-emerald-50 hover:to-green-50 hover:border-emerald-400'
                      }`}>
                      <BookOpen className="w-7 h-7" />
                      <span className="text-sm">حفظ</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, sessionType: "murajaah" })}
                      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl font-bold transition-all border-2 ${
                        formData.sessionType === "murajaah"
                          ? 'bg-gradient-to-br from-teal-500 to-cyan-600 text-white border-teal-400 shadow-xl scale-105'
                          : 'bg-white text-green-700 border-green-200 hover:bg-gradient-to-br hover:from-teal-50 hover:to-cyan-50 hover:border-teal-400'
                      }`}>
                      <RotateCcw className="w-7 h-7" />
                      <span className="text-sm">مراجعة</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, sessionType: "both" })}
                      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl font-bold transition-all border-2 ${
                        formData.sessionType === "both"
                          ? 'bg-gradient-to-br from-lime-500 to-green-600 text-white border-lime-400 shadow-xl scale-105'
                          : 'bg-white text-green-700 border-green-200 hover:bg-gradient-to-br hover:from-lime-50 hover:to-green-50 hover:border-lime-400'
                      }`}>
                      <BookMarked className="w-7 h-7" />
                      <span className="text-sm">كلاهما</span>
                    </button>
                  </div>
                </div>
              )}
              
              {/* حقل الوصف/الملاحظات */}
              <div className="mt-4">
                <label className="block text-sm font-bold text-green-900 mb-2">
                  ملاحظات أو وصف الحلقة
                </label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="أضف ملاحظات أو وصف تفصيلي عن الحلقة (اختياري)"
                  maxLength={500}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none text-sm bg-white hover:border-green-400 transition-colors"
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-green-600">يمكنك كتابة حتى 500 حرف</p>
                  <p className="text-xs font-semibold text-green-700">{formData.description?.length || 0}/500</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* أزرار العمل */}
        <div className="flex gap-3 pt-4 border-t-2 border-gray-100">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            fullWidth
            disabled={loading}>
            إلغاء
          </Button>
          <Button type="submit" variant="primary" fullWidth loading={loading}>
            {editingSession ? "💾 حفظ التعديل" : "➕ إضافة الموعد"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
