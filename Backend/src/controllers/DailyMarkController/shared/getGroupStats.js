// ============================================================================
// shared/getGroupStats.js - إحصائيات الحلقة
// ============================================================================
// دالة لجلب عدد الطلاب وعدد المقاطع لحلقة معينة

const Student = require("../../../schema/Student");
const Section = require("../../../schema/DailyMark/Section");
const { createLogger } = require("../../../utils/logger");
const {
  sendSuccess,
  sendError,
  sendValidationError,
} = require("../utils/responseHelpers");

const logger = createLogger('GroupStats');

/**
 * @route GET /api/daily-marks/group-stats/:groupName
 * @desc جلب إحصائيات الحلقة (عدد الطلاب وعدد المقاطع)
 * @param {string} req.params.groupName - اسم الحلقة
 * @param {string} req.query.month - الشهر (اختياري) - للفلترة حسب الشهر
 * @param {string} req.query.year - السنة (اختياري) - للفلترة حسب السنة
 * @access Private (Teacher/Admin)
 * @returns {Object} إحصائيات الحلقة
 */
exports.getGroupStats = async (req, res) => {
  try {
    const { groupName } = req.params;
    const { month, year } = req.query;

    logger.debug("Fetching stats for group:", groupName);

    if (!groupName) {
      return sendValidationError(res, "اسم الحلقة مطلوب");
    }

    // 1. عد الطلاب في الحلقة
    const studentsCount = await Student.countDocuments({
      group: groupName,
    });

    logger.debug(`Students count: ${studentsCount}`);

    // 2. عد المقاطع في الحلقة
    let sectionQuery = { group: groupName };

    // إضافة فلترة حسب الشهر والسنة إذا تم توفيرها
    if (month || year) {
      sectionQuery.$expr = {
        $and: [],
      };

      if (month) {
        const monthNum = parseInt(month);
        sectionQuery.$expr.$and.push({
          $eq: [{ $month: "$date" }, monthNum],
        });
      }

      if (year) {
        const yearNum = parseInt(year);
        sectionQuery.$expr.$and.push({
          $eq: [{ $year: "$date" }, yearNum],
        });
      }
    }

    const sectionsCount = await Section.countDocuments(sectionQuery);

    logger.debug(`Sections count: ${sectionsCount}`);

    sendSuccess(
      res,
      {
        groupName,
        studentsCount,
        sectionsCount,
        filters: {
          month: month || null,
          year: year || null,
        },
      },
      "تم جلب إحصائيات الحلقة بنجاح"
    );
  } catch (error) {
    logger.error("Error fetching group stats:", error);
    sendError(res, "حدث خطأ أثناء جلب إحصائيات الحلقة", 500, error);
  }
};
