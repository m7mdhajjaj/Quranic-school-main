// ============================================================================
// updateNews.js - Update News Operations
// ============================================================================

const News = require("../../schema/News");
const cloudinary = require("../../config/cloudinary");
const Student = require("../../schema/Student");
const Notification = require("../../schema/Notification");
const { sendNotificationToDevices } = require("../../Notifications/NotificationService");

/**
 * Update news item
 * @route PUT /api/news/:id
 */
exports.updateNews = async (req, res) => {
  try {
    console.log("========================================");
    console.log("✏️ Updating news:", req.params.id);
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

    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "الخبر غير موجود",
      });
    }

    // التحقق من الصلاحيات: المعلم يمكنه فقط تعديل أخباره
    const currentUserId = req.user?._id.toString();
    const currentUserRole = req.user?.role;
    const newsAuthorId = news.author.toString();

    if (currentUserRole === 'teacher' && currentUserId !== newsAuthorId) {
      return res.status(403).json({
        success: false,
        message: "لا يمكنك تعديل أخبار منشورة من قبل معلمين آخرين",
      });
    }

    // Update fields
    if (title) {
      if (title.length < 3 || title.length > 200) {
        return res.status(400).json({
          success: false,
          message: "العنوان يجب أن يكون بين 3 و 200 حرف",
          errors: ["العنوان يجب أن يكون بين 3 و 200 حرف"]
        });
      }
      news.title = title.trim();
    }

    if (content) {
      if (content.length < 3) {
        return res.status(400).json({
          success: false,
          message: "المحتوى يجب أن يكون 3 أحرف على الأقل",
          errors: ["المحتوى يجب أن يكون 3 أحرف على الأقل"]
        });
      }
      news.content = content.trim();
    }

    if (description) news.description = description.trim();
    if (author) news.author = author;
    if (category) news.category = category;
    if (tags) news.tags = tags.split(",").map((t) => t.trim());

    // Handle images update
    if (req.files && req.files.length > 0) {
      try {
        console.log(`📤 Updating with ${req.files.length} new images...`);

        // Delete old images from news folder in Cloudinary
        if (news.images && news.images.length > 0) {
          console.log(`🗑️ Deleting ${news.images.length} old images...`);
          
          for (const img of news.images) {
            try {
              await cloudinary.uploader.destroy(img.publicId);
              console.log(`✅ Deleted old image: ${img.publicId}`);
            } catch (deleteError) {
              console.warn("⚠️ Could not delete old image:", deleteError);
            }
          }
        } else if (news.imagePublicId) {
          // Backward compatibility: delete single old image
          try {
            await cloudinary.uploader.destroy(news.imagePublicId);
            console.log("✅ Old image deleted");
          } catch (deleteError) {
            console.warn("⚠️ Could not delete old image:", deleteError);
          }
        }

        // Process all new uploaded images
        const newImages = req.files.map((file) => {
          console.log("  - File path:", file.path);
          console.log("  - Filename:", file.filename);
          
          return {
            url: file.path,
            publicId: file.filename,
          };
        });

        // Update images array
        news.images = newImages;
        
        // Update backward compatibility fields
        news.image = newImages[0].url;
        news.imagePublicId = newImages[0].publicId;
        
        console.log(`✅ Updated with ${newImages.length} new images`);
      } catch (uploadError) {
        console.error("❌ Images update failed:", uploadError);
        return res.status(400).json({
          success: false,
          message: "فشل تحديث الصور",
          error: uploadError.message,
        });
      }
    } else if (req.file) {
      // Handle single file upload (backward compatibility)
      try {
        console.log("📤 Updating with single image...");

        // Delete old images
        if (news.images && news.images.length > 0) {
          for (const img of news.images) {
            try {
              await cloudinary.uploader.destroy(img.publicId);
            } catch (deleteError) {
              console.warn("⚠️ Could not delete old image:", deleteError);
            }
          }
        } else if (news.imagePublicId) {
          try {
            await cloudinary.uploader.destroy(news.imagePublicId);
          } catch (deleteError) {
            console.warn("⚠️ Could not delete old image:", deleteError);
          }
        }

        // Update with single image
        news.image = req.file.path;
        news.imagePublicId = req.file.filename;
        news.images = [{
          url: req.file.path,
          publicId: req.file.filename,
        }];
        
        console.log("✅ Updated with single image");
      } catch (uploadError) {
        console.error("❌ Image update failed:", uploadError);
        return res.status(400).json({
          success: false,
          message: "فشل تحديث الصورة",
          error: uploadError.message,
        });
      }
    }

    news.updatedAt = new Date();
    await news.save();

    console.log("✅ News updated successfully");

    // Send notification to all students about the update
    try {
      const students = await Student.find({}).select('_id firstName lastName');
      
      if (students && students.length > 0) {
        const trimmedTitle = news.title.length > 50 
          ? news.title.substring(0, 50) + '...' 
          : news.title;

        const notificationPromises = students.map(async (student) => {
          const notification = new Notification({
            recipient: student._id,
            recipientModel: 'Student',
            title: '✏️ تم تعديل منشور',
            message: `تم تحديث المنشور: ${trimmedTitle}`,
            type: 'news',
            data: {
              newsId: news._id.toString(),
              newsTitle: trimmedTitle,
              relatedId: news._id,
              relatedModel: 'News',
              action: 'updated',
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
          '✏️ تم تعديل منشور',
          `تم تحديث المنشور: ${trimmedTitle}`,
          { 
            newsId: news._id.toString(), 
            type: 'news',
            action: 'updated'
          }
        );
        
        console.log(`✅ Sent update notifications to ${students.length} students`);
      }
    } catch (notifError) {
      console.error("❌ Error sending update notifications:", notifError);
      // Don't fail the whole request if notifications fail
    }

    // Emit event for live updates
    if (global.io) {
      global.io.emit("newsUpdated", {
        id: news._id,
        title: news.title,
        timestamp: news.updatedAt,
      });
      console.log('📡 Socket event emitted: newsUpdated');
    }

    res.json({
      success: true,
      message: "تم تحديث الخبر بنجاح",
      data: news,
    });
  } catch (error) {
    console.error("❌ Error updating news:", error);
    
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
      message: "حدث خطأ أثناء تحديث الخبر",
      error: error.message,
    });
  }
};

