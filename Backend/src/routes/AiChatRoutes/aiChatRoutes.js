const express = require('express');
const router = express.Router();
const aiChatController = require('../../controllers/AiChatController/aiChatController');

router.post('/', aiChatController.chat);

module.exports = router;
