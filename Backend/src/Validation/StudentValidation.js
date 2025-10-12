// Student Validation - متطابق مع Frontend validation
// التحقق من صحة بيانات الطلاب - نفس المنطق المستخدم في الفرونت إند

// تطبيع الجنس - نفس المنطق في Frontend
const normalizeGender = (value) => {
  if (!value) return null;
  const normalized = value.toString().toLowerCase().trim();
  if (normalized === 'male' || normalized === 'ذكر') return 'ذكر';
  if (normalized === 'female' || normalized === 'أنثى' || normalized === 'انثى') return 'أنثى';
  return value;
};

// حساب العمر من تاريخ الميلاد
const calculateAge = (birthDate) => {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

// التحقق من صحة البيانات الأساسية
const validateStudentData = (req, res, next) => {
  try {
    const errors = {};
    const { 
      firstName, 
      fatherName,
      grandFatherName,
      motherName,
      lastName, 
      email, 
      phoneNumber, 
      idNumber,
      birthDate,
      gender,
      residence,
      teacher,
      group,
      password,
      age
    } = req.body;

    const isNewStudent = req.method === 'POST';

    // التحقق من الاسم الأول - مطلوب
    if (!firstName || typeof firstName !== 'string' || firstName.trim().length === 0) {
      errors.firstName = 'الاسم الأول مطلوب';
    }

    // التحقق من اسم الأب - مطلوب
    if (!fatherName || typeof fatherName !== 'string' || fatherName.trim().length === 0) {
      errors.fatherName = 'اسم الأب مطلوب';
    }

    // التحقق من اسم الجد - مطلوب
    if (!grandFatherName || typeof grandFatherName !== 'string' || grandFatherName.trim().length === 0) {
      errors.grandFatherName = 'اسم الجد مطلوب';
    }

    // التحقق من اسم الأم - مطلوب
    if (!motherName || typeof motherName !== 'string' || motherName.trim().length === 0) {
      errors.motherName = 'اسم الأم مطلوب';
    }

    // التحقق من اسم العائلة - مطلوب
    if (!lastName || typeof lastName !== 'string' || lastName.trim().length === 0) {
      errors.lastName = 'اسم العائلة مطلوب';
    }

    // التحقق من رقم الهوية - مطلوب
    if (!idNumber || typeof idNumber !== 'string') {
      errors.idNumber = 'رقم الهوية مطلوب';
    } else {
      const cleanIdNumber = idNumber.replace(/\s+/g, '');
      if (!/^\d{9}$/.test(cleanIdNumber)) {
        errors.idNumber = 'رقم الهوية يجب أن يتكون من 9 أرقام فقط';
      }
    }

    // التحقق من تاريخ الميلاد - مطلوب
    if (!birthDate || typeof birthDate !== 'string') {
      errors.birthDate = 'تاريخ الميلاد مطلوب';
    } else {
      const birthDateObj = new Date(birthDate);
      if (birthDateObj > new Date()) {
        errors.birthDate = 'تاريخ الميلاد لا يمكن أن يكون في المستقبل';
      }
    }

    // التحقق من الجنس - مطلوب
    if (!gender || typeof gender !== 'string') {
      errors.gender = 'الجنس مطلوب';
    } else {
      const allowedGenders = ['ذكر', 'أنثى', 'male', 'female', 'Male', 'Female'];
      if (!allowedGenders.includes(gender)) {
        errors.gender = 'الجنس يجب أن يكون ذكر أو أنثى';
      }
    }

    // التحقق من مكان السكن - مطلوب
    if (!residence || typeof residence !== 'string' || residence.trim().length === 0) {
      errors.residence = 'مكان السكن مطلوب';
    }

    // التحقق من المعلم - مطلوب
    if (!teacher || typeof teacher !== 'string' || teacher.trim().length === 0) {
      errors.teacher = 'اسم المعلم مطلوب';
    }

    // التحقق من الحلقة - مطلوب
    if (!group || typeof group !== 'string' || group.trim().length === 0) {
      errors.group = 'اسم الحلقة مطلوب';
    }

    // التحقق من رقم الهاتف - مطلوب
    if (!phoneNumber || typeof phoneNumber !== 'string') {
      errors.phoneNumber = 'رقم الهاتف مطلوب';
    } else {
      const cleanPhone = phoneNumber.replace(/\s+/g, '');
      if (!/^05\d{8}$/.test(cleanPhone)) {
        errors.phoneNumber = 'الرقم يجب أن يبدأ بـ 05 ويتكوّن من 10 أرقام';
      }
    }

    // التحقق من البريد الإلكتروني - اختياري
    if (email && typeof email === 'string' && email.trim() !== '') {
      const emailRegex = /\S+@\S+\.\S+/;
      if (!emailRegex.test(email.trim())) {
        errors.email = 'البريد الإلكتروني غير صالح';
      }
    }

    // التحقق من كلمة المرور للطالب الجديد
    if (isNewStudent) {
      if (!password || typeof password !== 'string' || password.trim().length === 0) {
        errors.password = 'كلمة المرور مطلوبة للطلاب الجدد';
      } else {
        // استيراد وتشغيل validatePasswordStrength من AuthValidation
        const { validatePasswordStrength } = require('./AuthValidation');
        const strengthValidation = validatePasswordStrength(password);
        if (!strengthValidation.isValid) {
          errors.password = strengthValidation.error;
        }
      }
    }

    // التحقق من العمر إذا تم تمريره
    if (age !== undefined && age !== null) {
      if (typeof age !== 'number' || age < 0) {
        errors.age = 'العمر يجب أن يكون رقماً موجباً';
      }
    }

    // إذا وجدت أخطاء، إرجاعها
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'بيانات غير صحيحة',
        errors
      });
    }

    next();
  } catch (error) {
    console.error('خطأ في validateStudentData:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في التحقق من بيانات الطالب',
      error: error.message
    });
  }
};

