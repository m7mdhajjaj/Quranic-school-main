/**
 * ============================================================================
 * Core Authentication Middleware - المصادقة الأساسية
 * ============================================================================
 * 
 * يتعامل مع التحقق من JWT وربط بيانات المستخدم بالطلب
 * يدعم ثلاثة أنواع من المستخدمين: Student, Teacher, Admin
 */

const jwt = require("jsonwebtoken");
const Student = require("../../schema/Student");
const Teacher = require("../../schema/Teacher");
const Admin = require("../../schema/Admin");
const Secretary = require("../../schema/Secretary");

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Main authentication middleware
 * المصادقة الرئيسية - التحقق من JWT وإضافة المستخدم للطلب
 * 
 * @middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @returns {Promise<void>}
 * 
 * الوظائف:
 * - التحقق من وجود token في Authorization header
 * - فك تشفير وفحص صلاحية JWT
 * - تحديد نوع المستخدم (student/teacher/admin)
 * - إرفاق بيانات المستخدم بـ req.user
 * - تحديث حالة النشاط (isActive = true)
 * - إرسال إشعار Socket.io بتغيير حالة المستخدم
 */
exports.protect = async (req, res, next) => {
  try {
    let token;

    // التحقق من وجود رمز في الترويسة
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // التحقق من وجود الرمز
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "يجب تسجيل الدخول للوصول إلى هذه الصفحة",
      });
    }

    // التحقق من صحة الرمز
    const decoded = jwt.verify(token, JWT_SECRET);

    // تحديد نوع المستخدم (طالب أو معلم أو إداري)
    if (decoded.role === "student" || !decoded.role) {
      // البحث عن الطالب في قاعدة البيانات
      const currentStudent = await Student.findById(decoded.id);

      if (!currentStudent) {
        return res.status(401).json({
          success: false,
          message: "الطالب المرتبط بهذا الرمز غير موجود",
        });
      }

      // إضافة بيانات الطالب إلى الطلب
      req.user = currentStudent;
      req.user.role = "student";
      
      // تحديث حالة النشاط فقط (بدون تغيير lastSeen)
      await Student.findByIdAndUpdate(decoded.id, { 
        isActive: true 
      });
      
      // إرسال إشعار Socket بتغيير حالة الطالب
      if (req.app && req.app.get("io")) {
        req.app.get("io").emit("userStatusChange", {
          userId: decoded.id,
          isActive: true,
          lastSeen: new Date().toISOString(),
        });
      }
    } else if (decoded.role === "admin") {
      // البحث عن المدير في قاعدة البيانات
      const currentAdmin = await Admin.findById(decoded.id);

      if (!currentAdmin) {
        return res.status(401).json({
          success: false,
          message: "المدير المرتبط بهذا الرمز غير موجود",
        });
      }

      // إضافة بيانات المدير إلى الطلب
      req.user = currentAdmin;
      req.user.role = "admin";
      
      // تحديث حالة النشاط فقط (بدون تغيير lastSeen)
      await Admin.findByIdAndUpdate(decoded.id, { 
        isActive: true 
      });
      
      // إرسال إشعار Socket بتغيير حالة الأدمن
      if (req.app && req.app.get("io")) {
        req.app.get("io").emit("userStatusChange", {
          userId: decoded.id,
          isActive: true,
          lastSeen: new Date().toISOString(),
        });
      }
    } else if (decoded.role === "secretary") {
      // البحث عن السكرتير في قاعدة البيانات
      const currentSecretary = await Secretary.findById(decoded.id);

      if (!currentSecretary) {
        return res.status(401).json({
          success: false,
          message: "السكرتير المرتبط بهذا الرمز غير موجود",
        });
      }

      // إضافة بيانات السكرتير إلى الطلب
      req.user = currentSecretary;
      req.user.role = "secretary";
      
      // تحديث حالة النشاط فقط (بدون تغيير lastSeen)
      await Secretary.findByIdAndUpdate(decoded.id, { 
        isActive: true 
      });
      
      // إرسال إشعار Socket بتغيير حالة السكرتير
      if (req.app && req.app.get("io")) {
        req.app.get("io").emit("userStatusChange", {
          userId: decoded.id,
          isActive: true,
          lastSeen: new Date().toISOString(),
        });
      }
    } else {
      // البحث عن المعلم في قاعدة البيانات
      const currentTeacher = await Teacher.findById(decoded.id);

      if (!currentTeacher) {
        return res.status(401).json({
          success: false,
          message: "المعلم المرتبط بهذا الرمز غير موجود",
        });
      }

      // إضافة بيانات المعلم إلى الطلب
      req.user = currentTeacher;
      req.user.role = "teacher";
      
      // تحديث حالة النشاط فقط (بدون تغيير lastSeen)
      await Teacher.findByIdAndUpdate(decoded.id, { 
        isActive: true 
      });
      
      // إرسال إشعار Socket بتغيير حالة المعلم
      if (req.app && req.app.get("io")) {
        req.app.get("io").emit("userStatusChange", {
          userId: decoded.id,
          isActive: true,
          lastSeen: new Date().toISOString(),
        });
      }
    }

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);

    // التحقق من نوع الخطأ
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "رمز المصادقة غير صالح",
      });
    }

    if (error.name === "TokenExpiredError") {
      // Set isActive to false for expired tokens
      try {
        const decoded = jwt.decode(token);
        if (decoded && decoded.id) {
          const lastSeen = new Date().toISOString();
          
          if (decoded.role === "student" || !decoded.role) {
            await Student.findByIdAndUpdate(decoded.id, { isActive: false, lastSeen });
          } else if (decoded.role === "admin") {
            await Admin.findByIdAndUpdate(decoded.id, { isActive: false, lastSeen });
          } else if (decoded.role === "secretary") {
            await Secretary.findByIdAndUpdate(decoded.id, { isActive: false, lastSeen });
          } else {
            await Teacher.findByIdAndUpdate(decoded.id, { isActive: false, lastSeen });
          }
          
          // إرسال إشعار Socket بتغيير حالة المستخدم عند انتهاء الـ token
          if (req.app && req.app.get("io")) {
            req.app.get("io").emit("userStatusChange", {
              userId: decoded.id,
              isActive: false,
              lastSeen,
            });
          }
        }
      } catch (updateError) {
        console.error("Error updating isActive on token expiry:", updateError);
      }
      return res.status(401).json({
        success: false,
        message: "انتهت صلاحية رمز المصادقة",
      });
    }

    res.status(401).json({
      success: false,
      message: "غير مصرح، يرجى تسجيل الدخول مرة أخرى",
    });
  }
};
