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
  createdAt: { type: Date, default: Date.now },
});

deviceTokenSchema.index({ user: 1 });
deviceTokenSchema.index({ token: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('DeviceToken', deviceTokenSchema);
