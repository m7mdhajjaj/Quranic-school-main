// ============================================================================
// createNews.js - Create News Operations
// ============================================================================

const News = require("../../schema/News");
const cloudinary = require("../../config/cloudinary");
const { validateNewsTitle, validateContent } = require("../../Validation/NewsValidation");
const Student = require("../../schema/Student");
const Notification = require("../../schema/Notification");
const { sendNotificationToDevices } = require("../../services/NotificationService");

/**
 * Create new news item
 * @route POST /api/news
 */
exports.createNews = async (req, res) => {
  try {
    console.log("📝 Creating new news...");

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

    // Upload image if provided
    if (req.file) {
      try {
        console.log("📤 Uploading image to Cloudinary...");

        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "quranic-school/news",
          resource_type: "auto",
        });

        imageUrl = result.secure_url;
        console.log("✅ Image uploaded successfully");
      } catch (uploadError) {
        console.error("❌ Image upload failed:", uploadError);
        return res.status(400).json({
          success: false,
          message: "فشل تحميل الصورة",
          error: uploadError.message,
        });
      }
    }

    // Determine author model based on role
    let authorModel = 'Admin'; // default
    if (authorRole === 'student') authorModel = 'Student';
    else if (authorRole === 'teacher') authorModel = 'Teacher';
    else if (authorRole === 'admin') authorModel = 'Admin';

    // Create news
    const newNews = new News({
      title: trimmedTitle,
      content: trimmedContent,
      description: description?.trim() || null,
      image: imageUrl,
      author: authorId,
      authorModel: authorModel,
      authorName: authorName,
      category: category || "عام",
      tags: tags ? tags.split(",").map((t) => t.trim()) : [],
      isPublished: false,
      views: 0,
    });

    await newNews.save();

    console.log("✅ News created successfully:", newNews._id);

    // Send notification to all students
    try {
      const students = await Student.find({}).select('_id firstName lastName');
      
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
