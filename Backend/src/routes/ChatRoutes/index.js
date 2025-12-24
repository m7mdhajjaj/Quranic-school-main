const express = require('express');
const router = express.Router();
const mentionRoutes = require('./mentionRoutes');

// ... existing routes ...

router.use('/mentions', mentionRoutes);

module.exports = router;
