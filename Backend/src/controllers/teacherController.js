// const Teacher = require("../models/Teacher");
// const bcrypt = require("bcryptjs");

// // Calculate age from birth date
// const calculateAge = (birthDate) => {
//   if (!birthDate) return 0;

//   const today = new Date();
//   const birthDateObj = new Date(birthDate);

//   if (isNaN(birthDateObj.getTime())) return 0;

//   let age = today.getFullYear() - birthDateObj.getFullYear();
//   const monthDiff = today.getMonth() - birthDateObj.getMonth();

//   if (
//     monthDiff < 0 ||
//     (monthDiff === 0 && today.getDate() < birthDateObj.getDate())
//   ) {
//     age--;
//   }

//   return age;
// };

// // Generate next teacher ID
// const generateTeacherId = async () => {
//   try {
//     const lastTeacher = await Teacher.findOne()
//       .sort({ teacherId: -1 })
//       .select("teacherId");

//     if (!lastTeacher) {
//       return 200001; // Start teacher IDs from 200001
//     }

//     return lastTeacher.teacherId + 1;
//   } catch (error) {
//     console.error("Error generating teacher ID:", error);
//     return 200001;
//   }
// };

// // Get all teachers
// exports.getAllTeachers = async (req, res) => {
//   try {
//     const teachers = await Teacher.find({ isActive: true }).select("-password");

//     res.status(200).json({
//       success: true,
//       data: teachers,
//     });
//   } catch (error) {
//     console.error("Error fetching teachers:", error);
//     res.status(500).json({
//       success: false,
//       message: "حدث خطأ أثناء جلب المعلمين",
//     });
//   }
// };

// // Get single teacher by ID
// exports.getTeacherById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const teacher = await Teacher.findById(id).select("-password");

//     if (!teacher) {
//       return res.status(404).json({
//         success: false,
//         message: "المعلم غير موجود",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: teacher,
//     });
//   } catch (error) {
//     console.error("Error fetching teacher:", error);
//     res.status(500).json({
//       success: false,
//       message: "حدث خطأ أثناء جلب المعلم",
//     });
//   }
// };

// // Create new teacher
// exports.createTeacher = async (req, res) => {
//   try {
//     console.log("Creating teacher with data:", req.body);

//     const {
//       firstName,
//       fatherName,
//       grandFatherName,
//       lastName,
//       birthDate,
//       gender,
//       residence,
//       email,
//       phoneNumber,
//       groupName,
//       yearsOfExperience,
//       password,
//       role = "teacher",
//     } = req.body;

//     // Validate required fields
//     const requiredFields = [
//       "firstName",
//       "fatherName",
//       "grandFatherName",
//       "lastName",
//       "birthDate",
//       "gender",
//       "residence",
//       "email",
//       "phoneNumber",
//       "yearsOfExperience",
//     ];

//     for (const field of requiredFields) {
//       if (!req.body[field]) {
//         return res.status(400).json({
//           success: false,
//           message: `حقل ${field} مطلوب`,
//         });
//       }
//     }

//     // Use provided password or generate default one (teacher ID)
//     let passwordToUse = password;
//     if (!passwordToUse) {
//       const tempTeacherId = await generateTeacherId();
//       passwordToUse = tempTeacherId.toString();
//     }

//     // Calculate age
//     const age = calculateAge(birthDate);
//     if (age < 18) {
//       return res.status(400).json({
//         success: false,
//         message: "يجب أن يكون عمر المعلم 18 عام على الأقل",
//       });
//     }


//     // Check if teacher with same email already exists
//     const existingTeacher = await Teacher.findOne({ email });
//     if (existingTeacher) {
//       return res.status(400).json({
//         success: false,
//         message: "البريد الإلكتروني مستخدم بالفعل",
//       });
//     }

//     // Check if teacher with same phone number already exists
//     const existingPhone = await Teacher.findOne({ phoneNumber });
//     if (existingPhone) {
//       return res.status(400).json({
//         success: false,
//         message: "رقم الهاتف مستخدم بالفعل",
//       });
//     }

//     // Generate teacher ID
//     const teacherId = await generateTeacherId();

//     // Hash password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(passwordToUse, salt);

//     // Create new teacher
//     const teacherData = {
//       teacherId,
//       firstName,
//       fatherName,
//       grandFatherName,
//       lastName,
//       birthDate,
//       age,
//       gender,
//       residence,
//       email,
//       phoneNumber,
//       yearsOfExperience,
//       password: hashedPassword,
//       role,
//     };

