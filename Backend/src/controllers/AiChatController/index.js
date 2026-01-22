/**
 * 🔒 AI Chat Controller - النظام الصارم
 * يستخدم StrictTafsirController للتفسير
 * + دعم المفضلات من FavoriteController
 */

// استيراد النظام الصارم للتفسير
const StrictTafsirController = require('./StrictTafsirController');
const FavoriteController = require('./FavoriteController');
const SuggestionController = require('./SuggestionController');

// ═══════════════════════════════════════════════════════════════════════════
// 💬 Chat - التفسير الصارم
// ═══════════════════════════════════════════════════════════════════════════

exports.chat = StrictTafsirController.chat;

// ═══════════════════════════════════════════════════════════════════════════
// 💡 Suggestions - الاقتراحات الذكية
// ═══════════════════════════════════════════════════════════════════════════

exports.getStudentSuggestion = SuggestionController.getStudentSuggestion;

// ═══════════════════════════════════════════════════════════════════════════
// 🔊 TTS - تحويل النص إلى صوت
// ═══════════════════════════════════════════════════════════════════════════

exports.speak = StrictTafsirController.speak;

// ═══════════════════════════════════════════════════════════════════════════
// 🎤 STT - تحويل الصوت إلى نص
// ═══════════════════════════════════════════════════════════════════════════

exports.transcribeAudio = StrictTafsirController.transcribe;

// ═══════════════════════════════════════════════════════════════════════════
// ⭐ Favorites - المفضلات
// ═══════════════════════════════════════════════════════════════════════════

// إضافة مفضلة
exports.addFavorite = FavoriteController.addFavorite;

// الحصول على المفضلات
exports.getFavorites = FavoriteController.getFavorites;

// الحصول على التاجات
exports.getFavoriteTags = FavoriteController.getTags;

// تحديث مفضلة
exports.updateFavorite = FavoriteController.updateFavorite;

// حذف مفضلة
exports.deleteFavorite = FavoriteController.deleteFavorite;
