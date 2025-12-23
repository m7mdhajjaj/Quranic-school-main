const mongoose = require('mongoose');

const deviceTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'userModel',
  },
  userModel: {
    type: String,
    enum: ['Student', 'Teacher', 'Admin', 'User'],
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  platform: {
    type: String,
    enum: ['web', 'android', 'ios', 'unknown'],
    default: 'web',
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  lastUsed: { 
    type: Date, 
    default: Date.now 
  },
});

// Indexes for performance
deviceTokenSchema.index({ user: 1 });
deviceTokenSchema.index({ token: 1 }, { unique: true, sparse: true });

// Update lastUsed on save
deviceTokenSchema.pre('save', function(next) {
  this.lastUsed = new Date();
  next();
});

module.exports = mongoose.model('DeviceToken', deviceTokenSchema);
