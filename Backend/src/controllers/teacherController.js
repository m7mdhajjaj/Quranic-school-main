

const Teacher = require("../models/Teacher");
const bcrypt = require("bcryptjs");

// Calculate age from birth date
const calculateAge = (birthDate) => {
  if (!birthDate) return 0;

  const today = new Date();
  const birthDateObj = new Date(birthDate);

  if (isNaN(birthDateObj.getTime())) return 0;

  let age = today.getFullYear() - birthDateObj.getFullYear();
  const monthDiff = today.getMonth() - birthDateObj.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDateObj.getDate())
  ) {
    age--;
  }

  return age;
};

// Generate next teacher ID
const generateTeacherId = async () => {
  try {
    const lastTeacher = await Teacher.findOne()
      .sort({ teacherId: -1 })
      .select("teacherId");

    if (!lastTeacher) {
      return 200001; // Start teacher IDs from 200001
    }

    return lastTeacher.teacherId + 1;
  } catch (error) {
    console.error("Error generating teacher ID:", error);
    return 200001;
  }
};

// Get all teachers
exports.getAllTeachers = async (req, res) => {
  try {
    // return full teacher docs (minus password) so UI has everything (including avatar)
    const teachers = await Teacher.find({}).select("-password");
    
    return res.status(200).json({ success: true, data: teachers });
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return res.status(500).json({ success: false, message: "حدث خطأ أثناء جلب المعلمين" });
  }
};

// Get single teacher by ID
exports.getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id).select("-password");
    if (!teacher) {
      return res.status(404).json({ success: false, message: "المعلم غير موجود" });
    }
    return res.status(200).json({ success: true, data: teacher });
  } catch (error) {
    console.error("Error fetching teacher:", error);
    return res.status(500).json({ success: false, message: "حدث خطأ أثناء جلب المعلم" });
  }
};

