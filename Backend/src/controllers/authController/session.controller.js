const Student = require("../../schema/Student");
const Teacher = require("../../schema/Teacher");
const Admin = require("../../schema/Admin");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * التحقق من صحة الرمز وإعادة بيانات المستخدم
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

    if (decoded.role === "student" || !decoded.role) {
      // البحث عن الطالب في قاعدة البيانات
      const student = await Student.findById(decoded.id);

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "الطالب غير موجود",
        });
      }

      // إرسال جميع بيانات الطالب
      return res.status(200).json({
        success: true,
        user: {
          _id: student._id,
          studentId: student.studentId,
          idNumber: student.idNumber,
          firstName: student.firstName,
          fatherName: student.fatherName,
          grandFatherName: student.grandFatherName,
          motherName: student.motherName,
          lastName: student.lastName,
          birthDate: student.birthDate,
          age: student.age,
          gender: student.gender,
          residence: student.residence,
          teacher: student.teacher,
          group: student.group,
          email: student.email,
          role: "student",
        },
      });
    } else if (decoded.role === "admin") {
      // البحث عن الإداري في قاعدة البيانات
      const admin = await Admin.findById(decoded.id);

      if (!admin) {
        return res.status(404).json({
          success: false,
          message: "الإداري غير موجود",
        });
      }

      // إرسال جميع بيانات الإداري
      return res.status(200).json({
        success: true,
        user: {
          _id: admin._id,
          adminId: admin.adminId,
          idNumber: admin.idNumber,
          firstName: admin.firstName,
          fatherName: admin.fatherName,
          grandFatherName: admin.grandFatherName,
          motherName: admin.motherName,
          lastName: admin.lastName,
          birthDate: admin.birthDate,
          age: admin.age,
          gender: admin.gender,
          residence: admin.residence,
          email: admin.email,
          phoneNumber: admin.phoneNumber,
          role: "admin",
        },
      });
    } else {
      // البحث عن المعلم في قاعدة البيانات
      const teacher = await Teacher.findById(decoded.id);

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: "المعلم غير موجود",
        });
      }

      // إرسال جميع بيانات المعلم
      return res.status(200).json({
        success: true,
        user: {
          _id: teacher._id,
          teacherId: teacher.teacherId,
          idNumber: teacher.idNumber,
          firstName: teacher.firstName,
          fatherName: teacher.fatherName,
          grandFatherName: teacher.grandFatherName,
          motherName: teacher.motherName,
          lastName: teacher.lastName,
          birthDate: teacher.birthDate,
          age: teacher.age,
          gender: teacher.gender,
          residence: teacher.residence,
          email: teacher.email,
          phoneNumber: teacher.phoneNumber,
          groups: teacher.groups,
          role: teacher.role,
        },
      });
    }
  } catch (error) {
    console.error("GetMe error:", error);

    // التحقق من نوع الخطأ
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
 * تسجيل الخروج
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
    } else if (userRole === "teacher" || userRole === "admin") {
      if (userRole === "admin") {
        updatedUser = await Admin.findByIdAndUpdate(userId, updateData, {
          new: true,
        });
        console.log(`✅ Admin updated - lastSeen: ${updatedUser.lastSeen}`);
      } else {
        updatedUser = await Teacher.findByIdAndUpdate(userId, updateData, {
          new: true,
        });
        console.log(`✅ Teacher updated - lastSeen: ${updatedUser.lastSeen}`);
      }
    }

    // إرسال إشعار Socket بتغيير حالة المستخدم (إذا كان هناك Socket.IO متاح)
    if (req.app && req.app.get("io")) {
      req.app.get("io").emit("userStatusChange", {
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
