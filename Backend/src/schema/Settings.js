// ============================================================================
// Settings.js - إعدادات النظام العامة
// ============================================================================

const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed, // يمكن أن يكون أي نوع: String, Number, Object, Array
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Note: تم استخدام index: true في الحقل key ولا حاجة لإضافة index آخر لتجنب تحذير التكرار

// دالة مساعدة للحصول على قيمة إعداد
settingsSchema.statics.getValue = async function (key, defaultValue = null) {
  const setting = await this.findOne({ key });
  return setting ? setting.value : defaultValue;
};

// دالة مساعدة لتحديث/إنشاء إعداد
settingsSchema.statics.setValue = async function (key, value, description = '', updatedBy = null) {
  const setting = await this.findOneAndUpdate(
    { key },
    {
      value,
      description,
      updatedBy,
      updatedAt: new Date(),
    },
    {
      upsert: true, // إنشاء إذا لم يكن موجود
      new: true,
      runValidators: true,
    }
  );
  return setting;
};

// دالة مساعدة لحذف إعداد
settingsSchema.statics.deleteValue = async function (key) {
  const result = await this.deleteOne({ key });
  return result;
};

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;
