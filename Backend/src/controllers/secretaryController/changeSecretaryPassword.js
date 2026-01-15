/**
 * تغيير كلمة مرور السكرتير
 * @access Admin, Secretary (self)
 */
const Secretary = require("../../schema/Secretary");
const bcrypt = require("bcryptjs");

const changeSecretaryPassword = async (req, res) => {
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

module.exports = changeSecretaryPassword;
