// Teacher Validation - متطابق مع Frontend validation
// التحقق من صحة بيانات المعلمين - نفس المنطق المستخدم في الفرونت إند

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
const validateTeacherData = (req, res, next) => {
  try {
    const errors = {};
    const { 
      firstName, 
      lastName, 
      email, 
      phoneNumber, 
      idNumber,
      birthDate,
      password,
      fatherName,
      grandFatherName,
      motherName,
      residence,
      gender,
      age
    } = req.body;

    const isNewTeacher = req.method === 'POST';

    // التحقق من الاسم الأول
    if (!firstName || typeof firstName !== 'string' || firstName.trim().length === 0) {
      errors.firstName = 'الاسم الأول مطلوب';
    }

    // التحقق من اسم العائلة
    if (!lastName || typeof lastName !== 'string' || lastName.trim().length === 0) {
      errors.lastName = 'اسم العائلة مطلوب';
    }

    // التحقق من رقم الهوية
    if (!idNumber || typeof idNumber !== 'string') {
      errors.idNumber = 'رقم الهوية مطلوب';
    } else {
      const cleanIdNumber = idNumber.replace(/\s+/g, '');
      if (!/^\d{9}$/.test(cleanIdNumber)) {
        errors.idNumber = 'رقم الهوية يجب أن يتكون من 9 أرقام فقط';
      }
    }

    // التحقق من رقم الهاتف
    if (!phoneNumber || typeof phoneNumber !== 'string') {
      errors.phoneNumber = 'رقم الهاتف مطلوب';
    } else {
      const cleanPhone = phoneNumber.replace(/\s+/g, '');
      if (!/^05\d{8}$/.test(cleanPhone)) {
        errors.phoneNumber = 'الرقم يجب أن يبدأ بـ 05 ويتكوّن من 10 أرقام';
      }
    }

    // التحقق من تاريخ الميلاد
    if (!birthDate || typeof birthDate !== 'string') {
      errors.birthDate = 'تاريخ الميلاد مطلوب';
    } else {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
        errors.birthDate = 'صيغة التاريخ يجب أن تكون YYYY-MM-DD';
      } else {
        const birthDateObj = new Date(birthDate);
        if (birthDateObj > new Date()) {
          errors.birthDate = 'تاريخ الميلاد لا يمكن أن يكون في المستقبل';
        }
      }
    }

    // التحقق من البريد الإلكتروني
    if (!email || typeof email !== 'string') {
      errors.email = 'البريد الإلكتروني مطلوب';
    } else {
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(email.trim())) {
        errors.email = 'صيغة البريد الإلكتروني غير صحيحة';
      }
    }

    // التحقق من كلمة المرور للمعلم الجديد
    if (isNewTeacher) {
      if (!password || typeof password !== 'string' || password.trim().length === 0) {
        errors.password = 'كلمة المرور مطلوبة للمعلمين الجدد';
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

    // التحقق من الجنس إذا تم تمريره
    if (gender !== undefined && gender !== null) {
      const allowedGenders = ['ذكر', 'أنثى', 'male', 'female', 'Male', 'Female'];
      if (!allowedGenders.includes(gender)) {
        errors.gender = 'الجنس يجب أن يكون ذكر أو أنثى';
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
    console.error('خطأ في validateTeacherData:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في التحقق من بيانات المعلم',
      error: error.message
    });
  }
};

// التحقق من الحلقات
const validateTeacherGroups = (req, res, next) => {
  try {
    const { groups } = req.body;
    
    // إذا لم يتم تمرير حلقات، استمر
    if (!groups) {
      req.body.groups = [];
      return next();
    }
    
    // التأكد من أن groups مصفوفة
    if (!Array.isArray(groups)) {
      return res.status(400).json({
        success: false,
        message: 'الحلقات يجب أن تكون مصفوفة',
        field: 'groups'
      });
    }
    
    // التحقق من كل حلقة
    const validatedGroups = [];
    
    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      
      // دعم البيانات القديمة (strings)
      if (typeof group === 'string') {
        if (group.trim().length === 0) {
          return res.status(400).json({
            success: false,
            message: `الحلقة رقم ${i + 1} لا يمكن أن تكون فارغة`,
            field: 'groups'
          });
        }
        
        // تحويل البيانات القديمة للبنية الجديدة
        validatedGroups.push({
          id: null,
          name: group.trim(),
          number: i + 1
        });
        continue;
      }
      
      // التحقق من البنية الجديدة
      if (typeof group !== 'object' || group === null) {
        return res.status(400).json({
          success: false,
          message: `الحلقة رقم ${i + 1} يجب أن تكون كائناً صالحاً`,
          field: 'groups'
        });
      }
      
      // التحقق من وجود الحقول المطلوبة
      if (!group.name || typeof group.name !== 'string' || group.name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: `اسم الحلقة رقم ${i + 1} مطلوب ويجب أن يكون نصاً غير فارغ`,
          field: 'groups'
        });
      }
      
      if (group.number !== undefined && (typeof group.number !== 'number' || group.number < 1)) {
        return res.status(400).json({
          success: false,
          message: `رقم الحلقة ${i + 1} يجب أن يكون رقماً موجباً`,
          field: 'groups'
        });
      }
      
      // إضافة الحلقة المتحقق منها
      validatedGroups.push({
        id: group.id || null,
        name: group.name.trim(),
        number: group.number || i + 1
      });
    }
    
    // تحديث البيانات المنظفة
    req.body.groups = validatedGroups;
    
    console.log(`✅ تم التحقق من ${validatedGroups.length} حلقة للمعلم`);
    next();
    
  } catch (error) {
    console.error('خطأ في middleware validateTeacherGroups:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في التحقق من بيانات الحلقات',
      error: error.message
    });
  }
};

