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
            // جلب البيانات من Backend مباشرة
            const req = { params: {}, query: {} };
            const res = {
              json: (data) => {
                // إرسال البيانات مباشرة في Socket event
                this.io.to("admin-room").emit("absentStudentsUpdated", {
                  date: new Date(),
                  timestamp: Date.now(),
                  message: "تحديث دوري كل ساعة",
                  reason: "hourly_backup",
                  data: data.data || [], // إرسال البيانات مباشرة
                  count: data.count || 0,
                });
                console.log(`📡 [AttendanceService] تم إرسال ${data.count || 0} طالب غائب (hourly backup)`);
              },
              status: () => res,
            };
            
            await getAbsentStudentsToday(req, res);
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
    // 🆕 Auto-Mark Presence Job (Runs at 01:00 AM daily)
    // ========================================================================
    // يقوم بحساب الحضور التلقائي لليوم السابق
    // إذا لم يتم رصد حضور لطالب في اليوم السابق، يتم اعتباره حاضراً تلقائياً
    this.autoPresenceJob = cron.schedule(
      "0 1 * * *", // الساعة 1:00 صباحاً
      async () => {
        console.log("🤖 [AutoPresence] بدء عملية الحضور التلقائي لليوم السابق...");
        try {
          // 1. تحديد تاريخ الأمس (بداية ونهاية)
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          yesterday.setHours(0, 0, 0, 0);
          
          const endOfYesterday = new Date(yesterday);
          endOfYesterday.setHours(23, 59, 59, 999);

          console.log(`📅 [AutoPresence] معالجة تاريخ: ${yesterday.toLocaleDateString('en-GB')}`);

          // 2. جلب جميع الطلاب النشطين
          // نفترض أن الطلاب النشطين هم الذين ليس لديهم حالة "inactive" أو ما شابه
          // هنا نجلب الجميع، يمكن تعديل الفلتر حسب الحاجة
          const allStudents = await Student.find({}).select('_id firstName lastName');
          
          if (allStudents.length === 0) {
            console.log("⚠️ [AutoPresence] لا يوجد طلاب لمعالجتهم.");
            return;
          }

          // 3. جلب سجلات الحضور الموجودة للأمس
          const existingRecords = await Attendance.find({
            date: {
              $gte: yesterday,
              $lte: endOfYesterday
            }
          }).select('studentId');

          // تحويل السجلات الموجودة إلى Set للبحث السريع
          const recordedStudentIds = new Set(existingRecords.map(r => r.studentId.toString()));

          // 4. تحديد الطلاب الذين ليس لديهم سجل
          const studentsWithoutRecord = allStudents.filter(s => !recordedStudentIds.has(s._id.toString()));

          if (studentsWithoutRecord.length === 0) {
            console.log("✅ [AutoPresence] جميع الطلاب لديهم سجلات حضور للأمس.");
            return;
          }

          console.log(`📝 [AutoPresence] تم العثور على ${studentsWithoutRecord.length} طالب بدون سجل. جاري تسجيلهم كحضور...`);

          // 5. إنشاء سجلات حضور (isPresent: true) لهؤلاء الطلاب
          const newRecords = studentsWithoutRecord.map(s => ({
            studentId: s._id,
            date: yesterday,
            isPresent: true, // افتراض الحضور
            autoGenerated: true // علامة لتمييز السجلات الآلية (اختياري إذا كان الموديل يدعمه)
          }));

          // استخدام insertMany للكفاءة
          if (newRecords.length > 0) {
            await Attendance.insertMany(newRecords, { ordered: false });
            console.log(`✅ [AutoPresence] تم تسجيل ${newRecords.length} طالب كحاضرين تلقائياً.`);
            
            // إشعار عبر السوكيت (اختياري)
            if (this.io) {
              this.io.to("attendance").emit("attendanceAutoFilled", {
                date: yesterday,
                count: newRecords.length
              });
            }
          }

        } catch (error) {
          console.error("❌ [AutoPresence] خطأ في عملية الحضور التلقائي:", error);
        }
      },
      {
        timezone: "Asia/Riyadh",
      }
    );
    console.log("⏰ [AutoPresence] سيتم تشغيل الحضور التلقائي يومياً الساعة 01:00 صباحاً");
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
