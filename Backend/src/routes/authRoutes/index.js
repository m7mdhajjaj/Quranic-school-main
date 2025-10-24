// routes/authRoutes/index.js
const express = require("express");
const router = express.Router();

// Import sub-routes
const loginRoutes = require("./login.routes");
const passwordRoutes = require("./password.routes");
const userRoutes = require("./user.routes");
const utilityRoutes = require("./utility.routes");

// Use sub-routes
router.use("/", loginRoutes);
router.use("/", passwordRoutes);
router.use("/", userRoutes);
router.use("/", utilityRoutes);

module.exports = router;
