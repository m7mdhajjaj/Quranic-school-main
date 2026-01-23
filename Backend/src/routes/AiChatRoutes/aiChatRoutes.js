const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit'); // 🔒 Rate Limiting

// ═══════════════════════════════════════════════════════════════════════════
// 🔒 Rate Limiters - منع الإساءة
// ═══════════════════════════════════════════════════════════════════════════

// Rate limiter للـ AI Chat (20 طلب/دقيقة)
const aiChatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 دقيقة
  max: 20,
  message: { 
    success: false, 
    message: 'طلبات كثيرة جداً، انتظر دقيقة واحدة' 
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || 'anonymous' // ربط بالمستخدم
});

// Rate limiter للـ TTS (5 طلبات/دقيقة - يكلف مال)
const ttsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { 
    success: false, 
    message: 'حد TTS: 5 طلبات في الدقيقة' 
  },
  keyGenerator: (req) => req.user?.id || 'anonymous'
});

// Rate limiter للـ STT (10 طلبات/دقيقة)
const sttLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { 
    success: false, 
    message: 'حد STT: 10 طلبات في الدقيقة' 
  },
  keyGenerator: (req) => req.user?.id || 'anonymous'
});

// ═══════════════════════════════════════════════════════════════════════════
// 📁 Multer Configuration - إعداد رفع الملفات الصوتية
// ═══════════════════════════════════════════════════════════════════════════

const uploadDir = path.join(__dirname, '../../uploads/audio');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + '.webm')
  }
});

// File filter for audio files
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['audio/webm', 'audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/m4a'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('نوع الملف غير مدعوم. الأنواع المسموحة: webm, mp3, wav, ogg, m4a'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// 📦 Imports
// ═══════════════════════════════════════════════════════════════════════════

const { protect } = require('../../middleware/auth');
const aiChatController = require('../../controllers/AiChatController');
const {
  validateChatMessage,
  validateTTS,
  validateAddFavorite,
  validateUpdateFavorite,
  validateDeleteFavorite,
  validateGetFavorites
} = require('../../Validation/ChatBot/aiChatValidation');

// ═══════════════════════════════════════════════════════════════════════════
// 💬 AI Chat - التفسير الصارم (مع Rate Limiting)
// ═══════════════════════════════════════════════════════════════════════════

// Chat endpoint - يستخدم النظام الصارم للتفسير
router.post('/', protect, aiChatLimiter, validateChatMessage, aiChatController.chat);

// Get Student Suggestion - اقتراح ذكي للطالب (أسماء السور فقط)
router.get('/suggestion', protect, aiChatController.getStudentSuggestion);

// 🔍 Surah Suggestions - اقتراحات السور عند الخطأ الإملائي
// GET /api/ai-chat/surah-suggestions?query=الفتحه
router.get('/surah-suggestions', protect, aiChatController.getSurahSuggestions);

// TTS Endpoint - تحويل النص إلى صوت (مع Rate Limiting)
router.post('/speak', protect, ttsLimiter, validateTTS, aiChatController.speak);

// Transcribe Endpoint - تحويل الصوت إلى نص (مع Rate Limiting)
router.post('/transcribe', protect, sttLimiter, upload.single('audio'), aiChatController.transcribeAudio);

// ═══════════════════════════════════════════════════════════════════════════
// ⭐ Favorites - المفضلات
// ═══════════════════════════════════════════════════════════════════════════

router.post('/favorites', protect, validateAddFavorite, aiChatController.addFavorite);

router.get('/favorites', protect, validateGetFavorites, aiChatController.getFavorites);

router.get('/favorites/tags', protect, aiChatController.getFavoriteTags);

router.put('/favorites/:id', protect, validateUpdateFavorite, aiChatController.updateFavorite);

router.delete('/favorites/:id', protect, validateDeleteFavorite, aiChatController.deleteFavorite);

module.exports = router;
