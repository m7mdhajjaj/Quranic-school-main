const express = require("express");
const router = express.Router();
const sessionController = require("../../controllers/TimeTableController");
const { validateTimetableData } = require("../../Validation/Timetable/TimetableValidation");

// Get all timetables
router.get("/", sessionController.getSessions);

// Create new timetable
router.post("/", validateTimetableData, sessionController.addSession);

// Update timetable
router.put("/:id", validateTimetableData, sessionController.updateSession);

// Delete timetable
router.delete("/:id", sessionController.deleteSession);

module.exports = router;
