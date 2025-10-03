// // controllers/teacherController.js
// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");
// const Teacher = require("../models/Teacher");

// // -------------------------
// // Helpers
// // -------------------------

// const normalizeEmail = (email) =>
//   typeof email === "string" ? email.trim().toLowerCase() : email;

// const normalizePhone = (phone) =>
//   typeof phone === "string" ? phone.replace(/\s+/g, "").trim() : phone;

// /** UTC-safe age calculation */
// const calculateAge = (birthDate) => {
//   if (!birthDate) return 0;
//   const d = new Date(birthDate);
//   if (Number.isNaN(d.getTime())) return 0;

//   const today = new Date();
//   let age = today.getUTCFullYear() - d.getUTCFullYear();
//   const m = today.getUTCMonth() - d.getUTCMonth();
//   if (m < 0 || (m === 0 && today.getUTCDate() < d.getUTCDate())) age--;
//   return age;
// };

// /** OPTIONAL: atomic counter using a "counters" collection.
//  *  Seed once: { _id: "teacherId", seq: 200000 }
//  */
// async function nextSeqAtomic(name, session = null) {
//   const counters = mongoose.connection.collection("counters");
//   const r = await counters.findOneAndUpdate(
//     { _id: name },
//     { $inc: { seq: 1 } },
//     { upsert: true, returnDocument: "after", session }
//   );
//   return r.value.seq;
// }

// /** Fallback non-atomic generator (use only if you don't set counters) */
// async function generateTeacherIdNonAtomic() {
//   const last = await Teacher.findOne().sort({ teacherId: -1 }).select("teacherId").lean();
//   return last ? last.teacherId + 1 : 200001;
// }

// /** Choose your ID strategy: atomic (recommended) or fallback */
// async function generateTeacherId() {
//   try {
//     return await nextSeqAtomic("teacherId"); // comment this line out if you don't use counters
//   } catch {
//     // fallback if counters not configured
//     return await generateTeacherIdNonAtomic();
//   }
// }

// /** Build list filter */
// function buildListFilter(qs) {
//   const { q, role, groupName, includeInactive } = qs || {};
//   const filter = {};
//   if (!includeInactive || includeInactive === "false") filter.isActive = true;
//   if (role) filter.role = role;
//   if (groupName) filter.groupName = groupName;

//   if (q && typeof q === "string" && q.trim()) {
//     const rx = new RegExp(q.trim(), "i");
//     const maybeId = Number(q);
//     filter.$or = [
//       { firstName: rx },
//       { fatherName: rx },
//       { grandFatherName: rx },
//       { lastName: rx },
//       { email: rx },
//       { phoneNumber: rx },
//       ...(Number.isFinite(maybeId) ? [{ teacherId: maybeId }] : []),
//     ];
//   }
//   return filter;
// }

// /** Whitelist updates to prevent mass-assignment */
// const ALLOWED_UPDATE = new Set([
//   "firstName",
//   "fatherName",
//   "grandFatherName",
//   "motherName",
//   "lastName",
//   "birthDate",
//   "gender",
//   "residence",
//   "email",
//   "phoneNumber",
//   "groupName",
//   "yearsOfExperience",
//   "role",       // ensure your auth layer restricts who can change role
//   "isActive",   // ensure your auth layer restricts this too
//   "password",
//   // avatar path/URL can be allowed if you manage uploads separately:
//   "avatar",
// ]);

// function pickAllowed(updates) {
//   const out = {};
//   for (const k of Object.keys(updates || {})) {
//     if (ALLOWED_UPDATE.has(k)) out[k] = updates[k];
//   }
//   return out;
// }

// // -------------------------
// // Controllers
// // -------------------------

// /** GET /teachers */
// exports.getAllTeachers = async (req, res) => {
//   try {
//     const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
//     const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
//     const sort = req.query.sort || "-createdAt"; // e.g. ?sort=firstName or ?sort=-yearsOfExperience

//     const filter = buildListFilter(req.query);

//     const [items, total] = await Promise.all([
//       Teacher.find(filter)
//         .sort(sort)
//         .skip((page - 1) * limit)
//         .limit(limit)
//         .select("-password -__v")
//         .lean(),
//       Teacher.countDocuments(filter),
//     ]);

//     return res.status(200).json({
//       success: true,
//       data: items,
//       pagination: { page, limit, total, pages: Math.ceil(total / limit) },
//     });
//   } catch (error) {
//     console.error("Error fetching teachers:", error);
//     return res.status(500).json({ success: false, message: "حدث خطأ أثناء جلب المعلمين" });
//   }
// };

// /** GET /teachers/:id (accepts ObjectId or numeric teacherId) */
// exports.getTeacherById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const query = mongoose.isValidObjectId(id)
//       ? { _id: id }
//       : Number.isFinite(Number(id))
//       ? { teacherId: Number(id) }
//       : { _id: id };

//     const teacher = await Teacher.findOne(query).select("-password -__v").lean();
//     if (!teacher) {
//       return res.status(404).json({ success: false, message: "المعلم غير موجود" });
//     }
//     return res.status(200).json({ success: true, data: teacher });
//   } catch (error) {
//     console.error("Error fetching teacher:", error);
//     return res.status(500).json({ success: false, message: "حدث خطأ أثناء جلب المعلم" });
//   }
// };

