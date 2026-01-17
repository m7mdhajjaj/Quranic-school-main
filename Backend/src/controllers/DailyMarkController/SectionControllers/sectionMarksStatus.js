// ============================================================================
// sectionMarksStatus.js - Helper functions to calculate and update section marks status
// ============================================================================

const Section = require("../../../schema/DailyMark/Section");
const Mark = require("../../../schema/DailyMark/DailyMark");
const Student = require("../../../schema/Student");

/**
 * Calculate marks status for a section
 * @param {string} sectionId - Section ID
 * @param {string} groupName - Group name (optional, will use section.group if not provided)
 * @returns {Promise<{marksStatus: string, marksProgress: object}>}
 */
async function calculateSectionMarksStatus(sectionId, groupName = null) {
  try {
    // Get section to find group if not provided
    const section = await Section.findById(sectionId).lean();
    if (!section) {
      throw new Error("المقطع غير موجود");
    }

    const group = groupName || section.group;
    
    if (!group) {
      return {
        marksStatus: "not_started",
        marksProgress: {
          totalStudents: 0,
          studentsWithMarks: 0,
          percentage: 0,
        },
      };
    }

    // Get all active students in the group
    const totalStudents = await Student.countDocuments({
      group: group,
    });

    if (totalStudents === 0) {
      return {
        marksStatus: "not_started",
        marksProgress: {
          totalStudents: 0,
          studentsWithMarks: 0,
          percentage: 0,
        },
      };
    }

    // Get count of students with marks for this section
    const studentsWithMarks = await Mark.countDocuments({
      sectionId: sectionId,
      $or: [
        { reviewMark: { $ne: null } },
        { memorizationMark: { $ne: null } },
      ],
    });

    // Determine status
    let marksStatus;
    if (studentsWithMarks === 0) {
      marksStatus = "not_started";
    } else if (studentsWithMarks === totalStudents) {
      marksStatus = "completed";
    } else {
      marksStatus = "in_progress";
    }

    const percentage = totalStudents > 0 
      ? Math.round((studentsWithMarks / totalStudents) * 100) 
      : 0;

    return {
      marksStatus,
      marksProgress: {
        totalStudents,
        studentsWithMarks,
        percentage,
      },
    };
  } catch (error) {
    console.error("❌ Error calculating section marks status:", error);
    throw error;
  }
}

/**
 * Update marks status for a section in the database
 * Also updates the status of memorizationMeta and reviewMeta segments
 * @param {string} sectionId - Section ID
 * @param {string} groupName - Group name (optional)
 * @returns {Promise<Section>}
 */
async function updateSectionMarksStatus(sectionId, groupName = null) {
  try {
    const statusData = await calculateSectionMarksStatus(sectionId, groupName);
    
    // ✅ تحديث حالة الـ segments أيضاً
    // إذا كانت حالة العلامات "completed" (جميع الطلاب أخذوا علامات)
    // نقوم بتحديث status كل segment إلى "completed"
    const segmentStatus = statusData.marksStatus === "completed" 
      ? "completed" 
      : statusData.marksStatus === "in_progress" 
        ? "in_progress" 
        : "not_started";

    // جلب المقطع لتحديث الـ segments
    const section = await Section.findById(sectionId);
    if (!section) {
      throw new Error("المقطع غير موجود");
    }

    // تحديث حالة مقاطع الحفظ
    if (section.memorizationMeta && section.memorizationMeta.length > 0) {
      section.memorizationMeta.forEach(seg => {
        seg.status = segmentStatus;
        if (segmentStatus === "completed" && !seg.completedAt) {
          seg.completedAt = new Date();
        }
      });
    }

    // تحديث حالة مقاطع المراجعة
    if (section.reviewMeta && section.reviewMeta.length > 0) {
      section.reviewMeta.forEach(seg => {
        seg.status = segmentStatus;
        if (segmentStatus === "completed" && !seg.completedAt) {
          seg.completedAt = new Date();
        }
      });
    }

    // تحديث Section مع marksStatus و segments المحدثة
    section.marksStatus = statusData.marksStatus;
    section.marksProgress = statusData.marksProgress;
    
    const updatedSection = await section.save();

    console.log(`✅ Section ${sectionId}: marksStatus=${statusData.marksStatus}, segments status updated`);

    return updatedSection;
  } catch (error) {
    console.error("❌ Error updating section marks status:", error);
    throw error;
  }
}

/**
 * Update marks status for multiple sections
 * @param {string[]} sectionIds - Array of section IDs
 * @returns {Promise<void>}
 */
async function updateMultipleSectionsMarksStatus(sectionIds) {
  try {
    const updatePromises = sectionIds.map(async (sectionId) => {
      try {
        await updateSectionMarksStatus(sectionId);
      } catch (error) {
        console.error(`⚠️ Error updating status for section ${sectionId}:`, error);
      }
    });

    await Promise.all(updatePromises);
  } catch (error) {
    console.error("❌ Error updating multiple sections marks status:", error);
    throw error;
  }
}

module.exports = {
  calculateSectionMarksStatus,
  updateSectionMarksStatus,
  updateMultipleSectionsMarksStatus,
};
