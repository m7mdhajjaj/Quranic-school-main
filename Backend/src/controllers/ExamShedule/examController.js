// ============================================================================
// examController.js - Main Entry Point
// ============================================================================
// تم تقسيم الكود إلى ملفات منفصلة داخل مجلد exam/ للتعديل بشكل مستقل

const examController = require('.');

exports.getExams = examController.getExams;
exports.addExam = examController.addExam;
exports.updateExam = examController.updateExam;
exports.deleteExam = examController.deleteExam;

