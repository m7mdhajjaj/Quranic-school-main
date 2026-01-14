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
import { isSummerTime, getTodayDate, isTimeInArray, findTimeIndex } from "../utils";
import { Calendar, Clock, UserCircle } from "lucide-react";
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
    bookedHoursDetails, // ✅ تفاصيل الأوقات المحجوزة للـ tooltip
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

  // ✅ Helper لبناء tooltip text للأوقات المحجوزة
  const getBookedHourTooltip = (hour: string): string => {
    const detailsList = bookedHoursDetails?.[hour];
    if (!detailsList || detailsList.length === 0) return '🚫 محجوز';
    
    // قد يكون هناك أكثر من جلسة في نفس الوقت (لحلقات مختلفة)
    const lines: string[] = [];
    detailsList.forEach((details, idx) => {
      if (idx > 0) lines.push('───────');
      lines.push(`📚 ${details.groupName || 'حلقة'}`);
      if (details.sectionName) lines.push(`📖 ${details.sectionName}`);
      if (details.studentName) lines.push(`👤 ${details.studentName}`);
      if (details.sessionTypeAr) lines.push(`📝 ${details.sessionTypeAr}`);
    });
    return lines.join('\n');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editingSession ? "✏️ تعديل موعد حلقة" : "➕ إضافة موعد حلقة"}
      size="4xl"
      bodyClassName="!p-0"
      footer={
        <div className="flex gap-3 w-full">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            fullWidth
            disabled={loading}>
            إلغاء
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            fullWidth 
            loading={loading}
            onClick={handleSubmit}>
            {editingSession ? "💾 حفظ التعديل" : "➕ إضافة الموعد"}
          </Button>
        </div>
      }>
      <form onSubmit={handleSubmit} className="flex flex-col">
        {/* محتوى المودال */}
        <div className="space-y-6 px-6 py-4">
          <div className="space-y-6">
            {/* 1️⃣ قسم معلومات المعلم (للمدير فقط) */}
            {role === "admin" && (
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border-2 border-emerald-200">
                <h3 className="text-base font-bold text-emerald-900 mb-4 flex items-center gap-2">
                  <UserCircle className="w-5 h-5" />
                  1️⃣ اختر المعلّم
                </h3>

                {/* اختيار المعلم */}
                <div className="mb-4">
                  <label className="block text-sm font-bold text-emerald-900 mb-3">
                    اختر المعلم *
                  </label>
                  {loadingTeachers ? (
                    <div className="flex items-center justify-center p-8 bg-emerald-50 rounded-lg border-2 border-emerald-200">
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
                      className="w-full px-4 py-3 border-2 border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-base">
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
                  <div className="mb-4 flex items-center justify-between p-4 bg-white rounded-lg border-2 border-emerald-300 shadow-sm">
                    <div className="flex items-center gap-3">
                      <UserCircle className="w-10 h-10 text-emerald-600" />
                      <div>
                        <p className="font-bold text-emerald-900">
                          {selectedTeacher.firstName} {selectedTeacher.lastName}
                        </p>
                        <p className="text-xs text-emerald-600">معلم مسؤول</p>
                      </div>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="نشط"></span>
                  </div>
                )}
              </div>
            )}

            {/* 2️⃣ قسم اختيار التاريخ والأوقات */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-blue-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {role === "admin" ? "2️⃣ اختر التاريخ والأوقات" : "1️⃣ اختر التاريخ والأوقات"}
                </h3>
                {/* عرض التوقيت الحالي */}
                <div className="flex flex-col items-end gap-1 bg-white px-3 py-2 rounded-lg border-2 border-blue-300">
                  <span className="text-xs font-bold text-blue-900">
                    {isSummerTime() ? '☀️ توقيت صيفي' : '❄️ توقيت شتوي'}
                  </span>
                  <span className="text-[10px] text-blue-600">
                    {isSummerTime() ? '12:00 PM - 9:00 PM' : '11:00 AM - 8:00 PM'}
                  </span>
                </div>
              </div>
              
              {/* ⚠️ اختيار التاريخ (بدلاً من اليوم) */}
              {!formData.sectionId && (
              <div className="mb-5">
                <label htmlFor="session-date-input" className="block text-sm font-bold text-blue-900 mb-3">
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
                    className={`flex-1 px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base ${
                      formData.sectionId ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  />
                  {/* عرض اسم اليوم المختار */}
                  {selectedDayName && (
                    <div className="bg-blue-600 text-white px-4 py-3 rounded-lg font-bold text-base shadow-lg">
                      📅 {selectedDayName}
                    </div>
                  )}
                </div>
              </div>
              )}

              {/* Time Picker أفقي */}
              <div className="space-y-5">
                {/* وقت البداية */}
                <div>
                  <label className="block text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    وقت البداية
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-2 p-3 bg-white rounded-lg border-2 border-blue-200">
                    {hours.map((hour) => {
                      const isBooked = isTimeInArray(bookedHours, hour);
                      return (
                        <button
                          key={hour}
                          type="button"
                          onClick={() => !isBooked && handleStartHourChange(hour)}
                          disabled={isBooked}
                          className={`px-2 py-3 rounded-lg font-bold transition-all min-w-0 text-center ${
                            formData.startHour === hour
                              ? 'bg-emerald-600 text-white shadow-md scale-105 text-sm'
                              : isBooked
                              ? 'bg-red-100 text-red-400 cursor-not-allowed opacity-60 line-through text-xs border border-red-200'
                              : 'bg-gray-50 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 border border-gray-200 text-xs'
                          }`}
                          title={isBooked ? getBookedHourTooltip(hour) : ''}>
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
                  <label className="block text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    وقت النهاية
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-2 p-3 bg-white rounded-lg border-2 border-blue-200">
                    {hours.map((hour) => {
                      const hourIdx = findTimeIndex(hours, hour);
                      const startIdx = findTimeIndex(hours, formData.startHour);
                      const isBooked = isTimeInArray(bookedHours, hour);
                      const isBeforeStart = hourIdx <= startIdx;
                      
                      // ✅ منع اختيار وقت نهاية إذا كان هناك وقت محجوز بين البداية والنهاية
                      let hasBookedBetween = false;
                      if (!isBeforeStart && startIdx !== -1) {
                        for (let i = startIdx + 1; i < hourIdx; i++) {
                          if (isTimeInArray(bookedHours, hours[i])) {
                            hasBookedBetween = true;
                            break;
                          }
                        }
                      }
                      
                      const isDisabled = isBooked || isBeforeStart || hasBookedBetween;
                      
                      return (
                        <button
                          key={hour}
                          type="button"
                          onClick={() => !isDisabled && setFormData({ ...formData, endHour: hour })}
                          disabled={isDisabled}
                          className={`px-2 py-3 rounded-lg font-bold transition-all min-w-0 text-center ${
                            formData.endHour === hour
                              ? 'bg-red-600 text-white shadow-md scale-105 text-sm'
                              : isBooked
                              ? 'bg-red-100 text-red-400 cursor-not-allowed opacity-60 line-through text-xs border border-red-200'
                              : isBeforeStart || hasBookedBetween
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50 text-xs'
                              : 'bg-gray-50 text-gray-700 hover:bg-red-50 hover:text-red-700 border border-gray-200 text-xs'
                          }`}
                          title={isBooked ? getBookedHourTooltip(hour) : hasBookedBetween ? '🚫 يوجد وقت محجوز قبله' : isBeforeStart ? 'قبل وقت البداية' : ''}>
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
                  <div className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-bold text-purple-900">
                      المدة: {duration.displayText}
                    </span>
                  </div>
                )}

                {/* رسالة تأكيد الوقت في وضع التعديل */}
                {editingSession && formData.startHour === editingSession.startHour && formData.endHour === editingSession.endHour && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <span className="text-emerald-600">✓</span>
                    <span className="text-sm text-emerald-700">
                      الوقت المحدد هو نفس الوقت المحجوز حالياً للحلقة
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 3️⃣ قسم نوع الحصة والملاحظات */}
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4 border-2 border-amber-200">
              <h3 className="text-base font-bold text-amber-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                {role === "admin" ? "3️⃣ نوع الحصة والملاحظات" : "2️⃣ نوع الحصة والملاحظات"}
              </h3>

              {/* نوع الحصة */}
              {(role === "teacher" || role === "admin") && (
                <div>
                  <label className="block text-sm font-bold text-amber-900 mb-3">
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
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg scale-105'
                          : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:border-amber-400'
                      }`}>
                      <span className="text-2xl">📖</span>
                      <span className="text-sm">حفظ</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, sessionType: "murajaah" })}
                      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl font-bold transition-all border-2 ${
                        formData.sessionType === "murajaah"
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg scale-105'
                          : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:border-amber-400'
                      }`}>
                      <span className="text-2xl">🔄</span>
                      <span className="text-sm">مراجعة</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, sessionType: "both" })}
                      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl font-bold transition-all border-2 ${
                        formData.sessionType === "both"
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg scale-105'
                          : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:border-amber-400'
                      }`}>
                      <span className="text-2xl">📚</span>
                      <span className="text-sm">كلاهما</span>
                    </button>
                  </div>
                </div>
              )}
              
              {/* حقل الوصف/الملاحظات */}
              <div className="mt-4">
                <label className="block text-sm font-bold text-amber-900 mb-2">
                  ملاحظات أو وصف الحلقة
                </label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="أضف ملاحظات أو وصف تفصيلي عن الحلقة (اختياري)"
                  maxLength={500}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none text-sm"
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-amber-600">يمكنك كتابة حتى 500 حرف</p>
                  <p className="text-xs text-amber-600">{formData.description?.length || 0}/500</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};
