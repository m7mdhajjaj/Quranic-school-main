const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();

// Configure multer for hero image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../public/uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "hero-image-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("يُسمح فقط بملفات الصور"));
    }
  },
});

// In-memory storage for settings (you can replace this with a database model)
let settings = {
  heroImage: "/src/images/officialPhoto.jpg", // Default image
};

// GET /api/settings/hero-image - Get current hero image
router.get("/hero-image", (req, res) => {
  try {
    res.json({
      success: true,
      heroImage: settings.heroImage,
    });
  } catch (error) {
    console.error("Error getting hero image:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في جلب صورة البطل",
    });
  }
});

// POST /api/settings/hero-image - Upload new hero image
router.post("/hero-image", upload.single("heroImage"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "لم يتم رفع أي ملف",
      });
    }

    // Delete old hero image if it's not the default one
    if (
      settings.heroImage &&
      settings.heroImage !== "/src/images/officialPhoto.jpg" &&
      settings.heroImage.startsWith("/uploads/")
    ) {
      const oldImagePath = path.join(
        __dirname,
        "../../public",
        settings.heroImage
      );
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
        console.log("Deleted old hero image:", oldImagePath);
      }
    }

    // Update the hero image path
    settings.heroImage = `/uploads/${req.file.filename}`;

    console.log("New hero image uploaded:", settings.heroImage);

    res.json({
      success: true,
      message: "تم رفع صورة البطل بنجاح",
      heroImage: settings.heroImage,
    });
  } catch (error) {
    console.error("Error uploading hero image:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في رفع صورة البطل",
    });
  }
});

module.exports = router;
