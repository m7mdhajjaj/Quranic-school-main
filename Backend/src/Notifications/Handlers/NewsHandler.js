const Notification = require("../../schema/Notification");
const { sendRealTimeNotification } = require("../Core/SocketSender");
const { sendPushNotification } = require("../Core/PushSender");

exports.notifyNewsCreated = async (news, io) => {
  // Stub
};

exports.notifyNewsUpdated = async (news, io) => {
  // Stub
};

exports.notifyNewsDeleted = async (news, io) => {
  // Stub
};

exports.notifyNewsPublished = async (news, io) => {
  // Stub
};

exports.notifyNewsArchived = async (news, io) => {
  // Stub
};

exports.notifyBulkNewsCreated = async (newsList, io) => {
  // Stub
};

exports.notifyBulkNewsUpdated = async (newsList, io) => {
  // Stub
};

exports.notifyBulkNewsDeleted = async (ids, io) => {
  // Stub
};

exports.notifyViewsIncremented = async (news, io) => {
  // Stub
};
