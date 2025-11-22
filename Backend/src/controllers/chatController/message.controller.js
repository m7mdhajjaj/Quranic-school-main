const Chat = require("../../schema/Chat");

/**
 * Get all messages for a specific user (student or teacher)
 */
exports.getUserMessages = async (req, res) => {
  try {
    const { userId, userType } = req.params;

    // Fetch direct messages where the user is either sender or recipient
    const messages = await Chat.find({
      $or: [
        { sender: userId, senderModel: userType },
        { recipient: userId, recipientModel: userType, isGroupMessage: false },
      ],
    })
      .sort({ createdAt: 1 })
      .populate({
        path: "sender",
        select: "firstName lastName",
      })
      .populate({
        path: "recipient",
        select: "firstName lastName",
      })
      .populate({
        path: "replyTo",
        select: "text sender createdAt",
        populate: {
          path: "sender",
          select: "firstName lastName"
        }
      });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res
      .status(500)
      .json({ message: "Error fetching messages", error: error.message });
  }
};

/**
 * Get group messages for a specific group
 */
exports.getGroupMessages = async (req, res) => {
  try {
    const { group } = req.params;

    const messages = await Chat.find({
      isGroupMessage: true,
      group: group,
    })
      .sort({ createdAt: 1 })
      .populate({
        path: "sender",
        select: "firstName lastName",
      })
      .populate({
        path: "replyTo",
        select: "text sender createdAt",
        populate: {
          path: "sender",
          select: "firstName lastName"
        }
      });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching group messages:", error);
    res
      .status(500)
      .json({ message: "Error fetching group messages", error: error.message });
  }
};

/**
 * Get conversation between two users
 */
exports.getConversation = async (req, res) => {
  try {
    const { senderId, senderType, recipientId, recipientType } = req.params;

    console.log("Fetching conversation with params:", {
      senderId,
      senderType,
      recipientId,
      recipientType,
    });
    console.log(
      "Database query:",
      JSON.stringify(
        {
          $or: [
            {
              sender: senderId,
              senderModel: senderType,
              recipient: recipientId,
              recipientModel: recipientType,
              isGroupMessage: false,
            },
            {
              sender: recipientId,
              senderModel: recipientType,
              recipient: senderId,
              recipientModel: senderType,
              isGroupMessage: false,
            },
          ],
        },
        null,
        2,
      ),
    );

    const messages = await Chat.find({
      $or: [
        {
          sender: senderId,
          senderModel: senderType,
          recipient: recipientId,
          recipientModel: recipientType,
          isGroupMessage: false,
        },
        {
          sender: recipientId,
          senderModel: recipientType,
          recipient: senderId,
          recipientModel: senderType,
          isGroupMessage: false,
        },
      ],
    })
    .sort({ createdAt: 1 })
    .populate({
      path: "sender",
      select: "firstName lastName",
    })
    .populate({
      path: "recipient",
      select: "firstName lastName",
    })
    .populate({
      path: "replyTo",
      select: "text sender createdAt",
      populate: {
        path: "sender",
        select: "firstName lastName"
      }
    });

    console.log("Found messages count:", messages.length);
    console.log("Messages found:", JSON.stringify(messages, null, 2));

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res
      .status(500)
      .json({ message: "Error fetching conversation", error: error.message });
  }
};

/**
 * Create a new message
 */
exports.createMessage = async (req, res) => {
  try {
    const {
      sender,
      senderModel,
      recipient,
      recipientModel,
      isGroupMessage,
      group,
      text,
      replyTo,
    } = req.body;

    const newMessage = new Chat({
      sender,
      senderModel,
      recipient: isGroupMessage ? null : recipient,
      recipientModel: isGroupMessage ? null : recipientModel,
      isGroupMessage,
      group: isGroupMessage ? group : null,
      text,
      replyTo: replyTo || null,
    });

    const savedMessage = await newMessage.save();

    // Populate the saved message with reply and sender information
    const populatedMessage = await Chat.findById(savedMessage._id)
      .populate({
        path: "sender",
        select: "firstName lastName",
      })
      .populate({
        path: "recipient", 
        select: "firstName lastName",
      })
      .populate({
        path: "replyTo",
        select: "text sender createdAt",
        populate: {
          path: "sender",
          select: "firstName lastName"
        }
      });

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Error creating message:", error);
    res
      .status(500)
      .json({ message: "Error creating message", error: error.message });
  }
};

/**
 * Mark messages as read
 */
exports.markAsRead = async (req, res) => {
  try {
    const { messageIds } = req.body;

    // جلب الرسائل قبل التحديث لإرسال الإشعارات
    const messages = await Chat.find({ _id: { $in: messageIds } }).populate('sender');

    const result = await Chat.updateMany(
      { _id: { $in: messageIds } },
      { $set: { read: true } },
    );

    // إرسال حدث القراءة لكل مرسل عبر Socket.IO
    if (global.onlineUsers) {
      messages.forEach(message => {
        const senderData = global.onlineUsers.get(message.sender._id.toString());
        if (senderData && global.io) {
          global.io.to(senderData.socketId).emit("messageRead", {
            messageId: message._id,
          });
        }
      });
    }

    res.status(200).json({ message: "Messages marked as read", result });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({
      message: "Error marking messages as read",
      error: error.message,
    });
  }
};

/**
 * Get unread message count
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const { userId, userType } = req.params;

    const count = await Chat.countDocuments({
      recipient: userId,
      recipientModel: userType,
      read: false,
    });

    res.status(200).json({ count });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res
      .status(500)
      .json({ message: "Error getting unread count", error: error.message });
  }
};
