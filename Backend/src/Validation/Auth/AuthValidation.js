// Validation/AuthValidation.js
const bcrypt = require("bcryptjs");

/**
 * Authentication data validation middleware with comprehensive rules
 * Validates and sanitizes authentication data to ensure security
 */

/**
 * Check if a value exists and is not empty
 */
const isRequired = (value) => {
  return (
    value !== undefined && value !== null && value.toString().trim() !== ""
  );
};

/**
 * Validate login credentials
 */
const validateLoginCredentials = (identifier, password) => {
  const errors = [];

  if (!isRequired(identifier)) {
    errors.push("اسم المستخدم أو البريد الإلكتروني مطلوب");
  } else {
    const identifierStr = identifier.toString().trim();
    if (identifierStr.length < 1) {
      errors.push("اسم المستخدم لا يمكن أن يكون فارغاً");
    }
  }

  if (!isRequired(password)) {
    errors.push("كلمة المرور مطلوبة");
  } else {
    const passwordStr = password.toString();
    if (passwordStr.length < 1) {
      errors.push("كلمة المرور لا يمكن أن تكون فارغة");
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
    data: {
      identifier: identifier?.toString().trim(),
      password: password?.toString(),
    },
  };
};

/**
 * Validate teacher registration data
 */
const validateTeacherRegistration = (data) => {
  const errors = [];
  const validatedData = {};

  // Teacher ID validation
  if (!isRequired(data.teacherId)) {
    errors.push("رقم المعلم مطلوب");
  } else {
    const teacherIdStr = data.teacherId.toString().trim();
    if (!/^\d{8}$/.test(teacherIdStr)) {
      errors.push("رقم المعلم يجب أن يكون 8 أرقام");
    } else {
      validatedData.teacherId = teacherIdStr;
    }
  }

  // First name validation
  if (!isRequired(data.firstName)) {
    errors.push("الاسم الأول مطلوب");
  } else {
    const firstNameStr = data.firstName.toString().trim();
    if (firstNameStr.length < 2) {
      errors.push("الاسم الأول يجب أن يكون حرفين على الأقل");
    } else if (
      !/^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s\-'\.]+$/.test(
        firstNameStr
      )
    ) {
      errors.push("الاسم الأول يجب أن يحتوي على أحرف عربية فقط");
    } else {
      validatedData.firstName = firstNameStr;
    }
  }

  // Last name validation
  if (!isRequired(data.lastName)) {
    errors.push("الاسم الأخير مطلوب");
  } else {
    const lastNameStr = data.lastName.toString().trim();
    if (lastNameStr.length < 2) {
      errors.push("الاسم الأخير يجب أن يكون حرفين على الأقل");
    } else if (
      !/^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s\-'\.]+$/.test(
        lastNameStr
      )
    ) {
      errors.push("الاسم الأخير يجب أن يحتوي على أحرف عربية فقط");
    } else {
      validatedData.lastName = lastNameStr;
    }
  }

  // Email validation
  if (!isRequired(data.email)) {
    errors.push("البريد الإلكتروني مطلوب");
  } else {
    const emailStr = data.email.toString().trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailStr)) {
      errors.push("البريد الإلكتروني غير صحيح");
    } else {
      validatedData.email = emailStr;
    }
  }

  // Phone validation
  if (!isRequired(data.phone)) {
    errors.push("رقم الهاتف مطلوب");
  } else {
    let phoneStr = data.phone
      .toString()
      .trim()
      .replace(/[\s\-\(\)\.]/g, "");
    if (!/^(?:\+970|970|0)?[0-9]{9}$/.test(phoneStr)) {
      errors.push("رقم الهاتف غير صحيح");
    } else {
      // Normalize phone format
      if (phoneStr.startsWith("+970")) phoneStr = phoneStr.substring(4);
      else if (phoneStr.startsWith("970")) phoneStr = phoneStr.substring(3);
      else if (phoneStr.startsWith("0")) phoneStr = phoneStr.substring(1);
      validatedData.phone = phoneStr;
    }
  }

  // Password validation
  if (!isRequired(data.password)) {
    errors.push("كلمة المرور مطلوبة");
  } else {
    const passwordStr = data.password.toString();
    const strengthValidation = validatePasswordStrength(passwordStr);
    if (!strengthValidation.isValid) {
      errors.push(strengthValidation.error);
    } else if (passwordStr.length > 100) {
      errors.push("كلمة المرور طويلة جداً");
    } else {
      validatedData.password = passwordStr;
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
    data: validatedData,
  };
};

