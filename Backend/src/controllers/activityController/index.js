/**
 * Activity Controller - Central Exports
 * Modular structure for activity management
 */

const { getAllActivities, getActivityById } = require("./getActivities");
const { createActivity } = require("./createActivity");
const { updateActivity } = require("./updateActivity");
const { deleteActivity } = require("./deleteActivity");

module.exports = {
  // GET operations
  getAllActivities,
  getActivityById,

  // POST operations
  createActivity,

  // PUT operations
  updateActivity,

  // DELETE operations
  deleteActivity,
};
