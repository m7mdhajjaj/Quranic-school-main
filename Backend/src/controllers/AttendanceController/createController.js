const mongoose = require("mongoose");
const Attendance = require("../../schema/Attendance");

// Create or update attendance records for a specific date
exports.createAttendance = async (req, res) => {
  try {
    const { date, records } = req.body;
    
    // Note: Validation is now handled by validate() middleware using Zod schema
    
    // 1. Date Parsing
    const formattedDate = new Date(date);
    formattedDate.setHours(0, 0, 0, 0);

    // 2. Check if date is in the future or too old ( > 7 days)
    const now = new Date();
    // Reset time part for accurate date comparison
    now.setHours(0, 0, 0, 0);
    
    // Check for future dates
    if (formattedDate > now) {
      return res.status(403).json({
        message: "لا يمكن تسجيل الحضور لتاريخ مستقبلي",
        details: "يجب تسجيل الحضور لليوم الحالي أو الأيام السابقة فقط.",
        isFutureDate: true
      });
    }

    const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
    const timeDiff = now - formattedDate;
    if (timeDiff > ONE_WEEK) {
      const daysAgo = Math.round(timeDiff / (1000 * 60 * 60 * 24));
      return res.status(403).json({
        message: "لا يمكن تعديل الحضور بعد مرور أسبوع",
        details: `هذا التاريخ قديم (مضى عليه ${daysAgo} يوم).`,
        daysAgo,
      });
    }

    // 3. Prepare Records
    const attendanceRecords = [];
    const studentIds = [];
    
    for (const record of records) {
      attendanceRecords.push({
        studentId: record.studentId,
        date: formattedDate,
        isPresent: record.isPresent,
      });
      studentIds.push(record.studentId);
    }

    // 4. Fetch Old Records (for notifications)
    // We do this before deletion to know who changed status
    let oldRecordsMap = new Map();
    try {
      const oldRecords = await Attendance.find({
        studentId: { $in: studentIds },
        date: formattedDate, // Exact match since we set hours to 0
      }).select('studentId isPresent createdAt').lean();

      oldRecords.forEach(r => {
        oldRecordsMap.set(r.studentId.toString(), r);
      });
    } catch (e) {
      console.error("Error fetching old records:", e);
    }

    // 6. Delete Existing Records (Clean Slate Strategy)
    await Attendance.deleteMany({
      studentId: { $in: studentIds },
      date: formattedDate,
    });

    // 7. Insert New Records
    const insertResult = await Attendance.insertMany(attendanceRecords, { ordered: false });

    // 8. Send Response Immediately (Optimistic)
    res.status(201).json({ message: "تم حفظ سجل الحضور بنجاح" });

    // 9. Background Tasks (Notifications & Sockets)
    // We don't await these to keep the response fast
    (async () => {
      try {
        // A. Notifications
        if (global.notificationService) {
          const teacherName = req.user?.firstName
            ? `${req.user.firstName} ${req.user.lastName || ""}`.trim()
            : "المعلم";
          const dateStr = formattedDate.toLocaleDateString("ar-SA");

          // Notify Absents
          const absentRecords = attendanceRecords.filter(r => !r.isPresent);
          for (const record of absentRecords) {
            global.notificationService.notifyAbsence(record.studentId, dateStr, teacherName)
              .catch(e => console.error(`Notification error for ${record.studentId}:`, e.message));
          }

          // Notify Absence Removals
          for (const record of attendanceRecords) {
            const oldRecord = oldRecordsMap.get(record.studentId.toString());
            if (oldRecord && !oldRecord.isPresent && record.isPresent) {
              // Check if within 7 days (already checked above, but good for safety)
              if (timeDiff <= ONE_WEEK) {
                global.notificationService.notifyAbsenceRemoved(record.studentId, dateStr, teacherName)
                  .catch(e => console.error(`Removal notification error for ${record.studentId}:`, e.message));
              }
            }
          }
        }

        // B. Socket.IO Updates
        if (global.io) {
          // Emit simple update
          global.io.to("attendance").emit("attendanceCreated", {
            date: formattedDate,
            count: insertResult.length,
            timestamp: Date.now(),
          });

          // Emit Dashboard Update (Admin)
          // Calculate absent students for today/tomorrow to update dashboard
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const nextDay = new Date(today);
          nextDay.setDate(today.getDate() + 1);

          // Only run aggregation if the updated date is TODAY
          if (formattedDate.getTime() === today.getTime()) {
            const absentStudents = await Attendance.aggregate([
              { $match: { date: { $gte: today, $lt: nextDay }, isPresent: false } },
              { $lookup: { from: "students", localField: "studentId", foreignField: "_id", as: "student" } },
              { $unwind: "$student" },
              { $lookup: { from: "groups", localField: "student.group", foreignField: "name", as: "groupInfo" } },
              { $unwind: { path: "$groupInfo", preserveNullAndEmptyArrays: true } },
              { $lookup: { from: "teachers", localField: "groupInfo.teacher", foreignField: "_id", as: "teacherInfo" } },
              { $unwind: { path: "$teacherInfo", preserveNullAndEmptyArrays: true } },
              {
                $project: {
                  _id: "$student._id",
                  fullName: { $concat: ["$student.firstName", " ", "$student.lastName"] }, // Simplified for speed
                  teacher: { $concat: ["$teacherInfo.firstName", " ", "$teacherInfo.lastName"] },
                  group: "$student.group"
                }
              }
            ]);

            global.io.to("admin-room").emit("absentStudentsUpdated", {
              date: formattedDate,
              timestamp: Date.now(),
              data: absentStudents,
              count: absentStudents.length,
            });
          }
        }
      } catch (bgError) {
        console.error("Background task error:", bgError);
      }
    })();

  } catch (error) {
    console.error("Error creating attendance records:", error);
    // Handle duplicate key error specifically if it happens
    if (error.code === 11000) {
      return res.status(201).json({ message: "تم الحفظ (مع وجود تكرار)" });
    }
    res.status(500).json({
      message: "حدث خطأ أثناء حفظ سجل الحضور",
      error: error.message,
    });
  }
};
