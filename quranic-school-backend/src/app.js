const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const http = require("http");
const { Server } = require("socket.io");
const Chat = require("./models/Chat");
const Student = require("./models/Student");
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
app.use(
  cors({
    origin: "*", // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
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
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/news", require("./routes/newsRoutes"));
app.use("/api/activities", require("./routes/activityRoutes"));
app.use("/api/rankings", require("./routes/rankingRoutes"));
app.use("/api/sections", require("./routes/sectionRoutes"));
app.use("/api/marks", require("./routes/markRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/settings", require("./routes/settingsRoutes"));

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

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Store online users
const onlineUsers = new Map();

// Socket.IO connection
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // User login - store their user ID and socket ID
  socket.on("login", (userData) => {
    onlineUsers.set(userData.userId, {
      socketId: socket.id,
      role: userData.role,
    });
    console.log(`User logged in: ${userData.userId} as ${userData.role}`);
    console.log("Online users:", [...onlineUsers.entries()]);
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
      });

      const savedMessage = await newMessage.save();

      // Check if recipient is online
      const recipientData = onlineUsers.get(recipient);
      console.log("Looking for recipient:", recipient, "in online users");
      console.log("Current online users:", [...onlineUsers.entries()]);
      console.log("Recipient data found:", recipientData);
      if (recipientData) {
        console.log(
          "Sending message to recipient socket:",
          recipientData.socketId
        );
        // Send the message to the recipient
        io.to(recipientData.socketId).emit("receiveMessage", {
          ...savedMessage._doc,
          senderName,
        });
      } else {
        console.log(
          "Recipient is not online, message not delivered in real-time"
        );
      }

      // Send confirmation back to sender
      socket.emit("messageSent", savedMessage);
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("error", { message: "Error sending message" });
    }
  });

  // Handle group messages (for teachers sending to students)
  socket.on("sendGroupMessage", async (messageData) => {
    try {
      const { sender, senderModel, group, text, senderName } = messageData;

      // Create and save the message
      const newMessage = new Chat({
        sender,
        senderModel,
        isGroupMessage: true,
        group,
        text,
      });

      const savedMessage = await newMessage.save();

      // Emit to all students in the group who are online
      for (const [userId, userData] of onlineUsers.entries()) {
        if (userData.role === "student") {
          // Check if student belongs to this group
          const student = await Student.findById(userId);
          if (student && student.group === group) {
            io.to(userData.socketId).emit("receiveMessage", {
              ...savedMessage._doc,
              senderName,
            });
          }
        }
      }

      // Send confirmation back to teacher
      socket.emit("messageSent", savedMessage);
    } catch (error) {
      console.error("Error sending group message:", error);
      socket.emit("error", { message: "Error sending group message" });
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

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);

    // Remove user from online users
    for (const [userId, userData] of onlineUsers.entries()) {
      if (userData.socketId === socket.id) {
        onlineUsers.delete(userId);
        console.log(`User removed from online list: ${userId}`);
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
