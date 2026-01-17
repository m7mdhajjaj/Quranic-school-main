const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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
// 💬 AI Chat - التفسير الصارم
// ═══════════════════════════════════════════════════════════════════════════

// Chat endpoint - يستخدم النظام الصارم للتفسير
router.post('/', protect, validateChatMessage, aiChatController.chat);

// TTS Endpoint - تحويل النص إلى صوت
router.post('/speak', protect, validateTTS, aiChatController.speak);

// Transcribe Endpoint - تحويل الصوت إلى نص
router.post('/transcribe', protect, upload.single('audio'), aiChatController.transcribeAudio);

// ═══════════════════════════════════════════════════════════════════════════
// ⭐ Favorites - المفضلات
// ═══════════════════════════════════════════════════════════════════════════

router.post('/favorites', protect, validateAddFavorite, aiChatController.addFavorite);

router.get('/favorites', protect, validateGetFavorites, aiChatController.getFavorites);

router.get('/favorites/tags', protect, aiChatController.getFavoriteTags);

router.put('/favorites/:id', protect, validateUpdateFavorite, aiChatController.updateFavorite);

router.delete('/favorites/:id', protect, validateDeleteFavorite, aiChatController.deleteFavorite);

module.exports = router;
