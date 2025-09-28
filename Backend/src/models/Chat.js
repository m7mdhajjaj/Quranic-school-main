const mongoose = require("mongoose");

const chatSchema = mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "senderModel",
    },
    senderModel: {
      type: String,
      required: true,
      enum: ["Teacher", "Student"],
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "recipientModel",
    },
    recipientModel: {
      type: String,
      enum: ["Teacher", "Student", "Group"],
    },
    isGroupMessage: {
      type: Boolean,
      default: false,
    },
    group: {
      type: String,
      required: function () {
        return this.isGroupMessage;
      },
    },
    text: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    delivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Chat", chatSchema);
