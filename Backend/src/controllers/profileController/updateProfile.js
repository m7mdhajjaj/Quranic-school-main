/**
 * Update Profile Controller
 * Handles updating current user profile
 */

const Student = require("../../schema/Student");
const Teacher = require("../../schema/Teacher");
const Admin = require("../../schema/Admin");
const Secretary = require("../../schema/Secretary");
const TeacherAssistant = require("../../schema/TeacherAssistant");

/**
 * @desc    Update user profile
 * @route   PUT /api/profile/me
 * @access  Private
 */
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const userType = req.user.role || "student";
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.password;
    delete updateData._id;
    delete updateData.studentId;
    delete updateData.teacherId;
    delete updateData.adminId;
    delete updateData.secretaryId;
    delete updateData.assistantId;
    // منع تعديل رقم الهوية - لا يمكن تغييره بعد الإنشاء
    delete updateData.idNumber;

    // Check if birthDate is being changed - apply edit limits
    let currentUser = null;
    if (updateData.birthDate) {
      // Get current user to compare birthDate and check edit history
      if (userType === "student") {
        currentUser = await Student.findById(userId).select(
          "birthDate birthDateEditHistory"
        );
      } else if (userType === "admin") {
        currentUser = await Admin.findById(userId).select(
          "birthDate birthDateEditHistory"
        );
      } else if (userType === "secretary") {
        currentUser = await Secretary.findById(userId).select(
          "birthDate birthDateEditHistory"
        );
      } else if (userType === "teacherAssistant") {
        currentUser = await TeacherAssistant.findById(userId).select(
          "birthDate birthDateEditHistory"
        );
      } else {
        currentUser = await Teacher.findById(userId).select(
          "birthDate birthDateEditHistory"
        );
      }

      if (!currentUser) {
        return res.status(404).json({
          success: false,
          message: "المستخدم غير موجود",
        });
      }

      // Check if birthDate is actually changing
      // Handle both Date (Student) and String (Teacher/Admin) types
      let currentBirthDate = null;
      if (currentUser.birthDate) {
        if (currentUser.birthDate instanceof Date) {
          currentBirthDate = currentUser.birthDate.toISOString().split("T")[0];
        } else {
          currentBirthDate = String(currentUser.birthDate).split("T")[0].trim();
        }
      }
      
      let newBirthDateStr = null;
      if (updateData.birthDate) {
        if (typeof updateData.birthDate === 'string') {
          newBirthDateStr = updateData.birthDate.split("T")[0].trim();
        } else {
          newBirthDateStr = new Date(updateData.birthDate).toISOString().split("T")[0];
        }
      }

      if (currentBirthDate !== newBirthDateStr && newBirthDateStr) {
        // BirthDate is being changed - check edit limits
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        // Count recent edits (within last month)
        const recentEdits =
          currentUser.birthDateEditHistory?.filter(
            (edit) => new Date(edit.editDate) >= oneMonthAgo
          ) || [];

        const editCount = recentEdits.length;
        const allowed = editCount < 2;
        const remaining = Math.max(0, 2 - editCount);

        if (!allowed) {
          return res.status(400).json({
            success: false,
            message:
              "لا يمكنك تعديل تاريخ الميلاد أكثر من مرتين خلال شهر كامل من آخر تعديلاتك",
            editLimit: {
              allowed: false,
              remaining: 0,
              count: editCount,
            },
          });
        }

        // Add new edit to history (will be saved with the update)
        if (!updateData.birthDateEditHistory) {
          updateData.birthDateEditHistory = currentUser.birthDateEditHistory || [];
        }
        updateData.birthDateEditHistory.push({ editDate: new Date() });
      }
    }

    let updatedUser;
    if (userType === "student") {
      updatedUser = await Student.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
      }).select("-password");
    } else if (userType === "admin") {
      updatedUser = await Admin.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
      }).select("-password");
    } else if (userType === "secretary") {
      updatedUser = await Secretary.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
      }).select("-password");
    } else if (userType === "teacherAssistant") {
      updatedUser = await TeacherAssistant.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
      }).select("-password")
        .populate('assignedTeacher', 'firstName lastName teacherId')
        .populate('allowedGroups', 'name');
    } else {
      updatedUser = await Teacher.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
      }).select("-password");
    }

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "المستخدم غير موجود",
      });
    }

    // Cleanup old edit history entries (older than 2 months) for birthDate
    if (
      updatedUser.birthDateEditHistory &&
      updatedUser.birthDateEditHistory.length > 0
    ) {
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

      const cleanedHistory = updatedUser.birthDateEditHistory.filter(
        (edit) => new Date(edit.editDate) >= twoMonthsAgo
      );

      // Only update if we removed old entries
      if (cleanedHistory.length !== updatedUser.birthDateEditHistory.length) {
        if (userType === "student") {
          await Student.findByIdAndUpdate(userId, {
            birthDateEditHistory: cleanedHistory,
          });
          updatedUser.birthDateEditHistory = cleanedHistory;
        } else if (userType === "admin") {
          await Admin.findByIdAndUpdate(userId, {
            birthDateEditHistory: cleanedHistory,
          });
          updatedUser.birthDateEditHistory = cleanedHistory;
        } else if (userType === "secretary") {
          await Secretary.findByIdAndUpdate(userId, {
            birthDateEditHistory: cleanedHistory,
          });
          updatedUser.birthDateEditHistory = cleanedHistory;
        } else if (userType === "teacherAssistant") {
          await TeacherAssistant.findByIdAndUpdate(userId, {
            birthDateEditHistory: cleanedHistory,
          });
          updatedUser.birthDateEditHistory = cleanedHistory;
        } else {
          await Teacher.findByIdAndUpdate(userId, {
            birthDateEditHistory: cleanedHistory,
          });
          updatedUser.birthDateEditHistory = cleanedHistory;
        }
      }
    }

    res.json({
      success: true,
      message: "تم تحديث البيانات بنجاح",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "بيانات غير صحيحة",
        errors: errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "خطأ في الخادم",
    });
  }
};

module.exports = {
  updateUserProfile,
};
