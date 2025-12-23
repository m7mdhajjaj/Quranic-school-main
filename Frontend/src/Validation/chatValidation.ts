import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const sendMessageSchema = z.object({
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
}).refine((data) => {
  if (data.chatType === "DM" && !data.recipientId) return false;
  if (data.chatType === "GROUP" && !data.groupId) return false;
  if (!data.text && (!data.attachments || data.attachments.length === 0)) return false;
  return true;
}, {
  message: "Invalid message data: Missing recipient/group or content",
});

export const getMessagesSchema = z.object({
  chatType: z.enum(["DM", "GROUP"]),
  targetId: z.string().regex(objectIdRegex), // recipientId or groupId
  limit: z.coerce.number().min(1).max(100).default(50),
  before: z.string().datetime().optional(), // For pagination
});

export const markSeenSchema = z.object({
  messageId: z.string().regex(objectIdRegex),
  chatType: z.enum(["DM", "GROUP"]),
});

export const editMessageSchema = z.object({
  text: z.string().min(1, "الرسالة لا يمكن أن تكون فارغة").max(4000, "الرسالة يجب أن لا تتجاوز 4000 حرف"),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type GetMessagesInput = z.infer<typeof getMessagesSchema>;
export type MarkSeenInput = z.infer<typeof markSeenSchema>;
export type EditMessageInput = z.infer<typeof editMessageSchema>;