/**
 * التحقق من قوة كلمة المرور الجديدة
 * يجب أن تحتوي على أقل شيء 4 أرقام أو 3 حروف وباقي أرقام
 */
const validatePasswordStrength = (password) => {
  if (!password || typeof password !== "string") {
    return { isValid: false, errors: ["كلمة المرور مطلوبة"] };
  }

  const errors = [];

  // التحقق من الطول الأدنى
  if (password.length < 4) {
    errors.push("كلمة المرور يجب أن تكون 4 أحرف على الأقل");
    return { isValid: false, errors };
  }

  // التحقق من الطول الأقصى
  if (password.length > 50) {
    errors.push("كلمة المرور يجب ألا تتجاوز 50 حرف");
    return { isValid: false, errors };
  }

  // عد الأرقام والحروف (يدعم الأرقام العربية والإنجليزية)
  const numbers = password.match(/[\d٠-٩]/g) || [];
  const letters = password.match(/[a-zA-Z\u0600-\u06FF]/g) || [];

  const numberCount = numbers.length;
  const letterCount = letters.length;

  // قاعدة التحقق الجديدة:
  // السيناريو 1: أقل شيء 4 أرقام
  const hasMinimumNumbers = numberCount >= 4;

  // السيناريو 2: 3 حروف على الأقل وباقي أرقام
  const hasMinimumLettersWithNumbers = letterCount >= 3 && numberCount >= 1;

  if (!hasMinimumNumbers && !hasMinimumLettersWithNumbers) {
    errors.push(
      "كلمة المرور يجب أن تحتوي على 4 أرقام على الأقل، أو 3 حروف مع أرقام"
    );
    return { isValid: false, errors };
  }

  return { isValid: true, errors: [] };
};

/**
 * Validate password change data
 */
