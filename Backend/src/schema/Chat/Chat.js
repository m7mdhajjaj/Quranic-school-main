const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    // نوع الرسالة: محادثة خاصة أو حلقة (جروب)
    chatType: {
      type: String,
      enum: ["DM", "GROUP"],
      required: true,
      index: true,
    },

    // مرسل الرسالة (طالب/معلم/أدمن إذا بدك تضيفه)
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "senderModel",
      index: true,
    },
    senderModel: {
      type: String,
      required: true,
      enum: ["Teacher", "Student", "Admin"], // إذا ما عندك Admin احذفها
    },

    // ============ DM ============
    // الطرف الآخر فقط في DM
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "recipientModel",
      required: function () {
        return this.chatType === "DM";
      },
      index: true,
    },
    recipientModel: {
      type: String,
      enum: ["Teacher", "Student", "Admin"],
      required: function () {
        return this.chatType === "DM";
      },
    },

    // ============ GROUP ============
    // رقم الحلقة (GroupId) فقط في GROUP
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: function () {
        return this.chatType === "GROUP";
      },
      index: true,
    },

    // محتوى الرسالة
    text: {
      type: String,
      trim: true,
      required: function () {
        // لو عندك attachments ممكن ما يكون text إلزامي
        return !this.attachments || this.attachments.length === 0;
      },
      maxlength: 4000,
    },

    // مرفقات (اختياري)
    attachments: [
      {
        url: { type: String, required: true },
        type: { type: String, enum: ["image", "file", "audio"], default: "file" },
        name: { type: String },
        size: { type: Number },
      },
    ],

    // Reply
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      default: null,
    },

    // حالة التسليم/القراءة (DM: سهلة، GROUP: بدنا arrays)
    // DM: نخزن deliveredAt/readAt مباشرة
    deliveredAt: { type: Date, default: null },
    readAt: { type: Date, default: null },

    // GROUP: لكل عضو (مهم!)
    deliveredTo: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
        deliveredAt: { type: Date, required: true },
      },
    ],
    seenBy: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
        seenAt: { type: Date, required: true },
      },
    ],

    // Soft delete (بدل حذف فعلي)
    deletedFor: [{ type: mongoose.Schema.Types.ObjectId, index: true }],
    deletedForAll: { type: Boolean, default: false },

    // للـ optimistic UI
    clientTempId: { type: String, default: null, index: true },

    // Edit tracking
    edited: { type: Boolean, default: false },
    editedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Indexes للأداء
chatSchema.index({ chatType: 1, groupId: 1, createdAt: -1 });
chatSchema.index({ chatType: 1, sender: 1, recipient: 1, createdAt: -1 });

module.exports = mongoose.model("Chat", chatSchema);