//     // Add groupName and groups only if provided
//     if (groupName) {
//       teacherData.groupName = groupName;
//       teacherData.groups = [groupName];
//     }

//     const teacher = await Teacher.create(teacherData);

//     // Remove password from response
//     const teacherResponse = teacher.toObject();
//     delete teacherResponse.password;

//     res.status(201).json({
//       success: true,
//       message: "تم إنشاء حساب المعلم بنجاح",
//       data: teacherResponse,
//     });
//   } catch (error) {
//     console.error("Error creating teacher:", error);
//     console.error("Error details:", {
//       message: error.message,
//       stack: error.stack,
//       name: error.name,
//     });

//     if (error.name === "ValidationError") {
//       const errors = Object.values(error.errors).map((err) => err.message);
//       console.error("Validation errors:", errors);
//       return res.status(400).json({
//         success: false,
//         message: errors.join(", "),
//       });
//     }

//     if (error.code === 11000) {
//       console.error("Duplicate key error:", error.keyPattern);
//       return res.status(400).json({
//         success: false,
//         message: "هذا البريد الإلكتروني أو رقم المعلم مستخدم بالفعل",
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: "حدث خطأ أثناء إنشاء حساب المعلم",
//       error: error.message,
//     });
//   }
// };

// // Update teacher
// exports.updateTeacher = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updates = { ...req.body };

//     // Check if teacher exists
//     const teacher = await Teacher.findById(id);
//     if (!teacher) {
//       return res.status(404).json({
//         success: false,
//         message: "المعلم غير موجود",
//       });
//     }


//     // If email is being updated, check for duplicates
//     if (updates.email && updates.email !== teacher.email) {
//       const existingTeacher = await Teacher.findOne({ email: updates.email });
//       if (existingTeacher) {
//         return res.status(400).json({
//           success: false,
//           message: "البريد الإلكتروني مستخدم بالفعل",
//         });
//       }
//     }

//     // If phoneNumber is being updated, check for duplicates
//     if (updates.phoneNumber && updates.phoneNumber !== teacher.phoneNumber) {
//       const existingPhone = await Teacher.findOne({ phoneNumber: updates.phoneNumber });
//       if (existingPhone) {
//         return res.status(400).json({
//           success: false,
//           message: "رقم الهاتف مستخدم بالفعل",
//         });
//       }
//     }

//     // If birthDate is being updated, recalculate age
//     if (updates.birthDate) {
//       updates.age = calculateAge(updates.birthDate);
//       if (updates.age < 18) {
//         return res.status(400).json({
//           success: false,
//           message: "يجب أن يكون عمر المعلم 18 عام على الأقل",
//         });
//       }
//     }

//     // If password is being updated, hash it
//     if (updates.password) {
//       const salt = await bcrypt.genSalt(10);
//       updates.password = await bcrypt.hash(updates.password, salt);
//     }

//     // Handle groupName and groups update
//     if (updates.hasOwnProperty("groupName")) {
//       if (updates.groupName) {
//         updates.groups = [updates.groupName];
//       } else {
//         updates.groups = [];
//       }
//     }

//     // Update teacher
//     const updatedTeacher = await Teacher.findByIdAndUpdate(
//       id,
//       { ...updates, updatedAt: new Date() },
//       { new: true, runValidators: true },
//     ).select("-password");

//     res.status(200).json({
//       success: true,
//       message: "تم تحديث بيانات المعلم بنجاح",
//       data: updatedTeacher,
//     });
//   } catch (error) {
//     console.error("Error updating teacher:", error);

//     if (error.name === "ValidationError") {
//       const errors = Object.values(error.errors).map((err) => err.message);
//       return res.status(400).json({
//         success: false,
//         message: errors.join(", "),
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: "حدث خطأ أثناء تحديث بيانات المعلم",
//     });
//   }
// };

// // Delete teacher (soft delete)
// exports.deleteTeacher = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Check if teacher exists
//     const teacher = await Teacher.findById(id);
//     if (!teacher) {
//       return res.status(404).json({
//         success: false,
//         message: "المعلم غير موجود",
//       });
//     }

//     // Soft delete by setting isActive to false
//     await Teacher.findByIdAndUpdate(id, { isActive: false });

//     res.status(200).json({
//       success: true,
//       message: "تم حذف المعلم بنجاح",
//     });
//   } catch (error) {
//     console.error("Error deleting teacher:", error);
//     res.status(500).json({
//       success: false,
//       message: "حدث خطأ أثناء حذف المعلم",
//     });
//   }
// };