const validatePasswordChange = (data) => {
  const errors = [];
  const validatedData = {};

  // Current password validation
  if (!isRequired(data.currentPassword)) {
    errors.push("كلمة المرور الحالية مطلوبة");
  } else {
    validatedData.currentPassword = data.currentPassword.toString();
  }

  // New password validation
  if (!isRequired(data.newPassword)) {
    errors.push("كلمة المرور الجديدة مطلوبة");
  } else {
    const newPasswordStr = data.newPassword.toString();

    // استخدام دالة التحقق الجديدة
    const strengthValidation = validatePasswordStrength(newPasswordStr);
    if (!strengthValidation.isValid) {
      errors.push(...strengthValidation.errors);
    } else {
      validatedData.newPassword = newPasswordStr;
    }
  }

  // Confirm password validation (optional - Frontend handles this)
  if (data.confirmPassword && isRequired(data.confirmPassword)) {
    const confirmPasswordStr = data.confirmPassword.toString();
    if (
      validatedData.newPassword &&
      confirmPasswordStr !== validatedData.newPassword
    ) {
      errors.push("كلمة المرور وتأكيدها غير متطابقان");
    } else {
      validatedData.confirmPassword = confirmPasswordStr;
    }
  }

  // Check if new password is different from current
  if (
    validatedData.currentPassword &&
    validatedData.newPassword &&
    validatedData.currentPassword === validatedData.newPassword
  ) {
    errors.push("كلمة المرور الجديدة يجب أن تكون مختلفة عن الحالية");
  }

  // UserId validation
  if (!isRequired(data.userId)) {
    errors.push("معرف المستخدم مطلوب");
  } else {
    validatedData.userId = data.userId.toString();
  }

  // UserType validation
  if (!isRequired(data.userType)) {
    errors.push("نوع المستخدم مطلوب");
  } else {
    const userType = data.userType.toString().toLowerCase();
    if (!["student", "teacher", "admin", "secretary"].includes(userType)) {
      errors.push("نوع المستخدم غير صحيح");
    } else {
      validatedData.userType = userType;
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
    data: validatedData,
  };
};

/**
 * Validate identity verification data (Forgot Password Step 1)
 */
const validateIdentityVerification = (data) => {
  const errors = [];
  const validatedData = {};

  // First name validation
  if (!isRequired(data.firstName)) {
    errors.push("الاسم الأول مطلوب");
  } else {
    const firstNameStr = data.firstName.toString().trim();
    if (firstNameStr.length < 2) {
      errors.push("الاسم الأول يجب أن يكون حرفين على الأقل");
    } else if (
      !/^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s\-'\.]+$/.test(
        firstNameStr
      )
    ) {
      errors.push("الاسم الأول يجب أن يحتوي على أحرف عربية فقط");
    } else {
      validatedData.firstName = firstNameStr;
    }
  }

  // Father name validation
  if (!isRequired(data.fatherName)) {
    errors.push("اسم الأب مطلوب");
  } else {
    const fatherNameStr = data.fatherName.toString().trim();
    if (fatherNameStr.length < 2) {
      errors.push("اسم الأب يجب أن يكون حرفين على الأقل");
    } else if (
      !/^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s\-'\.]+$/.test(
        fatherNameStr
      )
    ) {
      errors.push("اسم الأب يجب أن يحتوي على أحرف عربية فقط");
    } else {
      validatedData.fatherName = fatherNameStr;
    }
  }

  // Grandfather name validation
  if (!isRequired(data.grandFatherName)) {
    errors.push("اسم الجد مطلوب");
  } else {
    const grandFatherNameStr = data.grandFatherName.toString().trim();
    if (grandFatherNameStr.length < 2) {
      errors.push("اسم الجد يجب أن يكون حرفين على الأقل");
    } else if (
      !/^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s\-'\.]+$/.test(
        grandFatherNameStr
      )
    ) {
      errors.push("اسم الجد يجب أن يحتوي على أحرف عربية فقط");
    } else {
      validatedData.grandFatherName = grandFatherNameStr;
    }
  }

  // Last name validation
  if (!isRequired(data.lastName)) {
    errors.push("اسم العائلة مطلوب");
  } else {
    const lastNameStr = data.lastName.toString().trim();
    if (lastNameStr.length < 2) {
      errors.push("اسم العائلة يجب أن يكون حرفين على الأقل");
    } else if (
      !/^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s\-'\.]+$/.test(
        lastNameStr
      )
    ) {
      errors.push("اسم العائلة يجب أن يحتوي على أحرف عربية فقط");
    } else {
      validatedData.lastName = lastNameStr;
    }
  }

  // Mother name validation
  if (!isRequired(data.motherName)) {
    errors.push("اسم الأم مطلوب");
  } else {
    const motherNameStr = data.motherName.toString().trim();
    if (motherNameStr.length < 2) {
      errors.push("اسم الأم يجب أن يكون حرفين على الأقل");
    } else if (
      !/^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s\-'\.]+$/.test(
        motherNameStr
      )
    ) {
      errors.push("اسم الأم يجب أن يحتوي على أحرف عربية فقط");
    } else {
      validatedData.motherName = motherNameStr;
    }
  }

  // ID number validation
  if (!isRequired(data.idNumber)) {
    errors.push("رقم الهوية مطلوب");
  } else {
    const idNumberStr = data.idNumber.toString().trim();
    if (!/^\d{9}$/.test(idNumberStr)) {
      errors.push("رقم الهوية يجب أن يكون 9 أرقام");
    } else {
      validatedData.idNumber = idNumberStr;
    }
  }

  // Birth date validation
  if (!isRequired(data.birthDate)) {
    errors.push("تاريخ الميلاد مطلوب");
  } else {
    const birthDate = new Date(data.birthDate);
    if (isNaN(birthDate.getTime())) {
      errors.push("تاريخ الميلاد غير صحيح");
    } else {
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 5 || age > 100) {
        errors.push("تاريخ الميلاد غير منطقي");
      } else {
        validatedData.birthDate = data.birthDate;
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
    data: validatedData,
  };
};

/**
 * Validate password reset data (Forgot Password Step 2)
 */
