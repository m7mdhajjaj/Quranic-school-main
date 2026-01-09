const Section = require("../../../schema/DailyMark/Section");
const {
  sendSuccess,
  sendError,
  sendNotFound,
} = require("../utils/responseHelpers");

/**
 * Get all sections, sorted by date (newest first)
 * Support filtering by group and teacher via query params
 */
exports.getSections = async (req, res) => {
  try {
    const { group, teacher } = req.query;
    const filter = {};

    if (group) {
      filter.group = group;
    }
    if (teacher) {
      filter.teacher = teacher;
    }

    const sections = await Section.find(filter)
      .sort({ date: -1 })
      .populate('timetableId', 'day startHour endHour sessionType');
      
    sendSuccess(res, sections, "تم جلب المقاطع بنجاح");
  } catch (error) {
    sendError(res, error.message, 500, error);
  }
};

/**
 * Get a single section
 */
exports.getSection = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id)
      .populate('timetableId', 'day startHour endHour sessionType');
    if (!section) {
      return sendNotFound(res, "المقطع");
    }
    sendSuccess(res, section, "تم جلب المقطع بنجاح");
  } catch (error) {
    sendError(res, error.message, 500, error);
  }
};
