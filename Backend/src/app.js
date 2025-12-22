// ⚠️ CRITICAL: Load environment variables FIRST before any other modules
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require('socket.io');
const Chat = require('./schema/Chat');
const Student = require('./schema/Student');
const { NotificationService, FCMService } = require('./Notifications');
const MonthlyChampionService = require('./services/ChampionService');
const AttendanceService = require('./services/DashboardService/GetStudentAbsence');
const WarningJob = require('./Notifications/Jobs/WarningJob');
// Initialize FCM service (reads env FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH)
// FCMService is now imported from ./Notifications above

// Connect to MongoDB
connectDB();

const app = express();

// Middleware to parse JSON and URL-encoded bodies.
// This MUST come before any routes that need to access req.body.
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:5174'];
app.use(
  cors({
    origin: '*', // Allow all origins for development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Cache-Control',
      'Accept',
      'X-Requested-With',
    ],
    credentials: false,
  })
);

// ✅ Security Headers Middleware
app.use((req, res, next) => {
  // Prevent XSS attacks
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  
  // Control referrer information
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Enable browser XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com data:; " +
    "img-src 'self' data: https: blob:; " +
    "connect-src 'self' ws: wss: http://localhost:* https://cloudinary.com https://res.cloudinary.com; " +
    "media-src 'self' blob: data:;"
  );
  
  // Prevent DNS prefetching
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  
  // Only HTTPS (in production)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  next();
});

