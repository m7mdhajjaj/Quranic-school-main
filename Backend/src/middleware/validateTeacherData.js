// middleware/validateTeacherData.js
// Middleware للتحقق من صحة بيانات المعلمين وخاصة الحلقات

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
          id: null, // سيتم تحديثه لاحقاً
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

// Middleware للتنظيف العام لبيانات المعلم
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
      residence 
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
    
    console.log('✅ تم تنظيف بيانات المعلم');
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

module.exports = {
  validateTeacherGroups,
  sanitizeTeacherData
};