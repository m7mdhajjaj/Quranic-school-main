const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for temp storage
const uploadDir = path.join(__dirname, '../../uploads');
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

const upload = multer({ storage: storage });

const { protect } = require('../../middleware/auth');
const aiChatController = require('../../controllers/AiChatController/aiChatController');
const favoriteController = require('../../controllers/AiChatController/FavoriteController');
const {
  validateChatMessage,
  validateAddFavorite,
  validateUpdateFavorite,
  validateDeleteFavorite,
  validateGetFavorites
} = require('../../Validation/ChatBot/aiChatValidation');

// AI Chat endpoint
router.post('/', protect, validateChatMessage, aiChatController.chat);
// TTS Endpoint
router.post('/speak', protect, aiChatController.generateSpeech);
// Transcribe Endpoint
router.post('/transcribe', protect, upload.single('audio'), aiChatController.transcribeAudio);

// Favorites endpoints
router.post('/favorites', protect, validateAddFavorite, favoriteController.addFavorite);

router.get('/favorites', protect, validateGetFavorites, favoriteController.getFavorites);

router.get('/favorites/tags', protect, favoriteController.getTags);

router.put('/favorites/:id', protect, validateUpdateFavorite, favoriteController.updateFavorite);

router.delete('/favorites/:id', protect, validateDeleteFavorite, favoriteController.deleteFavorite);

module.exports = router;
