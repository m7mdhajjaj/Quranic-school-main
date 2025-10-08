const express = require("express");
const router = express.Router();
const sessionController = require("../controllers/sessionController");
const { validateSessionData } = require("../Validation/SessionValidation");

router.get("/", sessionController.getSessions);
router.post("/", validateSessionData, sessionController.addSession);
router.put("/:id", validateSessionData, sessionController.updateSession);
router.delete("/:id", sessionController.deleteSession);

module.exports = router;
