const Section = require("../models/Section");
const Mark = require("../models/Mark");

// Get sections with filtering support (by group/teacher)
exports.getSections = async (req, res) => {
  try {
    console.log("📄 جلب المقاطع...");

    // بناء استعلام الفلترة
    let query = {};

    // فلترة حسب الحلقة
    if (req.query.group) {
      const groupName = decodeURIComponent(req.query.group);
      console.log("🎯 فلترة حسب الحلقة:", groupName);
      query.group = groupName;
    }

    // فلترة حسب المعلم
    if (req.query.teacher) {
      const teacherName = decodeURIComponent(req.query.teacher);
      console.log("👩‍🏫 فلترة حسب المعلم:", teacherName);
      query.teacher = teacherName;
    }

    const sections = await Section.find(query).sort({ date: -1 });
    console.log(`✅ تم جلب ${sections.length} مقطع`);
    console.log("🔍 استعلام الفلترة:", query);

    res.json(sections);
  } catch (error) {
    console.error("❌ خطأ في جلب المقاطع:", error);
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
    console.log("➕ إنشاء مقطع جديد:", req.body);

    const section = new Section({
      date: req.body.date,
      reviewSection: req.body.reviewSection,
      memorizationSection: req.body.memorizationSection,
      group: req.body.group,
      teacher: req.body.teacher,
    });

    const newSection = await section.save();
    console.log("✅ تم إنشاء المقطع بنجاح:", newSection._id);
    res.status(201).json(newSection);
  } catch (error) {
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

    res.status(500).json({ message: error.message });
  }
};

// Update a section
exports.updateSection = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) {
      return res.status(404).json({ message: "المقطع غير موجود" });
    }

    const updatedSection = await Section.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

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

    // Delete all marks for this section
    await Mark.deleteMany({ sectionId: req.params.id });

    // Delete the section
    await Section.findByIdAndDelete(req.params.id);

    res.json({ message: "تم حذف المقطع وجميع علاماته بنجاح" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
