const Admin = require("../../../schema/Admin");
const { getUsersByRole, onlineUsersManager } = require("../../../services/PresenceService");

/**
 * جلب إحصائيات الإداريين
 * 
 * ✅ Updated: Returns both total count and real-time online count
 */
exports.getAdminStats = async (req, res) => {
  try {
    // ✅ Total admins in DB (all, regardless of online status)
    const totalAdmins = await Admin.countDocuments({});
    
    // ✅ Real-time online admins from PresenceService
    const onlineAdminIds = getUsersByRole('admin');
    const onlineAdmins = onlineAdminIds.length;
    
    // Get role-specific counts for online admins
    let onlineSuperAdmins = 0;
    let onlineRegularAdmins = 0;
    
    for (const adminId of onlineAdminIds) {
      const adminData = onlineUsersManager.getUserData(adminId);
      // Note: role في userData هو 'admin' للجميع، نحتاج للتحقق من DB
      const admin = await Admin.findById(adminId).select('role').lean();
      if (admin) {
        if (admin.role === 'superAdmin') {
          onlineSuperAdmins++;
        } else {
          onlineRegularAdmins++;
        }
      }
    }
    
    // Total in DB (for comparison)
    const totalSuperAdmins = await Admin.countDocuments({ role: 'superAdmin' });
    const totalRegularAdmins = await Admin.countDocuments({ role: 'admin' });
    
    const recentAdmins = await Admin.countDocuments({
      createdAt: {
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        total: totalAdmins,
        online: onlineAdmins, // ✅ Real-time
        offline: totalAdmins - onlineAdmins, // ✅ Real-time
        superAdmins: {
          total: totalSuperAdmins,
          online: onlineSuperAdmins, // ✅ Real-time
        },
        regularAdmins: {
          total: totalRegularAdmins,
          online: onlineRegularAdmins, // ✅ Real-time
        },
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
