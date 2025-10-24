// ============================================================================
// index.js - News Controller Exports
// ============================================================================

const getNews = require("./getNews");
const createNews = require("./createNews");
const updateNews = require("./updateNews");
const deleteNews = require("./deleteNews");
const newsNotifications = require("./newsNotifications");

module.exports = {
  // Get operations
  getAllNews: getNews.getAllNews,
  getNewsById: getNews.getNewsById,
  searchNews: getNews.searchNews,
  getPublishedNews: getNews.getPublishedNews,

  // Create operations
  createNews: createNews.createNews,
  createBulkNews: createNews.createBulkNews,
  publishNews: createNews.publishNews,

  // Update operations
  updateNews: updateNews.updateNews,
  updateBulkNews: updateNews.updateBulkNews,
  incrementViews: updateNews.incrementViews,

  // Delete operations
  deleteNews: deleteNews.deleteNews,
  deleteBulkNews: deleteNews.deleteBulkNews,
  archiveNews: deleteNews.archiveNews,
  clearArchivedNews: deleteNews.clearArchivedNews,

  // Notifications
  notifyNewsCreated: newsNotifications.notifyNewsCreated,
  notifyNewsUpdated: newsNotifications.notifyNewsUpdated,
  notifyNewsDeleted: newsNotifications.notifyNewsDeleted,
  notifyNewsPublished: newsNotifications.notifyNewsPublished,
  notifyNewsArchived: newsNotifications.notifyNewsArchived,
  notifyBulkNewsCreated: newsNotifications.notifyBulkNewsCreated,
  notifyBulkNewsUpdated: newsNotifications.notifyBulkNewsUpdated,
  notifyBulkNewsDeleted: newsNotifications.notifyBulkNewsDeleted,
  notifyViewsIncremented: newsNotifications.notifyViewsIncremented,
};
