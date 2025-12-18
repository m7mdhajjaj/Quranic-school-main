/**
 * Session Management Controllers
 * Handles user session operations (getMe, logout)
 */

const jwt = require("jsonwebtoken");
const Student = require("../../schema/Student");
const Teacher = require("../../schema/Teacher");
const Admin = require("../../schema/Admin");

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Get current authenticated user data
 * @route GET /api/auth/me
 * @access Private
 */
exports.getMe = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "لم يتم توفير رمز المصادقة",
      });
    }

    // التحقق من صحة الرمز
    const decoded = jwt.verify(token, JWT_SECRET);

    let user;
    let role;

    if (decoded.role === "student" || !decoded.role) {
      user = await Student.findById(decoded.id).select("-password");
      role = "student";
    } else if (decoded.role === "admin") {
      user = await Admin.findById(decoded.id).select("-password");
      role = "admin";
    } else {
      user = await Teacher.findById(decoded.id).select("-password");
      role = "teacher";
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `${role === "student" ? "الطالب" : role === "teacher" ? "المعلم" : "الإداري"} غير موجود`,
      });
    }

    // إرسال بيانات المستخدم مع الـ role
    const userData = user.toObject();
    userData.role = role;

    return res.status(200).json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.error("GetMe error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "رمز المصادقة غير صالح",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "انتهت صلاحية رمز المصادقة",
      });
    }

    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء التحقق من المصادقة",
    });
  }
};

/**
 * Logout user and update status
 * @route POST /api/auth/logout
 * @access Private
 */
exports.logout = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    // Set isActive to false and update lastSeen based on user type
    const updateData = {
      isActive: false,
      lastSeen: new Date(),
    };

    console.log(
      `🔴 Logout: تحديث lastSeen للمستخدم ${userId} في ${updateData.lastSeen.toISOString()}`
    );

    let updatedUser;
    if (userRole === "student") {
      updatedUser = await Student.findByIdAndUpdate(userId, updateData, {
        new: true,
      });
      console.log(`✅ Student updated - lastSeen: ${updatedUser.lastSeen}`);
    } else if (userRole === "teacher") {
      updatedUser = await Teacher.findByIdAndUpdate(userId, updateData, {
        new: true,
      });
      console.log(`✅ Teacher updated - lastSeen: ${updatedUser.lastSeen}`);
    } else if (userRole === "admin") {
      updatedUser = await Admin.findByIdAndUpdate(userId, updateData, {
        new: true,
      });
      console.log(`✅ Admin updated - lastSeen: ${updatedUser.lastSeen}`);
    }

    // إرسال إشعار Socket بتغيير حالة المستخدم (إذا كان هناك Socket.IO متاح)
    if (global.io) {
      global.io.emit("userStatusChange", {
        userId: userId,
        isActive: false,
        lastSeen:
          updatedUser?.lastSeen?.toISOString() || new Date().toISOString(),
      });
    }

    res.status(200).json({
      success: true,
      message: "تم تسجيل الخروج بنجاح",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تسجيل الخروج",
    });
  }
};
