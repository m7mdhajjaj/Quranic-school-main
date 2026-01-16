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
 * ⚠️ sessionDate مطلوب للمواعيد الجديدة أو day للمتكررة
 */
export interface Session {
  _id?: string;
  sessionDate?: string;     // التاريخ المحدد (YYYY-MM-DD أو ISO) - قد يكون فارغ للمتكررة
  day?: string;             // اسم اليوم - مطلوب للمواعيد المتكررة
  startHour: string;        // وقت البداية (HH:MM AM/PM)
  endHour: string;          // وقت النهاية (HH:MM AM/PM)
  note?: string;            // اسم الحلقة (اختياري)
  groupName?: string;       // ✅ اسم الحلقة (من العلاقة)
  description?: string;     // وصف أو ملاحظات إضافية
  sessionType?: SessionType; // حفظ، مراجعة، أو الاثنين
  groupId?: string;         // معرف الحلقة
  teacherId?: string | Teacher; // معرف المعلم أو بياناته الكاملة
  sectionId?: string;       // معرف المقطع المرتبط
  isRecurring?: boolean;    // ✅ هل الموعد متكرر أسبوعياً
  sectionInfo?: {           // معلومات المقطع (من API)
    memorizationSection?: string;
    reviewSection?: string;
    marksStatus?: string;
  };
  sectionDetails?: {        // ✅ معلومات المقطع المُحسّنة (من Backend)
    surahName?: string;           // اسم السورة
    memorizationSection?: string; // مقطع الحفظ (السورة + الآيات)
    reviewSection?: string;       // مقطع المراجعة
    marksStatus?: string;         // حالة الدرجات
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
export type ArabicDay = 
  | "السبت"
  | "الأحد" 
  | "الاثنين"
  | "الثلاثاء"
  | "الأربعاء"
  | "الخميس"
  | "الجمعة";
