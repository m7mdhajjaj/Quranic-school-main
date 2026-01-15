/**
 * إنشاء سكرتير جديد
 * @access Admin only
 */
const Secretary = require("../../../schema/Secretary");
const Counter = require("../../../schema/Counter");
const bcrypt = require("bcryptjs");

const createSecretary = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      fatherName,
      grandFatherName,
      motherName,
      email,
      phoneNumber,
      idNumber,
      birthDate,
      gender,
      residence,
      permissions,
    } = req.body;

    // =================== Validations ===================
    // التحقق من رقم الهوية (9 أرقام بالضبط)
    if (!idNumber || !/^\d{9}$/.test(idNumber)) {
      return res.status(400).json({
        success: false,
        message: "رقم الهوية يجب أن يتكون من 9 أرقام بالضبط",
      });
    }

    // التحقق من رقم الهاتف (10 أرقام يبدأ بـ 05)
    if (!phoneNumber || !/^05\d{8}$/.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: "رقم الهاتف يجب أن يبدأ بـ 05 ويتكون من 10 أرقام",
      });
    }

    // التحقق من البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "صيغة البريد الإلكتروني غير صحيحة",
      });
    }

    // التحقق من العمر (21 سنة على الأقل)
    if (birthDate) {
      const birthYear = new Date(birthDate).getFullYear();
      const currentYear = new Date().getFullYear();
      const age = currentYear - birthYear;
      if (age < 21) {
        return res.status(400).json({
          success: false,
          message: "يجب أن يكون عمر السكرتير 21 عام على الأقل",
        });
      }
    }

    // التحقق من عدم وجود سكرتير بنفس البريد الإلكتروني أو رقم الهاتف أو رقم الهوية
    const existingSecretary = await Secretary.findOne({
      $or: [{ email }, { phoneNumber }, { idNumber }],
    });

    if (existingSecretary) {
      let message = "البريد الإلكتروني أو رقم الهاتف أو رقم الهوية مستخدم بالفعل";
      if (existingSecretary.email === email) {
        message = "البريد الإلكتروني مستخدم بالفعل";
      } else if (existingSecretary.phoneNumber === phoneNumber) {
        message = "رقم الهاتف مستخدم بالفعل";
      } else if (existingSecretary.idNumber === idNumber) {
        message = "رقم الهوية مستخدم بالفعل";
      }
      return res.status(400).json({
        success: false,
        message,
      });
    }

    // الحصول على الـ ID التالي
    const secretaryId = await Counter.getNextId("secretary");

    // كلمة المرور الافتراضية = رقم الهوية
    const defaultPassword = idNumber;

    // تشفير كلمة المرور
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    // إنشاء السكرتير
    const secretary = await Secretary.create({
      secretaryId,
      firstName,
      lastName,
      fatherName,
      grandFatherName,
      motherName,
      email,
      phoneNumber,
      password: hashedPassword,
      idNumber,
      birthDate,
      gender,
      residence,
      permissions: permissions || {},
    });

    res.status(201).json({
      success: true,
      message: "تم إنشاء حساب السكرتير بنجاح",
      data: {
        _id: secretary._id,
        secretaryId: secretary.secretaryId,
        firstName: secretary.firstName,
        lastName: secretary.lastName,
        email: secretary.email,
        phoneNumber: secretary.phoneNumber,
        permissions: secretary.permissions,
      },
    });
  } catch (error) {
    console.error("Create secretary error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء إنشاء حساب السكرتير",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

module.exports = createSecretary;
