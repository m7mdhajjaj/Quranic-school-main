// services/CounterService.js
const Counter = require("../../schema/Counter");

/**
 * Counter Service - خدمة إدارة الأرقام التسلسلية
 * ==============================================
 * 
 * واجهة موحدة للتعامل مع نظام العدادات
 * 
 * الاستخدام:
 * ---------
 * const CounterService = require("../services/CounterService");
 * 
 * // الحصول على ID جديد للطالب
 * const studentId = await CounterService.getNextStudentId();
 * 
 * // إعادة ID محذوف للتدوير
 * await CounterService.recycleStudentId(deletedStudentId);
 */

class CounterService {
  // ============================================================================
  // STUDENT IDs
  // ============================================================================

  /**
   * الحصول على الرقم التالي للطالب
   * @returns {Promise<number>}
   */
  static async getNextStudentId() {
    return await Counter.getNextId("student");
  }

  /**
   * إعادة رقم طالب للتدوير
   * @param {number} id
   */
  static async recycleStudentId(id) {
    await Counter.recycleId("student", id);
  }

  /**
   * إعادة عدة أرقام طلاب للتدوير
   * @param {number[]} ids
   */
  static async recycleStudentIds(ids) {
    await Counter.recycleMultipleIds("student", ids);
  }

  // ============================================================================
  // TEACHER IDs
  // ============================================================================

  /**
   * الحصول على الرقم التالي للمعلم
   * @returns {Promise<number>}
   */
  static async getNextTeacherId() {
    return await Counter.getNextId("teacher");
  }

  /**
   * إعادة رقم معلم للتدوير
   * @param {number} id
   */
  static async recycleTeacherId(id) {
    await Counter.recycleId("teacher", id);
  }

  /**
   * إعادة عدة أرقام معلمين للتدوير
   * @param {number[]} ids
   */
  static async recycleTeacherIds(ids) {
    await Counter.recycleMultipleIds("teacher", ids);
  }

  // ============================================================================
  // ADMIN IDs
  // ============================================================================

  /**
   * الحصول على الرقم التالي للمشرف
   * @returns {Promise<number>}
   */
  static async getNextAdminId() {
    return await Counter.getNextId("admin");
  }

  /**
   * إعادة رقم مشرف للتدوير
   * @param {number} id
   */
  static async recycleAdminId(id) {
    await Counter.recycleId("admin", id);
  }

  /**
   * إعادة عدة أرقام مشرفين للتدوير
   * @param {number[]} ids
   */
  static async recycleAdminIds(ids) {
    await Counter.recycleMultipleIds("admin", ids);
  }

  // ============================================================================
  // TEACHER ASSISTANT IDs
  // ============================================================================

  /**
   * الحصول على الرقم التالي لمساعد المعلم
   * @returns {Promise<number>}
   */
  static async getNextTeacherAssistantId() {
    return await Counter.getNextId("teacherAssistant");
  }

  /**
   * إعادة رقم مساعد معلم للتدوير
   * @param {number} id
   */
  static async recycleTeacherAssistantId(id) {
    await Counter.recycleId("teacherAssistant", id);
  }

  /**
   * إعادة عدة أرقام مساعدي معلمين للتدوير
   * @param {number[]} ids
   */
  static async recycleTeacherAssistantIds(ids) {
    await Counter.recycleMultipleIds("teacherAssistant", ids);
  }

  // ============================================================================
  // GENERIC METHODS
  // ============================================================================

  /**
   * الحصول على حالة عداد معين
   * @param {"student"|"teacher"|"admin"|"teacherAssistant"} type
   * @returns {Promise<Object>}
   */
  static async getCounterStatus(type) {
    return await Counter.getStatus(type);
  }

  /**
   * الحصول على حالة جميع العدادات
   * @returns {Promise<Object>}
   */
  static async getAllCountersStatus() {
    const [student, teacher, admin, teacherAssistant] = await Promise.all([
      Counter.getStatus("student"),
      Counter.getStatus("teacher"),
      Counter.getStatus("admin"),
      Counter.getStatus("teacherAssistant"),
    ]);

    return { student, teacher, admin, teacherAssistant };
  }

  /**
   * حجز عدة IDs دفعة واحدة (للاستيراد المجمع)
   * @param {"student"|"teacher"|"admin"} type
   * @param {number} count
   * @returns {Promise<number[]>}
   */
  static async reserveIds(type, count) {
    return await Counter.reserveMultipleIds(type, count);
  }

  // ============================================================================
  // INITIALIZATION - للترقية من النظام القديم
  // ============================================================================

  /**
   * تهيئة العدادات من البيانات الموجودة
   * يُستخدم مرة واحدة عند الترقية
   */
  static async initializeFromDatabase() {
    const Student = require("../../schema/Student/Student");
    const Teacher = require("../../schema/Teacher");
    const Admin = require("../../schema/Admin");

    console.log("🔄 [CounterService] Initializing counters from existing data...");

    // تهيئة عداد الطلاب
    const students = await Student.find({}, { studentId: 1 }).lean();
    const studentIds = students.map((s) => s.studentId).filter((id) => id);
    const maxStudentId = studentIds.length > 0 ? Math.max(...studentIds) : 0;
    await Counter.initializeFromExisting("student", maxStudentId, studentIds);

    // تهيئة عداد المعلمين
    const teachers = await Teacher.find({}, { teacherId: 1 }).lean();
    const teacherIds = teachers.map((t) => t.teacherId).filter((id) => id);
    const maxTeacherId = teacherIds.length > 0 ? Math.max(...teacherIds) : 0;
    await Counter.initializeFromExisting("teacher", maxTeacherId, teacherIds);

    // تهيئة عداد المشرفين
    const admins = await Admin.find({}, { adminId: 1 }).lean();
    const adminIds = admins.map((a) => a.adminId).filter((id) => id);
    const maxAdminId = adminIds.length > 0 ? Math.max(...adminIds) : 0;
    await Counter.initializeFromExisting("admin", maxAdminId, adminIds);

    // تهيئة عداد مساعدي المعلمين
    const TeacherAssistant = require("../../schema/TeacherAssistant");
    const teacherAssistants = await TeacherAssistant.find({}, { assistantId: 1 }).lean();
    const teacherAssistantIds = teacherAssistants.map((ta) => ta.assistantId).filter((id) => id);
    const maxTeacherAssistantId = teacherAssistantIds.length > 0 ? Math.max(...teacherAssistantIds) : 600;
    await Counter.initializeFromExisting("teacherAssistant", maxTeacherAssistantId, teacherAssistantIds);

    console.log("✅ [CounterService] All counters initialized successfully");

    return {
      student: { max: maxStudentId, count: studentIds.length },
      teacher: { max: maxTeacherId, count: teacherIds.length },
      admin: { max: maxAdminId, count: adminIds.length },
      teacherAssistant: { max: maxTeacherAssistantId, count: teacherAssistantIds.length },
    };
  }

  /**
   * التحقق من أن العدادات مُهيأة
   * @returns {Promise<boolean>}
   */
  static async areCountersInitialized() {
    const counters = await Counter.find({});
    return counters.length === 4; // student, teacher, admin, teacherAssistant
  }

  /**
   * تهيئة تلقائية إذا لم تكن العدادات موجودة
   */
  static async ensureInitialized() {
    const initialized = await this.areCountersInitialized();
    if (!initialized) {
      console.log("⚠️ [CounterService] Counters not found, initializing...");
      await this.initializeFromDatabase();
    }
  }
}

module.exports = CounterService;
