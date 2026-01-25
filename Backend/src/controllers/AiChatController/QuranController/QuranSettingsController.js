// ============================================================================
// QuranSettingsController.js - Controller for Reading Settings & Bookmarks
// ============================================================================

const QuranUserSettings = require("../../../schema/QuranUserSettings");

/**
 * Helper: Get user type from role
 */
const getUserType = (role) => {
  if (role === "student") return "Student";
  if (role === "teacher" || role === "teacherAssistant") return "Teacher";
  return "Admin";
};

/**
 * Get reading settings for current user
 * @route GET /api/quran/reading-settings
 */
const getReadingSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const userType = getUserType(req.user.role);

    const settings = await QuranUserSettings.findOne({ userId, userType });

    if (!settings) {
      // إرجاع الإعدادات الافتراضية إذا لم تكن موجودة
      return res.json({
        success: true,
        data: {
          fontSize: 18,
          theme: "light",
          ayahsPerPage: 10,
        },
      });
    }

    res.json({
      success: true,
      data: settings.readingSettings,
    });
  } catch (err) {
    console.error("Error fetching reading settings:", err);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في جلب الإعدادات",
      error: err.message,
    });
  }
};

/**
 * Save reading settings for current user
 * @route POST /api/quran/reading-settings
 */
const saveReadingSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const userType = getUserType(req.user.role);
    const { fontSize, theme, ayahsPerPage } = req.body;

    // التحقق من صحة البيانات
    const updateData = {};
    if (fontSize !== undefined) {
      updateData["readingSettings.fontSize"] = Math.min(Math.max(fontSize, 12), 40);
    }
    if (theme !== undefined && ["light", "dark", "sepia"].includes(theme)) {
      updateData["readingSettings.theme"] = theme;
    }
    if (ayahsPerPage !== undefined) {
      updateData["readingSettings.ayahsPerPage"] = Math.min(Math.max(ayahsPerPage, 5), 50);
    }

    const settings = await QuranUserSettings.findOneAndUpdate(
      { userId, userType },
      { $set: updateData },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: "تم حفظ الإعدادات بنجاح",
      data: settings.readingSettings,
    });
  } catch (err) {
    console.error("Error saving reading settings:", err);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في حفظ الإعدادات",
      error: err.message,
    });
  }
};

/**
 * Get reading bookmark for current user
 * @route GET /api/quran/bookmark
 */
const getBookmark = async (req, res) => {
  try {
    const userId = req.user._id;
    const userType = getUserType(req.user.role);

    const settings = await QuranUserSettings.findOne({ userId, userType });

    if (!settings || !settings.bookmark || !settings.bookmark.surahNumber) {
      return res.json({
        success: true,
        data: null,
        message: "لا توجد إشارة مرجعية",
      });
    }

    res.json({
      success: true,
      data: settings.bookmark,
    });
  } catch (err) {
    console.error("Error fetching bookmark:", err);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في جلب الإشارة المرجعية",
      error: err.message,
    });
  }
};

/**
 * Save reading bookmark for current user
 * @route POST /api/quran/bookmark
 */
const saveBookmark = async (req, res) => {
  try {
    const userId = req.user._id;
    const userType = getUserType(req.user.role);
    const { surahNumber, ayahNumber } = req.body;

    // التحقق من صحة البيانات
    if (!surahNumber || surahNumber < 1 || surahNumber > 114) {
      return res.status(400).json({
        success: false,
        message: "رقم السورة غير صحيح",
      });
    }
    if (!ayahNumber || ayahNumber < 1) {
      return res.status(400).json({
        success: false,
        message: "رقم الآية غير صحيح",
      });
    }

    const settings = await QuranUserSettings.findOneAndUpdate(
      { userId, userType },
      {
        $set: {
          "bookmark.surahNumber": surahNumber,
          "bookmark.ayahNumber": ayahNumber,
          "bookmark.lastUpdated": new Date(),
        },
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: "تم حفظ الإشارة المرجعية بنجاح",
      data: settings.bookmark,
    });
  } catch (err) {
    console.error("Error saving bookmark:", err);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في حفظ الإشارة المرجعية",
      error: err.message,
    });
  }
};

/**
 * Delete reading bookmark for current user
 * @route DELETE /api/quran/bookmark
 */
const deleteBookmark = async (req, res) => {
  try {
    const userId = req.user._id;
    const userType = getUserType(req.user.role);

    await QuranUserSettings.findOneAndUpdate(
      { userId, userType },
      { $unset: { bookmark: 1 } }
    );

    res.json({
      success: true,
      message: "تم حذف الإشارة المرجعية بنجاح",
    });
  } catch (err) {
    console.error("Error deleting bookmark:", err);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في حذف الإشارة المرجعية",
      error: err.message,
    });
  }
};

module.exports = {
  getReadingSettings,
  saveReadingSettings,
  getBookmark,
  saveBookmark,
  deleteBookmark,
};
