const mongoose = require("mongoose");

// ============================================================================
// Quran Segment Schema (New Structured Data)
// ============================================================================
// Represents a specific range of verses (Surah + Ayah Start/End)
// Source of Truth for memorization and review segments.

const quranRangeSchema = new mongoose.Schema(
  {
    // Identification
    surahNumber: { 
      type: Number, 
      required: true,
      min: [1, "Surah number must be between 1 and 114"], 
      max: [114, "Surah number must be between 1 and 114"], 
      index: true 
    },
    surahNameCanonical: { type: String, trim: true }, // Official Name (e.g. "الناس")
    surahNameInput: { type: String, trim: true },     // Original User Input (for reference)

    // Range
    ayahStart: { type: Number, required: true, min: [1, "Ayah start must be at least 1"] },
    ayahEnd: { type: Number, required: true, min: [1, "Ayah end must be at least 1"] },

    // Uniqueness Key: "surah:start-end" (e.g. "114:1-5")
    // Used for quick duplication checks and lookups
    canonicalKey: { type: String, trim: true, required: true, index: true }, 
    
    // Validation Context
    surahAyahCount: { type: Number, min: 1 }, // Total ayahs in this Surah (for validation)
    surahNameUthmani: { type: String, trim: true },

    // Completion Tracking
    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed"],
      default: "not_started",
      index: true,
    },
    completedAt: { type: Date, default: null, index: true },
    completedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Teacher/User who marked it
    completionNote: { type: String, trim: true }, // Optional notes
  },
  { _id: true, timestamps: true } // Each segment gets an ID + timestamps
);

// Basic range validation (End >= Start)
quranRangeSchema.path('ayahEnd').validate(function(value) {
  return this.ayahStart <= value;
}, 'Ayah End must be greater than or equal to Ayah Start');


// ============================================================================
// Section Schema (Daily Record)
// ============================================================================

const sectionSchema = new mongoose.Schema(
  {
    // ==========================================
    // 1. Core Section Fields
    // ==========================================
    date: { 
      type: Date, 
      required: [true, "تاريخ المقطع مطلوب"], 
      default: Date.now, 
      index: true 
    },

    group: { 
      type: String, 
      index: true, 
      trim: true 
    },
    teacher: { 
      type: String, 
      trim: true 
    },

    // ==========================================
    // 2. Legacy Text Fields (Display/Backward Compatibility)
    // ==========================================
    // These strings store the human-readable description.
    // They are NOT the source of truth for completion tracking but must be preserved.
    reviewSection: { type: String, trim: true },
    memorizationSection: { type: String, trim: true },

    // ==========================================
    // 3. Status & Progress (Section Level)
    // ==========================================
    marksStatus: {
      type: String,
      enum: ["completed", "in_progress", "not_started"],
      default: "not_started",
      index: true,
    },
    marksProgress: {
      totalStudents: { type: Number, default: 0 },
      studentsWithMarks: { type: Number, default: 0 },
      percentage: { type: Number, default: 0, min: 0, max: 100 },
    },

    // ==========================================
    // 4. Scheduling Integration
    // ==========================================
    hasSchedule: { type: Boolean, default: false, index: true },
    scheduleStatus: {
      type: String,
      enum: ["scheduled", "needs_schedule"],
      default: "needs_schedule",
      index: true,
    },
    timetableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TimeTable",
      index: true,
    },

    // ==========================================
    // 5. New Structured Data (Source of Truth)
    // ==========================================
    // Segments are stored here.
    memorizationMeta: { type: [quranRangeSchema], default: [] },
    reviewMeta: { type: [quranRangeSchema], default: [] },
    
    // Pre-calculated summary for efficient frontend rendering
    progressSummary: {
      memorization: {
        totalSegments: { type: Number, default: 0 },
        completedSegments: { type: Number, default: 0 },
      },
      review: {
        totalSegments: { type: Number, default: 0 },
        completedSegments: { type: Number, default: 0 },
      },
      lastUpdatedAt: { type: Date, default: null },
    },

    quranMetaVersion: { type: Number, default: 2, index: true },
  },
  { timestamps: true }
);

// ==========================================
// Indexes
// ==========================================
// Optimize searching for segments (e.g. "Find all students reviewing Surah 114")
sectionSchema.index({ group: 1, teacher: 1, "memorizationMeta.canonicalKey": 1 });
sectionSchema.index({ group: 1, teacher: 1, "reviewMeta.canonicalKey": 1 });

// ==========================================
// 🚀 Sequence Tracking Indexes (Performance)
// ==========================================
// These indexes speed up the "Get Last Progress" and "Check Overlap" queries
// by allowing efficient filtering by Group + Surah and sorting by Date.

// 1. Memorization Sequence: Find last Surah part efficiently
sectionSchema.index({ group: 1, "memorizationMeta.surahNumber": 1, date: -1 });

// 2. Review Sequence: Find last Surah part efficiently
sectionSchema.index({ group: 1, "reviewMeta.surahNumber": 1, date: -1 });

// 3. Overlap Checks: Range queries
// (Note: Multikey indexes on arrays have limitations, but this helps reduce the scan)
sectionSchema.index({ group: 1, "memorizationMeta.surahNumber": 1, "memorizationMeta.ayahStart": 1 });
sectionSchema.index({ group: 1, "reviewMeta.surahNumber": 1, "reviewMeta.ayahStart": 1 });


// ==========================================
// Middleware & Hooks
// ==========================================

sectionSchema.pre("save", function (next) {
  // ------------------------------------------
  // A. Duplication Checks (Intra-document)
  // ------------------------------------------
  
  // 1. Memorization: STRICT NO DUPLICATES
  if (this.memorizationMeta && this.memorizationMeta.length > 0) {
    const memKeys = new Set();
    for (const seg of this.memorizationMeta) {
      if (memKeys.has(seg.canonicalKey)) {
        return next(new Error(`Duplicate memorization segment found: ${seg.canonicalKey} (Cannot memorize the same part twice in one section)`));
      }
      memKeys.add(seg.canonicalKey);
    }
  }

  // 2. Review: NO DUPLICATES INSIDE REVIEW LIST
  // (You can review same part as memorization, but not review the same part twice)
  if (this.reviewMeta && this.reviewMeta.length > 0) {
    const revKeys = new Set();
    for (const seg of this.reviewMeta) {
      if (revKeys.has(seg.canonicalKey)) {
        return next(new Error(`Duplicate review segment found: ${seg.canonicalKey}`));
      }
      revKeys.add(seg.canonicalKey);
    }
  }

  // ------------------------------------------
  // B. Update Progress Summary
  // ------------------------------------------
  const memTotal = this.memorizationMeta?.length || 0;
  const memDone = (this.memorizationMeta || []).filter(s => s.status === "completed").length;

  const revTotal = this.reviewMeta?.length || 0;
  const revDone = (this.reviewMeta || []).filter(s => s.status === "completed").length;

  this.progressSummary = {
    memorization: { totalSegments: memTotal, completedSegments: memDone },
    review: { totalSegments: revTotal, completedSegments: revDone },
    lastUpdatedAt: new Date(),
  };

  next();
});

// Clean up TimeTable if Section is deleted
sectionSchema.pre("findOneAndDelete", async function (next) {
  try {
    const section = await this.model.findOne(this.getFilter());
    if (section?.timetableId) {
      await mongoose.model("TimeTable").findByIdAndDelete(section.timetableId);
    }
    next();
  } catch (error) {
    next(error);
  }
});

const Section = mongoose.model("Section", sectionSchema);
module.exports = Section;