// Create new teacher
exports.createTeacher = async (req, res) => {
  try {
    const {
      firstName, lastName, email, phoneNumber,
      fatherName, grandFatherName, motherName,
      idNumber, birthDate, gender, residence,
      groupName, yearsOfExperience = 0, role = "teacher",
      password,
    } = req.body;

    // basic validation (keep minimal and practical)
    const must = ["firstName", "lastName", "email", "phoneNumber"];
    for (const f of must) {
      if (!req.body[f]) {
        return res.status(400).json({ success: false, message: `حقل ${f} مطلوب` });
      }
    }

    // duplicates
    if (await Teacher.findOne({ email })) {
      return res.status(400).json({ success: false, message: "البريد الإلكتروني مستخدم بالفعل" });
    }
    if (await Teacher.findOne({ phoneNumber })) {
      return res.status(400).json({ success: false, message: "رقم الهاتف مستخدم بالفعل" });
    }

    // teacherId + password
    const teacherId = await generateTeacherId();
    const rawPass = password || String(teacherId);
    const hashed = await bcrypt.hash(rawPass, 10);

    // age
    const age = calculateAge(birthDate);
    if (birthDate && age < 18) {
      return res.status(400).json({ success: false, message: "يجب أن يكون عمر المعلم 18 عام على الأقل" });
    }

    const doc = await Teacher.create({
      teacherId,
      password: hashed,
      firstName,
      lastName,
      fatherName,
      grandFatherName,
      motherName,
      idNumber,
      birthDate,
      age,
      gender,
      residence,
      email,
      phoneNumber,
      groupName,
      groups: groupName ? [groupName] : [],
      yearsOfExperience,
      role,
    });

    console.log("Teacher created successfully:", doc._id);
    
    // Emit socket event for real-time update
    if (global.io) {
      global.io.emit('teacherCreated', doc);
      console.log('📡 Teacher created event emitted via socket');
    }
    
    return res.status(201).json({ success: true, message: "تم إنشاء المعلم بنجاح", data: doc });
  } catch (error) {
    console.error("Error creating teacher:", error);

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
    return res.status(500).json({
      success: false,
      message: "حدث خطأ غير متوقع أثناء حفظ بيانات المعلم",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// Update teacher
exports.updateTeacher = async (req, res) => {
  try {
    const id = req.params.id;
    const updates = { ...req.body };

    // Remove password field from updates if it's empty or undefined
    if (!updates.password) {
      delete updates.password;
    } else {
      // Hash password if provided
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    // Handle age calculation
    if (updates.birthDate) {
      updates.age = calculateAge(updates.birthDate);
    }

    // Handle groups array
    if (updates.groupName) {
      updates.groups = [updates.groupName];
    }

    const updated = await Teacher.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: false } // Skip validation for updates
    ).select("-password");

    if (!updated) {
      return res.status(404).json({ success: false, message: "المعلم غير موجود" });
    }

    // Emit socket event for real-time update
    if (global.io) {
      global.io.emit('teacherUpdated', updated);
      console.log('📡 Teacher updated event emitted via socket');
    }

    return res.status(200).json({ 
      success: true, 
      message: "تم تحديث بيانات المعلم بنجاح", 
      data: updated 
    });
  } catch (error) {
    console.error("Error updating teacher:", error);
    
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
    return res.status(500).json({ 
      success: false, 
      message: "حدث خطأ غير متوقع أثناء تحديث بيانات المعلم",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Delete teacher (soft delete)
exports.deleteTeacher = async (req, res) => {
  try {
    const id = req.params.id;
    const teacher = await Teacher.findById(id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: "المعلم غير موجود" });
    }

    // التحقق من وجود حلقات مرتبطة بالمعلم
    const Group = require('../models/Group');
    const Student = require('../models/Student');
    
    const teacherName = `${teacher.firstName} ${teacher.lastName}`;
    
    // فحص الحلقات المرتبطة
    const relatedGroups = await Group.find({ 
      $or: [
        { teacher: teacherName },
        { teacherName: teacherName },
        { teacher: teacher._id }
      ],
      isActive: { $ne: false }
    });
    
    // فحص الطلاب المرتبطين
    const relatedStudents = await Student.find({ 
      teacher: teacherName,
      isActive: { $ne: false }
    });
    
    if (relatedGroups.length > 0 || relatedStudents.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `لا يمكن حذف المعلم. يوجد ${relatedGroups.length} حلقة و ${relatedStudents.length} طالب مرتبطين بالمعلم. يجب نقلهم أولاً.`,
        details: {
          groupsCount: relatedGroups.length,
          studentsCount: relatedStudents.length,
          groups: relatedGroups.map(g => g.name),
          students: relatedStudents.map(s => `${s.firstName} ${s.lastName}`)
        }
      });
    }

    // soft delete (requires isActive in schema)
    await Teacher.findByIdAndUpdate(id, { isActive: false, updatedAt: new Date() });
    
    // Emit socket event for real-time update
    if (global.io) {
      global.io.emit('teacherDeleted', { _id: id });
      console.log('📡 Teacher deleted event emitted via socket');
    }
    
    return res.status(200).json({ success: true, message: "تم حذف المعلم بنجاح" });
  } catch (error) {
    console.error("Error deleting teacher:", error);
    return res.status(500).json({ success: false, message: "حدث خطأ أثناء حذف المعلم" });
  }
};

// Get teacher statistics
exports.getTeacherStats = async (req, res) => {
  try {
    // requires isActive in schema; if not present, remove filters
    const totalTeachers = await Teacher.countDocuments({ isActive: true });
    const totalAdmins = await Teacher.countDocuments({ role: "admin", isActive: true });
    const totalActiveTeachers = await Teacher.countDocuments({ role: "teacher", isActive: true });

    const teachers = await Teacher.find({ isActive: true }).select("-password -avatar");

    const exp = (x) => Number.isFinite(x) ? x : 0;
    const experienceDistribution = {
      "مبتدئ (0-2 سنة)": teachers.filter(t => exp(t.yearsOfExperience) <= 2).length,
      "متوسط (3-5 سنوات)": teachers.filter(t => exp(t.yearsOfExperience) >= 3 && exp(t.yearsOfExperience) <= 5).length,
      "خبير (6-10 سنوات)": teachers.filter(t => exp(t.yearsOfExperience) >= 6 && exp(t.yearsOfExperience) <= 10).length,
      "خبير جداً (+10 سنوات)": teachers.filter(t => exp(t.yearsOfExperience) > 10).length,
    };

    return res.status(200).json({
      success: true,
      data: {
        totalTeachers,
        totalAdmins,
        totalActiveTeachers,
        experienceDistribution,
        teachers: teachers.map(t => ({
          _id: t._id,
          teacherId: t.teacherId,
          fullName: `${t.firstName || ""} ${t.fatherName || ""} ${t.lastName || ""}`.replace(/\s+/g, " ").trim(),
          groupName: t.groupName,
          yearsOfExperience: exp(t.yearsOfExperience),
          role: t.role,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching teacher stats:", error);
    return res.status(500).json({ success: false, message: "حدث خطأ أثناء جلب إحصائيات المعلمين" });
  }
};