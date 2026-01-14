// ============================================================================
// cloudinary/upload.js - دوال الرفع والحذف
// ============================================================================

const cloudinary = require('./config');
const { getUploadOptions } = require('./constants');

/**
 * رفع ملف إلى Cloudinary
 * @param {string|Buffer} file - مسار الملف أو Buffer
 * @param {string} type - نوع الملف (avatar, logo, hero, news, video, welcome_video)
 * @param {object} customOptions - خيارات إضافية
 * @returns {Promise<object>} - نتيجة الرفع
 */
const uploadToCloudinary = async (file, type = 'image', customOptions = {}) => {
  try {
    const options = {
      ...getUploadOptions(type),
      ...customOptions,
    };
    
    console.log(`📤 جاري رفع ${type} إلى Cloudinary...`);
    console.log(`📁 المجلد: ${options.folder}`);
    
    const result = await cloudinary.uploader.upload(file, options);
    
    console.log(`✅ تم رفع ${type} بنجاح:`, result.secure_url);
    
    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      resource_type: result.resource_type,
      created_at: result.created_at,
    };
  } catch (error) {
    console.error(`❌ خطأ في رفع ${type}:`, error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * رفع فيديو إلى Cloudinary (مع stream للملفات الكبيرة)
 * @param {string|Buffer} file - مسار الملف أو Buffer
 * @param {string} type - نوع الفيديو (video, welcome_video)
 * @param {object} customOptions - خيارات إضافية
 * @returns {Promise<object>} - نتيجة الرفع
 */
const uploadVideoToCloudinary = async (file, type = 'video', customOptions = {}) => {
  try {
    const options = {
      ...getUploadOptions(type),
      ...customOptions,
      resource_type: 'video',
    };
    
    console.log(`🎬 جاري رفع فيديو ${type} إلى Cloudinary...`);
    console.log(`📁 المجلد: ${options.folder}`);
    
    const result = await cloudinary.uploader.upload(file, options);
    
    console.log(`✅ تم رفع الفيديو بنجاح:`, result.secure_url);
    
    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      duration: result.duration,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      resource_type: result.resource_type,
      created_at: result.created_at,
    };
  } catch (error) {
    console.error(`❌ خطأ في رفع الفيديو:`, error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * حذف ملف من Cloudinary
 * @param {string} publicId - Public ID للملف
 * @param {string} resourceType - نوع الملف (image, video, raw)
 * @returns {Promise<object>} - نتيجة الحذف
 */
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    console.log(`🗑️ جاري حذف ${publicId} من Cloudinary...`);
    
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true,
    });
    
    if (result.result === 'ok') {
      console.log(`✅ تم حذف ${publicId} بنجاح`);
      return { success: true };
    } else {
      console.log(`⚠️ لم يتم العثور على ${publicId}`);
      return { success: false, error: 'Not found' };
    }
  } catch (error) {
    console.error(`❌ خطأ في حذف ${publicId}:`, error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * استخراج Public ID من رابط Cloudinary
 * @param {string} url - رابط Cloudinary
 * @returns {string|null} - Public ID
 */
const extractPublicIdFromUrl = (url) => {
  try {
    if (!url || !url.includes('cloudinary')) return null;
    
    // مثال: https://res.cloudinary.com/xxx/image/upload/v123/folder/file.jpg
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;
    
    // إزالة version والامتداد
    let publicId = parts[1].replace(/^v\d+\//, '');
    publicId = publicId.replace(/\.[^/.]+$/, '');
    
    return publicId;
  } catch {
    return null;
  }
};

module.exports = {
  uploadToCloudinary,
  uploadVideoToCloudinary,
  deleteFromCloudinary,
  extractPublicIdFromUrl,
};
