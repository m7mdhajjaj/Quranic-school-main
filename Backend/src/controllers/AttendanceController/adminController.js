const mongoose = require('mongoose');
const Group = require('../../schema/Group');
const Student = require('../../schema/Student');
const Teacher = require('../../schema/Teacher');
const Attendance = require('../../schema/Attendance');
const Section = require("../../schema/DailyMark/Section");

/**
 * Get all active groups for admin with full attendance data
 * GET /api/attendance/admin/groups
 * 
 * Similar to getTeacherGroupsForAttendance but for ALL groups
 */
exports.getAllGroupsForAdmin = async (req, res) => {
  try {
    const { 
      date,
      includeAbsenceStats = 'true'
    } = req.query;

    // 1. Prepare Date Range - ✅ Use UTC dates
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

    console.log(`📅 [Admin Groups] Date range: ${targetDateStart.toISOString()} to ${targetDateEnd.toISOString()}, dateKey: ${dateKey}`);

    // 2. Aggregation Pipeline - جلب كل الحلقات الفعالة
    const pipeline = [
      // Match ALL Active Groups
      { 
        $match: { 
          activeStatus: true
        } 
      },
      
      // Lookup Teacher for each Group
      {
        $lookup: {
          from: 'teachers',
          localField: 'teacher',
          foreignField: '_id',
          as: 'teacherInfo'
        }
      },
      { $unwind: { path: '$teacherInfo', preserveNullAndEmptyArrays: true } },
      
      // Lookup Sections to determine "Total Days"
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
                 dates: { $addToSet: { $dateToString: { format: "%Y-%m-%d", date: "$date" } } }
               } 
            }
          ],
          as: 'sectionStats'
        }
      },

      // Lookup Students for each Group
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
      
      // Unwind Students
      { $unwind: { path: '$students', preserveNullAndEmptyArrays: false } },
      
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

      // Lookup Absence Stats
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

      // Project final shape
      {
        $project: {
          groupId: '$_id',
          groupName: '$name',
          groupStatus: '$activeStatus',
          teacherId: '$teacherInfo._id',
          teacherName: {
            $cond: {
              if: { $and: ['$teacherInfo.firstName', '$teacherInfo.lastName'] },
              then: {
                $trim: {
                  input: {
                    $concat: [
                      { $ifNull: ['$teacherInfo.firstName', ''] },
                      ' ',
                      { $ifNull: ['$teacherInfo.fatherName', ''] },
                      ' ',
                      { $ifNull: ['$teacherInfo.lastName', ''] }
                    ]
                  }
                }
              },
              else: 'غير محدد'
            }
          },
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

    // 3. Process Results
    const groupsMap = new Map();
    let totalPresentToday = 0;
    let totalAbsentToday = 0;

    for (const row of results) {
      const groupKey = row.groupId.toString();
      
      // Initialize Group
      if (!groupsMap.has(groupKey)) {
        groupsMap.set(groupKey, {
          _id: row.groupId,
          name: row.groupName,
          status: row.groupStatus ? 'active' : 'inactive',
          teacherId: row.teacherId,
          teacherName: row.teacherName,
          totalStudents: 0,
          totalSectionDays: row.totalSectionDays || 0,
          students: [],
          presentToday: 0,
          absentToday: 0
        });
      }

      const group = groupsMap.get(groupKey);
      
      // Process Student
      if (row.student) {
        group.totalStudents++;

        const isPresent = row.todayAttendance 
          ? row.todayAttendance.isPresent 
          : true;
        
        if (isPresent) {
          group.presentToday++;
          totalPresentToday++;
        } else {
          group.absentToday++;
          totalAbsentToday++;
        }

        const studentTotalAbsences = row.absenceStats ? row.absenceStats.totalAbsences : 0;

        // Format Absence Dates
        let formattedAbsenceDates = [];
        if (row.absenceStats && row.absenceStats.absenceDates) {
          formattedAbsenceDates = row.absenceStats.absenceDates
            .map(d => {
              const dateObj = new Date(d);
              return dateObj.toLocaleDateString('en-GB');
            })
            .sort((a, b) => {
               const [da, ma, ya] = a.split('/').map(Number);
               const [db, mb, yb] = b.split('/').map(Number);
               return new Date(yb, mb-1, db) - new Date(ya, ma-1, da);
            });
        }

        // Convert gender
        let genderValue = 'male';
        if (row.student.gender) {
          const normalized = row.student.gender.toString().toLowerCase().trim();
          if (normalized === 'أنثى' || normalized === 'انثى' || normalized === 'female') {
            genderValue = 'female';
          }
        }

        const totalPotentialDays = Math.max(1, group.totalSectionDays);
        const daysPresent = Math.max(0, group.totalSectionDays - studentTotalAbsences);
        const attendanceRate = Math.round((daysPresent / totalPotentialDays) * 100);

        group.students.push({
          _id: row.student._id,
          studentId: row.student.studentId,
          name: `${row.student.firstName} ${row.student.fatherName || ''} ${row.student.lastName}`.trim().replace(/\s+/g, ' '),
          gender: genderValue,
          phoneNumber: row.student.phoneNumber || '',
          group: row.groupName,
          isPresent: isPresent,
          totalAbsences: studentTotalAbsences,
          absenceDates: formattedAbsenceDates,
          attendanceRate: attendanceRate
        });
      }
    }

    // 4. Prepare Response
    const groups = Array.from(groupsMap.values()).map(g => {
      const attendanceRate = g.totalStudents > 0 
        ? Math.round((g.presentToday / g.totalStudents) * 100)
        : 0;

      return {
        _id: g._id,
        name: g.name,
        status: g.status,
        teacherId: g.teacherId,
        teacherName: g.teacherName,
        totalStudents: g.totalStudents,
        presentToday: g.presentToday,
        absentToday: g.absentToday,
        attendanceRate: attendanceRate,
        students: g.students
      };
    });
    
    // Sort by name
    groups.sort((a, b) => a.name.localeCompare(b.name, 'ar'));

    const totalStudents = groups.reduce((sum, g) => sum + g.totalStudents, 0);

    console.log(`✅ [Admin] Found ${groups.length} active groups with ${totalStudents} students`);

    return res.json({
      success: true,
      data: {
        groups,
        summary: {
          totalGroups: groups.length,
          totalStudents,
          presentToday: totalPresentToday,
          absentToday: totalAbsentToday,
          attendanceRate: totalStudents > 0 
            ? Math.round((totalPresentToday / totalStudents) * 100)
            : 0
        }
      }
    });

  } catch (error) {
    console.error('❌ [Admin Groups] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب البيانات',
      error: error.message
    });
  }
};

