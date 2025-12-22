const express = require("express");
const router = express.Router();
const goalController = require("../../controllers/Goals/goalController");
const { protect } = require("../../middleware/auth");

// Routes for goals
router.get("/", protect, goalController.getAllGoals);
router.get("/student/:studentId", protect, goalController.getGoalsByStudent);
router.get("/teacher/:teacherId", protect, goalController.getGoalsByTeacher);
router.get("/group/:groupId", protect, goalController.getGoalsByGroup);
router.get("/:id", protect, goalController.getGoalById);

router.post("/", protect, goalController.createGoal);
router.put("/:id", protect, goalController.updateGoal);
router.delete("/:id", protect, goalController.deleteGoal);

router.patch("/:id/progress", protect, goalController.updateGoalProgress);
router.patch("/:id/complete", protect, goalController.completeGoal);
router.get("/:id/progress", protect, goalController.getGoalProgressHistory);

module.exports = router;
