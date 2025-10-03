
const Student = require("../models/Student");

// Get all students - OPTIMIZED for performance
exports.getStudents = async (req, res) => {
  try {
    console.log('🚀 تحميل بيانات الطلاب...');
    const startTime = Date.now();
    
    // Optimized query: exclude heavy fields like avatar
    const students = await Student.find()
      .select('-avatar') // استبعاد الصور لتسريع التحميل
      .lean() // استخدام lean() لتحسين الأداء
      .sort({ createdAt: -1 }) // ترتيب حسب الأحدث
      .limit(1000); // حد أقصى 1000 طالب
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ تم تحميل ${students.length} طالب في ${duration}ms`);
    res.json(students);
  } catch (error) {
    console.error('❌ خطأ في تحميل الطلاب:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get students by group
exports.getStudentsByGroup = async (req, res) => {
  try {
    const students = await Student.find({ group: req.params.group });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single student by ID (for profile)
exports.getStudentById = async (req, res) => {
  try {
    // Always return email and phoneNumber if present
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    // Explicitly include email and phoneNumber in response (for clarity)
    const studentObj = student.toObject();
    res.status(200).json({ 
      success: true, 
      data: {
        ...studentObj,
        email: studentObj.email || '',
        phoneNumber: studentObj.phoneNumber || ''
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add new student - simplified for robustness
exports.createStudent = async (req, res) => {
  try {
    console.log(
      "Received request to create student:",
      JSON.stringify(req.body, null, 2),
    );

    const { idNumber, email, phoneNumber } = req.body;
    const Teacher = require('../models/Teacher');
    const Admin = require('../models/Admin');

    // فحص التكرار في جميع المجموعات
    if (idNumber) {
      const [existingStudent, existingTeacher, existingAdmin] = await Promise.all([
        Student.findOne({ idNumber }),
        Teacher.findOne({ idNumber }),
        Admin.findOne({ idNumber })
      ]);
      
      if (existingStudent || existingTeacher || existingAdmin) {
        return res.status(400).json({ 
          success: false, 
          message: "رقم الهوية موجود بالفعل في النظام",
          field: 'idNumber'
        });
      }
    }
    
    if (email) {
      const [existingStudent, existingTeacher, existingAdmin] = await Promise.all([
        Student.findOne({ email }),
        Teacher.findOne({ email }),
        Admin.findOne({ email })
      ]);
      
      if (existingStudent || existingTeacher || existingAdmin) {
        return res.status(400).json({ 
          success: false, 
          message: "البريد الإلكتروني موجود بالفعل في النظام",
          field: 'email'
        });
      }
    }
    
    if (phoneNumber) {
      const [existingStudent, existingTeacher, existingAdmin] = await Promise.all([
        Student.findOne({ phoneNumber }),
        Teacher.findOne({ phoneNumber }),
        Admin.findOne({ phoneNumber })
      ]);
      
      if (existingStudent || existingTeacher || existingAdmin) {
        return res.status(400).json({ 
          success: false, 
          message: "رقم الهاتف موجود بالفعل في النظام",
          field: 'phoneNumber'
        });
      }
    }

    // Generate new studentId (max + 1)
    let maxId = 100000;
    try {
      const lastStudent = await Student.findOne().sort({ studentId: -1 });
      if (lastStudent) {
        maxId = lastStudent.studentId;
      }
    } catch (idError) {
      console.error("Error getting last student ID:", idError);
      // Continue with default maxId if there's an error
    }

    // التحقق من توافق المعلم مع الحلقة
    const { teacher, group } = req.body;
    if (teacher && group) {
      const Group = require('../models/Group');
      
      // البحث بالاسم الكامل أولاً
      let groupData = await Group.findOne({ name: group, isActive: { $ne: false } });
      
      // إذا لم يوجد تطابق كامل، ابحث بالتطابق الجزئي
      if (!groupData) {
        groupData = await Group.findOne({ 
          name: { $regex: group.replace(/\s+/g, '\\s*'), $options: 'i' }, 
          isActive: { $ne: false } 
        });
      }
      
      // إذا لم يوجد، ابحث عن المجموعات التي تحتوي على الاسم المحدد
      if (!groupData) {
        groupData = await Group.findOne({ 
          name: { $regex: group, $options: 'i' }, 
          isActive: { $ne: false } 
        });
      }
      
      if (!groupData) {
        // إنشاء المجموعة تلقائياً إذا لم توجد
        console.log(`📝 إنشاء مجموعة جديدة: ${group}`);
        try {
          groupData = await Group.create({
            name: group,
            teacher: teacher,
            teacherName: teacher,
            description: `مجموعة ${group} - تم إنشاؤها تلقائياً`,
            capacity: 30,
            isActive: true
          });
          console.log(`✅ تم إنشاء المجموعة: ${group}`);
        } catch (groupError) {
          console.error('خطأ في إنشاء المجموعة:', groupError);
          return res.status(400).json({
            success: false,
            message: `الحلقة "${group}" غير موجودة ولم يتمكن من إنشاؤها. ${groupError.message}`
          });
        }
      }

      // التحقق من تطابق المعلم مع معلم الحلقة
      const normalizeTeacherName = (name) => name?.trim().toLowerCase().replace(/\s+/g, ' ') || '';
      const normalizedStudentTeacher = normalizeTeacherName(teacher);
      const normalizedGroupTeacher = normalizeTeacherName(groupData.teacher || '');
      const normalizedGroupTeacherName = normalizeTeacherName(groupData.teacherName || '');
      
      const teacherMatches = (
        normalizedStudentTeacher === normalizedGroupTeacher ||
        normalizedStudentTeacher === normalizedGroupTeacherName ||
        normalizedGroupTeacher.includes(normalizedStudentTeacher) ||
        normalizedGroupTeacherName.includes(normalizedStudentTeacher)
      );

      if (!teacherMatches) {
        return res.status(400).json({
          success: false,
          message: `المعلم "${teacher}" لا يطابق معلم الحلقة "${groupData.teacher || groupData.teacherName}". يجب أن يكون الطالب في حلقة تابعة لنفس المعلم.`
        });
      }
    }

    const studentData = {
      ...req.body,
      studentId: maxId + 1,
      // Ensure age is a number
      age: parseInt(req.body.age || 0, 10) || 0,
    };

    console.log(
      "Creating student with data:",
      JSON.stringify(studentData, null, 2),
    );

    const student = new Student(studentData);
    const newStudent = await student.save();

    console.log("Student created successfully:", newStudent._id);

    // Emit socket event for real-time updates
    if (global.io) {
      console.log('📡 Broadcasting student created event');
      global.io.emit('studentCreated', newStudent);
    }

    res.status(201).json(newStudent);
  } catch (error) {
    console.error("Error creating student:", error);

    // التحقق من أخطاء التحقق من صحة البيانات
    if (error.name === "ValidationError") {
      const validationErrors = {};
      const errorMessages = [];
      
      Object.keys(error.errors).forEach((field) => {
        const fieldError = error.errors[field];
        validationErrors[field] = fieldError.message;
        
        // رسائل خطأ مخصصة حسب نوع الحقل
        if (field === 'idNumber') {
          if (fieldError.message.includes('9 أرقام')) {
            errorMessages.push('رقم الهوية يجب أن يتكون من 9 أرقام فقط');
          } else {
            errorMessages.push('رقم الهوية غير صحيح');
          }
        } else if (field === 'phoneNumber') {
          errorMessages.push('رقم الهاتف يجب أن يبدأ بـ 05 ويتكون من 10 أرقام');
        } else if (field === 'email') {
          errorMessages.push('البريد الإلكتروني غير صحيح');
        } else {
          errorMessages.push(`${field}: ${fieldError.message}`);
        }
      });

      return res.status(400).json({
        success: false,
        message: `خطأ في التحقق من البيانات: ${errorMessages.join(', ')}`,
        errors: validationErrors,
        validationErrors: errorMessages
      });
    }

    // معالجة أخطاء التكرار (Duplicate key errors)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      let arabicFieldName = field;
      let specificMessage = '';
      
      switch (field) {
        case 'idNumber':
          arabicFieldName = 'رقم الهوية';
          specificMessage = 'رقم الهوية موجود بالفعل في النظام. يرجى استخدام رقم هوية مختلف.';
          break;
        case 'phoneNumber':
          arabicFieldName = 'رقم الهاتف';
          specificMessage = 'رقم الهاتف موجود بالفعل في النظام. يرجى استخدام رقم هاتف مختلف.';
          break;
        case 'email':
          arabicFieldName = 'البريد الإلكتروني';
          specificMessage = 'البريد الإلكتروني موجود بالفعل في النظام.';
          break;
        default:
          specificMessage = `${arabicFieldName} موجود بالفعل في النظام.`;
      }
      
      return res.status(400).json({
        success: false,
        message: specificMessage,
        error: `Duplicate ${field}`,
        field: field,
        arabicField: arabicFieldName
      });
    }

    // معالجة أخطاء أخرى محددة
    if (error.message && error.message.includes('Cast to')) {
      return res.status(400).json({
        success: false,
        message: "نوع البيانات المدخلة غير صحيح",
        error: "Invalid data type"
      });
    }

    // معالجة الأخطاء العامة
    console.error('Unexpected error:', error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ غير متوقع أثناء حفظ بيانات الطالب",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// Update student
exports.updateStudent = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    
    const id = req.params.id;
    const updatedData = { ...req.body };
    const Teacher = require('../models/Teacher');
    const Admin = require('../models/Admin');

    // فحص التكرار للحقول المحدثة (تجنب الحقل المحدث حالياً)
    if (updatedData.idNumber) {
      const [existingStudent, existingTeacher, existingAdmin] = await Promise.all([
        Student.findOne({ idNumber: updatedData.idNumber, _id: { $ne: id } }),
        Teacher.findOne({ idNumber: updatedData.idNumber }),
        Admin.findOne({ idNumber: updatedData.idNumber })
      ]);
      
      if (existingStudent || existingTeacher || existingAdmin) {
        return res.status(400).json({ 
          success: false, 
          message: "رقم الهوية موجود بالفعل في النظام",
          field: 'idNumber'
        });
      }
    }
    
    if (updatedData.email) {
      const [existingStudent, existingTeacher, existingAdmin] = await Promise.all([
        Student.findOne({ email: updatedData.email, _id: { $ne: id } }),
        Teacher.findOne({ email: updatedData.email }),
        Admin.findOne({ email: updatedData.email })
      ]);
      
      if (existingStudent || existingTeacher || existingAdmin) {
        return res.status(400).json({ 
          success: false, 
          message: "البريد الإلكتروني موجود بالفعل في النظام",
          field: 'email'
        });
      }
    }
    
    if (updatedData.phoneNumber) {
      const [existingStudent, existingTeacher, existingAdmin] = await Promise.all([
        Student.findOne({ phoneNumber: updatedData.phoneNumber, _id: { $ne: id } }),
        Teacher.findOne({ phoneNumber: updatedData.phoneNumber }),
        Admin.findOne({ phoneNumber: updatedData.phoneNumber })
      ]);
      
      if (existingStudent || existingTeacher || existingAdmin) {
        return res.status(400).json({ 
          success: false, 
          message: "رقم الهاتف موجود بالفعل في النظام",
          field: 'phoneNumber'
        });
      }
    }
    
    // Always run validation, but handle password field specially
    if (!updatedData.password || updatedData.password.trim() === '') {
      // If no password provided, remove it from update data
      delete updatedData.password;
    }
    
    // التحقق من توافق المعلم مع الحلقة عند التعديل
    const { teacher, group } = updatedData;
    if (teacher && group) {
      const Group = require('../models/Group');
      
      // البحث بالاسم الكامل أولاً
      let groupData = await Group.findOne({ name: group, isActive: { $ne: false } });
      
      // إذا لم يوجد تطابق كامل، ابحث بالتطابق الجزئي
      if (!groupData) {
        groupData = await Group.findOne({ 
          name: { $regex: group.replace(/\s+/g, '\\s*'), $options: 'i' }, 
          isActive: { $ne: false } 
        });
      }
      
      // إذا لم يوجد، ابحث عن المجموعات التي تحتوي على الاسم المحدد
      if (!groupData) {
        groupData = await Group.findOne({ 
          name: { $regex: group, $options: 'i' }, 
          isActive: { $ne: false } 
        });
      }
      
      if (!groupData) {
        // إنشاء المجموعة تلقائياً إذا لم توجد
        console.log(`📝 إنشاء مجموعة جديدة: ${group}`);
        try {
          groupData = await Group.create({
            name: group,
            teacher: teacher,
            teacherName: teacher,
            description: `مجموعة ${group} - تم إنشاؤها تلقائياً`,
            capacity: 30,
            isActive: true
          });
          console.log(`✅ تم إنشاء المجموعة: ${group}`);
        } catch (groupError) {
          console.error('خطأ في إنشاء المجموعة:', groupError);
          return res.status(400).json({
            success: false,
            message: `الحلقة "${group}" غير موجودة ولم يتمكن من إنشاؤها. ${groupError.message}`
          });
        }
      }

      // التحقق من تطابق المعلم مع معلم الحلقة
      const normalizeTeacherName = (name) => name?.trim().toLowerCase().replace(/\s+/g, ' ') || '';
      const normalizedStudentTeacher = normalizeTeacherName(teacher);
      const normalizedGroupTeacher = normalizeTeacherName(groupData.teacher || '');
      const normalizedGroupTeacherName = normalizeTeacherName(groupData.teacherName || '');
      
      const teacherMatches = (
        normalizedStudentTeacher === normalizedGroupTeacher ||
        normalizedStudentTeacher === normalizedGroupTeacherName ||
        normalizedGroupTeacher.includes(normalizedStudentTeacher) ||
        normalizedGroupTeacherName.includes(normalizedStudentTeacher)
      );

      if (!teacherMatches) {
        return res.status(400).json({
          success: false,
          message: `المعلم "${teacher}" لا يطابق معلم الحلقة "${groupData.teacher || groupData.teacherName}". يجب أن يكون الطالب في حلقة تابعة لنفس المعلم.`
        });
      }
    }
    
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { 
        new: true, 
        runValidators: true, // ✅ Always run validation to match Student.js
        context: 'query' // Required for some validators to work properly
      }
    );
    
    if (!updatedStudent) {
      return res.status(404).json({ 
        success: false, 
        message: "الطالب غير موجود" 
      });
    }

    // Emit socket event for real-time updates
    if (global.io) {
      console.log('📡 Broadcasting student updated event');
      global.io.emit('studentUpdated', updatedStudent);
    }
    
    res.json({ success: true, data: updatedStudent });
    
  } catch (error) {
    console.error("Error updating student:", error);
    
    // التحقق من أخطاء التحقق من صحة البيانات
    if (error.name === "ValidationError") {
      const validationErrors = {};
      const errorMessages = [];
      
      Object.keys(error.errors).forEach((field) => {
        const fieldError = error.errors[field];
        validationErrors[field] = fieldError.message;
        
        // رسائل خطأ مخصصة حسب نوع الحقل
        if (field === 'idNumber') {
          if (fieldError.message.includes('9 أرقام')) {
            errorMessages.push('رقم الهوية يجب أن يتكون من 9 أرقام فقط');
          } else {
            errorMessages.push('رقم الهوية غير صحيح');
          }
        } else if (field === 'phoneNumber') {
          errorMessages.push('رقم الهاتف يجب أن يبدأ بـ 05 ويتكون من 10 أرقام');
        } else if (field === 'email') {
          errorMessages.push('البريد الإلكتروني غير صحيح');
        } else {
          errorMessages.push(`${field}: ${fieldError.message}`);
        }
      });

      return res.status(400).json({
        success: false,
        message: `خطأ في التحقق من البيانات: ${errorMessages.join(', ')}`,
        errors: validationErrors,
        validationErrors: errorMessages
      });
    }

    // معالجة أخطاء التكرار (Duplicate key errors)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      let arabicFieldName = field;
      let specificMessage = '';
      
      switch (field) {
        case 'idNumber':
          arabicFieldName = 'رقم الهوية';
          specificMessage = 'رقم الهوية موجود بالفعل في النظام. يرجى استخدام رقم هوية مختلف.';
          break;
        case 'phoneNumber':
          arabicFieldName = 'رقم الهاتف';
          specificMessage = 'رقم الهاتف موجود بالفعل في النظام. يرجى استخدام رقم هاتف مختلف.';
          break;
        case 'email':
          arabicFieldName = 'البريد الإلكتروني';
          specificMessage = 'البريد الإلكتروني موجود بالفعل في النظام.';
          break;
        default:
          specificMessage = `${arabicFieldName} موجود بالفعل في النظام.`;
      }
      
      return res.status(400).json({
        success: false,
        message: specificMessage,
        error: `Duplicate ${field}`,
        field: field,
        arabicField: arabicFieldName
      });
    }

    // معالجة أخطاء أخرى محددة
    if (error.message && error.message.includes('Cast to')) {
      return res.status(400).json({
        success: false,
        message: "نوع البيانات المدخلة غير صحيح",
        error: "Invalid data type"
      });
    }

    // معالجة الأخطاء العامة
    console.error('Unexpected error during update:', error);
    res.status(500).json({ 
      success: false, 
      message: "حدث خطأ غير متوقع أثناء تحديث بيانات الطالب",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Delete student
exports.deleteStudent = async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);
    if (!deletedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Emit socket event for real-time updates
    if (global.io) {
      console.log('📡 Broadcasting student deleted event');
      global.io.emit('studentDeleted', { 
        studentId: req.params.id, 
        student: deletedStudent 
      });
    }

    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};