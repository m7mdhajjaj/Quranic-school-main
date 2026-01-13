const mongoose = require('mongoose');
const Section = require('../../schema/DailyMark/Section');
const Group = require('../../schema/Group');

/**
 * Get available dates (sections dates) for attendance
 * GET /api/attendance/teacher/:teacherId/available-dates
 * Query params: groupId (optional) - if provided, get dates for specific group
 */
exports.getAvailableDates = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { groupId } = req.query;

    // Validate Teacher ID
    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'معرف المعلم غير صالح' 
      });
    }

    // Get teacher's groups
    const teacherGroups = await Group.find({ 
      teacher: new mongoose.Types.ObjectId(teacherId),
      activeStatus: true 
    }).select('name');
    
    if (teacherGroups.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'لا توجد حلقات نشطة لهذا المعلم' 
      });
    }

    const groupNames = teacherGroups.map(g => g.name);

    // Build query
    let query = { group: { $in: groupNames } };
    
    // If specific group requested
    if (groupId) {
      if (!mongoose.Types.ObjectId.isValid(groupId)) {
        return res.status(400).json({ 
          success: false, 
          message: 'معرف الحلقة غير صالح' 
        });
      }
      
      const specificGroup = await Group.findById(groupId).select('name');
      if (!specificGroup) {
        return res.status(404).json({ 
          success: false, 
          message: 'الحلقة غير موجودة' 
        });
      }
      
      query.group = specificGroup.name;
    }

    // Get all section dates
    const sections = await Section.find(query)
      .select('date group')
      .sort({ date: -1 })
      .lean();

    // Format dates
    const availableDates = sections.map(s => ({
      date: s.date.toISOString().split('T')[0], // YYYY-MM-DD format
      group: s.group
    }));

    // Remove duplicates (same date might have multiple sections)
    const uniqueDates = [...new Set(availableDates.map(d => d.date))];

    return res.status(200).json({
      success: true,
      data: {
        dates: uniqueDates,
        total: uniqueDates.length,
        details: availableDates // Include group info if needed
      }
    });

  } catch (error) {
    console.error('❌ خطأ في جلب التواريخ المتاحة:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: error.message
    });
  }
};
