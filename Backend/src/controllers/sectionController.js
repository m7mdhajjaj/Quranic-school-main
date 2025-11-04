const Section = require("../schema/Section");
const DailyMark = require("../schema/DailyMark");
const { 
  notifySectionAdded, 
  notifySectionUpdated, 
  notifySectionDeleted 
} = require("../Notifications/sectionNotifications");

// Get all sections, sorted by date (newest first)
// Support filtering by group and teacher via query params
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

// Get a single section
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

// Create a new section
exports.createSection = async (req, res) => {
  try {
    console.log("📝 Creating section with original data:", req.body);
    console.log("✅ Using validated data:", req.validatedData);

    // Use validated data from middleware
    const sectionData = req.validatedData || {
      date: req.body.date,
      reviewSection: req.body.reviewSection,
      memorizationSection: req.body.memorizationSection,
      group: req.body.group,
      teacher: req.body.teacher,
    };

    const section = new Section(sectionData);

    console.log("✅ Section object created:", section);
    const newSection = await section.save();
    console.log("✅ Section saved successfully:", newSection);
    
    // إرسال إشعارات لجميع طلاب الحلقة
    const io = req.app.get("io");
    if (io && newSection.group) {
      await notifySectionAdded(newSection, io);
    }
    
    res.status(201).json(newSection);
  } catch (error) {
    console.error("❌ Error creating section:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.keys(error.errors)
        .map((field) => `${field}: ${error.errors[field].message}`)
        .join(", ");

      return res.status(400).json({
        message: `خطأ في التحقق من البيانات: ${validationErrors}`,
        error: validationErrors,
      });
    }

    res.status(400).json({ message: error.message, error: error.toString() });
  }
};

// Update a section
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

// Delete a section
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
