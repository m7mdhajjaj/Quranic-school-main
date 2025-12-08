// ============================================================================
// index.js - Exam Mark Controller Entry Point
// ============================================================================
// يجمع كل وظائف علامات الامتحانات من الملفات المنفصلة

const { getStudentMarks, getExamMarks } = require("./getMarks");
const { setExamMarks } = require("./setMarks");
const { updateStudentMark } = require("./updateMark");
const { deleteStudentMark, bulkDeleteMarks } = require("./deleteMark");
const { getExamAverage } = require("../Exam/examAverage");

module.exports = {
  getStudentMarks,
  getExamMarks,
  setExamMarks,
  updateStudentMark,
  deleteStudentMark,
  bulkDeleteMarks,
  getExamAverage,
};
