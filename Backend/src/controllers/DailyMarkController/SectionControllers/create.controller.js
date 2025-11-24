const Section = require("../../../schema/Section");
const { notifySectionAdded } = require("../../../Notifications/handlers/DailyMarks/sectionNotifications");

/**
 * Create a new section
 */
exports.createSection = async (req, res) => {
  try {
    console.log(" Creating section with original data:", req.body);
    console.log(" Using validated data:", req.validatedData);

    // Use validated data from middleware
    const sectionData = req.validatedData || {
      date: req.body.date,
      reviewSection: req.body.reviewSection,
      memorizationSection: req.body.memorizationSection,
      group: req.body.group,
      teacher: req.body.teacher,
    };

    const section = new Section(sectionData);

    console.log(" Section object created:", section);
    const newSection = await section.save();
    console.log(" Section saved successfully:", newSection);
    
    // ����� ������� ����� ���� ������
    const io = req.app.get("io");
    if (io && newSection.group) {
      await notifySectionAdded(newSection, io);
    }
    
    res.status(201).json(newSection);
  } catch (error) {
    console.error(" Error creating section:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.keys(error.errors)
        .map((field) => `${field}: ${error.errors[field].message}`)
        .join(", ");

      return res.status(400).json({
        message: `��� �� ������ �� ��������: ${validationErrors}`,
        error: validationErrors,
      });
    }

    res.status(400).json({ message: error.message, error: error.toString() });
  }
};
