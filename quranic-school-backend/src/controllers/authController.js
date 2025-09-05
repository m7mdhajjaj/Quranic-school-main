const Student = require("../models/Student");
const jwt = require("jsonwebtoken");

// JWT Secret - في الحالة المثالية يجب وضع هذا في ملف .env
const JWT_SECRET = "quranic-school-secret-key";

// تسجيل الدخول بواسطة رقم الطالب ورقم الهوية
exports.login = async (req, res) => {
  try {
    const { studentId, idNumber } = req.body;

    // التحقق من إدخال رقم الطالب ورقم الهوية
    if (!studentId || !idNumber) {
      return res.status(400).json({
        success: false,
        message: "الرجاء إدخال رقم الطالب ورقم الهوية",
      });
    }

    // البحث عن الطالب باستخدام رقم الطالب
    const student = await Student.findOne({ studentId });

    if (!student) {
      return res.status(401).json({
        success: false,
        message: "رقم الطالب غير موجود",
      });
    }

    // التحقق من صحة رقم الهوية
    if (student.idNumber !== idNumber) {
      return res.status(401).json({
        success: false,
        message: "رقم الهوية غير صحيح",
      });
    }

    // إنشاء رمز JWT
    const token = jwt.sign(
      {
        id: student._id,
        studentId: student.studentId,
        name: `${student.firstName} ${student.lastName}`,
        group: student.group,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // إرسال البيانات المصادق عليها
    res.status(200).json({
      success: true,
      token,
      user: {
        id: student._id,
        studentId: student.studentId,
        name: `${student.firstName} ${student.fatherName} ${student.lastName}`,
        group: student.group,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تسجيل الدخول",
    });
  }
};

// التحقق من صحة الرمز وإعادة بيانات المستخدم
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

    // البحث عن الطالب في قاعدة البيانات
    const student = await Student.findById(decoded.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "الطالب غير موجود",
      });
    }

    // إرسال بيانات الطالب
    res.status(200).json({
      success: true,
      user: {
        id: student._id,
        studentId: student.studentId,
        name: `${student.firstName} ${student.fatherName} ${student.lastName}`,
        group: student.group,
      },
    });
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
