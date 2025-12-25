const { z } = require("zod");

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const sendMessageSchema = z.object({
  chatType: z.enum(["DM", "GROUP"]),
  recipientId: z.string().regex(objectIdRegex).optional(), // Required if DM
  groupId: z.string().regex(objectIdRegex).optional(), // Required if GROUP
  text: z.string().max(4000).optional(),
  attachments: z.array(
    z.object({
      url: z.string().url(),
      type: z.enum(["image", "file", "audio"]),
      name: z.string().optional(),
      size: z.number().optional(),
    })
  ).optional(),
  replyTo: z.string().regex(objectIdRegex).optional().nullable(),
  clientTempId: z.string().optional(),
  mentions: z.array(
    z.object({
      type: z.enum(["user", "all"]),
      user: z.any().optional(), // Accept ID or Object, we'll handle it in service
    })
  ).optional(),
}).refine((data) => {
  if (data.chatType === "DM" && !data.recipientId) return false;
  if (data.chatType === "GROUP" && !data.groupId) return false;
  if (!data.text && (!data.attachments || data.attachments.length === 0)) return false;
  return true;
}, {
  message: "Invalid message data: Missing recipient/group or content",
});

const getMessagesSchema = z.object({
  chatType: z.enum(["DM", "GROUP"]),
  targetId: z.string().regex(objectIdRegex), // recipientId or groupId
  limit: z.coerce.number().min(1).max(100).default(50),
  before: z.string().datetime().optional(), // For pagination
});

const markSeenSchema = z.object({
  messageId: z.string().regex(objectIdRegex),
  chatType: z.enum(["DM", "GROUP"]), // Helpful for optimization
});

const resetUnreadCountSchema = z.object({
  chatType: z.enum(["DM", "GROUP"]),
  targetId: z.string().regex(objectIdRegex),
});

const editMessageSchema = z.object({
  text: z.string().min(1).max(4000, "الرسالة يجب أن لا تتجاوز 4000 حرف"),
});

const deleteMessageSchema = z.object({
  deleteForAll: z.boolean().optional().default(false),
});

const fcmTokenSchema = z.object({
  token: z.string().min(1, "FCM token is required"),
  platform: z.enum(["web", "ios", "android", "unknown"]).optional().default("web"),
});

const removeFcmTokenSchema = z.object({
  token: z.string().min(1, "FCM token is required"),
});

module.exports = {
  sendMessageSchema,
  getMessagesSchema,
  markSeenSchema,
  resetUnreadCountSchema,
  editMessageSchema,
  deleteMessageSchema,
  fcmTokenSchema,
  removeFcmTokenSchema,
};
