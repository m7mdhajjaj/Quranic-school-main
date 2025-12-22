// routes/adminRoutes/crud.routes.js
const express = require("express");
const router = express.Router();
const controller = require("../../controllers/basicController/adminController");
const { validateAdminData } = require("../../Validation/Admin/AdminValidation");
const { protect } = require("../../middleware/auth");

/**
 * CRUD Routes for Admins
 * All routes use AdminValidation middleware
 */

// Get all admins
router.get("/", protect, controller.getAllAdmins);

// Get admin statistics
router.get("/stats", protect, controller.getAdminStats);

// Get admin by ID
router.get("/:id", protect, controller.getAdminById);

// Create new admin (with validation)
router.post("/", protect, validateAdminData, controller.createAdmin);

// Update admin (with validation)
router.put("/:id", protect, validateAdminData, controller.updateAdmin);

// Delete admin
router.delete("/:id", protect, controller.deleteAdmin);

module.exports = router;
