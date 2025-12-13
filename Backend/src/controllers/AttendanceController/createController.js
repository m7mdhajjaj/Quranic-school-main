const mongoose = require("mongoose");
const Attendance = require("../../schema/Attendance");

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
      console.log(
        `⚠️ Attempt to modify attendance older than 7 days (${daysAgo} days ago)`
      );
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
      oldRecords.forEach((record) => {
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
          ? `${req.user.firstName} ${req.user.lastName || ""}`.trim()
          : req.user?.name || "المعلم";

        console.log(
          `📢 Sending absence notifications to ${absentRecords.length} absent students by teacher: ${teacherName}`
        );

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

                console.log(
                  `📱 Absence removal notification sent to student ${studentIdStr}`
                );
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
      const { updateGroupsMonthlyStats } = require("./statsController");
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
        
        // إرسال event مع البيانات مباشرة لتحديث قائمة الطلاب الغائبين في Dashboard
        // هذا event يستمع له Dashboard فقط (للادمن)
        try {
          // جلب البيانات مباشرة (نفس منطق getAbsentStudentsToday)
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const nextDay = new Date(today);
          nextDay.setDate(today.getDate() + 1);

          const absentStudents = await Attendance.aggregate([
            {
              $match: {
                date: { $gte: today, $lt: nextDay },
                isPresent: false,
              },
            },
            {
              $lookup: {
                from: "students",
                localField: "studentId",
                foreignField: "_id",
                as: "student",
              },
            },
            { $unwind: { path: "$student", preserveNullAndEmptyArrays: false } },
            {
              $lookup: {
                from: "groups",
                localField: "student.group",
                foreignField: "name",
                as: "groupInfo",
              },
            },
            { $unwind: { path: "$groupInfo", preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                from: "teachers",
                localField: "groupInfo.teacher",
                foreignField: "_id",
                as: "teacherInfo",
              },
            },
            { $unwind: { path: "$teacherInfo", preserveNullAndEmptyArrays: true } },
            {
              $project: {
                _id: "$student._id",
                fullName: {
                  $trim: {
                    input: {
                      $concat: [
                        { $ifNull: ["$student.firstName", ""] },
                        " ",
                        { $ifNull: ["$student.fatherName", ""] },
                        " ",
                        { $ifNull: ["$student.lastName", ""] },
                      ],
                    },
                  },
                },
                teacher: {
                  $cond: {
                    if: { $and: ["$teacherInfo.firstName", "$teacherInfo.lastName"] },
                    then: {
                      $trim: {
                        input: {
                          $concat: [
                            { $ifNull: ["$teacherInfo.firstName", ""] },
                            " ",
                            { $ifNull: ["$teacherInfo.fatherName", ""] },
                            " ",
                            { $ifNull: ["$teacherInfo.lastName", ""] },
                          ],
                        },
                      },
                    },
                    else: { $ifNull: ["$student.teacher", "غير محدد"] },
                  },
                },
                group: { $ifNull: ["$student.group", "بدون حلقة"] },
              },
            },
            { $sort: { fullName: 1 } },
          ]);

          // إرسال البيانات مباشرة في Socket event
          global.io.to("admin-room").emit("absentStudentsUpdated", {
            date: formattedDate,
            timestamp: Date.now(),
            message: "تم تحديث قائمة الطلاب الغائبين",
            reason: "attendance_saved",
            data: absentStudents,
            count: absentStudents.length,
          });
          console.log(`📡 Broadcasting absentStudentsUpdated event with ${absentStudents.length} absent students`);
        } catch (error) {
          console.error("❌ خطأ في جلب البيانات لإرسالها في Socket:", error);
          // إرسال event بدون بيانات (Frontend سيجلبها)
          global.io.to("admin-room").emit("absentStudentsUpdated", {
            date: formattedDate,
            timestamp: Date.now(),
            message: "تم تحديث قائمة الطلاب الغائبين",
            reason: "attendance_saved",
          });
        }
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
