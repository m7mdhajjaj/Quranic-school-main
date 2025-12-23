const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["DM", "GROUP"],
      required: true,
    },
    // For DM: 2 participants. For GROUP: can be empty or just track members (but members are in Group model)
    // We'll use this mainly for DMs to find the conversation quickly.
    // For Groups, we might just rely on the Group model, but having a Conversation entry helps unify the list.
    participants: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "participants.userModel" },
        userModel: { type: String, required: true, enum: ["Teacher", "Student", "Admin"] },
        mutedUntil: { type: Date, default: null }
      },
    ],
    
    // Only for GROUP
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      index: true,
    },

    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },

    // Unread count per user
    unreadCounts: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId },
        count: { type: Number, default: 0 },
      },
    ],

    // Users who deleted this conversation (Soft Delete)
    deletedFor: [{ type: mongoose.Schema.Types.ObjectId }],
  },
  { timestamps: true }
);

// Index for finding DM between two users
conversationSchema.index({ type: 1, "participants.userId": 1 });
conversationSchema.index({ updatedAt: -1 });

module.exports = mongoose.model("Conversation", conversationSchema);
