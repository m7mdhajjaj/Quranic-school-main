// ============================================================================
// Timetable Types - تعريفات الأنواع لجدول الحصص
// ============================================================================
// ⚠️ النظام الجديد: يعتمد على sessionDate (التاريخ المحدد) وليس day (اسم اليوم)
// 📅 12 يناير (الاثنين) ≠ 19 يناير (الاثنين) - لا يوجد تعارض!

export type SessionType = "hifz" | "murajaah" | "both";

export interface Teacher {
  _id: string;
  firstName: string;
  lastName: string;
}

/**
 * واجهة الموعد (TimeTable)
 * ⚠️ sessionDate مطلوب للمواعيد الجديدة
 */
export interface Session {
  _id?: string;
  sessionDate: string;      // ⚠️ التاريخ المحدد - مطلوب! (YYYY-MM-DD أو ISO)
  day?: string;             // 🔄 يُشتق تلقائياً من sessionDate
  startHour: string;        // وقت البداية (HH:MM AM/PM)
  endHour: string;          // وقت النهاية (HH:MM AM/PM)
  note?: string;            // اسم الحلقة (اختياري)
  description?: string;     // وصف أو ملاحظات إضافية
  sessionType?: SessionType; // حفظ، مراجعة، أو الاثنين
  groupId?: string;         // معرف الحلقة
  teacherId?: string | Teacher; // معرف المعلم أو بياناته الكاملة
  sectionId?: string;       // معرف المقطع المرتبط
  sectionInfo?: {           // معلومات المقطع (من API)
    memorizationSection?: string;
    reviewSection?: string;
    marksStatus?: string;
  };
  teacherGroups?: {         // الحلقات المرتبطة بالمعلم
    _id: string;
    name: string;
  }[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Group {
  _id: string;
  name: string;
  teacher: string;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  fatherName?: string;
  role: "student" | "teacher" | "admin";
  group?: string;
}

export type UserRole = "student" | "teacher" | "admin";

/**
 * بيانات نموذج الموعد
 * ⚠️ sessionDate مطلوب!
 */
export interface SessionFormData {
  sessionDate: string;      // ⚠️ التاريخ المحدد - مطلوب! (YYYY-MM-DD)
  startHour: string;        // وقت البداية
  endHour: string;          // وقت النهاية
  note?: string;            // اسم الحلقة (اختياري)
  description?: string;     // وصف أو ملاحظات إضافية
  sessionType?: SessionType; // نوع الحصة
  teacherId: string;        // معرف المعلم - مطلوب
  groupId?: string;         // معرف الحلقة
  sectionId?: string;       // معرف المقطع المرتبط (اختياري)
}

/**
 * بيانات فحص التعارض
 * ⚠️ sessionDate مطلوب!
 */
export interface CheckConflictData {
  teacherId: string;
  sessionDate: string;      // ⚠️ التاريخ المحدد - مطلوب!
  startHour: string;
  endHour: string;
  excludeId?: string;       // لاستثناء الموعد الحالي عند التعديل
}

export interface TimetableState {
  sessions: Session[];
  loading: boolean;
  error: string | null;
  selectedGroup: string;
  teacherGroups: string[];
}

/**
 * خطأ التعارض من الـ Backend
 */
export interface ConflictError {
  isConflict: true;
  success: false;
  error: string;
  message: string;
  conflictDetails?: {
    sessionDate: string;    // التاريخ المتعارض
    day?: string;           // اسم اليوم (مشتق)
    startHour: string;
    endHour: string;
    note?: string;
    timetableId: string;
  };
}

/**
 * أيام الأسبوع بالعربية
 */
export const ARABIC_DAYS = [
  "السبت",
  "الأحد", 
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
] as const;

export type ArabicDay = typeof ARABIC_DAYS[number];

/**
 * دالة للحصول على اسم اليوم العربي من التاريخ
 */
export const getDayNameFromDate = (dateStr: string): ArabicDay => {
  const date = new Date(dateStr);
  const jsDay = date.getDay(); // 0 = Sunday, 6 = Saturday
  // تحويل: Sunday(0) -> الأحد(1), Saturday(6) -> السبت(0)
  const arabicIndex = (jsDay + 1) % 7;
  return ARABIC_DAYS[arabicIndex];
};

/**
 * دالة لتنسيق التاريخ للعرض
 */
export const formatDateForDisplay = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * دالة لتنسيق التاريخ للإرسال للـ API
 */
export const formatDateForAPI = (date: Date): string => {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
};
