const Admin = require("../../schema/Admin");

/**
 * جلب إحصائيات الإداريين
 */
exports.getAdminStats = async (req, res) => {
  try {
    const totalAdmins = await Admin.countDocuments({ isActive: true });
    const superAdmins = await Admin.countDocuments({ 
      isActive: true, 
      role: 'superAdmin' 
    });
    const regularAdmins = await Admin.countDocuments({ 
      isActive: true, 
      role: 'admin' 
    });
    const recentAdmins = await Admin.countDocuments({
      isActive: true,
      createdAt: {
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        total: totalAdmins,
        superAdmins,
        regularAdmins,
        recent: recentAdmins
      }
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return res
      .status(500)
      .json({ success: false, message: "حدث خطأ أثناء جلب إحصائيات الإدارة" });
  }
};
