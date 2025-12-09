// Student Validation - متطابق مع Frontend validation
// التحقق من صحة بيانات الطلاب - نفس المنطق المستخدم في الفرونت إند
const { checkDuplicateFields } = require('../../utils/validators/duplicateChecker');

// تطبيع الجنس - نفس المنطق في Frontend
const normalizeGender = (value) => {
  if (!value) return null;
  const normalized = value.toString().toLowerCase().trim();
  if (normalized === 'male' || normalized === 'ذكر') return 'ذكر';
  if (normalized === 'female' || normalized === 'أنثى' || normalized === 'انثى') return 'أنثى';
  return value;
};

// تطبيع الأسماء المركبة - إزالة الفراغ بعد "عبد"
// مثال: "عبد الرحمن" → "عبدالرحمن"، "عبد الله" → "عبدالله"
const normalizeCompoundNames = (value) => {
  if (!value || typeof value !== 'string') return value;
  
  // إزالة الفراغ بين "عبد" و (ا، أ، إ)
  return value.replace(/عبد\s+([اأإ])/gi, 'عبد$1');
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
const validateStudentData = async (req, res, next) => {
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
    const isUpdate = req.method === 'PUT';

    // التحقق من الاسم الأول - مطلوب دائماً
    if (!firstName || typeof firstName !== 'string' || firstName.trim().length === 0) {
      errors.firstName = 'الاسم الأول مطلوب';
    }

    // التحقق من اسم الأب - مطلوب للطلاب الجدد فقط
    if (isNewStudent && (!fatherName || typeof fatherName !== 'string' || fatherName.trim().length === 0)) {
      errors.fatherName = 'اسم الأب مطلوب';
    }

    // التحقق من اسم الجد - مطلوب للطلاب الجدد فقط
    if (isNewStudent && (!grandFatherName || typeof grandFatherName !== 'string' || grandFatherName.trim().length === 0)) {
      errors.grandFatherName = 'اسم الجد مطلوب';
    }

    // التحقق من اسم الأم - مطلوب للطلاب الجدد فقط
    if (isNewStudent && (!motherName || typeof motherName !== 'string' || motherName.trim().length === 0)) {
      errors.motherName = 'اسم الأم مطلوب';
    }

    // التحقق من اسم العائلة - مطلوب للطلاب الجدد فقط
    if (isNewStudent && (!lastName || typeof lastName !== 'string' || lastName.trim().length === 0)) {
      errors.lastName = 'اسم العائلة مطلوب';
    }

    // التحقق من رقم الهوية - مطلوب للطلاب الجدد، اختياري للتحديث
    if (idNumber !== undefined && idNumber !== null && idNumber !== '') {
      if (typeof idNumber !== 'string') {
        errors.idNumber = 'رقم الهوية يجب أن يكون نصاً';
      } else {
        const cleanIdNumber = idNumber.replace(/\s+/g, '');
        if (!/^\d{9}$/.test(cleanIdNumber)) {
          errors.idNumber = 'رقم الهوية يجب أن يتكون من 9 أرقام فقط';
        }
      }
    } else if (isNewStudent) {
      errors.idNumber = 'رقم الهوية مطلوب';
    }

    // التحقق من تاريخ الميلاد - مطلوب للطلاب الجدد
    if (isNewStudent && (!birthDate || birthDate === '')) {
      errors.birthDate = 'تاريخ الميلاد مطلوب';
    } else if (birthDate !== undefined && birthDate !== null && birthDate !== '') {
      if (typeof birthDate !== 'string') {
        errors.birthDate = 'تاريخ الميلاد يجب أن يكون نصاً';
      } else {
        // التحقق من صيغة YYYY-MM-DD
        if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
          errors.birthDate = 'صيغة تاريخ الميلاد يجب أن تكون YYYY-MM-DD';
        } else {
          const birthDateObj = new Date(birthDate);
          if (isNaN(birthDateObj.getTime())) {
            errors.birthDate = 'تاريخ الميلاد غير صحيح';
          } else if (birthDateObj > new Date()) {
            errors.birthDate = 'تاريخ الميلاد لا يمكن أن يكون في المستقبل';
          }
        }
      }
    }

    // التحقق من الجنس - اختياري ولكن إذا تم إدخاله يجب أن يكون صحيحاً
    if (gender !== undefined && gender !== null && gender !== '') {
      if (typeof gender !== 'string') {
        errors.gender = 'الجنس يجب أن يكون نصاً';
      } else {
        const allowedGenders = ['ذكر', 'أنثى', 'male', 'female', 'Male', 'Female'];
        if (!allowedGenders.includes(gender)) {
          errors.gender = 'الجنس يجب أن يكون ذكر أو أنثى';
        }
      }
    }

    // التحقق من مكان السكن - اختياري
    if (residence !== undefined && residence !== null && residence !== '') {
      if (typeof residence !== 'string' || residence.trim().length === 0) {
        errors.residence = 'مكان السكن غير صحيح';
      }
    }

    // التحقق من المعلم - اختياري (يتم الحصول عليه من الحلقة)
    if (teacher !== undefined && teacher !== null && teacher !== '') {
      if (typeof teacher !== 'string' || teacher.trim().length === 0) {
        errors.teacher = 'اسم المعلم غير صحيح';
      }
    }

    // التحقق من الحلقة - مطلوب للطلاب الجدد فقط
    if (isNewStudent && (!group || typeof group !== 'string' || group.trim().length === 0)) {
      errors.group = 'اسم الحلقة مطلوب';
    }

    // التحقق من رقم الهاتف - اختياري ولكن إذا تم إدخاله يجب أن يكون صحيحاً
    if (phoneNumber !== undefined && phoneNumber !== null && phoneNumber !== '') {
      if (typeof phoneNumber !== 'string') {
        errors.phoneNumber = 'رقم الهاتف يجب أن يكون نصاً';
      } else {
        const cleanPhone = phoneNumber.replace(/\s+/g, '');
        if (!/^05\d{8}$/.test(cleanPhone)) {
          errors.phoneNumber = 'الرقم يجب أن يبدأ بـ 05 ويتكوّن من 10 أرقام';
        }
      }
    }

    // التحقق من البريد الإلكتروني - اختياري
    if (email && typeof email === 'string' && email.trim() !== '') {
      const emailRegex = /\S+@\S+\.\S+/;
      if (!emailRegex.test(email.trim())) {
        errors.email = 'البريد الإلكتروني غير صالح';
      }
    }

    // التحقق من كلمة المرور - اختيارية (سيتم استخدام رقم الهوية إذا لم تُدخل)
    if (password !== undefined && password !== null && password !== '') {
      if (typeof password !== 'string' || password.trim().length === 0) {
        errors.password = 'كلمة المرور غير صحيحة';
      } else {
        // التحقق من الطول الأدنى
        if (password.length < 4) {
          errors.password = 'كلمة المرور يجب أن تكون 4 أحرف على الأقل';
        } else {
          const numbers = (password.match(/[\d\u0660-\u0669]/g) || []).length;
          const letters = (password.match(/[a-zA-Z\u0600-\u06FF]/g) || []).length;
          
          const hasMinimumNumbers = numbers >= 4;
          const hasMinimumLettersWithNumbers = letters >= 3 && numbers >= 1;
          
          if (!hasMinimumNumbers && !hasMinimumLettersWithNumbers) {
            errors.password = 'كلمة المرور يجب أن تحتوي على 4 أرقام على الأقل، أو 3 حروف مع أرقام';
          }
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
      console.log('❌ أخطاء في التحقق من البيانات:', errors);
      return res.status(400).json({
        success: false,
        message: 'بيانات غير صحيحة',
        errors
      });
    }

    // التحقق من التكرار باستخدام duplicateChecker
    const currentStudentId = isUpdate ? req.params.id : null;
    const duplicateError = await checkDuplicateFields(
      {
        email: email,
        phoneNumber: phoneNumber,
        idNumber: idNumber
      },
      currentStudentId,
      'student'
    );
    
    if (duplicateError) {
      console.log('❌ تكرار في البيانات:', duplicateError.message);
      return res.status(400).json(duplicateError);
    }

    console.log('✅ تم التحقق من البيانات بنجاح');
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
        // تنظيف المسافات الزائدة
        let cleanValue = value.trim();
        
        // تطبيع الأسماء المركبة (عبد الرحمن → عبدالرحمن)
        if (['firstName', 'fatherName', 'grandFatherName', 'motherName', 'lastName', 'teacher'].includes(field)) {
          cleanValue = normalizeCompoundNames(cleanValue);
        }
        
        req.body[field] = cleanValue;
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
  normalizeCompoundNames,
  calculateAge,
  formatBirthDateForBackend,
  commonStudentValidationErrors
};