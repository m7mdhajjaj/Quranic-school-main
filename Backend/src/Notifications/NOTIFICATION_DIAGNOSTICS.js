// ============================================================================
// NOTIFICATION_DIAGNOSTICS.js - أداة تشخيص نظام الإشعارات
// ============================================================================
// استخدام: node src/Notifications/NOTIFICATION_DIAGNOSTICS.js
// ============================================================================

require('dotenv').config();
const mongoose = require('mongoose');
const Notification = require('../schema/Notification');
const DeviceToken = require('../schema/DeviceToken');
const Student = require('../schema/Student');
const Group = require('../schema/Group');

// Colors for console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.cyan}${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}${colors.reset}`),
};

async function runDiagnostics() {
  try {
    log.header('🔍 تشغيل فحص تشخيصي لنظام الإشعارات');

    // 1. اتصال قاعدة البيانات
    log.info('جاري الاتصال بقاعدة البيانات...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    log.success('تم الاتصال بقاعدة البيانات بنجاح');

    // 2. فحص Notification Schema
    log.header('📋 فحص Notification Schema');
    await checkNotificationSchema();

    // 3. فحص DeviceToken Schema
    log.header('📱 فحص DeviceToken Schema');
    await checkDeviceTokenSchema();

    // 4. فحص الإشعارات الموجودة
    log.header('🔔 فحص الإشعارات الموجودة');
    await checkExistingNotifications();

    // 5. فحص توكنات الأجهزة
    log.header('📲 فحص توكنات الأجهزة');
    await checkDeviceTokens();

    // 6. فحص Group-Student matching
    log.header('👥 فحص Group-Student Matching');
    await checkGroupStudentMatching();

    // 7. اختبار إنشاء إشعار تجريبي
    log.header('🧪 اختبار إنشاء إشعار تجريبي');
    await testNotificationCreation();

    // 8. فحص الفهارس (Indexes)
    log.header('📊 فحص Indexes');
    await checkIndexes();

    log.header('✅ اكتمل الفحص التشخيصي');
    
  } catch (error) {
    log.error(`خطأ في الفحص التشخيصي: ${error.message}`);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    log.info('تم قطع الاتصال بقاعدة البيانات');
  }
}

// ============================================================================
// وظائف الفحص
// ============================================================================

async function checkNotificationSchema() {
  try {
    const count = await Notification.countDocuments();
    log.success(`Schema صحيح - يوجد ${count} إشعار في قاعدة البيانات`);

    // Check required fields
    const sampleNotification = await Notification.findOne();
    if (sampleNotification) {
      log.info('مثال على إشعار:');
      console.log({
        _id: sampleNotification._id,
        type: sampleNotification.type,
        recipient: sampleNotification.recipient,
        recipientModel: sampleNotification.recipientModel,
        title: sampleNotification.title,
        isRead: sampleNotification.isRead,
        createdAt: sampleNotification.createdAt,
      });
    } else {
      log.warning('لا يوجد إشعارات في قاعدة البيانات');
    }
  } catch (error) {
    log.error(`خطأ في فحص Notification Schema: ${error.message}`);
  }
}

async function checkDeviceTokenSchema() {
  try {
    const count = await DeviceToken.countDocuments();
    log.success(`Schema صحيح - يوجد ${count} توكن في قاعدة البيانات`);

    const sampleToken = await DeviceToken.findOne();
    if (sampleToken) {
      log.info('مثال على توكن:');
      console.log({
        _id: sampleToken._id,
        user: sampleToken.user,
        userModel: sampleToken.userModel,
        platform: sampleToken.platform,
        createdAt: sampleToken.createdAt,
      });
    } else {
      log.warning('لا يوجد توكنات في قاعدة البيانات');
    }
  } catch (error) {
    log.error(`خطأ في فحص DeviceToken Schema: ${error.message}`);
  }
}

async function checkExistingNotifications() {
  try {
    // Stats by type
    const types = await Notification.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    log.info('الإشعارات حسب النوع:');
    types.forEach(({ _id, count }) => {
      console.log(`  - ${_id}: ${count}`);
    });

    // Stats by read status
    const unreadCount = await Notification.countDocuments({ isRead: false });
    const readCount = await Notification.countDocuments({ isRead: true });
    log.info(`المقروءة: ${readCount} | غير المقروءة: ${unreadCount}`);

    // Recent notifications
    const recent = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('type title recipientModel isRead createdAt');
    
    log.info('آخر 5 إشعارات:');
    recent.forEach((n) => {
      console.log(`  - [${n.type}] ${n.title} (${n.isRead ? 'مقروء' : 'غير مقروء'})`);
    });
  } catch (error) {
    log.error(`خطأ في فحص الإشعارات: ${error.message}`);
  }
}

async function checkDeviceTokens() {
  try {
    // Stats by platform
    const platforms = await DeviceToken.aggregate([
      { $group: { _id: '$platform', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    log.info('التوكنات حسب المنصة:');
    platforms.forEach(({ _id, count }) => {
      console.log(`  - ${_id}: ${count}`);
    });

    // Stats by user model
    const userModels = await DeviceToken.aggregate([
      { $group: { _id: '$userModel', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    log.info('التوكنات حسب نوع المستخدم:');
    userModels.forEach(({ _id, count }) => {
      console.log(`  - ${_id}: ${count}`);
    });

    // Check FCM service
    const FCMService = require('./Core/FCMService');
    if (FCMService && FCMService.initialized) {
      log.success('خدمة FCM مفعلة');
    } else {
      log.warning('خدمة FCM غير مفعلة - تحقق من FIREBASE_SERVICE_ACCOUNT_JSON');
    }
  } catch (error) {
    log.error(`خطأ في فحص التوكنات: ${error.message}`);
  }
}

async function checkGroupStudentMatching() {
  try {
    const groups = await Group.find().limit(5);
    
    for (const group of groups) {
      // Search by name
      const studentsByName = await Student.find({ group: group.name }).countDocuments();
      
      // Search by ID
      const studentsByID = await Student.find({ group: group._id.toString() }).countDocuments();
      
      log.info(`الحلقة: ${group.name}`);
      console.log(`  - الطلاب (by name): ${studentsByName}`);
      console.log(`  - الطلاب (by ID): ${studentsByID}`);
      
      if (studentsByName === 0 && studentsByID === 0) {
        log.warning(`  لا يوجد طلاب في هذه الحلقة`);
      } else {
        log.success(`  يوجد طلاب في الحلقة`);
      }
    }
  } catch (error) {
    log.error(`خطأ في فحص Group-Student Matching: ${error.message}`);
  }
}

async function testNotificationCreation() {
  try {
    // Find a student to test with
    const student = await Student.findOne();
    
    if (!student) {
      log.warning('لا يوجد طلاب في قاعدة البيانات للاختبار');
      return;
    }

    const testNotification = new Notification({
      recipient: student._id,
      recipientModel: 'Student',
      type: 'general',
      title: 'إشعار تجريبي',
      message: 'هذا إشعار تجريبي للتأكد من عمل النظام',
      data: {
        action: 'test',
        timestamp: new Date(),
      },
    });

    await testNotification.save();
    log.success(`تم إنشاء إشعار تجريبي بنجاح (ID: ${testNotification._id})`);

    // Clean up
    await Notification.deleteOne({ _id: testNotification._id });
    log.info('تم حذف الإشعار التجريبي');
  } catch (error) {
    log.error(`خطأ في اختبار إنشاء الإشعار: ${error.message}`);
  }
}

async function checkIndexes() {
  try {
    const notificationIndexes = await Notification.collection.getIndexes();
    log.info('Notification Indexes:');
    Object.keys(notificationIndexes).forEach((indexName) => {
      console.log(`  - ${indexName}`);
    });

    const deviceTokenIndexes = await DeviceToken.collection.getIndexes();
    log.info('DeviceToken Indexes:');
    Object.keys(deviceTokenIndexes).forEach((indexName) => {
      console.log(`  - ${indexName}`);
    });

    log.success('جميع الفهارس موجودة');
  } catch (error) {
    log.error(`خطأ في فحص Indexes: ${error.message}`);
  }
}

// ============================================================================
// تشغيل الفحص
// ============================================================================

if (require.main === module) {
  runDiagnostics();
}

module.exports = { runDiagnostics };
