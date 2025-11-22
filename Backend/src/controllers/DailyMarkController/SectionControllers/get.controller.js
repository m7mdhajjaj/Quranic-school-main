const Section = require("../../../schema/Section");

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

    const sections = await Section.find(filter).sort({ date: -1 });
    res.json(sections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get a single section
 */
exports.getSection = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) {
      return res.status(404).json({ message: "المقطع غير موجود" });
    }
    res.json(section);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
