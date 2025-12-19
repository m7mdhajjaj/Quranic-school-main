// ============================================================================
// schema/Student/index.js - Student Schemas Entry Point
// ============================================================================

const Student = require('./Student');
const StudentHistory = require('./StudentHistory');

// Export Student model as default (backward compatibility)
module.exports = Student;

// Export named exports for StudentHistory
module.exports.Student = Student;
module.exports.StudentHistory = StudentHistory;
