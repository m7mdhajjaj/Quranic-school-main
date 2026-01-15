/**
 * ============================================================================
 * Secretary Controller - إدارة السكرتير
 * ============================================================================
 * 
 * هذا الملف يجمع كل الـ Controllers من الملفات المنفصلة
 * كل وظيفة موجودة في ملف منفصل لتسهيل الصيانة والقراءة
 */

// استيراد جميع الوظائف من الملفات المنفصلة
const getAllSecretaries = require("./getAllSecretaries");
const getSecretaryById = require("./getSecretaryById");
const createSecretary = require("./createSecretary");
const updateSecretary = require("./updateSecretary");
const updateSecretaryPermissions = require("./updateSecretaryPermissions");
const deleteSecretary = require("./deleteSecretary");
const changeSecretaryPassword = require("./changeSecretaryPassword");
const getCurrentSecretary = require("./getCurrentSecretary");
const getSecretaryStats = require("./getSecretaryStats");
const checkDuplicate = require("./checkDuplicate");

// تصدير جميع الوظائف
module.exports = {
  getAllSecretaries,
  getSecretaryById,
  createSecretary,
  updateSecretary,
  updateSecretaryPermissions,
  deleteSecretary,
  changeSecretaryPassword,
  getCurrentSecretary,
  getSecretaryStats,
  checkDuplicate,
};
