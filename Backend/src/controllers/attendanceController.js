const mongoose = require("mongoose");
const Attendance = require("../models/Attendance");
const Student = require("../models/Student");

// Create or update attendance records for a specific date
exports.createAttendance = async (req, res) => {
  try {
    console.log(
      "Received request to create attendance records:",
      JSON.stringify(req.body, null, 2)
    );
    const { date, records, teacher, group } = req.body;

    console.log("💾 حفظ سجل حضور - المعلم:", teacher, "المجموعة:", group);

    if (!date) {
      console.log("No date provided in request");
      return res.status(400).json({ message: "التاريخ مطلوب" });
    }

    if (!teacher) {
      console.log("No teacher provided in request");
      return res.status(400).json({ message: "معلومات المعلم مطلوبة" });
    }

    if (!records || !Array.isArray(records) || records.length === 0) {
      console.log("No valid records provided in request");
      return res.status(400).json({ message: "سجلات الحضور مطلوبة" });
    }

    // Format the date to ensure it's consistently stored
    let formattedDate;
    try {
      formattedDate = new Date(date);
      if (isNaN(formattedDate.getTime())) {
        console.log(`Invalid date provided: ${date}`);
        return res.status(400).json({ message: "التاريخ غير صالح" });
      }
      formattedDate.setHours(0, 0, 0, 0);
      console.log(`Formatted date: ${formattedDate.toISOString()}`);
    } catch (dateError) {
      console.error(`Error formatting date: ${dateError.message}`);
      return res.status(400).json({ message: "خطأ في تنسيق التاريخ" });
    }

    try {
      // First, delete any existing records for this date to avoid duplicates
      const deleteResult = await Attendance.deleteMany({
        date: {
          $gte: formattedDate,
          $lt: new Date(formattedDate.getTime() + 24 * 60 * 60 * 1000),
        },
      });

      console.log(
        `Deleted ${deleteResult.deletedCount} existing records for this date`
      );
    } catch (deleteError) {
      console.error("Error deleting existing records:", deleteError);
      // Continue with the process even if delete fails
    }

    // Create new attendance records
    const attendanceRecords = records.map((record) => ({
      studentId: record.studentId,
      date: formattedDate,
      isPresent: record.isPresent,
      teacher: teacher,
      group: group || "غير محدد",
    }));

    console.log(
      `Prepared ${attendanceRecords.length} attendance records for insertion`
    );
    console.log(
      "First few records:",
      JSON.stringify(attendanceRecords.slice(0, 3))
    );

    try {
      // Validate that the studentIds are valid ObjectIds
      for (const record of attendanceRecords) {
        if (!mongoose.Types.ObjectId.isValid(record.studentId)) {
          console.error(`Invalid studentId: ${record.studentId}`);
          return res.status(400).json({
            message: "معرف طالب غير صالح",
            details: `Invalid studentId format: ${record.studentId}`,
          });
        }
      }

      const insertResult = await Attendance.insertMany(attendanceRecords, {
        ordered: false,
      });
      console.log(
        `Successfully inserted ${insertResult.length} attendance records`
      );

      // إرسال إشعارات للطلاب الغائبين
      if (global.notificationService) {
        const absentRecords = attendanceRecords.filter(
          (record) => !record.isPresent
        );
        const dateStr = formattedDate.toLocaleDateString("ar-SA");

        for (const record of absentRecords) {
          try {
            await global.notificationService.notifyAbsence(
              record.studentId,
              dateStr,
              req.user?.name || "المعلم"
            );
          } catch (notificationError) {
            console.error(
              "Error sending absence notification:",
              notificationError
            );
            // لا نريد أن يفشل حفظ الحضور بسبب مشكلة في الإشعارات
          }
        }

        console.log(
          `Sent absence notifications to ${absentRecords.length} students`
        );
      }

      return res.status(201).json({ message: "تم حفظ سجل الحضور بنجاح" });
    } catch (insertError) {
      console.error("Error inserting attendance records:", insertError);
      // If error is due to duplicate keys, consider it partially successful
      if (insertError.code === 11000) {
        return res.status(201).json({
          message: "تم حفظ سجل الحضور بنجاح (مع وجود بعض السجلات المكررة)",
          warning: "بعض السجلات كانت مكررة ولم يتم إضافتها",
        });
      }
      return res.status(500).json({
        message: "حدث خطأ أثناء حفظ سجل الحضور",
        error: insertError.message,
      });
    }
  } catch (error) {
    console.error("Error creating attendance records:", error);
    res.status(500).json({
      message: "حدث خطأ أثناء حفظ سجل الحضور",
      error: error.message,
    });
  }
};

