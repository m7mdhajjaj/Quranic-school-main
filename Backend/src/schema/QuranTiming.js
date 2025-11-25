const mongoose = require('mongoose');

/**
 * Word Timing Schema
 * Stores timing for individual words in an ayah
 */
const WordTimingSchema = new mongoose.Schema({
  word: {
    type: String,
    required: true,
    trim: true
  },
  startTime: {
    type: Number,
    required: true,
    min: 0
  },
  endTime: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: function(value) {
        return value > this.startTime;
      },
      message: 'endTime must be greater than startTime'
    }
  }
}, { _id: false });

/**
 * Ayah Timing Schema
 * Stores timing for individual ayahs in a surah
 */
const AyahTimingSchema = new mongoose.Schema({
  ayahNumber: {
    type: Number,
    required: true,
    min: 1
  },
  startTime: {
    type: Number,
    required: true,
    min: 0
  },
  endTime: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: function(value) {
        return value > this.startTime;
      },
      message: 'endTime must be greater than startTime'
    }
  },
  words: [WordTimingSchema] // Optional: word-level timing
}, { _id: false });

/**
 * Quran Timing Schema
 * Main schema for storing timing data for a surah by a specific reciter
 */
const QuranTimingSchema = new mongoose.Schema({
  surahNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 114,
    index: true
  },
  surahName: {
    type: String,
    required: true,
    trim: true
  },
  reciter: {
    type: String,
    required: true,
    enum: [
      'ar.alafasy',
      'ar.abdulbasit',
      'ar.sudais',
      'ar.ajmi',
      'ar.ghamdi',
      'ar.muaiqly',
      'ar.dossari'
    ],
    index: true
  },
  reciterName: {
    type: String,
    required: true,
    trim: true
  },
  totalDuration: {
    type: Number,
    required: true,
    min: 0
  },
  ayahs: {
    type: [AyahTimingSchema],
    required: true,
    validate: {
      validator: function(ayahs) {
        return ayahs && ayahs.length > 0;
      },
      message: 'Ayahs array cannot be empty'
    }
  },
  audioUrl: {
    type: String,
    trim: true
  },
  source: {
    type: String,
    enum: ['manual', 'everyayah', 'audio-analysis', 'api'],
    default: 'manual'
  },
  accuracy: {
    type: String,
    enum: ['high', 'medium', 'estimated'],
    default: 'medium'
  },
  metadata: {
    createdBy: String,
    verifiedBy: String,
    notes: String
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
QuranTimingSchema.index({ surahNumber: 1, reciter: 1 }, { unique: true });

// Virtual for ayah count
QuranTimingSchema.virtual('ayahCount').get(function() {
  return this.ayahs.length;
});

// Method to get timing for a specific ayah
QuranTimingSchema.methods.getAyahTiming = function(ayahNumber) {
  return this.ayahs.find(ayah => ayah.ayahNumber === ayahNumber);
};

// Method to validate timing consistency
QuranTimingSchema.methods.validateTimings = function() {
  const errors = [];
  
  // Check if ayahs are in order
  for (let i = 1; i < this.ayahs.length; i++) {
    const prev = this.ayahs[i - 1];
    const curr = this.ayahs[i];
    
    if (curr.ayahNumber !== prev.ayahNumber + 1) {
      errors.push(`Ayah order broken at ${curr.ayahNumber}`);
    }
    
    if (curr.startTime < prev.endTime) {
      errors.push(`Timing overlap at ayah ${curr.ayahNumber}`);
    }
  }
  
  // Check if last ayah ends at total duration
  const lastAyah = this.ayahs[this.ayahs.length - 1];
  if (Math.abs(lastAyah.endTime - this.totalDuration) > 0.5) {
    errors.push('Last ayah endTime does not match totalDuration');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Static method to get all available reciters for a surah
QuranTimingSchema.statics.getAvailableReciters = async function(surahNumber) {
  return await this.find({ surahNumber }).distinct('reciter');
};

// Static method to import timing data
QuranTimingSchema.statics.importTimingData = async function(data) {
  const { surahNumber, reciter } = data;
  
  // Check if timing already exists
  const existing = await this.findOne({ surahNumber, reciter });
  
  if (existing) {
    // Update existing
    Object.assign(existing, data);
    return await existing.save();
  } else {
    // Create new
    return await this.create(data);
  }
};

const QuranTiming = mongoose.model('QuranTiming', QuranTimingSchema);

module.exports = QuranTiming;
