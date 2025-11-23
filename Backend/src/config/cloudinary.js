const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// تحقق من الإعدادات عند التشغيل
console.log("🌤️ Cloudinary initialized:", {
  cloud_name: cloudinary.config().cloud_name || "❌ Not set",
  api_key: cloudinary.config().api_key ? "✅ Set" : "❌ Not set",
  api_secret: cloudinary.config().api_secret ? "✅ Set" : "❌ Not set"
});

module.exports = cloudinary;
