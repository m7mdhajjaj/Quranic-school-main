// ============================================================================
// updateNews.js - Update News Operations
// ============================================================================

const News = require("../../schema/News");
const { cloudinary } = require("../../config/cloudinary");
const Student = require("../../schema/Student");
const Notification = require("../../schema/Notification");
const { notifyNewsUpdated } = require("../../Notifications");

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

    const { title, content, visibility } = req.body;

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

    // Update visibility if provided
    if (visibility && ['general', 'group'].includes(visibility)) {
      news.visibility = visibility;
    }

    // Handle images update
    let newFiles = [];
    if (req.files && req.files.length > 0) {
      newFiles = req.files;
    } else if (req.file) {
      newFiles = [req.file];
    }

    if (newFiles.length > 0) {
      try {
        console.log(`📤 Updating with ${newFiles.length} new images...`);

        // 1. Delete old images from Cloudinary
        if (news.images && news.images.length > 0) {
          console.log(`🗑️ Deleting ${news.images.length} old images...`);
          // Use Promise.all for parallel deletion
          await Promise.all(news.images.map(async (img) => {
            try {
              await cloudinary.uploader.destroy(img.publicId);
              console.log(`✅ Deleted old image: ${img.publicId}`);
            } catch (deleteError) {
              console.warn(`⚠️ Could not delete old image ${img.publicId}:`, deleteError);
            }
          }));
        } else if (news.imagePublicId) {
          // Backward compatibility: delete single old image
          try {
            await cloudinary.uploader.destroy(news.imagePublicId);
            console.log("✅ Old image deleted");
          } catch (deleteError) {
            console.warn("⚠️ Could not delete old image:", deleteError);
          }
        }

        // 2. Process new uploaded images
        const newImages = newFiles.map((file) => {
          console.log("  - File path:", file.path);
          console.log("  - Filename:", file.filename);
          
          return {
            url: file.path,
            publicId: file.filename,
          };
        });

        // 3. Update news document
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
    }

    news.updatedAt = new Date();
    await news.save();

    console.log("✅ News updated successfully");

    // Send notification using centralized handler
    try {
      const io = req.app.get("io");
      await notifyNewsUpdated(news, io);
    } catch (notifError) {
      console.error("❌ Error sending update notifications:", notifError);
      // Don't fail the whole request if notifications fail
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
