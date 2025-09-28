const Chat = require("../models/Chat");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");

// Get all messages for a specific user (student or teacher)
const getUserMessages = async (req, res) => {
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
      });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res
      .status(500)
      .json({ message: "Error fetching messages", error: error.message });
  }
};

// Get group messages for a specific group
const getGroupMessages = async (req, res) => {
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
      });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching group messages:", error);
    res
      .status(500)
      .json({ message: "Error fetching group messages", error: error.message });
  }
};

// Get conversation between two users
const getConversation = async (req, res) => {
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
    }).sort({ createdAt: 1 });

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

// Create a new message
const createMessage = async (req, res) => {
  try {
    const {
      sender,
      senderModel,
      recipient,
      recipientModel,
      isGroupMessage,
      group,
      text,
    } = req.body;

    const newMessage = new Chat({
      sender,
      senderModel,
      recipient: isGroupMessage ? null : recipient,
      recipientModel: isGroupMessage ? null : recipientModel,
      isGroupMessage,
      group: isGroupMessage ? group : null,
      text,
    });

    const savedMessage = await newMessage.save();

    res.status(201).json(savedMessage);
  } catch (error) {
    console.error("Error creating message:", error);
    res
      .status(500)
      .json({ message: "Error creating message", error: error.message });
  }
};

// Mark messages as read
const markAsRead = async (req, res) => {
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

// Get all teachers for a student to chat with
const getTeachers = async (req, res) => {
  try {
    // Get the student's group
    const { studentId } = req.params;
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Find all teachers who teach this student's group
    const teachers = await Teacher.find({
      groups: { $in: [student.group] },
    }).select("_id firstName lastName imageUrl");

    res.status(200).json(teachers);
  } catch (error) {
    console.error("Error fetching teachers:", error);
    res
      .status(500)
      .json({ message: "Error fetching teachers", error: error.message });
  }
};

// Get all students for a teacher
const getStudents = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const teacher = await Teacher.findById(teacherId);

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Find all students in the teacher's groups
    const students = await Student.find({
      group: { $in: teacher.groups },
    }).select("_id firstName lastName group imageUrl");

    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res
      .status(500)
      .json({ message: "Error fetching students", error: error.message });
  }
};

// Get unread message count
const getUnreadCount = async (req, res) => {
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

module.exports = {
  getUserMessages,
  getGroupMessages,
  getConversation,
  createMessage,
  markAsRead,
  getTeachers,
  getStudents,
  getUnreadCount,
};
