const express = require('express');
const router = express.Router();
const mentionController = require('../../controllers/ChatController/mentionController');
const { protect } = require('../../middleware/auth');

router.use(protect);

router.get('/search', mentionController.searchStudentsForMention);

module.exports = router;
