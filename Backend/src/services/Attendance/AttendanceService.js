// ============================================================================
// services/AttendanceService/index.js - Attendance Daily Reset Service
// ============================================================================
// 
// المسؤوليات:
// ✅ إرسال event عند منتصف الليل (00:00:00) لتحديث قائمة الطلاب الغائبين
// ✅ استخدام timezone محدد (Asia/Riyadh) لضمان التوقيت الصحيح
//
// ============================================================================

const cron = require("node-cron");
const Attendance = require("../../schema/Attendance");
const Student = require("../../schema/Student");
const Section = require("../../schema/DailyMark/Section");
const Warning = require("../../schema/Warning"); // Import Warning
const { getAbsentStudentsToday } = require("../../controllers/AttendanceController");

/**
 * خدمة تحديث قائمة الطلاب الغائبين عند بداية يوم جديد
 */
class AttendanceService {
  constructor() {
    this.cronJob = null;
    this.io = null;
  }

  /**
   * ربط Socket.IO بالخدمة
   */
  setIO(io) {
    this.io = io;
  }

  /**
   * بدء خدمة التحديث اليومي
   */
  start() {
    if (!this.io) {
      console.error("❌ [AttendanceService] Socket.IO غير متاح");
      return;
    }

    console.log("🚀 [AttendanceService] Starting daily attendance reset service...");

    // تشغيل cron job عند منتصف الليل كل يوم (00:00:00)
    // Format: minute hour day month day-of-week
    // "0 0 * * *" = كل يوم في الساعة 00:00
    this.midnightJob = cron.schedule(
      "0 0 * * *",
      async () => {
        console.log("🔄 [AttendanceService] بداية يوم جديد - جلب وإرسال بيانات الطلاب الغائبين...");
        
        if (this.io) {
          try {
            // جلب البيانات مباشرة باستخدام نفس منطق getAbsentStudentsToday
            const Attendance = require("../../schema/Attendance");
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
            this.io.to("admin-room").emit("absentStudentsUpdated", {
              date: new Date(),
              timestamp: Date.now(),
              message: "بداية يوم جديد - تم تحديث قائمة الطلاب الغائبين",
              reason: "midnight_reset",
              data: absentStudents,
              count: absentStudents.length,
            });
            console.log(`📡 [AttendanceService] تم إرسال ${absentStudents.length} طالب غائب مباشرة في Socket event`);
          } catch (error) {
            console.error("❌ [AttendanceService] خطأ في جلب البيانات:", error);
            // إرسال event بدون بيانات (Frontend سيجلبها)
            this.io.to("admin-room").emit("absentStudentsUpdated", {
              date: new Date(),
              timestamp: Date.now(),
              message: "بداية يوم جديد - حدث خطأ في جلب البيانات",
              reason: "midnight_reset",
            });
          }
        }
      },
      {
        timezone: "Asia/Riyadh", // توقيت السعودية
      }
    );

    // تشغيل cron job كل ساعة كـ backup (في حالة انقطاع Socket أو مشاكل أخرى)
    // "0 * * * *" = كل ساعة في الدقيقة 0
    this.hourlyJob = cron.schedule(
      "0 * * * *",
      async () => {
        console.log("⏰ [AttendanceService] تحديث دوري كل ساعة - جلب وإرسال بيانات...");
        
        if (this.io) {
          try {
            // جلب البيانات مباشرة باستخدام نفس منطق midnight job
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
            this.io.to("admin-room").emit("absentStudentsUpdated", {
              date: new Date(),
              timestamp: Date.now(),
              message: "تحديث دوري كل ساعة",
              reason: "hourly_backup",
              data: absentStudents,
              count: absentStudents.length,
            });
            console.log(`📡 [AttendanceService] تم إرسال ${absentStudents.length} طالب غائب (hourly backup)`);
          } catch (error) {
            console.error("❌ [AttendanceService] خطأ في جلب البيانات:", error);
            // إرسال event بدون بيانات (Frontend سيجلبها)
            this.io.to("admin-room").emit("absentStudentsUpdated", {
              date: new Date(),
              timestamp: Date.now(),
              message: "تحديث دوري كل ساعة - حدث خطأ في جلب البيانات",
              reason: "hourly_backup",
            });
          }
        }
      },
      {
        timezone: "Asia/Riyadh", // توقيت السعودية
      }
    );

    console.log("✅ [AttendanceService] Daily attendance reset service started");
    console.log("⏰ [AttendanceService] سيتم إرسال event كل يوم في 00:00:00 (توقيت السعودية)");
    console.log("⏰ [AttendanceService] سيتم إرسال event كل ساعة كـ backup");

    // ========================================================================
    // 🆕 Auto-Mark Presence Job (Runs at 23:59 daily)
    // ========================================================================
    // يقوم بحساب الحضور التلقائي لليوم الحالي
    // إذا لم يتم رصد حضور لطالب في اليوم الحالي، يتم اعتباره حاضراً تلقائياً
    // يعمل فقط للحلقات التي لها مقاطع (Sections) في هذا اليوم
    this.autoPresenceJob = cron.schedule(
      "59 23 * * *", // الساعة 11:59 مساءً
      async () => {
        console.log("🤖 [AutoPresence] بدء عملية الحضور التلقائي لليوم الحالي...");
        try {
          // 1. تحديد تاريخ اليوم (بداية ونهاية)
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const endOfToday = new Date(today);
          endOfToday.setHours(23, 59, 59, 999);

          console.log(`📅 [AutoPresence] معالجة تاريخ: ${today.toLocaleDateString('en-GB')}`);

          // 2. جلب المقاطع (Sections) التي كانت اليوم
          // هذا يحدد الحلقات التي كان يجب أخذ الحضور فيها
          const sections = await Section.find({
            date: { $gte: today, $lte: endOfToday }
          }).select('group date');

          if (sections.length === 0) {
            console.log("ℹ️ [AutoPresence] لم يتم العثور على مقاطع (Sections) لهذا اليوم. تجاوز فحص الحضور.");
            return;
          }

          // 3. استخراج أسماء الحلقات المعنية
          const groupsWithSections = [...new Set(sections.map(s => s.group))];
          console.log(`ℹ️ [AutoPresence] تم العثور على مقاطع للحلقات: ${groupsWithSections.join(', ')}`);

          let totalAdded = 0;

          // 4. لكل حلقة، تحقق من حضور طلابها
          for (const groupName of groupsWithSections) {
            if (!groupName) continue;

            // جلب طلاب الحلقة (Active Only - Exclude Expelled)
            // We need to fetch students who do NOT have an active "third" or "expulsion" warning
            // Since we can't easily join in find(), we'll fetch then filter, or use aggregate.
            // Aggregate is better for performance.
            const activeStudents = await Student.aggregate([
              { $match: { group: groupName } },
              {
                $lookup: {
                  from: "warnings",
                  let: { studentId: "$_id" },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [
                            { $eq: ["$studentId", "$$studentId"] },
                            { $eq: ["$status", "active"] },
                            { $in: ["$type", ["third", "expulsion"]] } // Strict filter
                          ]
                        }
                      }
                    }
                  ],
                  as: "activeWarnings"
                }
              },
              {
                $match: {
                  activeWarnings: { $size: 0 } // No expulsion warnings
                }
              },
              {
                $project: { _id: 1 }
              }
            ]);
            
            if (activeStudents.length === 0) continue;

            const studentIds = activeStudents.map(s => s._id);

            // جلب الحضور المسجل لهؤلاء الطلاب في نفس اليوم
            const existingAttendance = await Attendance.find({
              studentId: { $in: studentIds },
              date: { $gte: today, $lte: endOfToday }
            }).select('studentId');

            const presentStudentIds = new Set(existingAttendance.map(a => a.studentId.toString()));

            // تحديد الطلاب الذين ليس لديهم سجل حضور
            const missingStudents = activeStudents.filter(s => !presentStudentIds.has(s._id.toString()));

            if (missingStudents.length > 0) {
               const newRecords = missingStudents.map(s => ({
                 studentId: s._id,
                 date: today,
                 isPresent: true, // افتراض الحضور تلقائياً
                 autoGenerated: true
               }));
               
               await Attendance.insertMany(newRecords, { ordered: false });
               totalAdded += newRecords.length;
               console.log(`✅ [AutoPresence] حلقة "${groupName}": تم تسجيل ${newRecords.length} طالب كحضور تلقائي.`);
            }
          }

