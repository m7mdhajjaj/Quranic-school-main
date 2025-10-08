const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const http = require("http");
const { Server } = require("socket.io");
const Chat = require("./schema/Chat");
const Student = require("./schema/Student");
const NotificationService = require("./services/NotificationService");
require("dotenv").config();

// Connect to MongoDB
connectDB();

const app = express();

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  if (req.method === "POST" || req.method === "PUT") {
    console.log("Request body:", JSON.stringify(req.body, null, 2));
  }
  next();
});

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",")
  : ["http://localhost:5173", "http://localhost:5174"];
app.use(
  cors({
    origin: "*", // Allow all origins in development
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cache-Control", "Accept", "X-Requested-With"],
    credentials: false, // Disable credentials to avoid Socket.io issues
  })
);

// Add request logging for uploaded files
app.use((req, res, next) => {
  if (req.url.includes("/uploads/")) {
    console.log("Static file request:", req.url);
  }
  next();
});

// Serve static files from public folder
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));
console.log(
  "Serving static files from:",
  path.join(__dirname, "../public/uploads")
);

// Serve test upload page
app.get("/test-upload", (req, res) => {
  res.sendFile(path.join(__dirname, "test-upload.html"));
});

// Routes
app.use("/api/students", require("./routes/studentRoutes"));
app.use("/api/teachers", require("./routes/teacherRoutes"));
app.use("/api/admins", require("./routes/adminRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/news", require("./routes/newsRoutes"));
app.use("/api/activities", require("./routes/activityRoutes"));
app.use("/api/rankings", require("./routes/rankingRoutes"));
app.use("/api/sections", require("./routes/sectionRoutes"));
app.use("/api/marks", require("./routes/markRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/exams", require("./routes/examRoutes"));
app.use("/api/exam-marks", require("./routes/examMarkRoutes"));
app.use("/api/sessions", require("./routes/sessionRoutes"));
app.use("/api/groups", require("./routes/groupRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/goals", require("./routes/goalRoutes"));
app.use("/api", require("./routes/profileRoutes"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Global error handler caught:", err);
  res.status(500).json({
    message: "خطأ في الخادم",
    error: err.message,
    stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
  });
});

// Handle 404s
app.use((req, res) => {
  res.status(404).json({ message: "الصفحة غير موجودة" });
});

// Start server
const PORT = process.env.PORT || 5005;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Initialize Socket.IO with simple settings
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins in development
    methods: ["GET", "POST"],
    credentials: false,
  },
  transports: ['polling', 'websocket'], // Start with polling first
  allowEIO3: true,
});

// Make io available to routes
app.set('io', io);

// Store online users
const onlineUsers = new Map();

// Global function to notify dashboard updates
global.notifyDashboardUpdate = (updateType, data = null) => {
  if (io) {
    const payload = {
      type: updateType, // 'stats', 'groups', 'full'
      data: data,
      timestamp: new Date().toISOString()
    };
    
    console.log(`📊 Broadcasting dashboard update: ${updateType}`);
    io.to('dashboard').emit('dashboardUpdate', payload);
  }
};

// Initialize Notification Service
let notificationService;

// Socket.IO error handling
io.engine.on("connection_error", (err) => {
  console.log('Socket.IO connection error:', err.message);
});

