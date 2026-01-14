// schema/Counter.js
const mongoose = require("mongoose");

/**
 * Counter Schema - نظام إدارة الأرقام التسلسلية
 * ============================================
 * 
 * الميزات:
 * --------
 * 1. تتبع آخر رقم ID مستخدم لكل نوع (student, teacher, admin)
 * 2. حفظ الأرقام المحذوفة لإعادة استخدامها (recycling)
 * 3. عمليات ذرية (atomic) لمنع التضارب
 * 4. لا ضياع للأرقام - عند الحذف يُعاد الرقم للقائمة
 * 
 * كيف يعمل:
 * ---------
 * - عند إنشاء مستخدم جديد:
 *   1. نتحقق من وجود أرقام محذوفة (recycledIds)
 *   2. إذا وجدت → نستخدم أصغر رقم منها
 *   3. إذا لم توجد → نزيد العداد (currentValue) ونستخدم الرقم الجديد
 * 
 * - عند حذف مستخدم:
 *   1. نضيف الرقم إلى recycledIds
 *   2. الرقم سيُعاد استخدامه للمستخدم التالي
 */

const counterSchema = new mongoose.Schema(
  {
    // اسم العداد (student, teacher, admin)
    name: {
      type: String,
      required: true,
      unique: true,
      enum: {
        values: ["student", "teacher", "admin"],
        message: "نوع العداد يجب أن يكون student, teacher, أو admin",
      },
    },

    // آخر قيمة مستخدمة
    currentValue: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "القيمة يجب أن تكون 0 أو أكثر"],
    },

    // الحد الأدنى للنطاق (لا يُستخدم رقم أقل منه)
    minValue: {
      type: Number,
      required: true,
      default: 1,
      min: [1, "الحد الأدنى يجب أن يكون 1 أو أكثر"],
    },

    // الأرقام المحذوفة المتاحة لإعادة الاستخدام
    recycledIds: {
      type: [Number],
      default: [],
      validate: {
        validator: function (arr) {
          // التأكد من عدم وجود أرقام مكررة
          return new Set(arr).size === arr.length;
        },
        message: "لا يمكن أن تحتوي القائمة على أرقام مكررة",
      },
    },

    // إحصائيات (اختياري)
    stats: {
      totalCreated: { type: Number, default: 0 }, // إجمالي ما تم إنشاؤه
      totalRecycled: { type: Number, default: 0 }, // إجمالي ما تم إعادة تدويره
      lastRecycledAt: { type: Date }, // آخر عملية تدوير
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ============================================================================
// INDEXES
// ============================================================================

// لا نحتاج فهارس إضافية لأن name له unique: true تلقائياً

// ============================================================================
// STATIC METHODS
// ============================================================================

/**
 * الحصول على الرقم التالي المتاح
 * يستخدم findOneAndUpdate لضمان العملية الذرية
 * 
 * @param {string} counterName - اسم العداد (student, teacher, admin)
 * @returns {Promise<number>} - الرقم التالي المتاح
 */
counterSchema.statics.getNextId = async function (counterName) {
  // الحصول على العداد الحالي للتحقق من minValue
  let counter = await this.findOne({ name: counterName });
  
  // إذا لم يوجد العداد، ننشئه مع القيم الافتراضية للنطاقات
  if (!counter) {
    const defaults = {
      student: { minValue: 100001, currentValue: 100000 },
      teacher: { minValue: 1001, currentValue: 1000 },
      admin: { minValue: 1, currentValue: 0 },
    };
    
    const defaultValues = defaults[counterName] || { minValue: 1, currentValue: 0 };
    
    counter = await this.create({
      name: counterName,
      currentValue: defaultValues.currentValue,
      minValue: defaultValues.minValue,
      recycledIds: [],
      stats: { totalCreated: 0, totalRecycled: 0 },
    });
  }

  // أولاً: نحاول الحصول على رقم مُعاد تدويره
  const counterWithRecycled = await this.findOneAndUpdate(
    {
      name: counterName,
      "recycledIds.0": { $exists: true }, // يوجد على الأقل رقم واحد
    },
    {
      $pop: { recycledIds: -1 }, // إزالة أول عنصر (الأصغر)
      $inc: { "stats.totalRecycled": 1 },
    },
    {
      new: false, // نريد القيمة القديمة للحصول على الرقم المحذوف
      upsert: false,
    }
  );

  if (counterWithRecycled && counterWithRecycled.recycledIds.length > 0) {
    // نرجع أصغر رقم من القائمة (القائمة مرتبة)
    const recycledId = Math.min(...counterWithRecycled.recycledIds);
    console.log(`♻️ [Counter] Recycled ID ${recycledId} for ${counterName}`);
    return recycledId;
  }

  // ثانياً: إذا لم يوجد أرقام محذوفة، نزيد العداد
  const updatedCounter = await this.findOneAndUpdate(
    { name: counterName },
    {
      $inc: {
        currentValue: 1,
        "stats.totalCreated": 1,
      },
    },
    {
      new: true, // نريد القيمة الجديدة
      upsert: true, // إنشاء إذا لم يوجد
      setDefaultsOnInsert: true,
    }
  );

  console.log(`🆕 [Counter] New ID ${updatedCounter.currentValue} for ${counterName}`);
  return updatedCounter.currentValue;
};

/**
 * إعادة رقم ID للتدوير (عند حذف مستخدم)
 * 
 * @param {string} counterName - اسم العداد
 * @param {number} id - الرقم المراد إعادته
 */
counterSchema.statics.recycleId = async function (counterName, id) {
  if (!id || typeof id !== "number" || id < 1) {
    console.warn(`⚠️ [Counter] Invalid ID for recycling: ${id}`);
    return;
  }

  const result = await this.findOneAndUpdate(
    { name: counterName },
    {
      $addToSet: { recycledIds: id }, // إضافة فقط إذا لم يكن موجوداً
      $set: { "stats.lastRecycledAt": new Date() },
    },
    {
      new: true,
      upsert: true,
    }
  );

  // ترتيب الأرقام المحذوفة تصاعدياً لضمان استخدام الأصغر أولاً
  if (result && result.recycledIds.length > 1) {
    await this.findOneAndUpdate(
      { name: counterName },
      {
        $push: {
          recycledIds: {
            $each: [],
            $sort: 1, // ترتيب تصاعدي
          },
        },
      }
    );
  }

  console.log(`♻️ [Counter] ID ${id} returned to pool for ${counterName}`);
};

/**
 * إعادة عدة أرقام للتدوير (عند حذف متعدد)
 * 
 * @param {string} counterName - اسم العداد
 * @param {number[]} ids - مصفوفة الأرقام
 */
counterSchema.statics.recycleMultipleIds = async function (counterName, ids) {
  if (!Array.isArray(ids) || ids.length === 0) return;

  const validIds = ids.filter((id) => typeof id === "number" && id >= 1);
  if (validIds.length === 0) return;

  await this.findOneAndUpdate(
    { name: counterName },
    {
      $addToSet: { recycledIds: { $each: validIds } },
      $set: { "stats.lastRecycledAt": new Date() },
    },
    { upsert: true }
  );

  // ترتيب القائمة
  await this.findOneAndUpdate(
    { name: counterName },
    {
      $push: {
        recycledIds: {
          $each: [],
          $sort: 1,
        },
      },
    }
  );

  console.log(`♻️ [Counter] ${validIds.length} IDs returned to pool for ${counterName}`);
};

/**
 * الحصول على حالة العداد
 * 
 * @param {string} counterName - اسم العداد
 * @returns {Promise<Object>} - معلومات العداد
 */
counterSchema.statics.getStatus = async function (counterName) {
  const counter = await this.findOne({ name: counterName });
  
  if (!counter) {
    return {
      name: counterName,
      currentValue: 0,
      availableRecycledIds: 0,
      recycledIds: [],
      stats: { totalCreated: 0, totalRecycled: 0 },
    };
  }

  return {
    name: counter.name,
    currentValue: counter.currentValue,
    availableRecycledIds: counter.recycledIds.length,
    recycledIds: counter.recycledIds,
    stats: counter.stats,
  };
};

/**
 * تهيئة العدادات من البيانات الموجودة
 * يُستخدم مرة واحدة عند الترقية من النظام القديم
 * 
 * @param {string} counterName - اسم العداد
 * @param {number} maxExistingId - أعلى ID موجود حالياً
 * @param {number[]} existingIds - جميع الـ IDs الموجودة
 */
counterSchema.statics.initializeFromExisting = async function (
  counterName,
  maxExistingId,
  existingIds
) {
  // حساب الأرقام المفقودة (الفجوات)
  const missingIds = [];
  for (let i = 1; i <= maxExistingId; i++) {
    if (!existingIds.includes(i)) {
      missingIds.push(i);
    }
  }

  await this.findOneAndUpdate(
    { name: counterName },
    {
      $set: {
        currentValue: maxExistingId,
        recycledIds: missingIds.sort((a, b) => a - b),
        "stats.totalCreated": existingIds.length,
      },
    },
    { upsert: true }
  );

  console.log(
    `✅ [Counter] Initialized ${counterName}: max=${maxExistingId}, gaps=${missingIds.length}`
  );
  
  return { maxExistingId, missingIds };
};

/**
 * حجز عدة IDs دفعة واحدة (للاستيراد المجمع)
 * 
 * @param {string} counterName - اسم العداد
 * @param {number} count - عدد الأرقام المطلوبة
 * @returns {Promise<number[]>} - مصفوفة الأرقام المحجوزة
 */
counterSchema.statics.reserveMultipleIds = async function (counterName, count) {
  if (count <= 0) return [];

  const ids = [];

  // أولاً: استخدام الأرقام المعاد تدويرها
  const counter = await this.findOne({ name: counterName });
  const recycledIds = counter?.recycledIds || [];

  const fromRecycled = recycledIds.slice(0, count).sort((a, b) => a - b);
  ids.push(...fromRecycled);

  // إزالة الأرقام المستخدمة من القائمة
  if (fromRecycled.length > 0) {
    await this.findOneAndUpdate(
      { name: counterName },
      {
        $pullAll: { recycledIds: fromRecycled },
        $inc: { "stats.totalRecycled": fromRecycled.length },
      }
    );
  }

  // ثانياً: إذا لم تكفِ الأرقام المعاد تدويرها، نولد أرقام جديدة
  const remaining = count - fromRecycled.length;
  if (remaining > 0) {
    const result = await this.findOneAndUpdate(
      { name: counterName },
      {
        $inc: {
          currentValue: remaining,
          "stats.totalCreated": remaining,
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    // توليد الأرقام الجديدة
    const startId = result.currentValue - remaining + 1;
    for (let i = 0; i < remaining; i++) {
      ids.push(startId + i);
    }
  }

  return ids.sort((a, b) => a - b);
};

const Counter = mongoose.model("Counter", counterSchema);
module.exports = Counter;
