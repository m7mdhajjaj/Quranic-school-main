const mongoose = require("mongoose");
const Attendance = require("../schema/Attendance");
const Student = require("../schema/Student");

// Create or update attendance records for a specific date
exports.createAttendance = async (req, res) => {
  try {
    console.log(
      "Received request to create attendance records:",
      JSON.stringify(req.body, null, 2)
    );
    const { date, records } = req.body;

    if (!date) {
      console.log("No date provided in request");
      return res.status(400).json({ message: "التاريخ مطلوب" });
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

    // ⏰ التحقق من أن التاريخ ليس أقدم من أسبوع (7 أيام)
    const now = new Date();
    const ONE_WEEK = 7 * 24 * 60 * 60 * 1000; // 7 أيام
    const timeDiff = now - formattedDate;

    if (timeDiff > ONE_WEEK) {
      const daysAgo = Math.round(timeDiff / (1000 * 60 * 60 * 24));
      console.log(`⚠️ Attempt to modify attendance older than 7 days (${daysAgo} days ago)`);
      return res.status(403).json({ 
        message: "لا يمكن تعديل الحضور بعد مرور أسبوع",
        details: `هذا التاريخ قديم (مضى عليه ${daysAgo} يوم). لا يمكن التعديل بعد مرور أسبوع.`,
        daysAgo: daysAgo,
      });
    }

    // Create new attendance records
    const attendanceRecords = records.map((record) => ({
      studentId: record.studentId,
      date: formattedDate,
      isPresent: record.isPresent,
    }));

    // متغير لحفظ السجلات القديمة (خارج block try)
    let oldRecordsMap = new Map();

    try {
      // جلب السجلات القديمة قبل الحذف لتتبع التغييرات من غائب إلى حاضر
      const studentIds = attendanceRecords.map((r) => r.studentId);
      
      const oldRecords = await Attendance.find({
        studentId: { $in: studentIds },
        date: {
          $gte: formattedDate,
          $lt: new Date(formattedDate.getTime() + 24 * 60 * 60 * 1000),
        },
      }).lean();

      // إنشاء map للسجلات القديمة للمقارنة السريعة
      oldRecords.forEach(record => {
        oldRecordsMap.set(record.studentId.toString(), {
          isPresent: record.isPresent,
          createdAt: record.createdAt,
        });
      });

      // حذف السجلات الموجودة
      const deleteResult = await Attendance.deleteMany({
        studentId: { $in: studentIds },
        date: {
          $gte: formattedDate,
          $lt: new Date(formattedDate.getTime() + 24 * 60 * 60 * 1000),
        },
      });

      console.log(
        `🗑️ حذف ${deleteResult.deletedCount} سجل موجود مسبقاً لـ ${studentIds.length} طالب في هذا التاريخ`
      );
    } catch (deleteError) {
      console.error("Error deleting existing records:", deleteError);
      // Continue with the process even if delete fails
    }

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
        
        // الحصول على اسم المعلم من بيانات المستخدم
        const teacherName = req.user?.firstName 
          ? `${req.user.firstName} ${req.user.lastName || ''}`.trim()
          : req.user?.name || "المعلم";

        console.log(`📢 Sending absence notifications to ${absentRecords.length} absent students by teacher: ${teacherName}`);

        for (const record of absentRecords) {
          try {
            await global.notificationService.notifyAbsence(
              record.studentId,
              dateStr,
              teacherName
            );
          } catch (notificationError) {
            console.error(
              `Error sending absence notification to student ${record.studentId}:`,
              notificationError
            );
            // لا نريد أن يفشل حفظ الحضور بسبب مشكلة في الإشعارات
          }
        }

        console.log(
          `✅ Successfully sent ${absentRecords.length} absence notifications`
        );

        // إرسال إشعارات لإزالة الغياب (الطلاب الذين كانوا غائبين وأصبحوا حاضرين)
        const now = new Date();
        const ONE_WEEK = 7 * 24 * 60 * 60 * 1000; // 7 أيام

        console.log(`🔍 Checking for absence removals...`);
        
        for (const record of attendanceRecords) {
          try {
            const studentIdStr = record.studentId.toString();
            const oldRecord = oldRecordsMap.get(studentIdStr);
            
            // التحقق: هل كان الطالب غائباً سابقاً وأصبح حاضراً الآن؟
            if (oldRecord && !oldRecord.isPresent && record.isPresent) {
              // التحقق من الفترة الزمنية: هل مضى أقل من أسبوع؟
              const timeDiff = now - new Date(oldRecord.createdAt);
              
              if (timeDiff <= ONE_WEEK) {
                const daysAgo = Math.round(timeDiff / (1000 * 60 * 60 * 24));
                console.log(
                  `✅ Student ${studentIdStr} was marked absent and is now present within 7 days (${daysAgo} days ago). Sending removal notification...`
                );
                
                await global.notificationService.notifyAbsenceRemoved(
                  record.studentId,
                  dateStr,
                  teacherName
                );
                
                console.log(`📱 Absence removal notification sent to student ${studentIdStr}`);
              } else {
                const daysAgo = Math.round(timeDiff / (1000 * 60 * 60 * 24));
                console.log(
                  `⏰ Student ${studentIdStr} absence was more than 7 days ago (${daysAgo} days). No notification sent.`
                );
              }
            }
          } catch (removalError) {
            console.error(
              `Error sending absence removal notification to student ${record.studentId}:`,
              removalError
            );
            // لا نريد أن يفشل حفظ الحضور بسبب مشكلة في الإشعارات
          }
        }
      }

      // تحديث إحصائيات الحلقات للشهر الحالي
      updateGroupsMonthlyStats(formattedDate).catch((err) => {
        console.error("خطأ في تحديث إحصائيات الحلقات:", err);
        // لا نريد أن يفشل حفظ الحضور بسبب مشكلة في تحديث الإحصائيات
      });

      // Emit Socket.IO event for attendance creation
      if (global.io) {
        console.log("📡 Broadcasting attendance created event");
        global.io.to("attendance").emit("attendanceCreated", {
          date: formattedDate,
          count: insertResult.length,
          timestamp: Date.now(),
        });
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
    console.log(`Getting attendance records for date: ${dateParam}`);

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
      const records = await Attendance.find({
        date: {
          $gte: date,
          $lt: nextDay,
        },
      });

      console.log(
        `Found ${records.length} attendance records for date: ${dateParam}`
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
    console.log(`Getting attendance records for student ID: ${studentId}`);

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
      const records = await Attendance.find({ studentId }).sort({ date: -1 });
      console.log(
        `Found ${records.length} attendance records for student ID: ${studentId}`
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
    const deletedAttendance = await Attendance.findByIdAndDelete(req.params.id);
    
    // Emit Socket.IO event for attendance deletion
    if (global.io && deletedAttendance) {
      console.log("📡 Broadcasting attendance deleted event");
      global.io.to("attendance").emit("attendanceDeleted", {
        _id: req.params.id,
        studentId: deletedAttendance.studentId,
        date: deletedAttendance.date,
        timestamp: Date.now(),
      });
    }
    
    res.json({ message: "تم حذف سجل الحضور بنجاح" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// دالة مساعدة لتحديث إحصائيات الحلقات للشهر الحالي
async function updateGroupsMonthlyStats(date) {
  try {
    const Group = require("../schema/Group");

    // تحديد بداية ونهاية الشهر
    const targetDate = new Date(date);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();
    const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`; // "YYYY-MM"

    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);

    console.log(`📊 تحديث إحصائيات الحلقات للشهر: ${monthKey}`);

    // جلب كل الحلقات
    const groups = await Group.find({});

    for (const group of groups) {
      try {
        // جلب كل الطلاب في هذه الحلقة
        const students = await Student.find({ group: group.name });
        const studentIds = students.map((s) => s._id);

        if (studentIds.length === 0) {
          console.log(`⚠️ لا يوجد طلاب في الحلقة: ${group.name}`);
          continue;
        }

        // جلب سجلات الحضور لهذا الشهر لطلاب هذه الحلقة
        const attendanceRecords = await Attendance.find({
          studentId: { $in: studentIds },
          date: { $gte: monthStart, $lte: monthEnd },
        });

        if (attendanceRecords.length === 0) {
          console.log(`⚠️ لا توجد سجلات حضور للحلقة: ${group.name}`);
          continue;
        }

        // حساب الإحصائيات
        let totalPresences = 0;
        let totalAbsences = 0;

        attendanceRecords.forEach((record) => {
          if (record.isPresent) {
            totalPresences++;
          } else {
            totalAbsences++;
          }
        });

        const totalRecords = totalPresences + totalAbsences;
        const attendanceRate =
          totalRecords > 0
            ? Math.round((totalPresences / totalRecords) * 100 * 10) / 10
            : 0;
        const absenceRate =
          totalRecords > 0
            ? Math.round((totalAbsences / totalRecords) * 100 * 10) / 10
            : 0;

        // حساب عدد الأيام الفريدة (عدد المرات التي تم تسجيل الحضور فيها)
        const uniqueDates = [
          ...new Set(
            attendanceRecords.map(
              (r) => new Date(r.date).toISOString().split("T")[0]
            )
          ),
        ];
        const totalDays = uniqueDates.length;

        // تحديث إحصائيات الحلقة
        group.currentMonthStats = {
          month: monthKey,
          absenceRate,
          attendanceRate,
          totalDays,
          totalAbsences,
          totalPresences,
        };

        await group.save();

        console.log(`✅ تم تحديث إحصائيات الحلقة: ${group.name}`);
        console.log(`   - نسبة الغياب: ${absenceRate}%`);
        console.log(`   - نسبة الحضور: ${attendanceRate}%`);
        console.log(`   - عدد الأيام: ${totalDays}`);
      } catch (groupError) {
        console.error(`❌ خطأ في تحديث الحلقة ${group.name}:`, groupError);
      }
    }

    console.log(`✅ تم الانتهاء من تحديث إحصائيات جميع الحلقات`);
  } catch (error) {
    console.error("❌ خطأ في تحديث إحصائيات الحلقات:", error);
  }
}

// تصدير الدالة للاستخدام في controllers أخرى
exports.updateGroupsMonthlyStats = updateGroupsMonthlyStats;
