// ============================================================================
// createNews.js - Create News Operations
// ============================================================================

const News = require("../../schema/News");
const cloudinary = require("../../config/cloudinary");
const { validateNewsTitle, validateContent } = require("../../Validation/News/NewsValidation");
const Student = require("../../schema/Student");
const Notification = require("../../schema/Notification");
const { sendNotificationToDevices } = require("../../Notifications");

/**
 * Create new news item
 * @route POST /api/news
 */
exports.createNews = async (req, res) => {
  try {
    console.log("========================================");
    console.log("📝 Creating new news...");
    console.log("========================================");
    console.log("📋 Request body:", JSON.stringify(req.body, null, 2));
    console.log("📎 Single File (req.file):", req.file ? "موجود" : "غير موجود");
    console.log("📎 Multiple Files (req.files):", req.files ? `موجود (${req.files.length})` : "غير موجود");
    
    if (req.files && req.files.length > 0) {
      console.log("📸 تفاصيل الصور المرسلة:");
      req.files.forEach((file, index) => {
        console.log(`  ${index + 1}. ${file.originalname} - ${(file.size / 1024).toFixed(2)} KB`);
      });
    }
    console.log("========================================");

    const { title, content, description, author, category, tags } = req.body;
    

    // Get author info from req.user (from auth middleware)
    const authorId = author || req.user?._id;
    const authorRole = req.user?.role; // 'student', 'teacher', or 'admin'
    const authorName = req.user?.firstName 
      ? `${req.user.firstName} ${req.user.lastName || ''}`
      : req.user?.name || 'غير معروف';

    // Prevent students from creating news
    if (authorRole === 'student') {
      return res.status(403).json({
        success: false,
        message: "الطلاب غير مسموح لهم بنشر الأخبار."
      });
    }

    console.log("📥 Received data:");
    console.log("  - Title:", title);
    console.log("  - Content length:", content?.length);
    console.log("  - Author ID:", authorId);
    console.log("  - Author Role:", authorRole);
    console.log("  - Author Name:", authorName);
    console.log("  - Has file:", !!req.file);
    console.log("  - Category:", category);
    console.log("  - Tags:", tags);


    // Validation using NewsValidation.js
    if (!title || !content || !authorId) {
      return res.status(400).json({
        success: false,
        message: "العنوان والمحتوى والكاتب مطلوبة",
      });
    }

    const titleValidation = validateNewsTitle(title);
    if (!titleValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: titleValidation.message,
      });
    }

    const contentValidation = validateContent(content);
    if (!contentValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: contentValidation.message,
      });
    }

    const trimmedTitle = titleValidation.value;
    const trimmedContent = contentValidation.value;

    let imageUrl = null;
    let imagePublicId = null;
    let images = [];

    // Handle multiple images from multer-cloudinary upload (already uploaded)
    if (req.files && req.files.length > 0) {
      console.log(`📤 ${req.files.length} images uploaded via multer-cloudinary`);
      
      // Process all uploaded images
      images = req.files.map((file) => {
        console.log("  - File path:", file.path);
        console.log("  - Filename:", file.filename);
        
        return {
          url: file.path,
          publicId: file.filename,
        };
      });
      
      // For backward compatibility, set first image as main image
      imageUrl = images[0].url;
      imagePublicId = images[0].publicId;
      
      console.log(`✅ Processed ${images.length} images`);
    } else if (req.file) {
      // Handle single file upload (backward compatibility)
      console.log("📤 Single image uploaded via multer-cloudinary");
      console.log("  - File path:", req.file.path);
      console.log("  - Filename:", req.file.filename);
      
      imageUrl = req.file.path;
      imagePublicId = req.file.filename;
      
      images = [{
        url: req.file.path,
        publicId: req.file.filename,
      }];
      
      console.log("✅ Image URL:", imageUrl);
      console.log("✅ Image Public ID:", imagePublicId);
    }

    // Determine author model based on role
    let authorModel = 'Admin'; // default
    if (authorRole === 'student') authorModel = 'Student';
    else if (authorRole === 'teacher') authorModel = 'Teacher';
    else if (authorRole === 'admin') authorModel = 'Admin';

    // Determine visibility based on request or default
    const visibility = req.body.visibility || 'group'; // Default to 'group' if not specified
    
    // Validate visibility
    if (!['general', 'group', 'administrative'].includes(visibility)) {
      return res.status(400).json({
        success: false,
        message: "نوع الظهور يجب أن يكون: general (عام), group (حلقة), أو administrative (إداري)",
      });
    }

    // Create news
    const newNews = new News({
      title: trimmedTitle,
      content: trimmedContent,
      description: description?.trim() || null,
      images: images, // Array of images
      image: imageUrl, // First image for backward compatibility
      imagePublicId: imagePublicId, // First image public ID for backward compatibility
      author: authorId,
      authorModel: authorModel,
      authorName: authorName,
      visibility: visibility, // Add visibility type
      category: category || "عام",
      tags: tags ? tags.split(",").map((t) => t.trim()) : [],
      isPublished: false,
      views: 0,
    });

    await newNews.save();

    console.log("✅ News created successfully:", newNews._id);

    // Send notification to students based on visibility type
    try {
      let students = [];
      
      if (visibility === 'general') {
        // General news: send to ALL students
        students = await Student.find({}).select('_id firstName lastName');
        console.log(`📧 General news: Sending to all ${students.length} students`);
      } else if (visibility === 'group') {
        // Group news: send only to teacher's students
        if (authorRole === 'teacher') {
          const teacher = await require('../../schema/Teacher').findById(authorId);
          if (teacher) {
            const teacherName = `${teacher.firstName} ${teacher.lastName}`;
            students = await Student.find({ teacher: teacherName }).select('_id firstName lastName');
            console.log(`📧 Group news: Sending to ${students.length} students of teacher: ${teacherName}`);
          }
        } else if (authorRole === 'admin') {
          // If admin chooses 'group', treat as general
          students = await Student.find({}).select('_id firstName lastName');
          console.log(`📧 Admin group news: Sending to all ${students.length} students`);
        }
      } else if (visibility === 'administrative') {
        // Administrative news: send to ALL students (from admin only)
        students = await Student.find({}).select('_id firstName lastName');
        console.log(`📧 Administrative news: Sending to all ${students.length} students`);
      }
      
      if (students && students.length > 0) {
        const notificationPromises = students.map(async (student) => {
          const notification = new Notification({
            recipient: student._id,
            recipientModel: 'Student',
            title: '📰 تم إضافة منشور جديد',
            message: `تم نشر خبر جديد: ${trimmedTitle}`,
            type: 'news',
            data: {
              newsId: newNews._id.toString(),
              newsTitle: trimmedTitle,
              relatedId: newNews._id,
              relatedModel: 'News',
            },
            isRead: false,
          });
          return notification.save();
        });

        const savedNotifications = await Promise.all(notificationPromises);
        
        // Send real-time notifications via Socket.IO
        if (global.io) {
          savedNotifications.forEach((notification) => {
            const recipientId = notification.recipient.toString();
            const notificationPayload = {
              id: notification._id,
              type: notification.type,
              title: notification.title,
              message: notification.message,
              data: notification.data,
              createdAt: notification.createdAt,
              isNew: true,
            };
            
            // Send to user's room
            global.io.to(recipientId).emit("newNotification", notificationPayload);
            console.log(`📤 Socket notification sent to student: ${recipientId}`);
          });
        }
        
        // Send push notifications via FCM
        await sendNotificationToDevices(
          students.map(s => s._id),
          '📰 تم إضافة منشور جديد',
          `تم نشر خبر جديد: ${trimmedTitle}`,
          { newsId: newNews._id.toString(), type: 'news' }
        );
        
        console.log(`✅ Sent notifications to ${students.length} students`);
      }
    } catch (notifError) {
      console.error("❌ Error sending notifications:", notifError);
      // Don't fail the whole request if notifications fail
    }

    // Emit event to subscribers for live updates
    if (global.io) {
      global.io.emit("newsCreated", {
        id: newNews._id,
        title: newNews.title,
        timestamp: newNews.createdAt,
      });
      console.log('📡 Socket event emitted: newsCreated');
    }

    res.status(201).json({
      success: true,
      message: "تم إنشاء الخبر بنجاح",
      data: newNews,
    });
  } catch (error) {
    console.error("❌ Error creating news:", error);
    
    // إذا كان الخطأ من التحقق من صحة البيانات
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "بيانات الخبر غير صحيحة",
        errors: errors,
      });
    }
    
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء إنشاء الخبر",
      error: error.message,
    });
  }
};

