const mongoose = require('mongoose');
const Group = require('../../schema/Group');
const Student = require('../../schema/Student');
const Teacher = require('../../schema/Teacher');
const Attendance = require('../../schema/Attendance');

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

    // 2. Get Teacher Info (Parallel with Aggregation if possible, but await here is fine)
    const teacher = await Teacher.findById(teacherId).select('firstName lastName fatherName');
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'المعلم غير موجود' });
    }
    const teacherName = `${teacher.firstName} ${teacher.lastName}`;

    // 3. Prepare Date Range for "Today's" Attendance
    let targetDateStart, targetDateEnd;
    if (date) {
      targetDateStart = new Date(date);
      targetDateStart.setHours(0, 0, 0, 0);
    } else {
      targetDateStart = new Date();
      targetDateStart.setHours(0, 0, 0, 0);
    }
    targetDateEnd = new Date(targetDateStart);
    targetDateEnd.setDate(targetDateStart.getDate() + 1);

    // 4. Aggregation Pipeline
    const pipeline = [
      // Match Groups for this Teacher (Active Only)
      { 
        $match: { 
          teacher: new mongoose.Types.ObjectId(teacherId),
          activeStatus: true
        } 
      },
      
      // Lookup Students for each Group
      {
        $lookup: {
          from: 'students',
          localField: 'name',
          foreignField: 'group',
          as: 'students'
        }
      },
      
      // Unwind Students to process each one (remove empty groups)
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
          status: row.groupStatus ? 'active' : 'inactive', // Map boolean to string if needed
          totalStudents: 0
        });
      }

      // Process Student (if exists)
      if (row.student) {
        const group = groupsMap.get(row.groupId.toString());
        group.totalStudents++;

        const isPresent = row.todayAttendance ? row.todayAttendance.isPresent : true; // Default to present
        
        if (isPresent) presentToday++;
        else absentToday++;

        // Format Absence Dates
        let formattedAbsenceDates = [];
        if (row.absenceStats && row.absenceStats.absenceDates) {
          formattedAbsenceDates = row.absenceStats.absenceDates
            .map(d => {
              const dateObj = new Date(d);
              return dateObj.toLocaleDateString('en-GB'); // DD/MM/YYYY
            })
            .sort((a, b) => {
               // Sort descending
               const [da, ma, ya] = a.split('/').map(Number);
               const [db, mb, yb] = b.split('/').map(Number);
               return new Date(yb, mb-1, db) - new Date(ya, ma-1, da);
            });
        }

        studentsList.push({
          _id: row.student._id,
          studentId: row.student.studentId,
          name: `${row.student.firstName} ${row.student.lastName}`, // Full name
          group: row.groupName,
          teacher: teacherName,
          isPresent: isPresent,
          totalAbsences: row.absenceStats ? row.absenceStats.totalAbsences : 0,
          absenceDates: formattedAbsenceDates
        });
      }
    }

    const groups = Array.from(groupsMap.values());
    
    // Sort groups by name
    groups.sort((a, b) => a.name.localeCompare(b.name, 'ar'));

    return res.json({
      success: true,
      data: {
        teacher: {
          _id: teacher._id,
          name: teacherName
        },
        groups,
        students: studentsList,
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