          if (totalAdded > 0) {
            console.log(`✅ [AutoPresence] الإجمالي: تم تسجيل ${totalAdded} طالب كحاضرين تلقائياً.`);
            
            // إشعار عبر السوكيت
            if (this.io) {
              this.io.to("attendance").emit("attendanceAutoFilled", {
                date: today,
                count: totalAdded
              });
            }
          } else {
            console.log("✅ [AutoPresence] جميع طلاب الحلقات النشطة لديهم سجلات حضور.");
          }

        } catch (error) {
          console.error("❌ [AutoPresence] خطأ في عملية الحضور التلقائي:", error);
        }
      },
      {
        timezone: "Asia/Riyadh",
      }
    );
    console.log("⏰ [AutoPresence] سيتم تشغيل الحضور التلقائي يومياً الساعة 23:59 مساءً");
  }

  /**
   * إيقاف الخدمة
   */
  stop() {
    if (this.midnightJob) this.midnightJob.stop();
    if (this.hourlyJob) this.hourlyJob.stop();
    if (this.autoPresenceJob) this.autoPresenceJob.stop();
    console.log("🛑 [AttendanceService] Daily attendance reset service stopped");
  }
}

// Export singleton instance
const attendanceService = new AttendanceService();

module.exports = attendanceService;
