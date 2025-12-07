// ============================================================================
// examScheduleController.js - Main Entry Point
// ============================================================================
// تم تقسيم الكود إلى ملفات منفصلة داخل مجلد ExamShedule/ للتعديل بشكل مستقل

const getExams = require('./getExams');
const addExam = require('./addExam');
const updateExam = require('./updateExam');
const deleteExam = require('./deleteExam');

module.exports = {
  getExams,
  addExam,
  updateExam,
  deleteExam,
};