const validatePasswordReset = (data) => {
  const errors = [];
  const validatedData = {};

  // First name validation
  if (!isRequired(data.firstName)) {
    errors.push("الاسم الأول مطلوب");
  } else {
    validatedData.firstName = data.firstName.toString().trim();
  }

  // Father name validation
  if (!isRequired(data.fatherName)) {
    errors.push("اسم الأب مطلوب");
  } else {
    validatedData.fatherName = data.fatherName.toString().trim();
  }

  // Grandfather name validation
  if (!isRequired(data.grandFatherName)) {
    errors.push("اسم الجد مطلوب");
  } else {
    validatedData.grandFatherName = data.grandFatherName.toString().trim();
  }

  // Last name validation
  if (!isRequired(data.lastName)) {
    errors.push("اسم العائلة مطلوب");
  } else {
    validatedData.lastName = data.lastName.toString().trim();
  }

  // Mother name validation
  if (!isRequired(data.motherName)) {
    errors.push("اسم الأم مطلوب");
  } else {
    validatedData.motherName = data.motherName.toString().trim();
  }

  // ID number validation
  if (!isRequired(data.idNumber)) {
    errors.push("رقم الهوية مطلوب");
  } else {
    const idNumberStr = data.idNumber.toString().trim();
    if (!/^\d{9}$/.test(idNumberStr)) {
      errors.push("رقم الهوية يجب أن يكون 9 أرقام");
    } else {
      validatedData.idNumber = idNumberStr;
    }
  }

  // Birth date validation
  if (!isRequired(data.birthDate)) {
    errors.push("تاريخ الميلاد مطلوب");
  } else {
    validatedData.birthDate = data.birthDate;
  }

  // New password validation
  if (!isRequired(data.newPassword)) {
    errors.push("كلمة المرور الجديدة مطلوبة");
  } else {
    const newPasswordStr = data.newPassword.toString();
    const strengthValidation = validatePasswordStrength(newPasswordStr);
    if (!strengthValidation.isValid) {
      errors.push(...strengthValidation.errors);
    } else if (newPasswordStr.length > 50) {
      errors.push("كلمة المرور الجديدة طويلة جداً");
    } else {
      validatedData.newPassword = newPasswordStr;
    }
  }

  // Confirm password validation (optional - frontend usually handles this)
  if (data.confirmPassword) {
    const confirmPasswordStr = data.confirmPassword.toString();
    if (
      validatedData.newPassword &&
      confirmPasswordStr !== validatedData.newPassword
    ) {
      errors.push("كلمة المرور وتأكيدها غير متطابقان");
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
    data: validatedData,
  };
};

/**
 * Sanitize authentication data
 */
const sanitizeAuthData = (data) => {
  const sanitized = {};

  Object.keys(data).forEach((key) => {
    if (typeof data[key] === "string") {
      sanitized[key] = data[key]
        .trim()
        .replace(/[<>]/g, "") // Remove potential HTML tags
        .replace(/javascript:/gi, "") // Remove javascript: protocols
        .replace(/on\w+=/gi, ""); // Remove event handlers
    } else {
      sanitized[key] = data[key];
    }
  });

  return sanitized;
};

/**
 * Hash password securely
 */
const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(12);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    throw new Error("خطأ في تشفير كلمة المرور");
  }
};

/**
 * Validation middleware for unified login
 * لا يحتاج userType - الباك إند يحدد نوع المستخدم تلقائياً
 */
const validateLogin = async (req, res, next) => {
  try {
    console.log("🔍 بدء التحقق من بيانات تسجيل الدخول الموحد...");
    console.log("📝 البيانات المستلمة:", req.body);

    const sanitizedData = sanitizeAuthData(req.body);

    // دعم حقول مختلفة للمعرف: identifier, adminId, teacherId, studentId
    const identifier =
      sanitizedData.identifier ||
      sanitizedData.adminId ||
      sanitizedData.teacherId ||
      sanitizedData.studentId;

    // دعم password و idNumber (للطلاب)
    const password = sanitizedData.password || sanitizedData.idNumber;

    console.log(
      "🔑 المعرف:",
      identifier,
      "| كلمة المرور:",
      password ? "***" : "غير موجودة"
    );

    const validation = validateLoginCredentials(identifier, password);

    if (!validation.isValid) {
      console.log("❌ أخطاء في تسجيل الدخول:", validation.errors);
      return res.status(400).json({
        success: false,
        message: "بيانات تسجيل الدخول غير صحيحة",
        errors: validation.errors,
      });
    }

    // لا نرسل userType - الباك إند سيحدده تلقائياً
    req.validatedData = validation.data;
    console.log("✅ تم التحقق من بيانات تسجيل الدخول بنجاح");
    next();
  } catch (error) {
    console.error("❌ خطأ في التحقق من بيانات تسجيل الدخول:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في خادم التحقق من البيانات",
      error: error.message,
    });
  }
};