// Centralized request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${
        res.statusCode
      } - ${duration}ms`
    );
  });

  if (req.method === 'POST' || req.method === 'PUT') {
    // Check if this is a multipart/form-data request (file upload)
    const isMultipart = req.headers['content-type']?.includes('multipart/form-data');
    
    if (isMultipart) {
      console.log('Request Body: [Multipart Form Data - will be parsed by multer]');
    } else if (req.body && Object.keys(req.body).length > 0) {
      console.log('Request Body:', JSON.stringify(req.body, null, 2));
    } else {
      console.log('Request Body: [Empty or Not Parsed]');
    }
  }
  next();
});

// Add request logging for uploaded files
app.use((req, res, next) => {
  if (req.url.includes('/uploads/')) {
    console.log('Static file request:', req.url);
  }
  next();
});

// Serve static files from public folder
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
console.log(
  'Serving static files from:',
  path.join(__dirname, '../public/uploads')
);

// Serve test upload page
app.get('/test-upload', (req, res) => {
  res.sendFile(path.join(__dirname, 'test-upload.html'));
});

// Routes
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/teachers', require('./routes/teacherRoutes'));
app.use('/api/admins', require('./routes/adminRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/news', require('./routes/NewsRoutes/newsRoutes'));
app.use('/api/activities', require('./routes/activityRoutes/activityRoutes'));
app.use('/api/rankings', require('./routes/rankingRoutes'));
// Sections now part of daily-marks: /api/daily-marks/sections
app.use(
  '/api/daily-marks',
  require('./routes/DailyMarkRoutes/DailyMarkRoutes')
);
app.use('/api/attendance', require('./routes/attendanceRoutes'));
// TODO: Chat routes not implemented yet
// app.use('/api/chat', require('./routes/chatRoutes'));
app.use(
  '/api/notifications',
  require('./routes/NotificationRoutes/notificationRoutes')
);
// Exam marks routes must come BEFORE exam-schedule routes (more specific first)
app.use('/api/exam-schedule/marks', require('./routes/ExamScheduleRoutes/ExamMarkRoutes/examMarkRoutes'));
app.use('/api/exam-schedule', require('./routes/ExamScheduleRoutes/examRoutes'));
app.use('/api/sessions', require('./routes/timetableRoutes/TimeTableRoutes'));
app.use('/api/groups', require('./routes/groupRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/points-game', require('./routes/pointsGameRoutes')); // لعبة النقاط والشارات
app.use('/api/reports', require('./routes/ReportRoutes'));
app.use('/api/goals', require('./routes/Goals/goalRoutes'));
app.use('/api', require('./routes/profileRoutes'));
app.use('/api/upload', require('./routes/UploadRoutes/uploadRoutes'));
app.use('/api/warnings', require('./routes/WarningRoutes/WarningRoutes'));
app.use('/api/quran', require('./routes/QuranRoutes/quranRoutes'));
app.use('/api/test', require('./routes/TestRoutes/testRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler caught:', err);
  
  // Handle Multer errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'حجم الملف كبير جداً. الحد الأقصى المسموح 2 ميجابايت',
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'عدد الملفات كبير جداً',
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'حقل الملف غير متوقع',
      });
    }
    return res.status(400).json({
      success: false,
      message: 'خطأ في رفع الملف',
    });
  }
  
  // Handle file type errors from fileFilter
  if (err.message && err.message.includes('يُسمح فقط بملفات الصور')) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  
  // Handle other errors
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'خطأ في الخادم',
    error: process.env.NODE_ENV === 'production' ? undefined : err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
});

// Handle 404s
app.use((req, res) => {
  res.status(404).json({ message: 'الصفحة غير موجودة' });
});

// Start server
const PORT = process.env.PORT || 5005;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Initialize Socket.IO with simple settings
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins in development
    methods: ['GET', 'POST'],
    credentials: false,
  },
  transports: ['polling', 'websocket'], // Start with polling first
  allowEIO3: true,
});

// Make io available to routes
app.set('io', io);

// ✅ Initialize Presence Service - المصدر الوحيد للحقيقة
const { onlineUsersManager, isUserOnline } = require('./services/PresenceService');

// Initialize Notification Service immediately after Socket.IO is ready
const notificationService = new NotificationService(io);
global.notificationService = notificationService; // Make it globally accessible
app.set('notificationService', notificationService); // ✅ لاستخدامه في الـ routes
global.onlineUsersManager = onlineUsersManager; // ✅ Presence Service عام
global.isUserOnline = isUserOnline; // ✅ دالة مساعدة عامة
global.io = io; // Make io globally accessible for chat controllers
global.fcmService = FCMService;

// تشغيل Cron Job لتتويج أبطال الشهر
MonthlyChampionService.start();
console.log('🏆 خدمة تتويج الأبطال الشهرية تم تفعيلها');

// تشغيل Cron Job لتحديث قائمة الطلاب الغائبين عند منتصف الليل
AttendanceService.setIO(io); // ربط Socket.IO بخدمة الحضور
AttendanceService.start();
console.log('📋 خدمة تحديث قائمة الطلاب الغائبين اليومية تم تفعيلها');

// تشغيل Cron Job لإنفاذ قرارات الفصل
WarningJob.setupWarningJobs();

// Socket.IO error handling
io.engine.on('connection_error', (err) => {
  console.log('Socket.IO connection error:', err.message);
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // ✅ Auto-join room if auth data is present (Handles reconnection/initial connect)
  const authUserId = socket.handshake.auth?.userId;
  const authUserRole = socket.handshake.auth?.userRole;
  
  if (authUserId) {
    console.log(`🔄 Auto-joining rooms for authenticated user: ${authUserId}`);
    socket.join(authUserId);
    socket.join('notifications');
    
    if (authUserRole === 'admin') {
      socket.join('admin-room');
    }
    
    // ✅ استخدام PresenceService بدلاً من onlineUsers Map
    onlineUsersManager.setUserOnline(
      authUserId,
      socket.id,
      authUserRole || 'unknown',
      'User' // Will be updated on 'login' event
    );

    // ✅ بث حالة Online فوراً
    io.emit('user-status', {
      userId: authUserId,
      isActive: true,
      timestamp: new Date().toISOString(),
    });

    // ✅ إرسال قائمة المستخدمين المتصلين حالياً للمستخدم الجديد
    const onlineUsers = {};
    onlineUsersManager.onlineUsers.forEach((data, userId) => {
      onlineUsers[userId] = {
        isActive: true,
        timestamp: data.connectedAt
      };
    });
    socket.emit('initial-online-users', onlineUsers);
  }

  // Handle socket errors
  socket.on('error', (error) => {
    console.error(`Socket ${socket.id} error:`, error);
  });

  socket.on('disconnect', (reason) => {
    // This handler is removed in favor of the comprehensive one at the end of the file
    // to avoid duplicate handling and race conditions.
  });

  // User login - store their user ID and socket ID with improved handling
  socket.on('login', async (userData) => {
    console.log('📥 [Backend] Login event received:', userData);
    const { userId, role, firstName } = userData;

    // ✅ تسجيل المستخدم كـ Online في PresenceService
    onlineUsersManager.setUserOnline(
      userId,
      socket.id,
      role,
      firstName || 'مستخدم'
    );

    // ✅ انضمام المستخدم لغرفة خاصة به لاستقبال الإشعارات
    socket.join(userId);
    socket.join('notifications'); // انضمام للغرفة العامة أيضاً
    
    // ✅ انضمام للغرف حسب الدور للتحديثات الفورية
    if (role === 'admin') {
      socket.join('admin-room'); // Admins يستقبلون كل التحديثات
    }
    
    console.log(`🔔 User ${userId} (${firstName}) joined rooms [${userId}, notifications${role === 'admin' ? ', admin-room' : ''}]`);

    // ✅ تحديث lastSeen فقط في DB (بدون isActive)
    try {
      let updateResult;
      if (role === 'student') {
        updateResult = await Student.findByIdAndUpdate(
          userId,
          { lastSeen: new Date() },
          { new: true, upsert: false }
        );
      } else if (role === 'admin') {
        const Admin = require('./schema/Admin');
        updateResult = await Admin.findByIdAndUpdate(
          userId,
          { lastSeen: new Date() },
          { new: true, upsert: false }
        );
      } else if (role === 'teacher') {
        const Teacher = require('./schema/Teacher');
        updateResult = await Teacher.findByIdAndUpdate(
          userId,
          { lastSeen: new Date() },
          { new: true, upsert: false }
        );
      }

      if (updateResult) {
        console.log(
          `✅ User ${firstName} (${userId}) logged in successfully as ${role}`
        );

        // ✅ بث حالة Online للجميع
        const statusEvent = {
          userId: userId,
          isActive: true,
          timestamp: new Date().toISOString(),
        };
        console.log('📡 [Backend] Emitting user-status event:', statusEvent);
        io.emit('user-status', statusEvent);
      } else {
        console.warn(`⚠️  User ${userId} not found in ${role} collection`);
      }
    } catch (error) {
      console.error(
        `❌ Error updating lastSeen for user ${userId}:`,
        error.message
      );
    }

    console.log(`📊 Online users: ${onlineUsersManager.getOnlineCount()}`);
  });

  // Heartbeat System - استقبال ping من Client
  socket.on('ping', (data) => {
    console.log(`💓 Heartbeat received from ${socket.id}:`, data);
    // إرسال pong للتأكيد
    socket.emit('pong', {
      timestamp: Date.now(),
      serverId: socket.id,
      clientTimestamp: data?.timestamp,
    });
  });

  // Teachers Socket Events
  socket.on('joinTeachers', (data) => {
    socket.join('teachers');
    console.log(`👨‍🏫 User ${socket.id} joined teachers room`, data);
  });

  socket.on('leaveTeachers', (data) => {
    socket.leave('teachers');
    console.log(`👨‍🏫 User ${socket.id} left teachers room`, data);
  });

  // Students Socket Events
  socket.on('joinStudents', (data) => {
    socket.join('students');
    console.log(`👨‍🎓 User ${socket.id} joined students room`, data);
  });

  socket.on('leaveStudents', (data) => {
    socket.leave('students');
    console.log(`👨‍🎓 User ${socket.id} left students room`, data);
  });

  // Groups Socket Events
  socket.on('joinGroups', (data) => {
    socket.join('groups');
    console.log(`👥 User ${socket.id} joined groups room`, data);
  });

  socket.on('leaveGroups', (data) => {
    socket.leave('groups');
    console.log(`👥 User ${socket.id} left groups room`, data);
  });

  // Marks Socket Events (for Rankings/Arrangement)
  socket.on('joinMarks', (data) => {
    socket.join('marks');
    console.log(`📝 User ${socket.id} joined marks room`, data);
  });

  socket.on('leaveMarks', (data) => {
    socket.leave('marks');
    console.log(`📝 User ${socket.id} left marks room`, data);
  });

  // Attendance Socket Events (for Absence)
  socket.on('joinAttendance', (data) => {
    socket.join('attendance');
    console.log(`📋 User ${socket.id} joined attendance room`, data);
  });

  socket.on('leaveAttendance', (data) => {
    socket.leave('attendance');
    console.log(`📋 User ${socket.id} left attendance room`, data);
  });

  // Activities Socket Events
  socket.on('joinActivities', (data) => {
    socket.join('activities');
    console.log(`🎯 User ${socket.id} joined activities room`, data);
  });

  socket.on('leaveActivities', (data) => {
    socket.leave('activities');
    console.log(`🎯 User ${socket.id} left activities room`, data);
  });

  // News Socket Events
  socket.on('joinNews', (data) => {
    socket.join('news');
    console.log(`📰 User ${socket.id} joined news room`, data);
  });

  socket.on('leaveNews', (data) => {
    socket.leave('news');
    console.log(`📰 User ${socket.id} left news room`, data);
  });

  // Exams Socket Events
  socket.on('joinExams', (data) => {
    socket.join('exams');
    console.log(`📝 User ${socket.id} joined exams room`, data);
  });

  socket.on('leaveExams', (data) => {
    socket.leave('exams');
    console.log(`📝 User ${socket.id} left exams room`, data);
  });

  // Sessions Socket Events
  socket.on('joinSessions', (data) => {
    socket.join('sessions');
    console.log(`📅 User ${socket.id} joined sessions room`, data);
  });

  socket.on('leaveSessions', (data) => {
    socket.leave('sessions');
    console.log(`📅 User ${socket.id} left sessions room`, data);
  });

  socket.on('joinProfile', (data) => {
    socket.join('profile');
    console.log(`👤 User ${socket.id} joined profile room`, data);
  });

  socket.on('leaveProfile', (data) => {
    socket.leave('profile');
    console.log(`👤 User ${socket.id} left profile room`, data);
  });

  // Warnings Socket Events
  socket.on('joinWarnings', (data) => {
    socket.join('warnings');
    console.log(`⚠️ User ${socket.id} joined warnings room`, data);
  });

  socket.on('leaveWarnings', (data) => {
    socket.leave('warnings');
    console.log(`⚠️ User ${socket.id} left warnings room`, data);
  });

  // ✅ Notifications Socket Events
  socket.on('joinNotifications', (data) => {
    const { userId, role } = data;

    // انضمام للـ room الخاص بالإشعارات العامة
    socket.join('notifications');

    // انضمام للـ room الخاص بالمستخدم (باستخدام userId)
    if (userId) {
      socket.join(userId);
      console.log(
        `🔔 [JOIN] Socket ${socket.id} (${role}) ✅ joined notification rooms: [${userId}, notifications]`
      );
      console.log(`📊 Socket rooms for ${socket.id}:`, Array.from(socket.rooms));
    }
  });

  socket.on('leaveNotifications', (data) => {
    const { userId } = data;
    socket.leave('notifications');
    if (userId) {
      socket.leave(userId);
    }
    console.log(`🔔 User ${socket.id} left notifications room`, data);
  });


  // Handle logout
  socket.on('logout', async (userData) => {
    console.log(`User logging out: ${userData.userId}`);

    // ✅ تحديث lastSeen فقط في DB
    try {
      let updateResult;
      if (userData.role === 'student') {
        updateResult = await Student.findByIdAndUpdate(
          userData.userId,
          { lastSeen: new Date() },
          { new: true }
        );
      } else if (userData.role === 'admin') {
        updateResult = await require('./schema/Admin').findByIdAndUpdate(
          userData.userId,
          { lastSeen: new Date() },
          { new: true }
        );
      } else {
        updateResult = await require('./schema/Teacher').findByIdAndUpdate(
          userData.userId,
          { lastSeen: new Date() },
          { new: true }
        );
      }

      if (updateResult) {
        console.log(`✅ Updated lastSeen for user ${userData.userId}`);
      }
    } catch (error) {
      console.error('Error updating lastSeen on logout:', error);
    }

    // ✅ تسجيل المستخدم كـ Offline في PresenceService
    onlineUsersManager.setUserOffline(userData.userId, (userId) => {
      // ✅ بث حالة Offline بعد grace period
      io.emit('user-status', {
        userId: userId,
        isActive: false,
        timestamp: new Date().toISOString(),
      });
    });

    console.log(`User logged out: ${userData.userId}`);
  });

  // Handle private messages
  socket.on('sendMessage', async (messageData) => {
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

      console.log('sendMessage received with data:', messageData);
      console.log(
        'Saving message to database:',
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
      console.log('Recipient online status:', onlineUsers.has(recipient));

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
          path: 'sender',
          select: 'firstName lastName',
        })
        .populate({
          path: 'recipient',
          select: 'firstName lastName',
        })
        .populate({
          path: 'replyTo',
          select: 'text sender createdAt',
          populate: {
            path: 'sender',
            select: 'firstName lastName',
          },
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

      // ✅ التحقق من حالة المستلم من PresenceService
      const recipientOnline = onlineUsersManager.isUserOnline(recipient);
      const recipientData = onlineUsersManager.getUserData(recipient);
      
      console.log('Looking for recipient:', recipient, 'in online users');
      console.log('Recipient online:', recipientOnline);
      console.log('Recipient data found:', recipientData);

      if (recipientOnline && recipientData) {
        console.log(
          'Sending message to recipient socket:',
          recipientData.socketId
        );
        // Send the message to the recipient with populated data
        io.to(recipientData.socketId).emit('receiveMessage', {
          ...populatedMessage._doc,
          senderName,
        });

        // إرسال حدث التوصيل للمرسل
        socket.emit('messageDelivered', {
          messageId: savedMessage._id,
          recipientOnline: true,
        });
      } else {
        console.log(
          'Recipient is not online, message not delivered in real-time'
        );
        // إرسال حدث التوصيل للمرسل (غير متصل)
        socket.emit('messageDelivered', {
          messageId: savedMessage._id,
          recipientOnline: false,
        });
      }

      // Send confirmation back to sender with delivery status and populated data
      socket.emit('messageSent', {
        ...populatedMessage._doc,
        delivered: true,
        recipientOnline,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Error sending message' });
    }
  });

  // Handle group messages (for teachers sending to students)
  socket.on('sendGroupMessage', async (messageData) => {
    try {
      const { sender, senderModel, group, text, senderName, replyTo } =
        messageData;

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
          path: 'sender',
          select: 'firstName lastName',
        })
        .populate({
          path: 'replyTo',
          select: 'text sender createdAt',
          populate: {
            path: 'sender',
            select: 'firstName lastName',
          },
        });

      // ✅ Emit to all students in the group who are online
      const onlineStudents = onlineUsersManager.getUsersByRole('student');
      for (const userId of onlineStudents) {
        // Check if student belongs to this group
        const student = await Student.findById(userId);
        if (student && student.group === group) {
          const userData = onlineUsersManager.getUserData(userId);
          if (userData) {
            io.to(userData.socketId).emit('receiveMessage', {
              ...populatedMessage._doc,
              senderName,
            });
          }
        }
      }

      // Send confirmation back to teacher with populated data
      socket.emit('messageSent', populatedMessage);
    } catch (error) {
      console.error('Error sending group message:', error);
      socket.emit('error', { message: 'Error sending group message' });
    }
  });

  // Handle message editing
  socket.on('editMessage', async (data) => {
    try {
      const { messageId, text } = data;

      if (!messageId || !text || text.trim() === '') {
        socket.emit('messageEditError', {
          error: 'Message ID and text are required',
        });
        return;
      }

      const message = await Chat.findById(messageId);
      if (!message) {
        socket.emit('messageEditError', { error: 'Message not found' });
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

      socket.emit('messageEdited', updatedMessage);

      // ✅ Find recipient's socket and emit to them
      const recipientId = message.recipient.toString();
      const recipientData = onlineUsersManager.getUserData(recipientId);
      if (recipientData) {
        io.to(recipientData.socketId).emit('messageEdited', updatedMessage);
      }
    } catch (error) {
      console.error('Error editing message:', error);
      socket.emit('messageEditError', { error: 'Failed to edit message' });
    }
  });

  // Handle message deletion
  socket.on('deleteMessage', async (data) => {
    try {
      const { messageId } = data;

      if (!messageId) {
        socket.emit('messageDeleteError', { error: 'Message ID is required' });
        return;
      }

      const message = await Chat.findById(messageId);
      if (!message) {
        socket.emit('messageDeleteError', { error: 'Message not found' });
        return;
      }

      // Store recipient ID before deletion
      const recipientId = message.recipient.toString();

      // Delete the message
      await Chat.findByIdAndDelete(messageId);

      // Emit to both sender and recipient
      socket.emit('messageDeleted', { messageId });

      // ✅ Find recipient's socket and emit to them
      const recipientData = onlineUsersManager.getUserData(recipientId);
      if (recipientData) {
        io.to(recipientData.socketId).emit('messageDeleted', { messageId });
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      socket.emit('messageDeleteError', { error: 'Failed to delete message' });
    }
  });

  // Handle user typing
  socket.on('typing', (data) => {
    // ✅ استخدام PresenceService
    const recipientData = onlineUsersManager.getUserData(data.recipient);
    if (recipientData) {
      io.to(recipientData.socketId).emit('userTyping', {
        sender: data.sender,
        isTyping: data.isTyping,
      });
    }
  });

  // Handle chat opened event
  socket.on('chatOpened', async (data) => {
    const { userId, chatWith } = data;
    console.log(`📖 User ${userId} opened chat with ${chatWith}`);

    // ✅ إشعار الطرف الآخر بفتح المحادثة
    const otherUserData = onlineUsersManager.getUserData(chatWith);
    if (otherUserData) {
      io.to(otherUserData.socketId).emit('chatOpened', {
        userId: userId,
        chatWith: chatWith,
      });
    }

    // تحديث حالة الرسائل إلى "تم التوصيل" للرسائل غير المقروءة
    try {
      await Chat.updateMany(
        {
          sender: chatWith,
          recipient: userId,
          delivered: { $ne: true },
        },
        {
          delivered: true,
          deliveredAt: new Date(),
        }
      );
    } catch (error) {
      console.error('Error updating message delivery status:', error);
    }
  });

  // Handle message delivered confirmation
  socket.on('messageDeliveredConfirm', async (data) => {
    const { messageId, recipientId, deliveredAt } = data;
    console.log(`✅ Message ${messageId} delivered to ${recipientId}`);

    try {
      // تحديث قاعدة البيانات
      await Chat.findByIdAndUpdate(messageId, {
        delivered: true,
        deliveredAt: new Date(deliveredAt),
      });

      // ✅ إشعار المرسل بالتوصيل
      const message = await Chat.findById(messageId).populate('sender');
      if (message) {
        const senderId = message.sender._id.toString();
        const senderData = onlineUsersManager.getUserData(senderId);
        if (senderData) {
          io.to(senderData.socketId).emit('messageDelivered', {
            messageId: messageId,
            recipientOnline: true,
            deliveredAt: deliveredAt,
          });
        }
      }
    } catch (error) {
      console.error('Error confirming message delivery:', error);
    }
  });

  // Handle message read confirmation
  socket.on('messageReadConfirm', async (data) => {
    const { messageId, recipientId, readAt } = data;
    console.log(`👁️ Message ${messageId} read by ${recipientId}`);

    try {
      // تحديث قاعدة البيانات
      await Chat.findByIdAndUpdate(messageId, {
        read: true,
        readAt: new Date(readAt),
      });

      // ✅ إشعار المرسل بالقراءة
      const message = await Chat.findById(messageId).populate('sender');
      if (message) {
        const senderId = message.sender._id.toString();
        const senderData = onlineUsersManager.getUserData(senderId);
        if (senderData) {
          io.to(senderData.socketId).emit('messageRead', {
            messageId: messageId,
            readAt: readAt,
          });
        }
      }
    } catch (error) {
      console.error('Error confirming message read:', error);
    }
  });

  // Handle disconnect with improved cleanup
  socket.on('disconnect', async (reason) => {
    console.log(`🔌 Socket disconnected: ${socket.id} (reason: ${reason})`);

    // ✅ الحصول على userId من PresenceService
    const disconnectedUserId = onlineUsersManager.getUserIdBySocket(socket.id);

    if (disconnectedUserId) {
      const disconnectedUserData = onlineUsersManager.getUserData(disconnectedUserId);
      
      if (disconnectedUserData) {
        const { role, firstName } = disconnectedUserData;

        // ✅ تسجيل المستخدم كـ Offline مع grace period
        onlineUsersManager.setUserOffline(disconnectedUserId, async (userId) => {
          // ✅ تحديث lastSeen فقط بعد grace period
          try {
            let updateResult;
            if (role === 'student') {
              updateResult = await Student.findByIdAndUpdate(
                userId,
                { lastSeen: new Date() },
                { new: true }
              );
            } else if (role === 'admin') {
              const Admin = require('./schema/Admin');
              updateResult = await Admin.findByIdAndUpdate(
                userId,
                { lastSeen: new Date() },
                { new: true }
              );
            } else if (role === 'teacher') {
              const Teacher = require('./schema/Teacher');
              updateResult = await Teacher.findByIdAndUpdate(
                userId,
                { lastSeen: new Date() },
                { new: true }
              );
            }

            if (updateResult) {
              console.log(`✅ User ${firstName} (${userId}) lastSeen updated (after delay)`);
            }
          } catch (error) {
            console.error(
              `❌ Error updating lastSeen for user ${userId}:`,
              error.message
            );
          }

          // ✅ بث حالة Offline للجميع
          io.emit('user-status', {
            userId: userId,
            isActive: false,
            timestamp: new Date().toISOString(),
          });
        });

        console.log(`📊 Remaining online users: ${onlineUsersManager.getOnlineCount()}`);
      }
    }
  });
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Try a different port.`);
    process.exit(1);
  }
});
