const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "عنوان الهدف مطلوب"],
      trim: true,
      maxlength: [100, "عنوان الهدف يجب أن يكون أقل من 100 حرف"]
    },
    description: {
      type: String,
      required: [true, "وصف الهدف مطلوب"],
      trim: true,
      maxlength: [500, "وصف الهدف يجب أن يكون أقل من 500 حرف"]
    },
    targetValue: {
      type: Number,
      required: [true, "القيمة المستهدفة مطلوبة"],
      min: [1, "القيمة المستهدفة يجب أن تكون أكبر من 0"]
    },
    currentValue: {
      type: Number,
      default: 0,
      min: [0, "القيمة الحالية لا يمكن أن تكون سالبة"]
    },
    unit: {
      type: String,
      required: [true, "وحدة القياس مطلوبة"],
      trim: true,
      maxlength: [20, "وحدة القياس يجب أن تكون أقل من 20 حرف"]
    },
    category: {
      type: String,
      required: [true, "فئة الهدف مطلوبة"],
      enum: {
        values: ["memorization", "reading", "understanding", "behavior"],
        message: "فئة الهدف يجب أن تكون إحدى القيم المحددة"
      }
    },
    priority: {
      type: String,
      required: [true, "أولوية الهدف مطلوبة"],
      enum: {
        values: ["high", "medium", "low"],
        message: "أولوية الهدف يجب أن تكون إحدى القيم المحددة"
      }
    },
    deadline: {
      type: Date,
      validate: {
        validator: function(value) {
          return !value || value > new Date();
        },
        message: "تاريخ الانتهاء يجب أن يكون في المستقبل"
      }
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date
    },
    // References
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student"
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher"
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group"
    },
    // Progress tracking
    progressHistory: [{
      progress: {
        type: Number,
        required: true,
        min: 0
      },
      notes: {
        type: String,
        trim: true,
        maxlength: [200, "الملاحظات يجب أن تكون أقل من 200 حرف"]
      },
      date: {
        type: Date,
        default: Date.now
      },
      recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
        required: true
      }
    }]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for progress percentage
goalSchema.virtual("progressPercentage").get(function() {
  if (this.targetValue === 0) return 0;
  return Math.min(Math.round((this.currentValue / this.targetValue) * 100), 100);
});

// Virtual for days remaining
goalSchema.virtual("daysRemaining").get(function() {
  if (!this.deadline) return null;
  const today = new Date();
  const deadline = new Date(this.deadline);
  const diffTime = deadline - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for status
goalSchema.virtual("status").get(function() {
  if (this.completed) return "completed";
  if (this.deadline && new Date() > new Date(this.deadline)) return "overdue";
  if (this.progressPercentage >= 100) return "achieved";
  if (this.progressPercentage >= 75) return "near_completion";
  if (this.progressPercentage >= 50) return "on_track";
  if (this.progressPercentage >= 25) return "started";
  return "not_started";
});

// Index for better query performance
goalSchema.index({ studentId: 1, completed: 1 });
goalSchema.index({ teacherId: 1, completed: 1 });
goalSchema.index({ groupId: 1, completed: 1 });
goalSchema.index({ category: 1, priority: 1 });
goalSchema.index({ deadline: 1 });

// Middleware to update completion status
goalSchema.pre("save", function(next) {
  if (this.currentValue >= this.targetValue && !this.completed) {
    this.completed = true;
    this.completedAt = new Date();
  } else if (this.currentValue < this.targetValue && this.completed) {
    this.completed = false;
    this.completedAt = undefined;
  }
  next();
});

// Static methods
goalSchema.statics.getGoalsByCategory = function(category) {
  return this.find({ category, completed: false });
};

goalSchema.statics.getOverdueGoals = function() {
  return this.find({
    completed: false,
    deadline: { $lt: new Date() }
  });
};

goalSchema.statics.getGoalsByPriority = function(priority) {
  return this.find({ priority, completed: false });
};

// Instance methods
goalSchema.methods.addProgress = function(progress, notes, recordedBy) {
  this.progressHistory.push({
    progress,
    notes,
    recordedBy,
    date: new Date()
  });
  this.currentValue = progress;
  return this.save();
};

goalSchema.methods.markComplete = function() {
  this.completed = true;
  this.completedAt = new Date();
  this.currentValue = this.targetValue;
  return this.save();
};

const Goal = mongoose.model("Goal", goalSchema);
module.exports = Goal;