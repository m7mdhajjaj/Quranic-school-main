const mongoose = require('mongoose');
const Group = require('../../schema/Group');
const Student = require('../../schema/Student');
const Teacher = require('../../schema/Teacher');
const Attendance = require('../../schema/Attendance');
const Section = require("../../schema/DailyMark/Section");

/**
 * Get all groups for a teacher with full attendance data
 * GET /api/attendance/teacher/:teacherId/groups
 * 
 * Optimized version using MongoDB Aggregation Pipeline
 */
exports.getTeacherGroupsForAttendance = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { 
      date,
      includeAbsenceStats = 'true'
    } = req.query;

    // 1. Validate Teacher ID
    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({ success: false, message: 'معرف المعلم غير صالح' });
    }

    // 2. Get Teacher Info
    const teacher = await Teacher.findById(teacherId).select('firstName lastName fatherName');
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'المعلم غير موجود' });
    }
    const teacherName = `${teacher.firstName} ${teacher.lastName}`;

    // 3. Prepare Date Range for "Today's" Attendance - ✅ FIX: Use UTC dates
    let targetDateStart, targetDateEnd, dateKey;
    if (date) {
      const inputDate = new Date(date);
      dateKey = inputDate.toISOString().split('T')[0];
    } else {
      dateKey = new Date().toISOString().split('T')[0];
    }
    targetDateStart = new Date(dateKey + 'T00:00:00.000Z');
    targetDateEnd = new Date(dateKey + 'T00:00:00.000Z');
    targetDateEnd.setUTCDate(targetDateEnd.getUTCDate() + 1);

    console.log(`📅 [TeacherGroups] Date range: ${targetDateStart.toISOString()} to ${targetDateEnd.toISOString()}, dateKey: ${dateKey}`);

    // 🆕 4. التحقق من وجود Section في التاريخ المطلوب
    const teacherGroups = await Group.find({ 
      teacher: new mongoose.Types.ObjectId(teacherId),
      activeStatus: true 
    }).select('name');
    
    const groupNames = teacherGroups.map(g => g.name);
    
    if (groupNames.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'لا توجد حلقات نشطة لهذا المعلم' 
      });
    }

    // التحقق من وجود مقطع في التاريخ المحدد لأي من حلقات المعلم - ✅ Use dateKey
    const sectionOnDate = await Section.findOne({
      group: { $in: groupNames },
      dateKey: dateKey
    });

    if (!sectionOnDate) {
      // تنسيق التاريخ للعرض
      const formattedDate = targetDateStart.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      return res.status(400).json({ 
        success: false, 
        message: `لا يوجد مقطع مضاف بتاريخ ${formattedDate}. لا يمكن تسجيل الحضور إلا في أيام المقاطع المضافة.`,
        noSection: true,
        date: formattedDate
      });
    }

    // 5. Aggregation Pipeline
    const pipeline = [
      // Match Groups for this Teacher (Active Only)
      { 
        $match: { 
          teacher: new mongoose.Types.ObjectId(teacherId),
          activeStatus: true
        } 
      },
      
      // Lookup Sections (Past Sections) to determine "Total Days"
      {
        $lookup: {
          from: 'sections',
          let: { groupName: '$name' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$group', '$$groupName'] },
                    { $lte: ['$date', new Date()] }
                  ]
                }
              }
            },
            { 
               $group: { 
                 _id: null, 
                 // Count unique dates just in case
                 dates: { $addToSet: { $dateToString: { format: "%Y-%m-%d", date: "$date" } } }
               } 
            }
          ],
          as: 'sectionStats'
        }
      },

      // Lookup Students for each Group (جلب كل الحقول بما فيها phoneNumber و gender)
      {
        $lookup: {
          from: 'students',
          let: { groupName: '$name' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$group', '$$groupName'] }
              }
            },
            {
              $project: {
                _id: 1,
                studentId: 1,
                firstName: 1,
                fatherName: 1,
                lastName: 1,
                phoneNumber: 1,
                gender: 1,
                group: 1
              }
            }
          ],
          as: 'students'
        }
      },
      
      // Unwind Students to process each one (remove empty groups)
      { $unwind: { path: '$students', preserveNullAndEmptyArrays: false } },

      // Exclude Expelled Students Logic Removed
      // Since suspended students have group=null, they won't appear here anyway.
      
      // Lookup Today's Attendance for each student
      {
        $lookup: {
          from: 'attendances',
          let: { studentId: '$students._id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$studentId', '$$studentId'] },
                    { $gte: ['$date', targetDateStart] },
                    { $lt: ['$date', targetDateEnd] }
                  ]
                }
              }
            },
            { $project: { isPresent: 1 } }
          ],
          as: 'todayAttendance'
        }
      },

      // Lookup Absence Stats (Only if requested)
      ...(includeAbsenceStats === 'true' ? [{
        $lookup: {
          from: 'attendances',
          let: { studentId: '$students._id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$studentId', '$$studentId'] },
                    { $eq: ['$isPresent', false] }
                  ]
                }
              }
            },
            {
              $group: {
                _id: null,
                totalAbsences: { $sum: 1 },
                absenceDates: { $push: '$date' }
              }
            }
          ],
          as: 'absenceStats'
        }
      }] : []),

      // Project final shape for this row
      {
        $project: {
          groupId: '$_id',
          groupName: '$name',
          groupStatus: '$activeStatus',
          totalSectionDays: { 
             $size: { $ifNull: [{ $arrayElemAt: ['$sectionStats.dates', 0] }, []] } 
          },
          student: '$students',
          todayAttendance: { $arrayElemAt: ['$todayAttendance', 0] },
          absenceStats: { $arrayElemAt: ['$absenceStats', 0] }
        }
      }
    ];

    const results = await Group.aggregate(pipeline);

    // 5. Process Results
    const groupsMap = new Map();
    const studentsList = [];
    let presentToday = 0;
    let absentToday = 0;

    for (const row of results) {
      // Process Group
      if (!groupsMap.has(row.groupId.toString())) {
        groupsMap.set(row.groupId.toString(), {
          _id: row.groupId,
          name: row.groupName,
          status: row.groupStatus ? 'active' : 'inactive',
          totalStudents: 0,
          totalSectionDays: row.totalSectionDays || 0,
          totalAbsencesAccumulated: 0
        });
      }

      // Process Student (if exists)
      if (row.student) {
        const group = groupsMap.get(row.groupId.toString());
        group.totalStudents++;

        // 🔧 تحديد حالة الحضور:
        // 1. إذا كان هناك سجل محفوظ لهذا التاريخ، استخدمه
        // 2. إذا لم يكن هناك سجل، افتراضياً حاضر (لأول مرة)
        const isPresent = row.todayAttendance 
          ? row.todayAttendance.isPresent 
          : true; // افتراضياً حاضر عند التحميل الأول
        
        if (isPresent) presentToday++;
        else absentToday++;

        const studentTotalAbsences = row.absenceStats ? row.absenceStats.totalAbsences : 0;
        group.totalAbsencesAccumulated += studentTotalAbsences;

        // Calculate Student Attendance Rate (Based on Sections)
        const totalPotentialDays = Math.max(1, group.totalSectionDays);
        const daysPresent = Math.max(0, group.totalSectionDays - studentTotalAbsences);
        const attendanceRate = Math.round((daysPresent / totalPotentialDays) * 100);

        // Format Absence Dates
        let formattedAbsenceDates = [];
        if (row.absenceStats && row.absenceStats.absenceDates) {
          formattedAbsenceDates = row.absenceStats.absenceDates
            .map(d => {
              const dateObj = new Date(d);
              return dateObj.toLocaleDateString('en-GB'); // DD/MM/YYYY
            })
            .sort((a, b) => { // Sort descending
               const [da, ma, ya] = a.split('/').map(Number);
               const [db, mb, yb] = b.split('/').map(Number);
               return new Date(yb, mb-1, db) - new Date(ya, ma-1, da);
            });
        }

        // تحويل الجنس من العربي إلى English
        let genderValue = 'male';
        if (row.student.gender) {
          const normalized = row.student.gender.toString().toLowerCase().trim();
          if (normalized === 'أنثى' || normalized === 'انثى' || normalized === 'female') {
            genderValue = 'female';
          }
        }

        // Debug: طباعة البيانات للتحقق
        console.log('🔍 Student Data from DB:', {
          name: `${row.student.firstName} ${row.student.fatherName || ''} ${row.student.lastName}`.trim().replace(/\s+/g, ' '),
          phoneNumber: row.student.phoneNumber,
          gender: row.student.gender,
          converted: genderValue,
          rawStudent: row.student
        });

        studentsList.push({
          _id: row.student._id,
          studentId: row.student.studentId,
          name: `${row.student.firstName} ${row.student.fatherName || ''} ${row.student.lastName}`.trim().replace(/\s+/g, ' '),
          gender: genderValue,
          phoneNumber: row.student.phoneNumber || '',
          group: row.groupName,
          teacher: teacherName,
          isPresent: isPresent,
          totalAbsences: studentTotalAbsences,
          absenceDates: formattedAbsenceDates,
          attendanceRate: attendanceRate
        });
      }
    }

    const groups = Array.from(groupsMap.values()).map(g => {
        // Calculate Group Monthly Rate (Rough average)
        const totalPotentialPresence = g.totalStudents * g.totalSectionDays;
        const totalActualAbsence = g.totalAbsencesAccumulated;
        
        let overallRate = 0;
        if (totalPotentialPresence > 0) {
            overallRate = Math.round(((totalPotentialPresence - totalActualAbsence) / totalPotentialPresence) * 100);
        } else {
            // If no sections yet, assume 100% or 0%? 100% is friendlier.
             overallRate = 100;
        }

        return {
            ...g,
            overallAttendanceRate: overallRate,
            // Cleanup internal fields
            totalSectionDays: undefined,
            totalAbsencesAccumulated: undefined
        };
    });
    
    // Sort groups by name
    groups.sort((a, b) => a.name.localeCompare(b.name, 'ar'));

    // Debug: طباعة عينة من البيانات النهائية
    console.log('📤 Sample student data being sent:', studentsList.slice(0, 2).map(s => ({
      name: s.name,
      phoneNumber: s.phoneNumber,
      gender: s.gender
    })));

    // 🆕 التحقق إذا تم أخذ الحضور لهذا التاريخ
    // يعتبر الحضور مسجل إذا كان هناك سجل واحد على الأقل لأي طالب في هذا التاريخ
    const hasExistingAttendance = studentsList.some(s => {
      // نتحقق إذا الطالب لديه سجل محفوظ (ليس افتراضي)
      const studentRow = results.find(r => r.student && r.student._id.toString() === s._id.toString());
      return studentRow && studentRow.todayAttendance;
    });

    console.log(`📋 [Attendance] Date: ${dateKey}, isAttendanceTaken: ${hasExistingAttendance}`);

    return res.json({
      success: true,
      data: {
        teacher: {
          _id: teacher._id,
          name: teacherName
        },
        groups,
        students: studentsList,
        // 🆕 معلومات إضافية للـ Frontend
        attendanceInfo: {
          date: dateKey,
          isAttendanceTaken: hasExistingAttendance, // ✅ هل تم أخذ الحضور؟
          totalRecords: hasExistingAttendance ? studentsList.length : 0
        },
        summary: {
          totalStudents: studentsList.length,
          presentToday,
          absentToday,
          attendanceRateToday: studentsList.length > 0 
            ? Math.round((presentToday / studentsList.length) * 100)
            : 0
        }
      }
    });

  } catch (error) {
    console.error('❌ [Attendance Optimized] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب البيانات',
      error: error.message
    });
  }
};
