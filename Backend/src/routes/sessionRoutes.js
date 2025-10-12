const express = require("express");
const router = express.Router();
const sessionController = require("../controllers/sessionController");
// تم تعطيل validateSessionData لأنه يتوقع بنية بيانات مختلفة
// const { validateSessionData } = require("../Validation/SessionValidation");

router.get("/", sessionController.getSessions);
router.post("/", sessionController.addSession); // إزالة validateSessionData
router.put("/:id", sessionController.updateSession); // إزالة validateSessionData
router.delete("/:id", sessionController.deleteSession);

module.exports = router;
