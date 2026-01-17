const Notification = require("../../schema/Notfcation/Notification");
const { sendRealTimeNotification } = require("../Core/SocketSender");
const { sendPushNotification } = require("../Core/PushSender");

exports.notifyExamCreated = async (exam, io) => {
  // Stub
};

exports.notifyExamUpdated = async (exam, io) => {
  // Stub
};

exports.notifyExamDeleted = async (exam, io) => {
  // Stub
};
