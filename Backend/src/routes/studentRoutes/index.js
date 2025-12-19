// routes/studentRoutes/index.js
const express = require("express");
const router = express.Router();

// Import sub-routes
const crudRoutes = require("./crud.routes");
const avatarRoutes = require("./avatar.routes");
const statsRoutes = require("./stats.routes");
const averageRoutes = require("./average.routes");
const historyRoutes = require("./history.routes");

// Use sub-routes
router.use("/", crudRoutes);
router.use("/", avatarRoutes);
router.use("/", statsRoutes);
router.use("/", averageRoutes);
router.use("/", historyRoutes);

module.exports = router;
