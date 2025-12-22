/**
 * 🟢 Online Users Manager
 * ======================
 * المصدر الوحيد للحقيقة لحالة المستخدمين Online/Offline
 * يعتمد 100% على Socket.io connections - لا يعتمد على DB
 * 
 * @module OnlineUsersManager
 * @description إدارة مركزية لحالة المستخدمين المتصلين
 */

class OnlineUsersManager {
  constructor() {
    /**
     * خريطة المستخدمين المتصلين
     * @type {Map<string, {socketId: string, role: string, firstName: string, connectedAt: string}>}
     */
    this.onlineUsers = new Map();
    
    /**
     * خريطة عكسية: socketId -> userId
     * @type {Map<string, string>}
     */
    this.socketToUser = new Map();
    
    /**
     * مؤقتات قطع الاتصال للسماح بإعادة الاتصال السريع
     * @type {Map<string, NodeJS.Timeout>}
     */
    this.disconnectTimeouts = new Map();
    
    /**
     * مدة الانتظار قبل اعتبار المستخدم offline (بالميلي ثانية)
     * @default 5000 (5 ثوان)
     */
    this.gracePeriod = 5000;
  }

  /**
   * تسجيل مستخدم كـ Online
   * @param {string} userId - معرف المستخدم
   * @param {string} socketId - معرف Socket
   * @param {string} role - دور المستخدم (student/teacher/admin)
   * @param {string} firstName - الاسم الأول
   * @returns {boolean} - true إذا تم التسجيل بنجاح
   */
  setUserOnline(userId, socketId, role = 'unknown', firstName = 'User') {
    try {
      // إلغاء مؤقت قطع الاتصال إذا كان موجوداً (إعادة اتصال سريع)
      if (this.disconnectTimeouts.has(userId)) {
        clearTimeout(this.disconnectTimeouts.get(userId));
        this.disconnectTimeouts.delete(userId);
        console.log(`🔄 [Presence] User ${userId} reconnected quickly - cancelled offline timeout`);
      }

      // الحصول على بيانات المستخدم الحالية أو إنشاء جديدة
      let userData = this.onlineUsers.get(userId);

      if (userData) {
        // تحديث البيانات وإضافة Socket الجديد
        userData.sockets.add(socketId);
        // تحديث البيانات الوصفية إذا كانت أحدث
        if (role !== 'unknown') userData.role = role;
        if (firstName !== 'User') userData.firstName = firstName;
        // الاحتفاظ بـ connectedAt الأصلي
      } else {
        // مستخدم جديد
        userData = {
          sockets: new Set([socketId]),
          role,
          firstName,
          connectedAt: new Date().toISOString(),
          // نحتفظ بـ socketId للتوافق مع الكود القديم (اختياري، لكن الأفضل استخدام sockets Set)
          socketId: socketId 
        };
        this.onlineUsers.set(userId, userData);
      }

      // تسجيل الخريطة العكسية
      this.socketToUser.set(socketId, userId);

      console.log(`✅ [Presence] User ${firstName} (${userId}) is now ONLINE (Sockets: ${userData.sockets.size})`);
      console.log(`📊 [Presence] Total online users: ${this.onlineUsers.size}`);
      
      return true;
    } catch (error) {
      console.error(`❌ [Presence] Error setting user online:`, error);
      return false;
    }
  }