// تنظيف وتطبيع البيانات - متوافق مع Frontend
const sanitizeTeacherData = (req, res, next) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      phoneNumber, 
      idNumber,
      fatherName,
      grandFatherName,
      motherName,
      residence,
      gender,
      birthDate,
      age
    } = req.body;
    
    // تنظيف النصوص
    const textFields = {
      firstName,
      lastName, 
      fatherName,
      grandFatherName,
      motherName,
      residence
    };
    
    for (const [field, value] of Object.entries(textFields)) {
      if (value && typeof value === 'string') {
        req.body[field] = value.trim();
        // إزالة القيم الفارغة
        if (req.body[field] === '') {
          req.body[field] = null;
        }
      } else if (value === '') {
        req.body[field] = null;
      }
    }
    
    // تنظيف البريد الإلكتروني
    if (email && typeof email === 'string') {
      req.body.email = email.trim().toLowerCase();
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
    if (req.body.role === undefined) {
      req.body.role = 'teacher';
    }

    if (req.body.isActive === undefined) {
      req.body.isActive = false;
    }

    if (!req.body.lastSeen) {
      req.body.lastSeen = new Date();
    }

    // ضمان أن groups مصفوفة
    if (!req.body.groups) {
      req.body.groups = [];
    }
    
    console.log('✅ تم تنظيف وتطبيع بيانات المعلم');
    next();
    
  } catch (error) {
    console.error('خطأ في middleware sanitizeTeacherData:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تنظيف بيانات المعلم',
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

// دالة مساعدة لتحويل صيغة YYYY-MM-DD إلى تاريخ للعرض
const parseBirthDateFromBackend = (dateString) => {
  if (!dateString || !dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return null;
  }
  
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

// الأخطاء الشائعة - متطابقة مع Frontend
const commonTeacherValidationErrors = {
  phoneFormat: 'الرقم يجب أن يبدأ بـ 05 ويتكوّن من 10 أرقام',
  emailFormat: 'صيغة البريد الإلكتروني غير صحيحة',
  birthDateFormat: 'صيغة التاريخ يجب أن تكون YYYY-MM-DD',
  idNumberFormat: 'رقم الهوية يجب أن يتكون من 9 أرقام فقط',
  passwordRequired: 'كلمة المرور مطلوبة للمعلم الجديد',
  uniqueConstraints: {
    phone: 'رقم الهاتف موجود بالفعل',
    email: 'البريد الإلكتروني موجود بالفعل',
    idNumber: 'رقم الهوية موجود بالفعل'
  },
};

module.exports = {
  validateTeacherData,
  validateTeacherGroups,
  sanitizeTeacherData,
  normalizeGender,
  calculateAge,
  formatBirthDateForBackend,
  parseBirthDateFromBackend,
  commonTeacherValidationErrors
};