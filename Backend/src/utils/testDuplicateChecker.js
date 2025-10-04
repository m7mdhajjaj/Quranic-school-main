/**
 * اختبار نظام التحقق من التكرار
 * 
 * هذا الملف يحتوي على مثال لاختبار دالة التحقق من التكرار
 * يمكن استخدامه للتأكد من عمل النظام بشكل صحيح
 */

const { checkDuplicateFields } = require('./duplicateChecker');

// مثال على كيفية استخدام الدالة
async function testDuplicateChecker() {
  try {
    console.log('🧪 اختبار نظام التحقق من التكرار...');

    // اختبار رقم هوية مكرر
    const result1 = await checkDuplicateFields({
      idNumber: '123456789',
      email: 'test@example.com',
      phoneNumber: '0500000000'
    });
    
    if (result1) {
      console.log('❌ وجد تكرار:', result1.message);
    } else {
      console.log('✅ لا يوجد تكرار في البيانات');
    }

    // اختبار استثناء معرف معين (للتحديث)
    const result2 = await checkDuplicateFields({
      idNumber: '123456789',
      email: 'test@example.com',
      phoneNumber: '0500000000'
    }, 'USER_ID_TO_EXCLUDE', 'student');

    if (result2) {
      console.log('❌ وجد تكرار:', result2.message);
    } else {
      console.log('✅ لا يوجد تكرار مع الاستثناء');
    }

  } catch (error) {
    console.error('💥 خطأ في الاختبار:', error.message);
  }
}

// تشغيل الاختبار فقط إذا تم استدعاء الملف مباشرة
if (require.main === module) {
  testDuplicateChecker();
}

module.exports = { testDuplicateChecker };