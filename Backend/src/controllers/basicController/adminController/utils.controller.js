const Admin = require("../../../schema/Admin");
const { calculateAge } = require("../groupController/utils");

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
