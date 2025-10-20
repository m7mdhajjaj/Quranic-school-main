const Mark = require("../schema/Mark");
const Section = require("../schema/Section");
const {
  calculateAndUpdateMonthlyAverage,
} = require("../utils/studentAverageCalculator");

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
    console.log("📝 Creating/updating mark with data:", req.body);
    console.log("✅ Using validated data:", req.validatedData);

    // Use validated data from middleware
    const markData = req.validatedData || req.body;

    // Check if mark already exists for this student and section
    let mark = await Mark.findOne({
      studentId: markData.studentId,
      sectionId: markData.sectionId,
    });

    let isNewMark = !mark;

    if (mark) {
      // Update existing mark
      const oldTotalMark =
        (mark.reviewMark || 0) + (mark.memorizationMark || 0);
      mark.reviewMark = markData.reviewMark;
      mark.memorizationMark = markData.memorizationMark;
      await mark.save();

      // Populate the references
      mark = await Mark.findById(mark._id)
        .populate("studentId", "firstName fatherName lastName group")
        .populate("sectionId");

      // حساب وتحديث المعدل الشهري للطالب
      if (mark.sectionId && mark.sectionId.date) {
        const sectionDate = new Date(mark.sectionId.date);
        const month = sectionDate.getMonth() + 1; // 1-12
        const year = sectionDate.getFullYear();

        try {
          await calculateAndUpdateMonthlyAverage(
            mark.studentId._id,
            month,
            year
          );
          console.log("✅ تم تحديث المعدل الشهري للطالب");
        } catch (avgError) {
          console.error("⚠️ خطأ في تحديث المعدل الشهري:", avgError);
          // لا نوقف العملية بسبب خطأ في حساب المعدل
        }
      }

      // إرسال إشعار التحديث
      const newTotalMark =
        (mark.reviewMark || 0) + (mark.memorizationMark || 0);
      if (global.notificationService) {
        const teacherName = req.user?.name || mark.sectionId?.teacher || "المعلم";
        const subjectName = "القرآن الكريم";
        
        await global.notificationService.notifyNewGrade(
          mark.studentId._id,
          subjectName,
          newTotalMark,
          teacherName,
          true, // isUpdate = true
          oldTotalMark // العلامة القديمة
        );
      }

      // Emit socket event for real-time updates (affects rankings)
      if (global.io) {
        console.log("📡 Broadcasting mark updated event");
        global.io.emit("markUpdated", mark);
      }

      res.json(mark);
    } else {
      // Create new mark
      const newMark = new Mark({
        studentId: markData.studentId,
        sectionId: markData.sectionId,
        reviewMark: markData.reviewMark,
        memorizationMark: markData.memorizationMark,
      });

      console.log("✅ Mark object created:", newMark);
      const savedMark = await newMark.save();
      console.log("✅ Mark saved successfully:", savedMark);

      // Populate the references
      const populatedMark = await Mark.findById(savedMark._id)
        .populate("studentId", "firstName fatherName lastName group")
        .populate("sectionId");

      // حساب وتحديث المعدل الشهري للطالب
      if (populatedMark.sectionId && populatedMark.sectionId.date) {
        const sectionDate = new Date(populatedMark.sectionId.date);
        const month = sectionDate.getMonth() + 1; // 1-12
        const year = sectionDate.getFullYear();

        try {
          await calculateAndUpdateMonthlyAverage(
            populatedMark.studentId._id,
            month,
            year
          );
          console.log("✅ تم حساب وحفظ المعدل الشهري للطالب");
        } catch (avgError) {
          console.error("⚠️ خطأ في حساب المعدل الشهري:", avgError);
          // لا نوقف العملية بسبب خطأ في حساب المعدل
        }
      }

      // إرسال إشعار العلامة الجديدة
      const totalMark =
        (populatedMark.reviewMark || 0) + (populatedMark.memorizationMark || 0);
      if (global.notificationService) {
        const teacherName = req.user?.name || populatedMark.sectionId?.teacher || "المعلم";
        const subjectName = "القرآن الكريم";
        
        await global.notificationService.notifyNewGrade(
          populatedMark.studentId._id,
          subjectName,
          totalMark,
          teacherName,
          false, // isUpdate = false (علامة جديدة)
          null // لا توجد علامة قديمة
        );
      }

      // Emit socket event for real-time updates (affects rankings)
      if (global.io) {
        console.log("📡 Broadcasting mark created event");
        global.io.emit("markCreated", populatedMark);
      }

      res.status(201).json(populatedMark);
    }
  } catch (error) {
    console.error("Error in createOrUpdateMark:", error);

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
    console.log("🗑️ حذف العلامة:", req.params.id);

    // الحصول على العلامة قبل حذفها لمعرفة الطالب والتاريخ
    const mark = await Mark.findById(req.params.id).populate("sectionId");

    if (!mark) {
      return res.status(404).json({ message: "العلامة غير موجودة" });
    }

    const studentId = mark.studentId;
    const sectionId = mark.sectionId;

    // حذف العلامة
    await Mark.findByIdAndDelete(req.params.id);
    console.log("✅ تم حذف العلامة");

    // Emit Socket.IO event for mark deletion
    if (global.io) {
      console.log("📡 Broadcasting mark deleted event");
      global.io.emit("markDeleted", { _id: req.params.id, studentId });
    }

    // إعادة حساب المعدل الشهري للطالب بعد الحذف
    if (sectionId && sectionId.date) {
      const sectionDate = new Date(sectionId.date);
      const month = sectionDate.getMonth() + 1; // 1-12
      const year = sectionDate.getFullYear();

      try {
        await calculateAndUpdateMonthlyAverage(studentId, month, year);
        console.log("✅ تم تحديث المعدل الشهري بعد حذف العلامة");
      } catch (avgError) {
        console.error("⚠️ خطأ في تحديث المعدل الشهري:", avgError);
        // لا نوقف العملية بسبب خطأ في حساب المعدل
      }
    }

    res.json({ message: "تم حذف العلامة بنجاح" });
  } catch (error) {
    console.error("خطأ في حذف العلامة:", error);
    res.status(500).json({ message: error.message });
  }
};
