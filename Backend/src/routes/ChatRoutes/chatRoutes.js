const express = require("express");
const router = express.Router();
const { 
  ContactsController, 
  MessageController, 
  ConversationController, 
  GroupController 
} = require("../../controllers/ChatController");
const { protect } = require("../../middleware/auth/protect.middleware");
const { validate } = require("../../middleware");
const { messageLimiter, apiLimiter } = require("../../middleware");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../../config/cloudinary");
const {
  sendMessageSchema,
  getMessagesSchema,
  markSeenSchema,
  resetUnreadCountSchema,
  editMessageSchema,
  deleteMessageSchema
} = require("../../Validation/Chat/chatValidation");

// Configure Cloudinary storage for chat attachments
const chatStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'quranic-school/chat-attachments',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'mp3', 'mp4'],
    resource_type: 'auto',
  }
});

const upload = multer({ 
  storage: chatStorage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

// All routes require authentication
router.use(protect);
router.use(apiLimiter); // General API rate limit

// ============================================================================
// Contacts & Groups Routes
// ============================================================================
router.get("/contacts", ContactsController.getContacts);
router.post("/initialize-groups", GroupController.initializeGroupConversations);

// ============================================================================
// Conversations Routes
// ============================================================================
router.get("/conversations", ConversationController.getConversations);
router.post("/conversations/reset-unread", validate(resetUnreadCountSchema), ConversationController.resetUnreadCount);

// ============================================================================
// Messages Routes
// ============================================================================
router.get("/messages", validate(getMessagesSchema, 'query'), MessageController.getMessages);
router.post("/messages", messageLimiter, validate(sendMessageSchema), MessageController.sendMessage);
router.post("/messages/seen", validate(markSeenSchema), MessageController.markSeen);
router.patch("/messages/:id", validate(editMessageSchema), MessageController.editMessage);
router.delete("/messages/:id", validate(deleteMessageSchema), MessageController.deleteMessage);

// ============================================================================
// Upload Routes
// ============================================================================
router.post("/upload", upload.single('file'), MessageController.uploadAttachment);

module.exports = router;