// Socket.IO connection
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle socket errors
  socket.on('error', (error) => {
    console.error(`Socket ${socket.id} error:`, error);
  });

  socket.on('disconnect', (reason) => {
    console.log(`User disconnected: ${socket.id}, reason: ${reason}`);
    // Clean up user from online users when they disconnect
    for (const [userId, userData] of onlineUsers.entries()) {
      if (userData.socketId === socket.id) {
        onlineUsers.delete(userId);
        console.log(`Removed user ${userId} from online users`);
        break;
      }
    }
  });

  // Initialize notification service after io is ready
  if (!notificationService) {
    notificationService = new NotificationService(io);
    global.notificationService = notificationService; // Make it globally accessible
    global.onlineUsers = onlineUsers; // Make onlineUsers globally accessible
    global.io = io; // Make io globally accessible for chat controllers
  }

  // User login - store their user ID and socket ID with improved handling
  socket.on("login", async (userData) => {
    const { userId, role, firstName } = userData;
    
    // Store user in online users map
    onlineUsers.set(userId, {
      socketId: socket.id,
      role: role,
      firstName: firstName || "مستخدم",
      loginTime: new Date().toISOString(),
    });
    
    // Set isActive to true in database with better error handling
    try {
      let updateResult;
      if (role === "student") {
        updateResult = await Student.findByIdAndUpdate(
          userId, 
          { isActive: true, lastSeen: new Date() }, 
          { new: true, upsert: false }
        );
      } else if (role === "admin") {
        const Admin = require("./schema/Admin");
        updateResult = await Admin.findByIdAndUpdate(
          userId, 
          { isActive: true, lastSeen: new Date() }, 
          { new: true, upsert: false }
        );
      } else if (role === "teacher") {
        const Teacher = require("./schema/Teacher");
        updateResult = await Teacher.findByIdAndUpdate(
          userId, 
          { isActive: true, lastSeen: new Date() }, 
          { new: true, upsert: false }
        );
      }
      
      if (updateResult) {
        console.log(`✅ User ${firstName} (${userId}) logged in successfully as ${role}`);
        
        // إرسال إشعار لجميع العملاء بتغيير حالة المستخدم إلى متصل
        io.emit('userStatusChange', {
          userId: userId,
          isActive: true,
          lastSeen: updateResult?.lastSeen?.toISOString() || new Date().toISOString()
        });
        
      } else {
        console.warn(`⚠️  User ${userId} not found in ${role} collection`);
      }
    } catch (error) {
      console.error(`❌ Error setting isActive for user ${userId}:`, error.message);
    }
    
    console.log(`📊 Online users: ${onlineUsers.size}`);
  });

  // Dashboard Socket Events
  socket.on("joinDashboard", () => {
    socket.join("dashboard");
    console.log(`📊 User ${socket.id} joined dashboard room`);
  });

  socket.on("leaveDashboard", () => {
    socket.leave("dashboard");
    console.log(`📊 User ${socket.id} left dashboard room`);
  });

  socket.on("requestDashboardUpdate", async () => {
    console.log(`📊 Dashboard update requested by ${socket.id}`);
    try {
      // يمكن إضافة منطق لجلب البيانات المحدثة وإرسالها
      socket.emit('dashboardUpdate', {
        type: 'full',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error handling dashboard update request:', error);
      socket.emit('error', {
        message: 'فشل في تحديث الداشبورد',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Handle logout
  socket.on("logout", async (userData) => {
    console.log(`User logging out: ${userData.userId}`);
    
    // Set isActive to false in database
    try {
      if (userData.role === "student") {
        await Student.findByIdAndUpdate(userData.userId, { isActive: false });
      } else if (userData.role === "admin") {
        await require("./schema/Admin").findByIdAndUpdate(userData.userId, { isActive: false });
      } else {
        await require("./schema/Teacher").findByIdAndUpdate(userData.userId, { isActive: false });
      }
    } catch (error) {
      console.error("Error setting isActive=false on logout:", error);
    }
    
    // Remove from online users
    onlineUsers.delete(userData.userId);
    console.log(`User logged out: ${userData.userId}`);
  });

  // Handle private messages
  socket.on("sendMessage", async (messageData) => {
    try {
      const {
        sender,
        senderModel,
        recipient,
        recipientModel,
        text,
        senderName,
        replyTo,
      } = messageData;

      console.log("sendMessage received with data:", messageData);
      console.log(
        "Saving message to database:",
        JSON.stringify(
          {
            sender,
            senderModel,
            recipient,
            recipientModel,
            isGroupMessage: false,
            text,
            replyTo,
          },
          null,
          2
        )
      );
      console.log("Recipient online status:", onlineUsers.has(recipient));

      // Create and save the message
      const newMessage = new Chat({
        sender,
        senderModel,
        recipient,
        recipientModel,
        isGroupMessage: false,
        text,
        replyTo: replyTo || null,
      });

      const savedMessage = await newMessage.save();

      // Populate the saved message with reply information
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

      // إرسال إشعار للمستلم عبر خدمة الإشعارات
      if (notificationService) {
        await notificationService.notifyNewMessage(
          recipient,
          recipientModel,
          senderName,
          text
        );
      }

      // Check if recipient is online
      const recipientData = onlineUsers.get(recipient);
      console.log("Looking for recipient:", recipient, "in online users");
      console.log("Current online users:", [...onlineUsers.entries()]);
      console.log("Recipient data found:", recipientData);
      
      let recipientOnline = false;
      if (recipientData) {
        console.log(
          "Sending message to recipient socket:",
          recipientData.socketId
        );
        recipientOnline = true;
        // Send the message to the recipient with populated data
        io.to(recipientData.socketId).emit("receiveMessage", {
          ...populatedMessage._doc,
          senderName,
        });

        // إرسال حدث التوصيل للمرسل
        socket.emit("messageDelivered", {
          messageId: savedMessage._id,
          recipientOnline: true,
        });
      } else {
        console.log(
          "Recipient is not online, message not delivered in real-time"
        );
        // إرسال حدث التوصيل للمرسل (غير متصل)
        socket.emit("messageDelivered", {
          messageId: savedMessage._id,
          recipientOnline: false,
        });
      }

      // Send confirmation back to sender with delivery status and populated data
      socket.emit("messageSent", {
        ...populatedMessage._doc,
        delivered: true,
        recipientOnline,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("error", { message: "Error sending message" });
    }
  });

  // Handle group messages (for teachers sending to students)
  socket.on("sendGroupMessage", async (messageData) => {
    try {
      const { sender, senderModel, group, text, senderName, replyTo } = messageData;

      // Create and save the message
      const newMessage = new Chat({
        sender,
        senderModel,
        isGroupMessage: true,
        group,
        text,
        replyTo: replyTo || null,
      });

      const savedMessage = await newMessage.save();

      // Populate the saved message with reply information
      const populatedMessage = await Chat.findById(savedMessage._id)
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

      // Emit to all students in the group who are online
      for (const [userId, userData] of onlineUsers.entries()) {
        if (userData.role === "student") {
          // Check if student belongs to this group
          const student = await Student.findById(userId);
          if (student && student.group === group) {
            io.to(userData.socketId).emit("receiveMessage", {
              ...populatedMessage._doc,
              senderName,
            });
          }
        }
      }

      // Send confirmation back to teacher with populated data
      socket.emit("messageSent", populatedMessage);
    } catch (error) {
      console.error("Error sending group message:", error);
      socket.emit("error", { message: "Error sending group message" });
    }
  });

  // Handle message editing
  socket.on("editMessage", async (data) => {
    try {
      const { messageId, text } = data;
      
      if (!messageId || !text || text.trim() === '') {
        socket.emit("messageEditError", { error: "Message ID and text are required" });
        return;
      }
      
      const message = await Chat.findById(messageId);
      if (!message) {
        socket.emit("messageEditError", { error: "Message not found" });
        return;
      }
      
      // Update the message
      message.text = text.trim();
      message.editedAt = new Date();
      await message.save();
      
      // Get populated message
      const updatedMessage = await Chat.findById(messageId)
        .populate('sender', 'firstName lastName')
        .populate('recipient', 'firstName lastName');
        
      socket.emit("messageEdited", updatedMessage);
      
      // Find recipient's socket and emit to them
      const recipientData = onlineUsers.get(message.recipient.toString());
      if (recipientData) {
        io.to(recipientData.socketId).emit("messageEdited", updatedMessage);
      }
    } catch (error) {
      console.error("Error editing message:", error);
      socket.emit("messageEditError", { error: "Failed to edit message" });
    }
  });
  
  // Handle message deletion
  socket.on("deleteMessage", async (data) => {
    try {
      const { messageId } = data;
      
      if (!messageId) {
        socket.emit("messageDeleteError", { error: "Message ID is required" });
        return;
      }
      
      const message = await Chat.findById(messageId);
      if (!message) {
        socket.emit("messageDeleteError", { error: "Message not found" });
        return;
      }
      
      // Store recipient ID before deletion
      const recipientId = message.recipient.toString();
      
      // Delete the message
      await Chat.findByIdAndDelete(messageId);
      
      // Emit to both sender and recipient
      socket.emit("messageDeleted", { messageId });
      
      // Find recipient's socket and emit to them
      const recipientData = onlineUsers.get(recipientId);
      if (recipientData) {
        io.to(recipientData.socketId).emit("messageDeleted", { messageId });
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      socket.emit("messageDeleteError", { error: "Failed to delete message" });
    }
  });

  // Handle user typing
  socket.on("typing", (data) => {
    const recipientData = onlineUsers.get(data.recipient);
    if (recipientData) {
      io.to(recipientData.socketId).emit("userTyping", {
        sender: data.sender,
        isTyping: data.isTyping,
      });
    }
  });

  // Handle chat opened event
  socket.on("chatOpened", async (data) => {
    const { userId, chatWith } = data;
    console.log(`📖 User ${userId} opened chat with ${chatWith}`);
    
    // إشعار الطرف الآخر بفتح المحادثة
    const otherUserData = onlineUsers.get(chatWith);
    if (otherUserData) {
      io.to(otherUserData.socketId).emit("chatOpened", {
        userId: userId,
        chatWith: chatWith
      });
    }

    // تحديث حالة الرسائل إلى "تم التوصيل" للرسائل غير المقروءة
    try {
      await Chat.updateMany(
        { 
          sender: chatWith,
          recipient: userId,
          delivered: { $ne: true }
        },
        { 
          delivered: true, 
          deliveredAt: new Date() 
        }
      );
    } catch (error) {
      console.error("Error updating message delivery status:", error);
    }
  });

  // Handle message delivered confirmation
  socket.on("messageDeliveredConfirm", async (data) => {
    const { messageId, recipientId, deliveredAt } = data;
    console.log(`✅ Message ${messageId} delivered to ${recipientId}`);
    
    try {
      // تحديث قاعدة البيانات
      await Chat.findByIdAndUpdate(messageId, {
        delivered: true,
        deliveredAt: new Date(deliveredAt)
      });

      // إشعار المرسل بالتوصيل
      for (const [userId, userData] of onlineUsers.entries()) {
        const message = await Chat.findById(messageId).populate('sender');
        if (message && message.sender._id.toString() === userId) {
          io.to(userData.socketId).emit("messageDelivered", {
            messageId: messageId,
            recipientOnline: true,
            deliveredAt: deliveredAt
          });
          break;
        }
      }
    } catch (error) {
      console.error("Error confirming message delivery:", error);
    }
  });

  // Handle message read confirmation
  socket.on("messageReadConfirm", async (data) => {
    const { messageId, recipientId, readAt } = data;
    console.log(`👁️ Message ${messageId} read by ${recipientId}`);
    
    try {
      // تحديث قاعدة البيانات
      await Chat.findByIdAndUpdate(messageId, {
        read: true,
        readAt: new Date(readAt)
      });

      // إشعار المرسل بالقراءة
      for (const [userId, userData] of onlineUsers.entries()) {
        const message = await Chat.findById(messageId).populate('sender');
        if (message && message.sender._id.toString() === userId) {
          io.to(userData.socketId).emit("messageRead", {
            messageId: messageId,
            readAt: readAt
          });
          break;
        }
      }
    } catch (error) {
      console.error("Error confirming message read:", error);
    }
  });

  // Handle disconnect with improved cleanup
  socket.on("disconnect", async (reason) => {
    console.log(`🔌 Socket disconnected: ${socket.id} (reason: ${reason})`);

    // Remove user from online users and set isActive to false
    for (const [userId, userData] of onlineUsers.entries()) {
      if (userData.socketId === socket.id) {
        const { role, firstName } = userData;
        
        // Set isActive to false in database
        try {
          let updateResult;
          if (role === "student") {
            updateResult = await Student.findByIdAndUpdate(
              userId, 
              { isActive: false, lastSeen: new Date() },
              { new: true }
            );
          } else if (role === "admin") {
            const Admin = require("./schema/Admin");
            updateResult = await Admin.findByIdAndUpdate(
              userId, 
              { isActive: false, lastSeen: new Date() },
              { new: true }
            );
          } else if (role === "teacher") {
            const Teacher = require("./schema/Teacher");
            updateResult = await Teacher.findByIdAndUpdate(
              userId, 
              { isActive: false, lastSeen: new Date() },
              { new: true }
            );
          }
          
          console.log(`✅ User ${firstName} (${userId}) marked as inactive`);
          
          // إرسال إشعار لجميع العملاء بتغيير حالة المستخدم
          io.emit('userStatusChange', {
            userId: userId,
            isActive: false,
            lastSeen: updateResult?.lastSeen?.toISOString() || new Date().toISOString()
          });
          
        } catch (error) {
          console.error(`❌ Error setting isActive=false for user ${userId}:`, error.message);
        }
        
        onlineUsers.delete(userId);
        console.log(`👋 User ${firstName} removed from online list`);
        console.log(`📊 Remaining online users: ${onlineUsers.size}`);
        break;
      }
    }
  });
});

// Handle server errors
server.on("error", (error) => {
  console.error("Server error:", error);
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Try a different port.`);
    process.exit(1);
  }
});
