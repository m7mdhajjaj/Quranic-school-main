const mongoose = require('mongoose');

const aiChatFavoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  answer: {
    type: String,
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  note: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for faster queries
aiChatFavoriteSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('AiChatFavorite', aiChatFavoriteSchema);
