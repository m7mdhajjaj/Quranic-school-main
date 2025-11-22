const Section = require("../../../schema/Section");
const DailyMark = require("../../../schema/DailyMark");
const { notifySectionDeleted } = require("../../../Notifications/sectionNotifications");

/**
 * Delete a section
 */
exports.deleteSection = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) {
      return res.status(404).json({ message: "المقطع غير موجود" });
    }

    // إرسال إشعارات قبل الحذف
    const io = req.app.get("io");
    if (io && section.group) {
      await notifySectionDeleted(section, io);
    }

    // Delete all marks for this section
    await DailyMark.deleteMany({ sectionId: req.params.id });

    // Delete the section
    await Section.findByIdAndDelete(req.params.id);

    res.json({ message: "تم حذف المقطع وجميع علاماته بنجاح" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
