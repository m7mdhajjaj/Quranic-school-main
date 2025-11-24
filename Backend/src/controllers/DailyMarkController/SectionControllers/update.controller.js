const Section = require("../../../schema/Section");
const { notifySectionUpdated } = require("../../../Notifications/handlers/DailyMarks/sectionNotifications");

/**
 * Update a section
 */
exports.updateSection = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) {
      return res.status(404).json({ message: "المقطع غير موجود" });
    }

    // Use validated data from middleware
    const updateData = req.validatedData || req.body;

    // حفظ المقطع القديم للمقارنة
    const oldSection = { ...section.toObject() };

    const updatedSection = await Section.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    // إرسال إشعارات لجميع طلاب الحلقة
    const io = req.app.get("io");
    if (io && updatedSection.group) {
      await notifySectionUpdated(updatedSection, oldSection, io);
    }
 
    res.json(updatedSection);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
