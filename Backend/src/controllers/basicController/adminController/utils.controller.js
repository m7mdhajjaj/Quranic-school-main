const Admin = require("../../../schema/Admin");

/**
 * حساب العمر من تاريخ الميلاد
 */
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

/**
 * توليد رقم إداري جديد
 */
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

module.exports = {
  calculateAge,
  generateAdminId,
};
