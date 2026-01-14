// ============================================================================
// cloudinary/config.js - إعدادات Cloudinary الأساسية
// ============================================================================

const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// تحقق من الإعدادات عند التشغيل
const checkConfig = () => {
  const config = {
    cloud_name: cloudinary.config().cloud_name || null,
    api_key: cloudinary.config().api_key || null,
    api_secret: cloudinary.config().api_secret || null,
  };
  
  console.log("🌤️ Cloudinary initialized:", {
    cloud_name: config.cloud_name || "❌ Not set",
    api_key: config.api_key ? "✅ Set" : "❌ Not set",
    api_secret: config.api_secret ? "✅ Set" : "❌ Not set"
  });
  
  return config;
};

// تشغيل التحقق
checkConfig();

module.exports = cloudinary;
