const Admin = require("../models/Admin");
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

// Generate next admin ID
const generateAdminId = async () => {
  try {
    const lastAdmin = await Admin.findOne()
      .sort({ adminId: -1 })
      .select("adminId");

    if (!lastAdmin) {
      return 1; // Start admin IDs from 1
    }

    return lastAdmin.adminId + 1;
  } catch (error) {
    console.error("Error generating admin ID:", error);
    return 1;
  }
};

// Get all admins
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find({}).select("-password");
    return res.status(200).json({ success: true, data: admins });
  } catch (error) {
    console.error("Error fetching admins:", error);
    return res
      .status(500)
      .json({ success: false, message: "حدث خطأ أثناء جلب الإداريين" });
  }
};

// Get single admin by ID
exports.getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id).select("-password");
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "الإداري غير موجود" });
    }
    return res.status(200).json({ success: true, data: admin });
  } catch (error) {
    console.error("Error fetching admin:", error);
    return res
      .status(500)
      .json({ success: false, message: "حدث خطأ أثناء جلب الإداري" });
  }
};

// Create new admin
exports.createAdmin = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      fatherName,
      grandFatherName,
      motherName,
      idNumber,
      birthDate,
      gender,
      residence,
      password,
    } = req.body;

    // basic validation
    const must = ["firstName", "lastName", "email", "phoneNumber"];
    for (const f of must) {
      if (!req.body[f]) {
        return res
          .status(400)
          .json({ success: false, message: `حقل ${f} مطلوب` });
      }
    }

    // duplicates
    if (await Admin.findOne({ email })) {
      return res
        .status(400)
        .json({ success: false, message: "البريد الإلكتروني مستخدم بالفعل" });
    }
    if (await Admin.findOne({ phoneNumber })) {
      return res
        .status(400)
        .json({ success: false, message: "رقم الهاتف مستخدم بالفعل" });
    }

    // adminId + password
    const adminId = await generateAdminId();
    const rawPass = password || String(adminId);
    const hashed = await bcrypt.hash(rawPass, 10);

    // age
    const age = calculateAge(birthDate);
    if (birthDate && age < 18) {
      return res
        .status(400)
        .json({
          success: false,
          message: "يجب أن يكون عمر الإداري 18 عام على الأقل",
        });
    }

    const doc = await Admin.create({
      adminId,
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
    });

    console.log("Admin created successfully:", doc._id);
    return res
      .status(201)
      .json({ success: true, message: "تم إنشاء الإداري بنجاح", data: doc });
  } catch (error) {
    console.error("Error creating admin:", error);
    return res
      .status(500)
      .json({ success: false, message: "حدث خطأ أثناء إنشاء الإداري" });
  }
};

// Update admin
exports.updateAdmin = async (req, res) => {
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

    const updated = await Admin.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: false }
    ).select("-password");

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "الإداري غير موجود" });
    }

    return res.status(200).json({
      success: true,
      message: "تم تحديث بيانات الإداري بنجاح",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating admin:", error);
    return res
      .status(500)
      .json({ success: false, message: "حدث خطأ أثناء تحديث بيانات الإداري" });
  }
};

// Delete admin (soft delete)
exports.deleteAdmin = async (req, res) => {
  try {
    const id = req.params.id;
    const admin = await Admin.findById(id);
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "الإداري غير موجود" });
    }

    await Admin.findByIdAndUpdate(id, {
      isActive: false,
      updatedAt: new Date(),
    });
    return res
      .status(200)
      .json({ success: true, message: "تم حذف الإداري بنجاح" });
  } catch (error) {
    console.error("Error deleting admin:", error);
    return res
      .status(500)
      .json({ success: false, message: "حدث خطأ أثناء حذف الإداري" });
  }
};