// // Get teacher statistics
// exports.getTeacherStats = async (req, res) => {
//   try {
//     const totalTeachers = await Teacher.countDocuments({ isActive: true });
//     const totalAdmins = await Teacher.countDocuments({
//       role: "admin",
//       isActive: true,
//     });
//     const totalActiveTeachers = await Teacher.countDocuments({
//       role: "teacher",
//       isActive: true,
//     });

//     // Get teachers with their groups
//     const teachers = await Teacher.find({ isActive: true }).select("-password");

//     // Group teachers by experience level
//     const experienceGroups = {
//       "مبتدئ (0-2 سنة)": teachers.filter((t) => t.yearsOfExperience <= 2)
//         .length,
//       "متوسط (3-5 سنوات)": teachers.filter(
//         (t) => t.yearsOfExperience >= 3 && t.yearsOfExperience <= 5,
//       ).length,
//       "خبير (6-10 سنوات)": teachers.filter(
//         (t) => t.yearsOfExperience >= 6 && t.yearsOfExperience <= 10,
//       ).length,
//       "خبير جداً (+10 سنوات)": teachers.filter((t) => t.yearsOfExperience > 10)
//         .length,
//     };

//     res.status(200).json({
//       success: true,
//       data: {
//         totalTeachers,
//         totalAdmins,
//         totalActiveTeachers,
//         experienceDistribution: experienceGroups,
//         teachers: teachers.map((teacher) => ({
//           _id: teacher._id,
//           teacherId: teacher.teacherId,
//           fullName: `${teacher.firstName} ${teacher.fatherName} ${teacher.lastName}`,
//           groupName: teacher.groupName,
//           yearsOfExperience: teacher.yearsOfExperience,
//           role: teacher.role,
//         })),
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching teacher stats:", error);
//     res.status(500).json({
//       success: false,
//       message: "حدث خطأ أثناء جلب إحصائيات المعلمين",
//     });
//   }
// };


// controllers/teacherController.js
const Teacher = require("../models/Teacher");
const bcrypt = require("bcryptjs");

// حساب العمر
const calculateAge = (birthDate) => {
  if (!birthDate) return 0;
  const today = new Date();
  const d = new Date(birthDate);
  if (isNaN(d.getTime())) return 0;
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age;
};

// رقم المعلّم التالي
const generateTeacherId = async () => {
  const last = await Teacher.findOne().sort({ teacherId: -1 }).select("teacherId");
  return last ? last.teacherId + 1 : 200001;
};

// -------- CRUD --------
exports.getAllTeachers = async (_req, res) => {
  try {
    const teachers = await Teacher.find({ isActive: true }).select("-password");
    res.status(200).json({ success: true, data: teachers });
  } catch (e) {
    res.status(500).json({ success: false, message: "حدث خطأ أثناء جلب المعلمين" });
  }
};

exports.getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id).select("-password");
    if (!teacher) return res.status(404).json({ success: false, message: "المعلم غير موجود" });
    res.status(200).json({ success: true, data: teacher });
  } catch (e) {
    res.status(500).json({ success: false, message: "حدث خطأ أثناء جلب المعلم" });
  }
};

exports.createTeacher = async (req, res) => {
  try {
    const {
      firstName, fatherName, grandFatherName, lastName,
      birthDate, gender, residence, email, phoneNumber,
      groupName, yearsOfExperience = 0, password, role = "teacher",
      idNumber, motherName
    } = req.body;

    // تحقق أساسي
    const must = ["firstName", "lastName", "email", "phoneNumber"];
    for (const f of must) if (!req.body[f]) return res.status(400).json({ success:false, message:`حقل ${f} مطلوب` });

    // كلمة السر: إن لم تأتِ → teacherId
    const teacherId = await generateTeacherId();
    const rawPass = password || String(teacherId);
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(rawPass, salt);

    // فريد
    if (await Teacher.findOne({ email }))       return res.status(400).json({ success:false, message:"البريد الإلكتروني مستخدم بالفعل" });
    if (await Teacher.findOne({ phoneNumber })) return res.status(400).json({ success:false, message:"رقم الهاتف مستخدم بالفعل" });

    const age = calculateAge(birthDate);
    if (birthDate && age < 18) return res.status(400).json({ success:false, message:"يجب أن يكون عمر المعلم 18 عام على الأقل" });

    const doc = await Teacher.create({
      teacherId,
      password: hashed,
      firstName, fatherName, grandFatherName, lastName,
      birthDate, age, gender, residence, email, phoneNumber,
      yearsOfExperience, role, idNumber, motherName,
      groupName,
      groups: groupName ? [groupName] : [],  // موحّد مع السكيمة
    });

    const out = doc.toObject();
    delete out.password;
    res.status(201).json({ success: true, message: "تم إنشاء حساب المعلم بنجاح", data: out });
  } catch (e) {
    if (e.code === 11000) return res.status(400).json({ success:false, message:"بريد أو رقم هاتف/معلّم مكرر" });
    res.status(500).json({ success:false, message:"حدث خطأ أثناء إنشاء حساب المعلم" });
  }
};

