// routes/teacherAssistantRoutes/crud.routes.js
const express = require("express");
const router = express.Router();
const controller = require("../../controllers/basicController/teacherAssistantController");
const { protect } = require("../../middleware/auth/protect.middleware");
const { adminProtect } = require("../../middleware/auth/role.middleware");

/**
 * CRUD Routes for Teacher Assistants
 * مسارات CRUD لمساعدي المدرسين
 */

// Get all teacher assistants - Admin only
router.get("/", adminProtect, controller.getAllAssistants);

// Check duplicate field - Admin only
router.get("/check-duplicate", adminProtect, controller.checkDuplicate);

// Get next assistant ID - Admin only
router.get("/next-id", adminProtect, controller.getNextAssistantId);

// Get teacher assistant by ID - Admin or Self
router.get("/:id", protect, controller.getAssistantById);

// Create new teacher assistant - Admin only
router.post("/", adminProtect, controller.createAssistant);

// Bulk delete teacher assistants - Admin only
router.post("/bulk-delete", adminProtect, controller.bulkDeleteAssistants);

// Update teacher assistant - Admin or Self
router.put("/:id", protect, controller.updateAssistant);

// Delete teacher assistant - Admin only
router.delete("/:id", adminProtect, controller.deleteAssistant);

module.exports = router;
