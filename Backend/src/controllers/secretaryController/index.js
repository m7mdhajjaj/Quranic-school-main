/**
 * ============================================================================
 * Secretary Controller - إدارة السكرتير
 * ============================================================================
 */

const Secretary = require("../../schema/Secretary");
const Counter = require("../../schema/Counter");
const bcrypt = require("bcryptjs");

/**
 * الحصول على جميع السكرتيرين
 * @access Admin only
 */
exports.getAllSecretaries = async (req, res) => {
  try {
    const secretaries = await Secretary.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: secretaries.length,
      data: secretaries,
    });
  } catch (error) {
    console.error("Get all secretaries error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب بيانات السكرتيرين",
    });
  }
};

/**
 * الحصول على سكرتير بواسطة ID
 * @access Admin, Secretary (self)
 */
exports.getSecretaryById = async (req, res) => {
  try {
    const secretary = await Secretary.findById(req.params.id).select("-password");

    if (!secretary) {
      return res.status(404).json({
        success: false,
        message: "السكرتير غير موجود",
      });
    }

    res.status(200).json({
      success: true,
      data: secretary,
    });
  } catch (error) {
    console.error("Get secretary by ID error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب بيانات السكرتير",
    });
  }
};

/**
 * إنشاء سكرتير جديد
 * @access Admin only
 */
exports.createSecretary = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      fatherName,
      grandFatherName,
      motherName,
      email,
      phoneNumber,
      password,
      idNumber,
      birthDate,
      gender,
      residence,
      permissions,
    } = req.body;

    // التحقق من عدم وجود سكرتير بنفس البريد الإلكتروني أو رقم الهاتف
    const existingSecretary = await Secretary.findOne({
      $or: [{ email }, { phoneNumber }],
    });

    if (existingSecretary) {
      return res.status(400).json({
        success: false,
        message: "البريد الإلكتروني أو رقم الهاتف مستخدم بالفعل",
      });
    }

    // الحصول على الـ ID التالي
    const secretaryId = await Counter.getNextId("secretary");

    // تشفير كلمة المرور
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // إنشاء السكرتير
    const secretary = await Secretary.create({
      secretaryId,
      firstName,
      lastName,
      fatherName,
      grandFatherName,
      motherName,
      email,
      phoneNumber,
      password: hashedPassword,
      idNumber,
      birthDate,
      gender,
      residence,
      permissions: permissions || {},
    });

    res.status(201).json({
      success: true,
      message: "تم إنشاء حساب السكرتير بنجاح",
      data: {
        _id: secretary._id,
        secretaryId: secretary.secretaryId,
        firstName: secretary.firstName,
        lastName: secretary.lastName,
        email: secretary.email,
        phoneNumber: secretary.phoneNumber,
        permissions: secretary.permissions,
      },
    });
  } catch (error) {
    console.error("Create secretary error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء إنشاء حساب السكرتير",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

/**
 * تحديث بيانات سكرتير
 * @access Admin, Secretary (self - limited)
 */
exports.updateSecretary = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // حذف الحقول التي لا يجب تحديثها مباشرة
    delete updateData.secretaryId;
    delete updateData.password;

    // إذا كان المستخدم سكرتير، لا يستطيع تغيير الصلاحيات
    if (req.user.role === "secretary") {
      delete updateData.permissions;
    }

    const secretary = await Secretary.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!secretary) {
      return res.status(404).json({
        success: false,
        message: "السكرتير غير موجود",
      });
    }

    res.status(200).json({
      success: true,
      message: "تم تحديث بيانات السكرتير بنجاح",
      data: secretary,
    });
  } catch (error) {
    console.error("Update secretary error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تحديث بيانات السكرتير",
    });
  }
};

/**
 * تحديث صلاحيات السكرتير
 * @access Admin only
 */
exports.updateSecretaryPermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body;

    const secretary = await Secretary.findByIdAndUpdate(
      id,
      { permissions },
      { new: true, runValidators: true }
    ).select("-password");

    if (!secretary) {
      return res.status(404).json({
        success: false,
        message: "السكرتير غير موجود",
      });
    }

    res.status(200).json({
      success: true,
      message: "تم تحديث صلاحيات السكرتير بنجاح",
      data: secretary,
    });
  } catch (error) {
    console.error("Update secretary permissions error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تحديث صلاحيات السكرتير",
    });
  }
};

/**
 * حذف سكرتير
 * @access Admin only
 */
exports.deleteSecretary = async (req, res) => {
  try {
    const { id } = req.params;

    const secretary = await Secretary.findById(id);

    if (!secretary) {
      return res.status(404).json({
        success: false,
        message: "السكرتير غير موجود",
      });
    }

    // إعادة الـ ID للـ recycled IDs
    await Counter.recycleId("secretary", secretary.secretaryId);

    await Secretary.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "تم حذف السكرتير بنجاح",
    });
  } catch (error) {
    console.error("Delete secretary error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء حذف السكرتير",
    });
  }
};

/**
 * تغيير كلمة مرور السكرتير
 * @access Admin, Secretary (self)
 */
exports.changeSecretaryPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    const secretary = await Secretary.findById(id);

    if (!secretary) {
      return res.status(404).json({
        success: false,
        message: "السكرتير غير موجود",
      });
    }

    // إذا كان السكرتير يغير كلمة مروره، يجب التحقق من كلمة المرور الحالية
    if (req.user.role === "secretary") {
      const isMatch = await bcrypt.compare(currentPassword, secretary.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "كلمة المرور الحالية غير صحيحة",
        });
      }
    }

    // تشفير كلمة المرور الجديدة
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await Secretary.findByIdAndUpdate(id, { password: hashedPassword });

    res.status(200).json({
      success: true,
      message: "تم تغيير كلمة المرور بنجاح",
    });
  } catch (error) {
    console.error("Change secretary password error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تغيير كلمة المرور",
    });
  }
};

/**
 * الحصول على بيانات السكرتير الحالي
 * @access Secretary only
 */
exports.getCurrentSecretary = async (req, res) => {
  try {
    const secretary = await Secretary.findById(req.user._id).select("-password");

    if (!secretary) {
      return res.status(404).json({
        success: false,
        message: "السكرتير غير موجود",
      });
    }

    res.status(200).json({
      success: true,
      data: secretary,
    });
  } catch (error) {
    console.error("Get current secretary error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب بيانات السكرتير",
    });
  }
};
