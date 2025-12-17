// ============================================================================
// deleteNews.js - Delete News Operations
// ============================================================================

const News = require("../../schema/News");
const cloudinary = require("../../config/cloudinary");

/**
 * Delete news item
 * @route DELETE /api/news/:id
 */
exports.deleteNews = async (req, res) => {
  try {
    console.log("🗑️ Deleting news:", req.params.id);

    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "الخبر غير موجود",
      });
    }

    // التحقق من الصلاحيات: المعلم يمكنه فقط حذف أخباره
    const currentUserId = req.user?._id.toString();
    const currentUserRole = req.user?.role;
    const newsAuthorId = news.author.toString();

    if (currentUserRole === 'teacher' && currentUserId !== newsAuthorId) {
      return res.status(403).json({
        success: false,
        message: "لا يمكنك حذف أخبار منشورة من قبل معلمين آخرين",
      });
    }

    // Delete all images from Cloudinary
    if (news.images && news.images.length > 0) {
      try {
        console.log(`🗑️ Deleting ${news.images.length} images from Cloudinary...`);
        
        // Optimize: Delete all images in parallel
        const deletePromises = news.images.map(img => 
          cloudinary.uploader.destroy(img.publicId)
            .then(() => console.log(`✅ Deleted image: ${img.publicId}`))
            .catch(err => console.warn(`⚠️ Could not delete image ${img.publicId}:`, err))
        );

        await Promise.all(deletePromises);
        
        // Try to delete the entire news folder
        // Extract folder path from first image public ID
        // Format: quranic-school/news/{teacherName}_{teacherId}/{newsId}/image_xxx
        if (news.images[0]?.publicId) {
          const publicId = news.images[0].publicId;
          const folderPath = publicId.substring(0, publicId.lastIndexOf('/'));
          
          // Run folder deletion in background to not block response
          cloudinary.api.delete_resources_by_prefix(folderPath)
            .then(() => cloudinary.api.delete_folder(folderPath))
            .then(() => console.log(`✅ Deleted news folder: ${folderPath}`))
            .catch(err => console.warn("⚠️ Could not delete news folder:", err));
        }
        
        console.log("✅ All images deleted successfully from Cloudinary");
      } catch (deleteError) {
        console.warn("⚠️ Could not delete images:", deleteError);
        // Continue with news deletion even if image deletion fails
      }
    } else if (news.image && news.imagePublicId) {
      // Backward compatibility: delete single image
      try {
        console.log("🗑️ Deleting image from Cloudinary...");
        console.log("  - Public ID:", news.imagePublicId);

        await cloudinary.uploader.destroy(news.imagePublicId);
        console.log("✅ Image deleted successfully from Cloudinary");
      } catch (deleteError) {
        console.warn("⚠️ Could not delete image:", deleteError);
        // Continue with news deletion even if image deletion fails
      }
    }

    // Delete news
    await News.findByIdAndDelete(req.params.id);

    console.log("✅ News deleted successfully");

    res.json({
      success: true,
      message: "تم حذف الخبر بنجاح",
    });
  } catch (error) {
    console.error("❌ Error deleting news:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء حذف الخبر",
      error: error.message,
    });
  }
};

/**
 * Delete multiple news items
 * @route DELETE /api/news/bulk
 */
