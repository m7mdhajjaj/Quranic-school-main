const News = require("../schema/News");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for news images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../../public/uploads/news");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    console.log("File will be uploaded to:", uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExt = path.extname(file.originalname);
    const filename = "news-" + uniqueSuffix + fileExt;
    console.log("Generated filename:", filename);
    cb(null, filename);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit to accommodate larger images
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only images are allowed!"));
    }
  },
});

// Get all news items
exports.getAllNews = async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 }); // Newest first
    res.status(200).json(news);
  } catch (error) {
    console.error("Error getting news:", error);
    res
      .status(500)
      .json({ message: "حدث خطأ أثناء جلب الأخبار", error: error.message });
  }
};

// Get a single news item
exports.getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({ message: "الخبر غير موجود" });
    }

    res.status(200).json(news);
  } catch (error) {
    console.error("Error getting news by ID:", error);
    res
      .status(500)
      .json({ message: "حدث خطأ أثناء جلب الخبر", error: error.message });
  }
};

// Create a new news item
exports.createNews = async (req, res) => {
  try {
    const { title, content, date } = req.body;
    console.log("Creating news with:", { title, content, date });
    console.log("Uploaded file:", req.file);

    if (!title || !content) {
      return res.status(400).json({ message: "عنوان الخبر ومحتواه مطلوبان" });
    }

    let imageUrl = "https://placehold.co/600x400/e9f5f2/1f6357?text=صورة+خبر";

    // If file was uploaded, use its path
    if (req.file) {
      imageUrl = `uploads/news/${req.file.filename}`;
      console.log("Image URL saved:", imageUrl);
    }

    const news = await News.create({
      title,
      content,
      date: date || new Date().toLocaleDateString("ar-SA"),
      image: imageUrl,
    });

    res.status(201).json({
      message: "تم إضافة الخبر بنجاح",
      news,
    });
  } catch (error) {
    console.error("Error creating news:", error);
    res
      .status(500)
      .json({ message: "حدث خطأ أثناء إضافة الخبر", error: error.message });
  }
};

// Update news item
exports.updateNews = async (req, res) => {
  try {
    const { title, content, date, isPublished } = req.body;
    const newsId = req.params.id;

    // Get existing news item
    const news = await News.findById(newsId);

    if (!news) {
      return res.status(404).json({ message: "الخبر غير موجود" });
    }

    // Update fields if provided
    if (title) news.title = title;
    if (content) news.content = content;
    if (date) news.date = date;
    if (isPublished !== undefined) news.isPublished = isPublished;

    // Update image if a new file was uploaded
    if (req.file) {
      news.image = `uploads/news/${req.file.filename}`;
    }

    await news.save();

    res.status(200).json({
      message: "تم تحديث الخبر بنجاح",
      news,
    });
  } catch (error) {
    console.error("Error updating news:", error);
    res
      .status(500)
      .json({ message: "حدث خطأ أثناء تحديث الخبر", error: error.message });
  }
};

// Delete news item
exports.deleteNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({ message: "الخبر غير موجود" });
    }

    // Delete the news item
    await News.findByIdAndDelete(req.params.id);

    // TODO: Delete associated image file from the filesystem if it's not a placeholder
    // This requires more complex code to safely delete files and handle errors

    res.status(200).json({ message: "تم حذف الخبر بنجاح" });
  } catch (error) {
    console.error("Error deleting news:", error);
    res
      .status(500)
      .json({ message: "حدث خطأ أثناء حذف الخبر", error: error.message });
  }
};

// Upload middleware for news image
exports.uploadNewsImage = upload.single("image");
