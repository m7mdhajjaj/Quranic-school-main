const Attendance = require("../../schema/Attendance");
const Student = require("../../schema/Student");

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
