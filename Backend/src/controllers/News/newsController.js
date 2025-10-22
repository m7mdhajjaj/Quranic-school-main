const News = require("../../schema/News");
const cloudinary = require("../../config/cloudinary");

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
    const { title, content, date, imageUrl, imagePublicId } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "عنوان الخبر ومحتواه مطلوبان" });
    }

    // Use the provided Cloudinary URL or a default placeholder
    const finalImageUrl =
      imageUrl && imageUrl.startsWith("http")
        ? imageUrl
        : "https://placehold.co/600x400/e9f5f2/1f6357?text=صورة+خبر";

    const news = await News.create({
      title,
      content,
      date: date || new Date().toLocaleDateString("en-GB"),
      image: finalImageUrl,
      imagePublicId: imagePublicId || null,
    });

    // 🔌 Emit Socket event to news room
    const io = req.app.get("io");
    if (io) {
      io.to("news").emit("newsCreated", {
        news: news,
        timestamp: Date.now(),
      });
      console.log("✅ newsCreated event emitted to news room");
    }

    res.status(201).json(news);
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
    const { title, content, date, isPublished, imageUrl, imagePublicId } = req.body;
    const newsId = req.params.id;

    const news = await News.findById(newsId);

    if (!news) {
      return res.status(404).json({ message: "الخبر غير موجود" });
    }

    // Update fields if provided
    if (title) news.title = title;
    if (content) news.content = content;
    if (date) news.date = date;
    if (isPublished !== undefined) news.isPublished = isPublished;

    // Update image only if a new Cloudinary URL was provided
    if (imageUrl && imageUrl.startsWith("http")) {
      // Delete old image from Cloudinary if exists and a new image is provided
      if (news.imagePublicId && imagePublicId && news.imagePublicId !== imagePublicId) {
        try {
          await cloudinary.uploader.destroy(news.imagePublicId);
          console.log(`✅ Deleted old image from Cloudinary: ${news.imagePublicId}`);
        } catch (cloudinaryError) {
          console.error("Error deleting old image from Cloudinary:", cloudinaryError);
          // Continue with update even if deletion fails
        }
      }
      
      news.image = imageUrl;
      news.imagePublicId = imagePublicId || null;
    }

    await news.save();

    // 🔌 Emit Socket event to news room
    const io = req.app.get("io");
    if (io) {
      io.to("news").emit("newsUpdated", {
        news: news,
        timestamp: Date.now(),
      });
      console.log("✅ newsUpdated event emitted to news room");
    }

    res.status(200).json(news);
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

    // Delete image from Cloudinary if exists
    if (news.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(news.imagePublicId);
        console.log(`✅ Deleted image from Cloudinary: ${news.imagePublicId}`);
      } catch (cloudinaryError) {
        console.error("Error deleting image from Cloudinary:", cloudinaryError);
        // Continue with news deletion even if Cloudinary deletion fails
      }
    }

    await News.findByIdAndDelete(req.params.id);

    // 🔌 Emit Socket event to news room
    const io = req.app.get("io");
    if (io) {
      io.to("news").emit("newsDeleted", {
        newsId: req.params.id,
        timestamp: Date.now(),
      });
      console.log("✅ newsDeleted event emitted to news room");
    }

    res.status(200).json({ message: "تم حذف الخبر بنجاح" });
  } catch (error) {
    console.error("Error deleting news:", error);
    res
      .status(500)
      .json({ message: "حدث خطأ أثناء حذف الخبر", error: error.message });
  }
};