/**
 * Update multiple news items
 * @route PUT /api/news/bulk
 */
exports.updateBulkNews = async (req, res) => {
  try {
    console.log("✏️ Updating bulk news...");

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

    // Validate all items have ID
    for (let item of items) {
      if (!item._id || !item.id) {
        return res.status(400).json({
          success: false,
          message: "جميع الأخبار يجب أن تحتوي على ID",
        });
      }
    }

    const updates = [];

    for (let item of items) {
      const id = item._id || item.id;

      const update = {
        $set: {
          updatedAt: new Date(),
        },
      };

      if (item.title) update.$set.title = item.title.trim();
      if (item.content) update.$set.content = item.content.trim();
      if (item.description) update.$set.description = item.description.trim();
      if (item.author) update.$set.author = item.author;
      if (item.category) update.$set.category = item.category;
      if (item.tags)
        update.$set.tags = item.tags.split(",").map((t) => t.trim());
      if (item.isPublished !== undefined)
        update.$set.isPublished = item.isPublished;

      const result = await News.findByIdAndUpdate(id, update, { new: true });
      updates.push(result);
    }

    console.log(`✅ Updated ${updates.length} news items`);

    // Emit event
    if (global.io) {
      global.io.emit("news:bulkUpdated", {
        count: updates.length,
        timestamp: new Date(),
      });
    }

    res.json({
      success: true,
      message: `تم تحديث ${updates.length} خبر بنجاح`,
      data: updates,
    });
  } catch (error) {
    console.error("❌ Error updating bulk news:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تحديث الأخبار",
      error: error.message,
    });
  }
};

/**
 * Increment news views
 * @route PUT /api/news/:id/view
 */
exports.incrementViews = async (req, res) => {
  try {
    console.log("👁️ Incrementing views for:", req.params.id);

    const news = await News.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "الخبر غير موجود",
      });
    }

    console.log(`✅ Views incremented to ${news.views}`);

    res.json({
      success: true,
      data: {
        views: news.views,
      },
    });
  } catch (error) {
    console.error("❌ Error incrementing views:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تحديث المشاهدات",
      error: error.message,
    });
  }
};