// تنظيف وتطبيع البيانات - متوافق مع Frontend
const sanitizeStudentData = (req, res, next) => {
  try {
    const { 
      firstName, 
      fatherName,
      grandFatherName,
      motherName,
      lastName, 
      email, 
      phoneNumber, 
      idNumber,
      residence,
      teacher,
      group,
      gender,
      birthDate,
      age
    } = req.body;
    
    // تنظيف النصوص
    const textFields = {
      firstName,
      fatherName,
      grandFatherName,
      motherName,
      lastName, 
      residence,
      teacher,
      group
    };
    
    for (const [field, value] of Object.entries(textFields)) {
      if (value && typeof value === 'string') {
        req.body[field] = value.trim();
      }
    }
    
    // تنظيف البريد الإلكتروني
    if (email && typeof email === 'string') {
      const cleanEmail = email.trim().toLowerCase();
      req.body.email = cleanEmail === '' ? null : cleanEmail;
    } else if (email === '') {
      req.body.email = null;
    }
    
    // تنظيف أرقام الهاتف والهوية
    if (phoneNumber && typeof phoneNumber === 'string') {
      req.body.phoneNumber = phoneNumber.replace(/\s+/g, '');
    }
    
    if (idNumber && typeof idNumber === 'string') {
      req.body.idNumber = idNumber.replace(/\s+/g, '');
    }

    // تطبيع الجنس
    if (gender && typeof gender === 'string') {
      req.body.gender = normalizeGender(gender);
    }

    // حساب العمر من تاريخ الميلاد إذا لم يكن موجوداً
    if (birthDate && !age) {
      req.body.age = calculateAge(birthDate);
    }

    // ضمان القيم الافتراضية
    if (req.body.isActive === undefined) {
      req.body.isActive = false;
    }

    if (!req.body.lastSeen) {
      req.body.lastSeen = new Date();
    }
    
    console.log('✅ تم تنظيف وتطبيع بيانات الطالب');
    next();
    
  } catch (error) {
    console.error('خطأ في middleware sanitizeStudentData:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تنظيف بيانات الطالب',
      error: error.message
    });
  }
};

// دالة مساعدة لتحويل تاريخ الميلاد إلى صيغة YYYY-MM-DD
const formatBirthDateForBackend = (dateInput) => {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  
  if (isNaN(date.getTime())) {
    throw new Error('تاريخ غير صالح');
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

// الأخطاء الشائعة - متطابقة مع Frontend
const commonStudentValidationErrors = {
  phoneFormat: 'الرقم يجب أن يبدأ بـ 05 ويتكوّن من 10 أرقام',
  emailFormat: 'البريد الإلكتروني غير صالح',
  birthDateFormat: 'تاريخ الميلاد لا يمكن أن يكون في المستقبل',
  idNumberFormat: 'رقم الهوية يجب أن يتكون من 9 أرقام فقط',
  passwordRequired: 'كلمة المرور مطلوبة للطالب الجديد',
  uniqueConstraints: {
    phone: 'رقم الهاتف موجود بالفعل',
    idNumber: 'رقم الهوية موجود بالفعل'
  },
};

module.exports = {
  validateStudentData,
  sanitizeStudentData,
  normalizeGender,
  calculateAge,
  formatBirthDateForBackend,
  commonStudentValidationErrors
};