/**
 * Get students of a specific group for admin
 * GET /api/attendance/admin/groups/:groupId/students
 */
exports.getGroupStudentsForAdmin = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { date } = req.query;

    // Validate Group ID
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ success: false, message: 'معرف الحلقة غير صالح' });
    }

    // Get Group
    const group = await Group.findById(groupId).populate('teacher', 'firstName fatherName lastName');
    if (!group) {
      return res.status(404).json({ success: false, message: 'الحلقة غير موجودة' });
    }

    const teacherName = group.teacher 
      ? `${group.teacher.firstName} ${group.teacher.fatherName || ''} ${group.teacher.lastName}`.trim().replace(/\s+/g, ' ')
      : 'غير محدد';

    // Date handling
    let dateKey;
    if (date) {
      dateKey = new Date(date).toISOString().split('T')[0];
    } else {
      dateKey = new Date().toISOString().split('T')[0];
    }
    const targetDateStart = new Date(dateKey + 'T00:00:00.000Z');
    const targetDateEnd = new Date(dateKey + 'T00:00:00.000Z');
    targetDateEnd.setUTCDate(targetDateEnd.getUTCDate() + 1);

    // Get Students
    const students = await Student.find({ group: group.name }).lean();

    // Get Total Section Days
    const sectionCount = await Section.countDocuments({
      group: group.name,
      date: { $lte: new Date() }
    });

    // Get Attendance for each student
    const studentIds = students.map(s => s._id);
    
    // Today's attendance
    const todayAttendance = await Attendance.find({
      studentId: { $in: studentIds },
      date: { $gte: targetDateStart, $lt: targetDateEnd }
    }).lean();
    const todayAttendanceMap = new Map(todayAttendance.map(a => [a.studentId.toString(), a]));

    // All absences
    const absences = await Attendance.find({
      studentId: { $in: studentIds },
      isPresent: false
    }).lean();
    
    // Group absences by student
    const absenceMap = new Map();
    for (const absence of absences) {
      const key = absence.studentId.toString();
      if (!absenceMap.has(key)) {
        absenceMap.set(key, []);
      }
      absenceMap.get(key).push(absence.date);
    }

    // Format students
    let presentCount = 0;
    let absentCount = 0;
    
    const formattedStudents = students.map(s => {
      const todayRecord = todayAttendanceMap.get(s._id.toString());
      const isPresent = todayRecord ? todayRecord.isPresent : true;
      
      if (isPresent) presentCount++;
      else absentCount++;

      const studentAbsences = absenceMap.get(s._id.toString()) || [];
      const totalAbsences = studentAbsences.length;

      const formattedAbsenceDates = studentAbsences
        .map(d => new Date(d).toLocaleDateString('en-GB'))
        .sort((a, b) => {
          const [da, ma, ya] = a.split('/').map(Number);
          const [db, mb, yb] = b.split('/').map(Number);
          return new Date(yb, mb-1, db) - new Date(ya, ma-1, da);
        });

      let genderValue = 'male';
      if (s.gender) {
        const normalized = s.gender.toString().toLowerCase().trim();
        if (normalized === 'أنثى' || normalized === 'انثى' || normalized === 'female') {
          genderValue = 'female';
        }
      }

      const totalPotentialDays = Math.max(1, sectionCount);
      const daysPresent = Math.max(0, sectionCount - totalAbsences);
      const attendanceRate = Math.round((daysPresent / totalPotentialDays) * 100);

      return {
        _id: s._id,
        studentId: s.studentId,
        name: `${s.firstName} ${s.fatherName || ''} ${s.lastName}`.trim().replace(/\s+/g, ' '),
        gender: genderValue,
        phoneNumber: s.phoneNumber || '',
        group: group.name,
        isPresent,
        totalAbsences,
        absenceDates: formattedAbsenceDates,
        attendanceRate
      };
    });

    return res.json({
      success: true,
      data: {
        group: {
          _id: group._id,
          name: group.name,
          teacherName
        },
        students: formattedStudents,
        summary: {
          totalStudents: formattedStudents.length,
          presentToday: presentCount,
          absentToday: absentCount,
          attendanceRate: formattedStudents.length > 0 
            ? Math.round((presentCount / formattedStudents.length) * 100)
            : 0
        }
      }
    });

  } catch (error) {
    console.error('❌ [Admin Group Students] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب البيانات',
      error: error.message
    });
  }
};

/**
 * Get available dates (sections dates) for a specific group (Admin)
 * GET /api/attendance/admin/groups/:groupId/available-dates
 */
exports.getAvailableDatesForGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    // Validate Group ID
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'معرف الحلقة غير صالح' 
      });
    }

    // Get group
    const group = await Group.findById(groupId).select('name activeStatus');
    if (!group) {
      return res.status(404).json({ 
        success: false, 
        message: 'الحلقة غير موجودة' 
      });
    }

    if (!group.activeStatus) {
      return res.status(400).json({ 
        success: false, 
        message: 'الحلقة غير نشطة' 
      });
    }

    // Get all section dates for this group
    const sections = await Section.find({ group: group.name })
      .select('date')
      .sort({ date: -1 })
      .lean();

    // Format dates
    const availableDates = sections.map(s => 
      s.date.toISOString().split('T')[0] // YYYY-MM-DD format
    );

    // Remove duplicates
    const uniqueDates = [...new Set(availableDates)];

    return res.status(200).json({
      success: true,
      data: {
        dates: uniqueDates,
        total: uniqueDates.length,
        groupName: group.name
      }
    });

  } catch (error) {
    console.error('❌ [Admin Available Dates] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: error.message
    });
  }
};
