// ============================================================================
// examHelpers.js - Helper Functions for Exam Controller
// ============================================================================

/**
 * Check if time is within allowed range (12:00 - 21:00)
 */
const isTimeWithinAllowedRange = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return false;
  const parts = timeStr.split(":");
  if (parts.length < 2) return false;
  const h = Number(parts[0]);
  const m = Number(parts[1]);
  if (Number.isNaN(h) || Number.isNaN(m)) return false;
  const total = h * 60 + m;
  const MIN = 12 * 60; // 12:00
  const MAX = 21 * 60; // 21:00
  return total >= MIN && total <= MAX;
};

/**
 * Build duplicate query for checking existing exams
 * Rule: One exam per group per day
 */
const buildDuplicateQuery = (date, group) => {
  if (group) {
    return { date, group };
  }
  return {
    date,
    $or: [
      { group: { $exists: false } },
      { group: null },
      { group: "" },
    ],
  };
};

/**
 * Check if group already has an exam on the same date
 * Rule: Each group can have only ONE exam per day
 * @param {Date} date - Exam date
 * @param {string} group - Group name
 * @param {string} excludeExamId - Exam ID to exclude (for updates)
 * @returns {Promise<Object|null>} Existing exam or null
 */
const checkGroupDailyLimit = async (date, group, excludeExamId = null) => {
  const ExamSchedule = require("../../../schema/ExamSchedule");
  
  if (!date || !group) return null;

  const query = {
    date: new Date(date),
    group: group,
  };
  
  if (excludeExamId) {
    query._id = { $ne: excludeExamId };
  }

  const existingExam = await ExamSchedule.findOne(query).lean();
  
  if (existingExam) {
    return {
      existingExam,
      message: `الحلقة "${group}" لديها بالفعل امتحان في هذا اليوم (${existingExam.name || existingExam.title}). كل حلقة يمكن أن يكون لها امتحان واحد فقط في اليوم.`
    };
  }

  return null;
};

/**
 * Validate exam duration in minutes (max 2 hours = 120 minutes)
 */
const validateDuration = (duration) => {
  if (!duration) {
    return { isValid: true, value: 60 }; // Default 60 minutes
  }
  
  const durationNum = parseInt(duration);
  if (isNaN(durationNum) || durationNum < 5) {
    return { isValid: false, message: 'مدة الامتحان يجب أن تكون 5 دقائق على الأقل' };
  }
  
  if (durationNum > 120) { // 2 hours max
    return { isValid: false, message: 'مدة الامتحان لا يمكن أن تزيد عن ساعتين (120 دقيقة)' };
  }
  
  return { isValid: true, value: durationNum };
};

/**
 * Check if teacher has time conflict with existing exams
 * Requires minimum 2 hours gap between exams
 * @param {string} teacherId - Teacher ID
 * @param {Date} date - Exam date
 * @param {string} time - Exam time (HH:MM)
 * @param {string} duration - Exam duration in minutes
 * @param {string} excludeExamId - Exam ID to exclude (for updates)
 * @returns {Promise<Object|null>} Conflicting exam or null
 */
const checkTeacherTimeConflict = async (teacherId, date, time, duration = 60, excludeExamId = null) => {
  const ExamSchedule = require("../../../schema/ExamSchedule");
  const Group = require("../../../schema/Group");
  
  if (!teacherId || !date || !time) return null;

  // Get teacher's groups to find all exams by this teacher
  const teacherGroups = await Group.find({ teacher: teacherId }).select('name').lean();
  if (!teacherGroups || teacherGroups.length === 0) return null;
  
  const groupNames = teacherGroups.map(g => g.name);

  // Convert time to minutes for comparison
  const [hours, minutes] = time.split(':').map(Number);
  const examStartMinutes = hours * 60 + minutes;
  const examEndMinutes = examStartMinutes + parseInt(duration);

  // Minimum gap required: 2 hours (120 minutes)
  const MIN_GAP_MINUTES = 120;

  // Find ALL exams on same date for ANY of teacher's groups
  // This ensures we check across all groups the teacher has
  const query = {
    date: new Date(date),
    group: { $in: groupNames },
    time: { $exists: true, $ne: null }
  };
  
  if (excludeExamId) {
    query._id = { $ne: excludeExamId };
  }

  const existingExams = await ExamSchedule.find(query).lean();

  // Check for time conflicts with 2-hour gap requirement
  for (const exam of existingExams) {
    const [existHours, existMinutes] = exam.time.split(':').map(Number);
    const existStartMinutes = existHours * 60 + existMinutes;
    const existEndMinutes = existStartMinutes + (exam.duration || 60);

    // Check if times overlap (direct conflict)
    const hasDirectConflict = (
      (examStartMinutes >= existStartMinutes && examStartMinutes < existEndMinutes) ||
      (examEndMinutes > existStartMinutes && examEndMinutes <= existEndMinutes) ||
      (examStartMinutes <= existStartMinutes && examEndMinutes >= existEndMinutes)
    );

    if (hasDirectConflict) {
      return {
        conflictingExam: exam,
        message: `تعارض مباشر في الوقت مع امتحان "${exam.name}" للحلقة "${exam.group}" في نفس الوقت (${exam.time})`
      };
    }

    // Check if gap is less than 2 hours
    // Calculate gap between exams
    let gapMinutes;
    if (examStartMinutes < existStartMinutes) {
      // New exam is before existing exam
      gapMinutes = existStartMinutes - examEndMinutes;
    } else {
      // New exam is after existing exam
      gapMinutes = examStartMinutes - existEndMinutes;
    }

    if (gapMinutes < MIN_GAP_MINUTES) {
      const gapHours = Math.floor(gapMinutes / 60);
      const gapMins = gapMinutes % 60;
      const gapText = gapHours > 0 
        ? `${gapHours} ساعة و ${gapMins} دقيقة`
        : `${gapMins} دقيقة`;

      return {
        conflictingExam: exam,
        message: `يجب أن يكون الفارق بين الامتحانات ساعتين على الأقل. الفارق الحالي مع امتحان "${exam.name}" للحلقة "${exam.group}" (${exam.time}) هو ${gapText} فقط`
      };
    }
  }

  return null;
};

module.exports = {
  isTimeWithinAllowedRange,
  buildDuplicateQuery,
  checkTeacherTimeConflict,
  checkGroupDailyLimit,
  validateDuration,
};