// /** POST /teachers */
// exports.createTeacher = async (req, res) => {
//   const session = await mongoose.startSession();
//   try {
//     // Minimal & practical required fields — adjust as needed
//     const {
//       firstName,
//       lastName,
//       email: rawEmail,
//       phoneNumber: rawPhone,
//       fatherName,
//       grandFatherName,
//       motherName,
//       idNumber,
//       birthDate,
//       gender,
//       residence,
//       groupName,
//       yearsOfExperience = 0,
//       role = "teacher",
//       password,
//       avatar,
//     } = req.body || {};

//     const must = ["firstName", "lastName", "email", "phoneNumber"];
//     for (const f of must) {
//       if (!req.body?.[f]) {
//         return res.status(422).json({ success: false, message: `حقل ${f} مطلوب` });
//       }
//     }

//     const email = normalizeEmail(rawEmail);
//     const phoneNumber = normalizePhone(rawPhone);

//     // Basic pattern checks (adapt to your locale rules)
//     // Example: Palestinian mobile 10 digits starting with 0 → /^0\d{9}$/ or Jawwal/Wataniya /^05\d{8}$/
//     const phoneRx = /^0\d{9}$/;
//     if (!phoneRx.test(phoneNumber)) {
//       return res.status(422).json({ success: false, message: "صيغة رقم الهاتف غير صحيحة (يجب أن يبدأ بـ 0 ويتكون من 10 أرقام)" });
//     }

//     // Age gate
//     const age = calculateAge(birthDate);
//     if (birthDate && age < 18) {
//       return res.status(422).json({ success: false, message: "يجب أن يكون عمر المعلم 18 عام على الأقل" });
//     }

//     // Duplicate checks (app-level; DB must also have unique indexes)
//     if (await Teacher.exists({ email })) {
//       return res.status(409).json({ success: false, message: "البريد الإلكتروني مستخدم بالفعل" });
//     }
//     if (await Teacher.exists({ phoneNumber })) {
//       return res.status(409).json({ success: false, message: "رقم الهاتف مستخدم بالفعل" });
//     }

//     // Transaction for atomic ID + create (best with counters)
//     session.startTransaction();

//     const teacherId = await generateTeacherId(); // atomic if counters configured
//     const rawPass = password || String(teacherId);
//     const hashed = await bcrypt.hash(rawPass, 10);

//     const doc = await Teacher.create(
//       [
//         {
//           teacherId,
//           password: hashed,
//           mustChangePassword: !password, // prompt change if default issued
//           firstName: firstName?.trim(),
//           lastName: lastName?.trim(),
//           fatherName: fatherName?.trim(),
//           grandFatherName: grandFatherName?.trim(),
//           motherName: motherName?.trim(),
//           idNumber: idNumber?.trim(),
//           birthDate,
//           age,
//           gender,
//           residence: residence?.trim(),
//           email,
//           phoneNumber,
//           groupName,
//           groups: groupName ? [groupName] : [],
//           yearsOfExperience,
//           role,
//           avatar,
//           isActive: true, // default; schema may also set this
//         },
//       ],
//       { session }
//     );

//     await session.commitTransaction();

//     const out = doc[0].toObject();
//     delete out.password;
//     delete out.__v;

//     return res.status(201).json({
//       success: true,
//       message: "تم إنشاء حساب المعلم بنجاح",
//       data: out,
//       meta: { defaultPasswordIssued: !password },
//     });
//   } catch (error) {
//     await session.abortTransaction().catch(() => {});
//     console.error("Error creating teacher:", error);

//     if (error?.code === 11000) {
//       return res.status(409).json({ success: false, message: "البيانات فريدة (البريد/الهاتف/teacherId) مكررة" });
//     }
//     return res.status(500).json({ success: false, message: "حدث خطأ أثناء إنشاء حساب المعلم" });
//   } finally {
//     session.endSession();
//   }
// };

// /** PATCH /teachers/:id */
// exports.updateTeacher = async (req, res) => {
//   try {
//     const id = req.params.id;

//     const existing = await Teacher.findById(id).select("+password");
//     if (!existing) {
//       return res.status(404).json({ success: false, message: "المعلم غير موجود" });
//     }

//     const updates = pickAllowed({ ...req.body });

//     // Normalize inputs
//     if (updates.email) updates.email = normalizeEmail(updates.email);
//     if (updates.phoneNumber) updates.phoneNumber = normalizePhone(updates.phoneNumber);

//     // Duplicate checks if changing
//     if (updates.email && updates.email !== existing.email) {
//       if (await Teacher.exists({ email: updates.email })) {
//         return res.status(409).json({ success: false, message: "البريد الإلكتروني مستخدم بالفعل" });
//       }
//     }
//     if (updates.phoneNumber && updates.phoneNumber !== existing.phoneNumber) {
//       if (await Teacher.exists({ phoneNumber: updates.phoneNumber })) {
//         return res.status(409).json({ success: false, message: "رقم الهاتف مستخدم بالفعل" });
//       }
//     }

