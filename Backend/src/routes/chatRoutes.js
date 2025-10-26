const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");
const { validateChatData } = require("../Validation/Chat/ChatValidation");

// Get all messages for a user
router.get("/user/:userId/:userType", protect, chatController.getUserMessages);

// Get group messages
router.get("/group/:group", protect, chatController.getGroupMessages);

// Get conversation between two users
router.get(
  "/conversation/:senderId/:senderType/:recipientId/:recipientType",
  protect,
  chatController.getConversation,
);

// Create a message
router.post("/", protect, validateChatData, chatController.createMessage);

// Send a message (with optional reply)
router.post("/send", protect, validateChatData, chatController.createMessage);

// Mark messages as read
router.put("/read", protect, chatController.markAsRead);

// Get teachers for a student to chat with
router.get("/teachers/:studentId", protect, chatController.getTeachers);

// Get students for a teacher
router.get("/students/:teacherId", protect, chatController.getStudents);

// Get unread message count
router.get("/unread/:userId/:userType", protect, chatController.getUnreadCount);

module.exports = router;