  /**
   * تسجيل مستخدم كـ Offline (مع grace period)
   * @param {string} userId - معرف المستخدم
   * @param {string} socketId - معرف Socket الذي تم فصله
   * @param {Function} onOfflineCallback - دالة تُنفذ عند تأكيد Offline
   * @returns {boolean} - true إذا تم جدولة Offline
   */
  setUserOffline(userId, socketId, onOfflineCallback = null) {
    try {
      const userData = this.onlineUsers.get(userId);
      
      if (!userData) {
        console.log(`⚠️ [Presence] User ${userId} not found in online users`);
        return false;
      }

      // حذف Socket المحدد من القائمة
      if (userData.sockets) {
        userData.sockets.delete(socketId);
      }
      
      // حذف الخريطة العكسية لهذا الـ Socket
      this.socketToUser.delete(socketId);

      // إذا كان للمستخدم اتصالات أخرى نشطة، لا نعتبره Offline
      if (userData.sockets && userData.sockets.size > 0) {
        console.log(`ℹ️ [Presence] User ${userId} disconnected socket ${socketId}, but has ${userData.sockets.size} active sockets.`);
        return false;
      }

      // جدولة Offline بعد grace period فقط إذا لم تبق أي اتصالات
      const timeoutId = setTimeout(() => {
        // تحقق نهائي (في حال عاد المستخدم خلال فترة السماح)
        const currentData = this.onlineUsers.get(userId);
        if (currentData && currentData.sockets && currentData.sockets.size > 0) {
          return;
        }

        // حذف من القائمة
        this.onlineUsers.delete(userId);
        this.disconnectTimeouts.delete(userId);
        
        console.log(`👋 [Presence] User ${userData.firstName} (${userId}) is now OFFLINE`);
        console.log(`📊 [Presence] Total online users: ${this.onlineUsers.size}`);

        // تنفيذ callback إذا كان موجوداً
        if (onOfflineCallback && typeof onOfflineCallback === 'function') {
          onOfflineCallback(userId, userData);
        }
      }, this.gracePeriod);

      this.disconnectTimeouts.set(userId, timeoutId);
      
      console.log(`⏳ [Presence] User ${userData.firstName} offline scheduled in ${this.gracePeriod}ms`);
      return true;
    } catch (error) {
      console.error(`❌ [Presence] Error setting user offline:`, error);
      return false;
    }
  }

  /**
   * إلغاء مؤقت Offline (عند إعادة الاتصال)
   * @param {string} userId - معرف المستخدم
   */
  cancelOfflineTimeout(userId) {
    if (this.disconnectTimeouts.has(userId)) {
      clearTimeout(this.disconnectTimeouts.get(userId));
      this.disconnectTimeouts.delete(userId);
      console.log(`🔄 [Presence] Offline timeout cancelled for user ${userId}`);
    }
  }

  /**
   * التحقق من حالة المستخدم
   * @param {string} userId - معرف المستخدم
   * @returns {boolean} - true إذا كان المستخدم Online
   */
  isUserOnline(userId) {
    return this.onlineUsers.has(userId);
  }

  /**
   * الحصول على معلومات المستخدم
   * @param {string} userId - معرف المستخدم
   * @returns {Object|null} - بيانات المستخدم أو null
   */
  getUserData(userId) {
    return this.onlineUsers.get(userId) || null;
  }

  /**
   * الحصول على userId من socketId
   * @param {string} socketId - معرف Socket
   * @returns {string|null} - userId أو null
   */
  getUserIdBySocket(socketId) {
    return this.socketToUser.get(socketId) || null;
  }

  /**
   * الحصول على جميع المستخدمين Online
   * @returns {Array} - قائمة بمعرفات المستخدمين
   */
  getAllOnlineUsers() {
    return Array.from(this.onlineUsers.keys());
  }

  /**
   * الحصول على عدد المستخدمين Online
   * @returns {number} - عدد المستخدمين
   */
  getOnlineCount() {
    return this.onlineUsers.size;
  }

  /**
   * الحصول على المستخدمين حسب الدور
   * @param {string} role - دور المستخدم (student/teacher/admin)
   * @returns {Array} - قائمة بمعرفات المستخدمين
   */
  getUsersByRole(role) {
    return Array.from(this.onlineUsers.entries())
      .filter(([_, userData]) => userData.role === role)
      .map(([userId, _]) => userId);
  }

  /**
   * حذف جميع البيانات (للاختبار فقط)
   */
  clear() {
    // إلغاء جميع المؤقتات
    this.disconnectTimeouts.forEach(timeout => clearTimeout(timeout));
    
    this.onlineUsers.clear();
    this.socketToUser.clear();
    this.disconnectTimeouts.clear();
    
    console.log('🧹 [Presence] All data cleared');
  }

  /**
   * الحصول على إحصائيات
   * @returns {Object} - إحصائيات النظام
   */
  getStats() {
    const usersByRole = {
      student: this.getUsersByRole('student').length,
      teacher: this.getUsersByRole('teacher').length,
      admin: this.getUsersByRole('admin').length,
      unknown: this.getUsersByRole('unknown').length,
    };

    return {
      totalOnline: this.onlineUsers.size,
      pendingDisconnects: this.disconnectTimeouts.size,
      usersByRole,
      gracePeriodMs: this.gracePeriod,
    };
  }
}

// تصدير نسخة واحدة (Singleton)
const onlineUsersManager = new OnlineUsersManager();

module.exports = {
  onlineUsersManager,
  OnlineUsersManager,
};