//     // Age recalculation
//     if (updates.birthDate) {
//       updates.age = calculateAge(updates.birthDate);
//       if (updates.age < 18) {
//         return res.status(422).json({ success: false, message: "يجب أن يكون عمر المعلم 18 عام على الأقل" });
//       }
//     }

//     // Password hashing
//     if (updates.password) {
//       updates.password = await bcrypt.hash(updates.password, 10);
//       updates.mustChangePassword = false; // user explicitly set a new password
//     }

//     // Sync groups with groupName if provided
//     if (Object.prototype.hasOwnProperty.call(updates, "groupName")) {
//       updates.groups = updates.groupName ? [updates.groupName] : [];
//     }

//     const updated = await Teacher.findByIdAndUpdate(
//       id,
//       { ...updates, updatedAt: new Date() },
//       { new: true, runValidators: true }
//     )
//       .select("-password -__v")
//       .lean();

//     return res.status(200).json({ success: true, message: "تم تحديث بيانات المعلم بنجاح", data: updated });
//   } catch (error) {
//     console.error("Error updating teacher:", error);
//     if (error?.code === 11000) {
//       return res.status(409).json({ success: false, message: "البيانات فريدة (البريد/الهاتف) مكررة" });
//     }
//     return res.status(500).json({ success: false, message: "حدث خطأ أثناء تحديث بيانات المعلم" });
//   }
// };

// /** DELETE /teachers/:id (soft delete) */
// exports.deleteTeacher = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const t = await Teacher.findById(id).lean();
//     if (!t) {
//       return res.status(404).json({ success: false, message: "المعلم غير موجود" });
//     }

//     await Teacher.findByIdAndUpdate(id, { isActive: false, updatedAt: new Date() });
//     return res.status(200).json({ success: true, message: "تم حذف المعلم بنجاح" });
//   } catch (error) {
//     console.error("Error deleting teacher:", error);
//     return res.status(500).json({ success: false, message: "حدث خطأ أثناء حذف المعلم" });
//   }
// };

// /** GET /teachers/stats */
// exports.getTeacherStats = async (req, res) => {
//   try {
//     const match = { isActive: true }; // adjust if you want to include inactive
//     const [counters, buckets] = await Promise.all([
//       Teacher.aggregate([
//         { $match: match },
//         {
//           $group: {
//             _id: null,
//             totalTeachers: { $sum: 1 },
//             totalAdmins: {
//               $sum: { $cond: [{ $eq: ["$role", "admin"] }, 1, 0] },
//             },
//             totalActiveTeachers: {
//               $sum: { $cond: [{ $eq: ["$role", "teacher"] }, 1, 0] },
//             },
//           },
//         },
//       ]),
//       Teacher.aggregate([
//         { $match: match },
//         {
//           $bucket: {
//             groupBy: { $ifNull: ["$yearsOfExperience", 0] },
//             boundaries: [0, 3, 6, 11, 1000], // 0-2, 3-5, 6-10, 11+
//             default: 0,
//             output: { count: { $sum: 1 } },
//           },
//         },
//       ]),
//     ]);

//     const counts = counters[0] || {
//       totalTeachers: 0,
//       totalAdmins: 0,
//       totalActiveTeachers: 0,
//     };

//     const mapBuckets = {
//       "0": "مبتدئ (0-2 سنة)",
//       "3": "متوسط (3-5 سنوات)",
//       "6": "خبير (6-10 سنوات)",
//       "11": "خبير جداً (+10 سنوات)",
//     };
//     const experienceDistribution = Object.fromEntries(
//       Object.values(mapBuckets).map((k) => [k, 0])
//     );
//     for (const b of buckets) {
//       const label = mapBuckets[String(b._id)] ?? mapBuckets["0"];
//       experienceDistribution[label] = b.count;
//     }

//     // Optional: list a lightweight roster for UI use
//     const teachers = await Teacher.find(match)
//       .select("_id teacherId firstName fatherName lastName groupName yearsOfExperience role")
//       .lean();

//     return res.status(200).json({
//       success: true,
//       data: {
//         totalTeachers: counts.totalTeachers,
//         totalAdmins: counts.totalAdmins,
//         totalActiveTeachers: counts.totalActiveTeachers,
//         experienceDistribution,
//         teachers: teachers.map((t) => ({
//           _id: t._id,
//           teacherId: t.teacherId,
//           fullName: `${t.firstName || ""} ${t.fatherName || ""} ${t.lastName || ""}`.replace(/\s+/g, " ").trim(),
//           groupName: t.groupName,
//           yearsOfExperience: Number.isFinite(t.yearsOfExperience) ? t.yearsOfExperience : 0,
//           role: t.role,
//         })),
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching teacher stats:", error);
//     return res.status(500).json({ success: false, message: "حدث خطأ أثناء جلب إحصائيات المعلمين" });
//   }
// };


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
    return res.status(500).json({ success: false, message: "حدث خطأ أثناء إنشاء المعلم" });
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
    return res.status(500).json({ success: false, message: "حدث خطأ أثناء تحديث بيانات المعلم" });
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