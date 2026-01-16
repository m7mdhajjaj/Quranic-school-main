// ============================================================================
// welcomeVideoUpload.js - رفع فيديو صفحة الترحيب
// ============================================================================

const { uploadVideoToCloudinary, deleteFromCloudinary, extractPublicIdFromUrl } = require('../../config/cloudinary/upload');
const { CLOUDINARY_FOLDERS } = require('../../config/cloudinary/constants');
const Settings = require('../../schema/Settings');

// مفتاح الإعداد في قاعدة البيانات
const WELCOME_VIDEO_KEY = 'welcomePageVideoUrl';

/**
 * رفع فيديو صفحة الترحيب
 * POST /api/upload/welcome-video
 */
const uploadWelcomeVideo = async (req, res) => {
  try {
    // التحقق من وجود ملف
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'لم يتم إرسال ملف فيديو',
      });
    }

    // التحقق من نوع الملف
    if (!req.file.mimetype.startsWith('video/')) {
      return res.status(400).json({
        success: false,
        message: 'الملف يجب أن يكون فيديو',
      });
    }

    // التحقق من حجم الملف (100MB max)
    const maxSize = 100 * 1024 * 1024;
    if (req.file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: 'حجم الفيديو يجب أن يكون أقل من 100MB',
      });
    }

    console.log('🎬 جاري رفع فيديو الترحيب...');
    console.log('📁 الحجم:', (req.file.size / (1024 * 1024)).toFixed(2), 'MB');

    // حذف الفيديو القديم إذا كان موجوداً
    const currentWelcomeVideoUrl = await Settings.getValue(WELCOME_VIDEO_KEY);
    if (currentWelcomeVideoUrl) {
      const oldPublicId = extractPublicIdFromUrl(currentWelcomeVideoUrl);
      if (oldPublicId) {
        await deleteFromCloudinary(oldPublicId, 'video');
      }
    }

    // رفع الفيديو الجديد
    // نستخدم path الملف المؤقت من multer
    const result = await uploadVideoToCloudinary(
      req.file.path || req.file.buffer,
      'welcome_video',
      {
        folder: CLOUDINARY_FOLDERS.WELCOME_VIDEO,
        public_id: `Quest_${Date.now()}`,
      }
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'فشل رفع الفيديو',
        error: result.error,
      });
    }

    // حفظ الرابط الجديد في قاعدة البيانات
    await Settings.setValue(
      WELCOME_VIDEO_KEY,
      result.url,
      'رابط فيديو صفحة الترحيب',
      req.user?._id // إذا كان المستخدم مسجل دخول
    );

    console.log('✅ تم رفع فيديو الترحيب بنجاح:', result.url);

    return res.status(200).json({
      success: true,
      message: 'تم رفع فيديو الترحيب بنجاح',
      data: {
        url: result.url,
        public_id: result.public_id,
        duration: result.duration,
        width: result.width,
        height: result.height,
        size: result.bytes,
      },
    });
  } catch (error) {
    console.error('❌ خطأ في رفع فيديو الترحيب:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء رفع الفيديو',
      error: error.message,
    });
  }
};

/**
 * الحصول على رابط فيديو الترحيب الحالي
 * GET /api/upload/welcome-video
 */
const getWelcomeVideo = async (req, res) => {
  try {
    // الفيديو الافتراضي من Pexels (مسجد)
    const defaultVideoUrl = 'https://videos.pexels.com/video-files/3773486/3773486-hd_1920_1080_30fps.mp4';
    
    // جلب رابط الفيديو من قاعدة البيانات
    const customVideoUrl = await Settings.getValue(WELCOME_VIDEO_KEY);
    
    return res.status(200).json({
      success: true,
      data: {
        url: customVideoUrl || defaultVideoUrl,
        isCustom: !!customVideoUrl,
      },
    });
  } catch (error) {
    console.error('❌ خطأ في جلب فيديو الترحيب:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ',
      error: error.message,
    });
  }
};

/**
 * حذف فيديو الترحيب (استعادة الافتراضي)
 * DELETE /api/upload/welcome-video
 */
const deleteWelcomeVideo = async (req, res) => {
  try {
    // جلب رابط الفيديو الحالي من قاعدة البيانات
    const currentWelcomeVideoUrl = await Settings.getValue(WELCOME_VIDEO_KEY);
    
    if (!currentWelcomeVideoUrl) {
      return res.status(400).json({
        success: false,
        message: 'لا يوجد فيديو مخصص للحذف',
      });
    }

    // حذف من Cloudinary
    const publicId = extractPublicIdFromUrl(currentWelcomeVideoUrl);
    if (publicId) {
      await deleteFromCloudinary(publicId, 'video');
    }

    // حذف من قاعدة البيانات
    await Settings.deleteValue(WELCOME_VIDEO_KEY);

    console.log('✅ تم حذف فيديو الترحيب واستعادة الافتراضي');

    return res.status(200).json({
      success: true,
      message: 'تم استعادة الفيديو الافتراضي',
    });
  } catch (error) {
    console.error('❌ خطأ في حذف فيديو الترحيب:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ',
      error: error.message,
    });
  }
};

module.exports = {
  uploadWelcomeVideo,
  getWelcomeVideo,
  deleteWelcomeVideo,
};
