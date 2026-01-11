// ============================================================================
// SessionModal - نافذة إضافة/تعديل موعد الحلقة
// ============================================================================

import React from "react";
import { Modal } from "@/components/UI/Modal";
import { Button } from "@/components/UI/Button";
import type {
  Session,
  SessionFormData,
  UserRole,
} from "../types/timetable.types";
import { WEEK_DAYS, isSummerTime } from "../utils";
import { Calendar, Clock, Users, UserCircle } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { 
  useSessionForm, 
  useTeachers, 
  useTeacherGroups, 
  useSessionModalLogic,
  useTeacherSelection,
  useSessionDuration
} from "../hooks";

interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: SessionFormData, sessionId?: string) => Promise<boolean>;
  editingSession: Session | null;
  role: UserRole;
  teacherGroups?: string[];
  sessions: Session[];
  initialSectionId?: string;
  initialGroupName?: string;
}

export const SessionModal: React.FC<SessionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingSession,
  role,
  teacherGroups = [],
  initialSectionId,
  initialGroupName,
}) => {
  const [searchParams] = useSearchParams();
  const urlSectionId = searchParams.get('sectionId');
  const urlGroupName = searchParams.get('groupName');

  const effectiveSectionId = initialSectionId || urlSectionId || undefined;
  const effectiveGroupName = initialGroupName || urlGroupName || undefined;

  // ✅ استخدام الـ hooks المنفصلة لتنظيم أفضل
  const { formData, setFormData, hours, bookedHours, handleStartHourChange, resetForm } = useSessionForm({
    editingSession,
    role,
    teacherGroups,
    initialSectionId: effectiveSectionId,
    initialGroupName: effectiveGroupName,
  });

  const { teachers, loadingTeachers } = useTeachers({
    isOpen,
    enabled: role === "admin",
    onlyWithGroups: true, // جلب المعلمين الذين لديهم حلقات فقط
  });

  // ✅ جلب حلقات المعلم المختار (للأدمن فقط)
  const { teacherGroups: teacherGroupsList, loadingGroups } = useTeacherGroups({
    teacherId: formData.teacherId,
    isOpen,
    enabled: role === "admin",
  });
  
  // ✅ منطق المودال (validation + submit + close)
  const { loading, handleSubmit, handleClose } = useSessionModalLogic({
    onSubmit,
    editingSession,
    onClose,
    resetForm,
    bookedHours,
    formData,
  });

  // ✅ منطق اختيار المعلم
  const { selectedTeacher } = useTeacherSelection({
    teachers,
    teacherId: formData.teacherId,
  });

  // ✅ حساب مدة الحصة
  const duration = useSessionDuration({
    startHour: formData.startHour,
    endHour: formData.endHour,
    hours,
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editingSession ? "✏️ تعديل موعد حلقة" : "➕ إضافة موعد حلقة"}
      size="4xl">
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        {/* محتوى المودال - قابل للتمرير */}
        <div className="flex-1 overflow-y-auto px-1">
          <div className="space-y-6">
            {/* 1️⃣ قسم معلومات المعلم والحلقة - الأول */}
            {!formData.sectionId && (role === "admin" || role === "teacher") && (
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border-2 border-emerald-200">
                <h3 className="text-base font-bold text-emerald-900 mb-4 flex items-center gap-2">
                  <UserCircle className="w-5 h-5" />
                  {role === "admin" ? "1️⃣ اختر المعلّم والحلقة" : "حلقاتي"}
                </h3>

                {role === "admin" && (
                  <>
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
                          // عند تغيير المعلم، نعيد تعيين اسم الحلقة (note) لأن الحلقات تختلف
                          setFormData({ ...formData, teacherId: newTeacherId, note: "" });
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
                  </>
                )}

                {/* عرض قائمة حلقات المعلم للاختيار */}
                {((role === "admin" && formData.teacherId) || (role === "teacher" && teacherGroups.length > 0 && !editingSession)) && (
                    <div>
                      <label className="block text-sm font-bold text-emerald-900 mb-3">
                        اختر حلقة للموعد *
                      </label>
                      
                      {(role === "admin" && loadingGroups) ? (
                        <div className="flex items-center justify-center p-8 bg-emerald-50 rounded-lg border-2 border-emerald-200">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                          <span className="mr-3 text-emerald-700">جاري تحميل الحلقات...</span>
                        </div>
                      ) : ((role === "admin" && teacherGroupsList.length === 0) || (role === "teacher" && teacherGroups.length === 0)) ? (
                        <div className="p-6 text-center bg-gray-50 rounded-lg border-2 border-gray-200">
                          <Users className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                          <p className="text-gray-600 font-semibold">لا توجد حلقات لهذا المعلم</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-3 bg-white rounded-lg border-2 border-emerald-200">
                          {(role === "admin" ? teacherGroupsList : teacherGroups).map((group) => (
                            <button
                              key={group}
                              type="button"
                              onClick={() => setFormData({ ...formData, note: group })}
                              className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all border-2 text-right ${
                                formData.note === group
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg scale-105'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-400'
                              }`}>
                              <Users className="w-5 h-5 flex-shrink-0" />
                              <span className="flex-1 text-base">{group}</span>
                              {formData.note === group && (
                                <span className="text-xs bg-white text-emerald-600 px-2 py-1 rounded-full">✓</span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                )}
              </div>
            )}

            {/* 2️⃣ قسم اختيار اليوم والأوقات */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-blue-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {role === "admin" ? "2️⃣ اختر اليوم والأوقات" : "معلومات الحصة"}
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
              {/* اليوم */}
              {!formData.sectionId && !(role === "teacher" && editingSession) && (
              <div className="mb-5">
                <label className="block text-sm font-bold text-blue-900 mb-3">اليوم</label>
                <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
                  {WEEK_DAYS.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setFormData({ ...formData, day })}
                      className={`px-3 py-3 rounded-lg text-sm font-bold transition-all min-w-0 ${
                        formData.day === day
                          ? 'bg-blue-600 text-white shadow-lg scale-105'
                          : 'bg-white text-blue-700 hover:bg-blue-100 border-2 border-blue-200'
                      }`}>
                      <span className="block truncate">{day}</span>
                    </button>
                  ))}
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
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-2 max-h-56 overflow-y-auto p-3 bg-white rounded-lg border-2 border-blue-200">
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
                              ? 'bg-emerald-600 text-white shadow-md scale-105 text-sm'
                              : isBooked
                              ? 'bg-red-100 text-red-400 cursor-not-allowed opacity-60 line-through text-xs border border-red-200'
                              : 'bg-gray-50 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 border border-gray-200 text-xs'
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
                  <label className="block text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    وقت النهاية
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-2 max-h-56 overflow-y-auto p-3 bg-white rounded-lg border-2 border-blue-200">
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
                              ? 'bg-red-600 text-white shadow-md scale-105 text-sm'
                              : isBooked
                              ? 'bg-red-100 text-red-400 cursor-not-allowed opacity-60 line-through text-xs border border-red-200'
                              : isBeforeStart
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50 text-xs'
                              : 'bg-gray-50 text-gray-700 hover:bg-red-50 hover:text-red-700 border border-gray-200 text-xs'
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
                  <div className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-bold text-purple-900">
                      المدة: {duration.displayText}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 3️⃣ قسم نوع الحصة والملاحظات */}
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4 border-2 border-amber-200">
              <h3 className="text-base font-bold text-amber-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                {role === "admin" ? "3️⃣ نوع الحصة والملاحظات" : "معلومات الحلقة"}
              </h3>

              {/* نوع الحصة */}
              {(role === "teacher" || role === "admin") && (
                <div>
                  <label className="block text-sm font-bold text-amber-900 mb-3">نوع الحصة *</label>
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

        {/* أزرار العمل - ثابتة في الأسفل */}
        <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t-2 border-gray-100 mt-4">
          <div className="flex gap-3">
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
        </div>
      </form>
    </Modal>
  );
};
