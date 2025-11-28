// ============================================
// CACHE UTILITIES FOR GROUP OPERATIONS
// ============================================

const Student = require('../../../schema/Student');

// Cache بسيط للنتائج (يمكن استبداله بـ Redis في الإنتاج)
let studentCountsCache = {
  data: {},
  timestamp: 0,
  ttl: 60000, // مهلة انتهاء الصلاحية: دقيقة واحدة
};

/**
 * دالة محسّنة لحساب عدد الطلاب لجميع الحلقات في استعلام واحد مع caching
 */
const getStudentCountsForAllGroups = async () => {
  try {
    // فحص الـ cache أولاً
    const now = Date.now();
    if (studentCountsCache.timestamp + studentCountsCache.ttl > now) {
      console.log('📋 استخدام البيانات المحفوظة (cache) لعدد الطلاب');
      return studentCountsCache.data;
    }

    console.log('🔄 تحديث إحصائيات الطلاب من قاعدة البيانات...');

    // استخدام aggregation pipeline للحصول على عدد الطلاب لكل حلقة في استعلام واحد
    const studentCounts = await Student.aggregate([
      {
        $match: {
          group: { $exists: true, $ne: null, $ne: '' },
        },
      },
      {
        $group: {
          _id: '$group',
          count: { $sum: 1 },
        },
      },
    ]);

    // تحويل النتيجة إلى object للبحث السريع
    const countMap = {};
    studentCounts.forEach((item) => {
      countMap[item._id] = item.count;
    });

    // حفظ في الـ cache
    studentCountsCache = {
      data: countMap,
      timestamp: now,
      ttl: 60000,
    };

    console.log(`✅ تم تحديث إحصائيات ${studentCounts.length} حلقة`);
    return countMap;
  } catch (error) {
    console.error('خطأ في حساب عدد الطلاب:', error);
    return {};
  }
};

/**
 * دالة محسّنة لحساب عدد الطلاب لمعلم محدد
 */
const getStudentCountsForTeacher = async (teacherName) => {
  try {
    const studentCounts = await Student.aggregate([
      {
        $match: {
          teacher: teacherName,
          group: { $exists: true, $ne: null, $ne: '' },
        },
      },
      {
        $group: {
          _id: '$group',
          count: { $sum: 1 },
        },
      },
    ]);

    const countMap = {};
    studentCounts.forEach((item) => {
      countMap[item._id] = item.count;
    });

    return countMap;
  } catch (error) {
    console.error('خطأ في حساب عدد طلاب المعلم:', error);
    return {};
  }
};

/**
 * دالة لإبطال cache عدد الطلاب (يتم استدعاؤها عند تعديل بيانات الطلاب)
 */
const invalidateStudentCountsCache = () => {
  console.log('🗑️ إبطال cache عدد الطلاب');
  studentCountsCache.timestamp = 0;
};

module.exports = {
  getStudentCountsForAllGroups,
  getStudentCountsForTeacher,
  invalidateStudentCountsCache,
};