/**
 * Validation middleware for teacher registration
 */
const validateRegisterTeacher = async (req, res, next) => {
  try {
    console.log("🔍 بدء التحقق من بيانات تسجيل المعلم...");

    const sanitizedData = sanitizeAuthData(req.body);
    const validation = validateTeacherRegistration(sanitizedData);

    if (!validation.isValid) {
      console.log("❌ أخطاء في تسجيل المعلم:", validation.errors);
      return res.status(400).json({
        success: false,
        message: "بيانات تسجيل المعلم غير صحيحة",
        errors: validation.errors,
      });
    }

    // Hash password before proceeding
    if (validation.data.password) {
      validation.data.password = await hashPassword(validation.data.password);
    }

    req.validatedData = validation.data;
    console.log("✅ تم التحقق من بيانات تسجيل المعلم بنجاح");
    next();
  } catch (error) {
    console.error("❌ خطأ في التحقق من بيانات تسجيل المعلم:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في خادم التحقق من البيانات",
      error: error.message,
    });
  }
};

/**
 * Validation middleware for password change
 */
const validateChangePassword = async (req, res, next) => {
  try {
    console.log("🔍 بدء التحقق من بيانات تغيير كلمة المرور...");

    const sanitizedData = sanitizeAuthData(req.body);
    const validation = validatePasswordChange(sanitizedData);

    if (!validation.isValid) {
      console.log("❌ أخطاء في تغيير كلمة المرور:", validation.errors);
      return res.status(400).json({
        success: false,
        message: "بيانات تغيير كلمة المرور غير صحيحة",
        errors: validation.errors,
      });
    }

    req.validatedData = validation.data;
    console.log("✅ تم التحقق من بيانات تغيير كلمة المرور بنجاح");
    next();
  } catch (error) {
    console.error("❌ خطأ في التحقق من بيانات تغيير كلمة المرور:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في خادم التحقق من البيانات",
      error: error.message,
    });
  }
};

/**
 * Validation middleware for identity verification
 */
const validateVerifyIdentity = async (req, res, next) => {
  try {
    console.log("🔍 بدء التحقق من بيانات التحقق من الهوية...");

    const sanitizedData = sanitizeAuthData(req.body);
    const validation = validateIdentityVerification(sanitizedData);

    if (!validation.isValid) {
      console.log("❌ أخطاء في التحقق من الهوية:", validation.errors);
      return res.status(400).json({
        success: false,
        message: "بيانات التحقق من الهوية غير صحيحة",
        errors: validation.errors,
      });
    }

    req.validatedData = validation.data;
    console.log("✅ تم التحقق من بيانات التحقق من الهوية بنجاح");
    next();
  } catch (error) {
    console.error("❌ خطأ في التحقق من بيانات التحقق من الهوية:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في خادم التحقق من البيانات",
      error: error.message,
    });
  }
};

/**
 * Validation middleware for password reset
 */
const validateResetPassword = async (req, res, next) => {
  try {
    console.log("🔍 بدء التحقق من بيانات إعادة تعيين كلمة المرور...");

    const sanitizedData = sanitizeAuthData(req.body);
    const validation = validatePasswordReset(sanitizedData);

    if (!validation.isValid) {
      console.log("❌ أخطاء في إعادة تعيين كلمة المرور:", validation.errors);
      return res.status(400).json({
        success: false,
        message: "بيانات إعادة تعيين كلمة المرور غير صحيحة",
        errors: validation.errors,
      });
    }

    // Hash new password before proceeding
    if (validation.data.newPassword) {
      validation.data.hashedNewPassword = await hashPassword(
        validation.data.newPassword
      );
    }

    req.validatedData = validation.data;
    console.log("✅ تم التحقق من بيانات إعادة تعيين كلمة المرور بنجاح");
    next();
  } catch (error) {
    console.error("❌ خطأ في التحقق من بيانات إعادة تعيين كلمة المرور:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في خادم التحقق من البيانات",
      error: error.message,
    });
  }
};

module.exports = {
  validateLogin,
  validateRegisterTeacher,
  validateChangePassword,
  validateVerifyIdentity,
  validateResetPassword,
  sanitizeAuthData,
  hashPassword,
  validateLoginCredentials,
  validateTeacherRegistration,
  validatePasswordChange,
  validatePasswordStrength,
  validateIdentityVerification,
  validatePasswordReset,
};
