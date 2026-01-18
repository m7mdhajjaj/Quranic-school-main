// Teacher Assistant Validation - متطابق مع Teacher validation
// التحقق من صحة بيانات المساعدين - نفس المنطق المستخدم للمعلمين
const { checkDuplicateFields } = require('../validators/duplicateChecker');

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
const validateAssistantData = async (req, res, next) => {
  try {
    const errors = {};
    const { 
      firstName, 
      lastName, 
      email, 
      phoneNumber, 
      idNumber,
      birthDate,
      fatherName,
      grandFatherName,
      motherName,
      residence,
      gender,
      age
    } = req.body;

    const isNewAssistant = req.method === 'POST';

    // التحقق من الاسم الأول - مطلوب فقط للمساعدين الجدد
    if (isNewAssistant && (!firstName || typeof firstName !== 'string' || firstName.trim().length === 0)) {
      errors.firstName = 'الاسم الأول مطلوب';
    } else if (firstName !== undefined && (typeof firstName !== 'string' || firstName.trim().length === 0)) {
      errors.firstName = 'الاسم الأول يجب أن يكون نصاً غير فارغ';
    }

    // التحقق من اسم العائلة - مطلوب فقط للمساعدين الجدد
    if (isNewAssistant && (!lastName || typeof lastName !== 'string' || lastName.trim().length === 0)) {
      errors.lastName = 'اسم العائلة مطلوب';
    } else if (lastName !== undefined && (typeof lastName !== 'string' || lastName.trim().length === 0)) {
      errors.lastName = 'اسم العائلة يجب أن يكون نصاً غير فارغ';
    }

    // التحقق من رقم الهوية - مطلوب فقط للمساعدين الجدد
    if (isNewAssistant && (!idNumber || typeof idNumber !== 'string')) {
      errors.idNumber = 'رقم الهوية مطلوب';
    } else if (idNumber !== undefined) {
      if (typeof idNumber !== 'string') {
        errors.idNumber = 'رقم الهوية يجب أن يكون نصاً';
      } else {
        const cleanIdNumber = idNumber.replace(/\s+/g, '');
        if (!/^\d{9}$/.test(cleanIdNumber)) {
          errors.idNumber = 'رقم الهوية يجب أن يتكون من 9 أرقام فقط';
        }
      }
    }

    // التحقق من رقم الهاتف - مطلوب فقط للمساعدين الجدد
    if (isNewAssistant && (!phoneNumber || typeof phoneNumber !== 'string')) {
      errors.phoneNumber = 'رقم الهاتف مطلوب';
    } else if (phoneNumber !== undefined) {
      if (typeof phoneNumber !== 'string') {
        errors.phoneNumber = 'رقم الهاتف يجب أن يكون نصاً';
      } else {
        const cleanPhone = phoneNumber.replace(/\s+/g, '');
        if (!/^05\d{8}$/.test(cleanPhone)) {
          errors.phoneNumber = 'الرقم يجب أن يبدأ بـ 05 ويتكوّن من 10 أرقام';
        }
      }
    }

    // التحقق من تاريخ الميلاد - مطلوب فقط للمساعدين الجدد
    if (isNewAssistant && (!birthDate || typeof birthDate !== 'string')) {
      errors.birthDate = 'تاريخ الميلاد مطلوب';
    } else if (birthDate !== undefined) {
      if (typeof birthDate !== 'string') {
        errors.birthDate = 'تاريخ الميلاد يجب أن يكون نصاً';
      } else if (!/^\d{4}-\d{2}-\d{2}/.test(birthDate)) {
        errors.birthDate = 'صيغة التاريخ يجب أن تكون YYYY-MM-DD';
      } else {
        const birthDateObj = new Date(birthDate);
        if (birthDateObj > new Date()) {
          errors.birthDate = 'تاريخ الميلاد لا يمكن أن يكون في المستقبل';
        }
      }
    }

    // التحقق من البريد الإلكتروني - مطلوب فقط للمساعدين الجدد
    if (isNewAssistant && (!email || typeof email !== 'string')) {
      errors.email = 'البريد الإلكتروني مطلوب';
    } else if (email !== undefined) {
      if (typeof email !== 'string') {
        errors.email = 'البريد الإلكتروني يجب أن يكون نصاً';
      } else {
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email.trim())) {
          errors.email = 'صيغة البريد الإلكتروني غير صحيحة';
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

    // التحقق من التكرار باستخدام duplicateChecker
    const currentAssistantId = req.method === 'PUT' ? (req.params.id || req.user?.id || req.user?._id) : null;
    const duplicateError = await checkDuplicateFields(
      {
        email: email,
        phoneNumber: phoneNumber,
        idNumber: idNumber
      },
      currentAssistantId,
      'teacherAssistant'
    );
    
    if (duplicateError) {
      console.log('❌ تكرار في البيانات:', duplicateError.message);
      return res.status(400).json(duplicateError);
    }

    next();
  } catch (error) {
    console.error('خطأ في validateAssistantData:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في التحقق من بيانات المساعد',
      error: error.message
    });
  }
};

// التحقق من الحلقات المرتبطة بالمساعد
const validateAssistantGroups = (req, res, next) => {
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
    
    console.log(`✅ تم التحقق من ${validatedGroups.length} حلقة للمساعد`);
    next();
    
  } catch (error) {
    console.error('خطأ في middleware validateAssistantGroups:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في التحقق من بيانات الحلقات',
      error: error.message
    });
  }
};

// تنظيف وتطبيع البيانات - متوافق مع Frontend
const sanitizeAssistantData = (req, res, next) => {
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
      req.body.role = 'teacherAssistant';
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
    
    console.log('✅ تم تنظيف وتطبيع بيانات المساعد');
    next();
    
  } catch (error) {
    console.error('خطأ في middleware sanitizeAssistantData:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تنظيف بيانات المساعد',
      error: error.message
    });
  }
};

module.exports = {
  validateAssistantData,
  validateAssistantGroups,
  sanitizeAssistantData,
  normalizeGender,
  calculateAge,
};
