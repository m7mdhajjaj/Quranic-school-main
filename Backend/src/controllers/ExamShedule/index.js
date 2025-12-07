// ============================================================================
// index.js - Exam Schedule Controller Entry Point
// ============================================================================
// يجمع كل وظائف الامتحانات من الملفات المنفصلة

const getExams = require("./getExams");
const addExam = require("./addExam");
const updateExam = require("./updateExam");
const deleteExam = require("./deleteExam");

module.exports = {
  getExams,
  addExam,
  updateExam,
  deleteExam,
};
