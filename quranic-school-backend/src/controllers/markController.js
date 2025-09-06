const Mark = require("../models/Mark");

// Get all marks
exports.getMarks = async (req, res) => {
  try {
    const marks = await Mark.find()
      .populate("studentId", "firstName fatherName lastName group")
      .populate("sectionId");
    res.json(marks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get marks for a specific student
exports.getStudentMarks = async (req, res) => {
  try {
    const marks = await Mark.find({ studentId: req.params.studentId })
      .populate("sectionId")
      .sort({ "sectionId.date": -1 }); // Sort by section date (newest first)
    res.json(marks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get marks for a specific section
exports.getSectionMarks = async (req, res) => {
  try {
    const marks = await Mark.find({ sectionId: req.params.sectionId }).populate(
      "studentId",
      "firstName fatherName lastName group"
    );
    res.json(marks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create or update a mark for a student
exports.createOrUpdateMark = async (req, res) => {
  try {
    // Check if mark already exists for this student and section
    let mark = await Mark.findOne({
      studentId: req.body.studentId,
      sectionId: req.body.sectionId,
    });

    if (mark) {
      // Update existing mark
      mark.reviewMark = req.body.reviewMark;
      mark.memorizationMark = req.body.memorizationMark;
      await mark.save();

      // Populate the references
      mark = await Mark.findById(mark._id)
        .populate("studentId", "firstName fatherName lastName group")
        .populate("sectionId");

      res.json(mark);
    } else {
      // Create new mark
      const newMark = new Mark({
        studentId: req.body.studentId,
        sectionId: req.body.sectionId,
        reviewMark: req.body.reviewMark,
        memorizationMark: req.body.memorizationMark,
      });

      const savedMark = await newMark.save();

      // Populate the references
      const populatedMark = await Mark.findById(savedMark._id)
        .populate("studentId", "firstName fatherName lastName group")
        .populate("sectionId");

      res.status(201).json(populatedMark);
    }
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

    res.status(400).json({ message: error.message });
  }
};

// Delete a mark
exports.deleteMark = async (req, res) => {
  try {
    await Mark.findByIdAndDelete(req.params.id);
    res.json({ message: "تم حذف العلامة بنجاح" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
