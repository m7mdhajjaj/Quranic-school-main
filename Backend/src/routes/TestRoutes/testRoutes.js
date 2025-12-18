const express = require('express');
const router = express.Router();
const { generateQuestions, saveTestResult } = require('../../controllers/TestController/testController');
const { protect } = require('../../middleware/authMiddleware');

router.post('/generate-questions', generateQuestions);
router.post('/results', protect, saveTestResult);

module.exports = router;