exports.deleteBulkNews = async (req, res) => {
  try {
    console.log("🗑️ Deleting bulk news...");

    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "يجب توفير مصفوفة من معرفات الأخبار",
      });
    }

    if (ids.length > 100) {
      return res.status(400).json({
        success: false,
        message: "الحد الأقصى 100 خبر في العملية الواحدة",
      });
    }

    const newsItems = await News.find({ _id: { $in: ids } });

    // Optimize: Collect all public IDs and folders first
    const publicIdsToDelete = [];
    const foldersToDelete = new Set();

    for (let news of newsItems) {
      if (news.images && news.images.length > 0) {
        news.images.forEach(img => {
          if (img.publicId) publicIdsToDelete.push(img.publicId);
        });
        
        // Identify folder to delete
        if (news.images[0]?.publicId) {
          const publicId = news.images[0].publicId;
          const folderPath = publicId.substring(0, publicId.lastIndexOf('/'));
          foldersToDelete.add(folderPath);
        }
      } else if (news.image && news.imagePublicId) {
        publicIdsToDelete.push(news.imagePublicId);
      }
    }

    // Delete images in parallel (batches of 20)
    if (publicIdsToDelete.length > 0) {
      console.log(`🗑️ Deleting ${publicIdsToDelete.length} images from Cloudinary...`);
      const batchSize = 20;
      for (let i = 0; i < publicIdsToDelete.length; i += batchSize) {
        const batch = publicIdsToDelete.slice(i, i + batchSize);
        await Promise.all(batch.map(id => 
          cloudinary.uploader.destroy(id).catch(err => console.warn(`⚠️ Failed to delete ${id}:`, err))
        ));
      }
    }

    // Delete folders in background (fire and forget)
    if (foldersToDelete.size > 0) {
      const folderPromises = Array.from(foldersToDelete).map(folderPath => 
        cloudinary.api.delete_resources_by_prefix(folderPath)
          .then(() => cloudinary.api.delete_folder(folderPath))
          .catch(err => console.warn(`⚠️ Failed to delete folder ${folderPath}:`, err))
      );
      // We don't await this to speed up response
      Promise.all(folderPromises).then(() => console.log("✅ Background folder deletion complete"));
    }

    console.log(`✅ Processed deletion for ${newsItems.length} items`);

    // Delete news items
    const result = await News.deleteMany({ _id: { $in: ids } });

    console.log(`✅ Deleted ${result.deletedCount} news items`);

    // Emit event
    if (global.io) {
      global.io.emit("news:bulkDeleted", {
        count: result.deletedCount,
        timestamp: new Date(),
      });
    }

    res.json({
      success: true,
      message: `تم حذف ${result.deletedCount} خبر بنجاح`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("❌ Error deleting bulk news:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء حذف الأخبار",
      error: error.message,
    });
  }
};

/**
 * Soft delete news (archive)
 * @route PUT /api/news/:id/archive
 */
exports.archiveNews = async (req, res) => {
  try {
    console.log("📦 Archiving news:", req.params.id);

    const news = await News.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          isArchived: true,
          archivedAt: new Date(),
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "الخبر غير موجود",
      });
    }

    console.log("✅ News archived successfully");

    // Emit event
    if (global.io) {
      global.io.emit("news:archived", {
        id: news._id,
        title: news.title,
        timestamp: news.archivedAt,
      });
    }

    res.json({
      success: true,
      message: "تم أرشفة الخبر بنجاح",
      data: news,
    });
  } catch (error) {
    console.error("❌ Error archiving news:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء أرشفة الخبر",
      error: error.message,
    });
  }
};

/**
 * Clear all archived news
 * @route DELETE /api/news/clear-archived
 */
exports.clearArchivedNews = async (req, res) => {
  try {
    console.log("🗑️ Clearing archived news...");

    const archivedNews = await News.find({ isArchived: true });

    // Delete images
    for (let news of archivedNews) {
      if (news.images && news.images.length > 0) {
        for (const img of news.images) {
          try {
            await cloudinary.uploader.destroy(img.publicId);
          } catch (deleteError) {
            console.warn("⚠️ Could not delete image:", deleteError);
          }
        }
        
        // Try to delete the entire news folder
        if (news.images[0]?.publicId) {
          const publicId = news.images[0].publicId;
          const folderPath = publicId.substring(0, publicId.lastIndexOf('/'));
          
          try {
            await cloudinary.api.delete_resources_by_prefix(folderPath);
            await cloudinary.api.delete_folder(folderPath);
          } catch (folderError) {
            console.warn("⚠️ Could not delete news folder:", folderError);
          }
        }
      } else if (news.image && news.imagePublicId) {
        try {
          await cloudinary.uploader.destroy(news.imagePublicId);
        } catch (deleteError) {
          console.warn("⚠️ Could not delete image:", deleteError);
        }
      }
    }

    const result = await News.deleteMany({ isArchived: true });

    console.log(`✅ Cleared ${result.deletedCount} archived news items`);

    // Emit event
    if (global.io) {
      global.io.emit("news:archivedCleared", {
        count: result.deletedCount,
        timestamp: new Date(),
      });
    }

    res.json({
      success: true,
      message: `تم حذف ${result.deletedCount} خبر مؤرشف`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("❌ Error clearing archived news:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء حذف الأخبار المؤرشفة",
      error: error.message,
    });
  }
};