/**
 * Create multiple news items
 * @route POST /api/news/bulk
 */
exports.createBulkNews = async (req, res) => {
  try {
    console.log("📝 Creating bulk news...");

    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "يجب توفير مصفوفة من الأخبار",
      });
    }

    if (items.length > 100) {
      return res.status(400).json({
        success: false,
        message: "الحد الأقصى 100 خبر في العملية الواحدة",
      });
    }

    // Validate all items
    for (let item of items) {
      if (!item.title || !item.content || !item.author) {
        return res.status(400).json({
          success: false,
          message: "جميع الأخبار يجب أن تحتوي على عنوان ومحتوى وكاتب",
        });
      }
    }

    // Insert all items
    const newsItems = items.map((item) => ({
      title: item.title.trim(),
      content: item.content.trim(),
      description: item.description?.trim() || null,
      author: item.author,
      category: item.category || "عام",
      tags: item.tags ? item.tags.split(",").map((t) => t.trim()) : [],
      isPublished: item.isPublished || false,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const result = await News.insertMany(newsItems);

    console.log(`✅ Created ${result.length} news items`);

    // Emit event
    if (global.io) {
      global.io.emit("news:bulkCreated", {
        count: result.length,
        timestamp: new Date(),
      });
    }

    res.status(201).json({
      success: true,
      message: `تم إنشاء ${result.length} خبر بنجاح`,
      data: result,
    });
  } catch (error) {
    console.error("❌ Error creating bulk news:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء إنشاء الأخبار",
      error: error.message,
    });
  }
};

/**
 * Publish news item
 * @route PUT /api/news/:id/publish
 */
exports.publishNews = async (req, res) => {
  try {
    console.log("📝 Publishing news:", req.params.id);

    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "الخبر غير موجود",
      });
    }

    news.isPublished = true;
    news.publishedAt = new Date();
    await news.save();

    console.log("✅ News published successfully");

    // Emit event
    if (global.io) {
      global.io.emit("news:published", {
        id: news._id,
        title: news.title,
        timestamp: news.publishedAt,
      });
    }

    res.json({
      success: true,
      message: "تم نشر الخبر بنجاح",
      data: news,
    });
  } catch (error) {
    console.error("❌ Error publishing news:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء نشر الخبر",
      error: error.message,
    });
  }
};
