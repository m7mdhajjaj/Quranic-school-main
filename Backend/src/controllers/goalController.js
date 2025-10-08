const Goal = require("../schema/Goal");
const Student = require("../schema/Student");
const Teacher = require("../schema/Teacher");
const Group = require("../schema/Group");
const mongoose = require("mongoose");

// Get all goals
exports.getAllGoals = async (req, res) => {
  try {
    const { category, priority, completed, studentId, teacherId, groupId } = req.query;
    
    // Build filter
    let filter = {};
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (completed !== undefined) filter.completed = completed === 'true';
    if (studentId) filter.studentId = studentId;
    if (teacherId) filter.teacherId = teacherId;
    if (groupId) filter.groupId = groupId;

    const goals = await Goal.find(filter)
      .populate("studentId", "firstName fatherName lastName group")
      .populate("teacherId", "firstName lastName")
      .populate("groupId", "name")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: goals,
      count: goals.length
    });
  } catch (error) {
    console.error("Error in getAllGoals:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في جلب الأهداف"
    });
  }
};

// Get goal by ID
exports.getGoalById = async (req, res) => {
  try {
    const { id } = req.params;

    const goal = await Goal.findById(id)
      .populate("studentId", "firstName fatherName lastName group")
      .populate("teacherId", "firstName lastName")
      .populate("groupId", "name")
      .populate("progressHistory.recordedBy", "firstName lastName");

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "الهدف غير موجود"
      });
    }

    res.json({
      success: true,
      data: goal
    });
  } catch (error) {
    console.error("Error in getGoalById:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في جلب الهدف"
    });
  }
};

// Get goals by student
exports.getGoalsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { completed } = req.query;

    let filter = { studentId };
    if (completed !== undefined) filter.completed = completed === 'true';

    const goals = await Goal.find(filter)
      .populate("teacherId", "firstName lastName")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: goals,
      count: goals.length
    });
  } catch (error) {
    console.error("Error in getGoalsByStudent:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في جلب أهداف الطالب"
    });
  }
};

// Get goals by teacher
exports.getGoalsByTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { completed } = req.query;

    let filter = { teacherId };
    if (completed !== undefined) filter.completed = completed === 'true';

    const goals = await Goal.find(filter)
      .populate("studentId", "firstName fatherName lastName group")
      .populate("groupId", "name")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: goals,
      count: goals.length
    });
  } catch (error) {
    console.error("Error in getGoalsByTeacher:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في جلب أهداف المعلم"
    });
  }
};

// Get goals by group
exports.getGoalsByGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { completed } = req.query;

    let filter = { groupId };
    if (completed !== undefined) filter.completed = completed === 'true';

    const goals = await Goal.find(filter)
      .populate("studentId", "firstName fatherName lastName")
      .populate("teacherId", "firstName lastName")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: goals,
      count: goals.length
    });
  } catch (error) {
    console.error("Error in getGoalsByGroup:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في جلب أهداف المجموعة"
    });
  }
};

// Create goal
exports.createGoal = async (req, res) => {
  try {
    const goalData = req.body;
    
    // Validate references
    if (goalData.studentId) {
      const student = await Student.findById(goalData.studentId);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: "الطالب غير موجود"
        });
      }
    }

    if (goalData.teacherId) {
      const teacher = await Teacher.findById(goalData.teacherId);
      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: "المعلم غير موجود"
        });
      }
    }

    if (goalData.groupId) {
      const group = await Group.findById(goalData.groupId);
      if (!group) {
        return res.status(404).json({
          success: false,
          message: "المجموعة غير موجودة"
        });
      }
    }

    const goal = new Goal(goalData);
    await goal.save();

    await goal.populate([
      { path: "studentId", select: "firstName fatherName lastName group" },
      { path: "teacherId", select: "firstName lastName" },
      { path: "groupId", select: "name" }
    ]);

    res.status(201).json({
      success: true,
      data: goal,
      message: "تم إنشاء الهدف بنجاح"
    });
  } catch (error) {
    console.error("Error in createGoal:", error);
    
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "بيانات غير صحيحة",
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: "خطأ في إنشاء الهدف"
    });
  }
};

// Update goal
exports.updateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate references if provided
    if (updateData.studentId) {
      const student = await Student.findById(updateData.studentId);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: "الطالب غير موجود"
        });
      }
    }

    if (updateData.teacherId) {
      const teacher = await Teacher.findById(updateData.teacherId);
      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: "المعلم غير موجود"
        });
      }
    }

    if (updateData.groupId) {
      const group = await Group.findById(updateData.groupId);
      if (!group) {
        return res.status(404).json({
          success: false,
          message: "المجموعة غير موجودة"
        });
      }
    }

    const goal = await Goal.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true,
        runValidators: true
      }
    ).populate([
      { path: "studentId", select: "firstName fatherName lastName group" },
      { path: "teacherId", select: "firstName lastName" },
      { path: "groupId", select: "name" }
    ]);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "الهدف غير موجود"
      });
    }

    res.json({
      success: true,
      data: goal,
      message: "تم تحديث الهدف بنجاح"
    });
  } catch (error) {
    console.error("Error in updateGoal:", error);
    
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "بيانات غير صحيحة",
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: "خطأ في تحديث الهدف"
    });
  }
};

// Delete goal
exports.deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;

    const goal = await Goal.findByIdAndDelete(id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "الهدف غير موجود"
      });
    }

    res.json({
      success: true,
      message: "تم حذف الهدف بنجاح"
    });
  } catch (error) {
    console.error("Error in deleteGoal:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في حذف الهدف"
    });
  }
};

// Update goal progress
exports.updateGoalProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { progress, notes } = req.body;
    const recordedBy = req.user._id; // From auth middleware

    if (typeof progress !== 'number' || progress < 0) {
      return res.status(400).json({
        success: false,
        message: "قيمة التقدم يجب أن تكون رقم موجب"
      });
    }

    const goal = await Goal.findById(id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "الهدف غير موجود"
      });
    }

    await goal.addProgress(progress, notes, recordedBy);

    await goal.populate([
      { path: "studentId", select: "firstName fatherName lastName group" },
      { path: "teacherId", select: "firstName lastName" },
      { path: "groupId", select: "name" }
    ]);

    res.json({
      success: true,
      data: goal,
      message: "تم تحديث تقدم الهدف بنجاح"
    });
  } catch (error) {
    console.error("Error in updateGoalProgress:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في تحديث تقدم الهدف"
    });
  }
};

// Complete goal
exports.completeGoal = async (req, res) => {
  try {
    const { id } = req.params;

    const goal = await Goal.findById(id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "الهدف غير موجود"
      });
    }

    await goal.markComplete();

    await goal.populate([
      { path: "studentId", select: "firstName fatherName lastName group" },
      { path: "teacherId", select: "firstName lastName" },
      { path: "groupId", select: "name" }
    ]);

    res.json({
      success: true,
      data: goal,
      message: "تم إكمال الهدف بنجاح"
    });
  } catch (error) {
    console.error("Error in completeGoal:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في إكمال الهدف"
    });
  }
};

// Get goal progress history
exports.getGoalProgressHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const goal = await Goal.findById(id)
      .populate("progressHistory.recordedBy", "firstName lastName")
      .select("progressHistory title");

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "الهدف غير موجود"
      });
    }

    res.json({
      success: true,
      data: goal.progressHistory,
      goalTitle: goal.title
    });
  } catch (error) {
    console.error("Error in getGoalProgressHistory:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في جلب تاريخ تقدم الهدف"
    });
  }
};