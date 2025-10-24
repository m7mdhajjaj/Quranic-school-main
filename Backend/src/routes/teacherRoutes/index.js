// routes/teacherRoutes/index.js
const express = require("express");
const router = express.Router();

// Import sub-routes
const crudRoutes = require("./crud.routes");
const avatarRoutes = require("./avatar.routes");
const statsRoutes = require("./stats.routes");

// Use sub-routes
router.use("/", crudRoutes);
router.use("/", avatarRoutes);
router.use("/", statsRoutes);

module.exports = router;