// Get attendance records for a specific date
exports.getAttendanceByDate = async (req, res) => {
  try {
    const dateParam = req.params.date;
    const { teacher, group } = req.query;
    console.log(
      `Getting attendance records for date: ${dateParam}, teacher: ${teacher}, group: ${group}`
    );

    if (!dateParam) {
      console.log("No date parameter provided");
      return res.json([]);
    }

    // Make sure the date is valid
    let date;
    try {
      date = new Date(dateParam);
      if (isNaN(date.getTime())) {
        console.log("Invalid date parameter");
        return res.json([]);
      }
      date.setHours(0, 0, 0, 0);
    } catch (dateError) {
      console.log(`Error parsing date: ${dateError.message}`);
      return res.json([]);
    }

    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);

    try {
      // بناء الاستعلام مع الفلاتر
      const query = {
        date: {
          $gte: date,
          $lt: nextDay,
        },
      };

      if (teacher) {
        query.teacher = decodeURIComponent(teacher);
        console.log("👩‍🏫 فلترة بالمعلم:", query.teacher);
      }

      if (group && group !== "all") {
        query.group = decodeURIComponent(group);
        console.log("🎓 فلترة بالمجموعة:", query.group);
      }

      const records = await Attendance.find(query);

      console.log(
        `Found ${records.length} attendance records for date: ${dateParam} with filters`
      );
      return res.json(records);
    } catch (findError) {
      console.log(`Error finding attendance records: ${findError.message}`);
      return res.json([]);
    }
  } catch (error) {
    console.error(`General error in getAttendanceByDate: ${error.message}`);
    // Return empty array instead of error to prevent frontend issues
    return res.json([]);
  }
};

// Get all attendance records for a specific student
exports.getStudentAttendance = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const { group } = req.query;
    console.log(
      `Getting attendance records for student ID: ${studentId}, group filter: ${group}`
    );

    // Verify that the student exists - but don't fail if not found
    try {
      const student = await Student.findById(studentId);
      if (!student) {
        console.log(
          `Student with ID ${studentId} not found, returning empty records`
        );
        // Instead of failing, just return empty records
        return res.json([]);
      }
    } catch (studentError) {
      console.log(`Error finding student: ${studentError.message}`);
      // Don't fail here, continue and try to get records
    }

    // Try to find attendance records for the student
    try {
      const query = { studentId };

      // فلترة بالمجموعة إذا تم توفيرها
      if (group && group !== "all") {
        query.group = decodeURIComponent(group);
        console.log("🎓 فلترة سجلات الطالب بالمجموعة:", query.group);
      }

      const records = await Attendance.find(query).sort({ date: -1 });
      console.log(
        `Found ${records.length} attendance records for student ID: ${studentId} with group filter`
      );
      return res.json(records);
    } catch (recordError) {
      console.log(`Error finding attendance records: ${recordError.message}`);
      // If we can't find records, return empty array instead of error
      return res.json([]);
    }
  } catch (error) {
    console.error(`General error in getStudentAttendance: ${error.message}`);
    // Return empty array instead of error to prevent frontend issues
    return res.json([]);
  }
};

// Get attendance statistics for a specific student
exports.getStudentAttendanceStats = async (req, res) => {
  try {
    const studentId = req.params.studentId;

    // Verify that the student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "الطالب غير موجود" });
    }

    // Get all attendance records for this student
    const records = await Attendance.find({ studentId }).sort({ date: 1 });

    // Group records by month
    const months = {};

    records.forEach((record) => {
      const date = new Date(record.date);
      const month = date.getMonth();
      const year = date.getFullYear();
      const key = `${year}-${month}`;

      if (!months[key]) {
        months[key] = {
          year,
          month,
          present: 0,
          absent: 0,
          total: 0,
        };
      }

      months[key].total++;
      if (record.isPresent) {
        months[key].present++;
      } else {
        months[key].absent++;
      }
    });

    // Convert to array and calculate rates
    const stats = Object.values(months).map((month) => ({
      year: month.year,
      month: month.month,
      presentDays: month.present,
      absentDays: month.absent,
      totalDays: month.total,
      attendanceRate: Math.round((month.present / month.total) * 100 * 10) / 10,
      absenceRate: Math.round((month.absent / month.total) * 100 * 10) / 10,
    }));

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete attendance record
exports.deleteAttendance = async (req, res) => {
  try {
    await Attendance.findByIdAndDelete(req.params.id);
    res.json({ message: "تم حذف سجل الحضور بنجاح" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
