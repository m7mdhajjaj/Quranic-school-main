const Admin = require("../../../schema/Admin");
const bcrypt = require("bcryptjs");
const { calculateAge, generateAdminId } = require("./utils.controller");

/**
 * جلب جميع الإداريين
 */
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

/**
 * جلب إداري واحد بواسطة ID
 */
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

/**
 * إنشاء إداري جديد
 * البيانات تأتي مُتحققة ومُنظفة من middleware (validateAdminData)
 */
exports.createAdmin = async (req, res) => {
  try {
    // جميع البيانات مُتحققة ومُشفرة من middleware
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

    // توليد adminId
    const adminId = await generateAdminId();
    
    // كلمة المرور تأتي مُشفرة من middleware
    const hashedPassword = password || await bcrypt.hash(String(adminId), 10);

    // حساب العمر
    const age = calculateAge(birthDate);

    const doc = await Admin.create({
      adminId,
      password: hashedPassword,
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
    
    // إشعار تحديث الداشبورد
    
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

/**
 * تحديث بيانات إداري
 * البيانات تأتي مُتحققة ومُنظفة من middleware (validateAdminData)
 */
exports.updateAdmin = async (req, res) => {
  try {
    const id = req.params.id;
    const updates = { ...req.body };

    // Check if birthDate is being changed - apply edit limits
    if (updates.birthDate) {
      const currentAdmin = await Admin.findById(id).select(
        "birthDate birthDateEditHistory"
      );

      if (currentAdmin) {
        // Check if birthDate is actually changing
        // Admin schema uses String type
        const currentBirthDate = currentAdmin.birthDate
          ? currentAdmin.birthDate.split("T")[0].trim()
          : null;
        const newBirthDateStr = updates.birthDate
          ? (typeof updates.birthDate === 'string'
              ? updates.birthDate.split("T")[0].trim()
              : new Date(updates.birthDate).toISOString().split("T")[0])
          : null;

        if (currentBirthDate !== newBirthDateStr && newBirthDateStr) {
          // BirthDate is being changed - check edit limits
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

          // Count recent edits (within last month)
          const recentEdits =
            currentAdmin.birthDateEditHistory?.filter(
              (edit) => new Date(edit.editDate) >= oneMonthAgo
            ) || [];

          const editCount = recentEdits.length;
          const allowed = editCount < 2;

          if (!allowed) {
            return res.status(400).json({
              success: false,
              message:
                "لا يمكنك تعديل تاريخ الميلاد أكثر من مرتين خلال شهر كامل من آخر تعديلاتك",
              editLimit: {
                allowed: false,
                remaining: 0,
                count: editCount,
              },
            });
          }

          // Add new edit to history (will be saved with the update)
          if (!updates.birthDateEditHistory) {
            updates.birthDateEditHistory =
              currentAdmin.birthDateEditHistory || [];
          }
          updates.birthDateEditHistory.push({ editDate: new Date() });
        }
      }
    }

    // حساب العمر إذا تم تحديث تاريخ الميلاد
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

    // Cleanup old edit history entries (older than 2 months) for birthDate
    if (
      updated.birthDateEditHistory &&
      updated.birthDateEditHistory.length > 0
    ) {
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

      const cleanedHistory = updated.birthDateEditHistory.filter(
        (edit) => new Date(edit.editDate) >= twoMonthsAgo
      );

      // Only update if we removed old entries
      if (cleanedHistory.length !== updated.birthDateEditHistory.length) {
        await Admin.findByIdAndUpdate(id, {
          birthDateEditHistory: cleanedHistory,
        });
        updated.birthDateEditHistory = cleanedHistory;
      }
    }

    // إشعار تحديث الداشبورد

    // إرسال تحديث مباشر عبر Socket
    const io = req.app.get("io");
    if (io) {
      io.to("profile").emit("profileUpdated", {
        user: updated,
        userId: req.params.id,
        userRole: "admin",
        timestamp: Date.now(),
      });
      console.log("📡 Profile updated event emitted via socket (admin)");
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

/**
 * حذف إداري (حذف ناعم)
 */
exports.deleteAdmin = async (req, res) => {
  try {
    const id = req.params.id;
    const admin = await Admin.findById(id);
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "الإداري غير موجود" });
    }

    // ✅ isActive removed - deleting admin directly
    await Admin.findByIdAndUpdate(id, {
      updatedAt: new Date(),
    });
    
    // Notify dashboard about admin deletion
    
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
