const express = require("express");
const router = express.Router();
const sessionController = require("../controllers/sessionController");

router.get("/", sessionController.getSessions);
router.post("/", sessionController.addSession);
router.put("/:id", sessionController.updateSession);
router.delete("/:id", sessionController.deleteSession);

module.exports = router;
