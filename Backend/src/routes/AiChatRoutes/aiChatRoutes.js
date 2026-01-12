const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const aiChatController = require('../../controllers/AiChatController/aiChatController');
const favoriteController = require('../../controllers/AiChatController/FavoriteController');
const {
  validateChatMessage,
  validateAddFavorite,
  validateUpdateFavorite,
  validateDeleteFavorite,
  validateGetFavorites
} = require('../../Validation/aiChatValidation');

// AI Chat endpoint
router.post('/', protect, validateChatMessage, aiChatController.chat);

// Favorites endpoints
router.post('/favorites', protect, validateAddFavorite, favoriteController.addFavorite);

router.get('/favorites', protect, validateGetFavorites, favoriteController.getFavorites);

router.get('/favorites/tags', protect, favoriteController.getTags);

router.put('/favorites/:id', protect, validateUpdateFavorite, favoriteController.updateFavorite);

router.delete('/favorites/:id', protect, validateDeleteFavorite, favoriteController.deleteFavorite);

module.exports = router;