exports.updateTeacher = async (req, res) => {
  try {
    const id = req.params.id;
    const updates = { ...req.body };

    const teacher = await Teacher.findById(id).select("+password");
    if (!teacher) return res.status(404).json({ success:false, message:"المعلم غير موجود" });

    if (updates.email && updates.email !== teacher.email) {
      if (await Teacher.findOne({ email: updates.email })) {
        return res.status(400).json({ success:false, message:"البريد الإلكتروني مستخدم بالفعل" });
      }
    }
    if (updates.phoneNumber && updates.phoneNumber !== teacher.phoneNumber) {
      if (await Teacher.findOne({ phoneNumber: updates.phoneNumber })) {
        return res.status(400).json({ success:false, message:"رقم الهاتف مستخدم بالفعل" });
      }
    }

    if (updates.birthDate) {
      updates.age = calculateAge(updates.birthDate);
      if (updates.age < 18) return res.status(400).json({ success:false, message:"يجب أن يكون عمر المعلم 18 عام على الأقل" });
    }

    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    if (Object.prototype.hasOwnProperty.call(updates, "groupName")) {
      updates.groups = updates.groupName ? [updates.groupName] : [];
    }

    const updated = await Teacher.findByIdAndUpdate(
      id, { ...updates, updatedAt: new Date() }, { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({ success:true, message:"تم تحديث بيانات المعلم بنجاح", data: updated });
  } catch (e) {
    res.status(500).json({ success:false, message:"حدث خطأ أثناء تحديث بيانات المعلم" });
  }
};

exports.deleteTeacher = async (req, res) => {
  try {
    const id = req.params.id;
    const t = await Teacher.findById(id);
    if (!t) return res.status(404).json({ success:false, message:"المعلم غير موجود" });
    await Teacher.findByIdAndUpdate(id, { isActive: false });
    res.status(200).json({ success:true, message:"تم حذف المعلم بنجاح" });
  } catch (e) {
    res.status(500).json({ success:false, message:"حدث خطأ أثناء حذف المعلم" });
  }
};

exports.getTeacherStats = async (_req, res) => {
  try {
    const totalTeachers = await Teacher.countDocuments({ isActive: true });
    const totalAdmins   = await Teacher.countDocuments({ role: "admin", isActive: true });
    const totalActiveTeachers = await Teacher.countDocuments({ role: "teacher", isActive: true });

    const teachers = await Teacher.find({ isActive: true }).select("-password -avatar");
    const experienceGroups = {
      "مبتدئ (0-2 سنة)": teachers.filter(t => (t.yearsOfExperience || 0) <= 2).length,
      "متوسط (3-5 سنوات)": teachers.filter(t => (t.yearsOfExperience || 0) >= 3 && (t.yearsOfExperience || 0) <= 5).length,
      "خبير (6-10 سنوات)": teachers.filter(t => (t.yearsOfExperience || 0) >= 6 && (t.yearsOfExperience || 0) <= 10).length,
      "خبير جداً (+10 سنوات)": teachers.filter(t => (t.yearsOfExperience || 0) > 10).length,
    };

    res.status(200).json({
      success: true,
      data: {
        totalTeachers,
        totalAdmins,
        totalActiveTeachers,
        experienceDistribution: experienceGroups,
        teachers: teachers.map(t => ({
          _id: t._id,
          teacherId: t.teacherId,
          fullName: `${t.firstName || ""} ${t.fatherName || ""} ${t.lastName || ""}`.trim(),
          groupName: t.groupName,
          yearsOfExperience: t.yearsOfExperience || 0,
          role: t.role,
        })),
      },
    });
  } catch (e) {
    res.status(500).json({ success:false, message:"حدث خطأ أثناء جلب إحصائيات المعلمين" });
  }
};
