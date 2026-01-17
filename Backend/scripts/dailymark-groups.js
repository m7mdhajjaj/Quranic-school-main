/**
 * ============================================================================
 * DailyMark Groups Management Script
 * سكريبت إدارة حلقات العلامات اليومية
 * ============================================================================
 * 
 * الاستخدام:
 *   node scripts/dailymark-groups.js <command> [options]
 * 
 * الأوامر المتاحة:
 *   migrate          - تهجير جميع الحلقات لدعم نظام السور الفعالة
 *   sync [groupId]   - مزامنة السور الفعالة من المقاطع الموجودة
 *   info <groupId>   - عرض معلومات السورة الفعالة لحلقة
 *   stats <groupId>  - عرض إحصائيات حلقة
 *   report           - تقرير شامل عن جميع الحلقات
 *   repair <groupId> - فحص وإصلاح تسلسل المقاطع
 *   reset <groupId> <type> - إعادة تعيين السورة الفعالة
 *   list             - عرض جميع الحلقات
 * 
 * أمثلة:
 *   node scripts/dailymark-groups.js migrate
 *   node scripts/dailymark-groups.js sync
 *   node scripts/dailymark-groups.js info 507f1f77bcf86cd799439011
 *   node scripts/dailymark-groups.js report
 * 
 * ============================================================================
 */

require("dotenv").config();
const mongoose = require("mongoose");

// Database connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }
    
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

// Import services after connection
const loadServices = () => {
  const GroupActiveSurahService = require("../src/services/DailyMark/GroupActiveSurahService");
  const Group = require("../src/schema/Group");
  return { GroupActiveSurahService, Group };
};

// ============================================================================
// Commands
// ============================================================================

/**
 * تهجير جميع الحلقات
 */
const cmdMigrate = async (service) => {
  console.log("\n🔄 بدء تهجير الحلقات...\n");
  const results = await service.migrateAllGroups();
  
  console.log("\n📊 نتائج التهجير:");
  console.log(`   - إجمالي الحلقات: ${results.total}`);
  console.log(`   - تم تهجيرها: ${results.migrated}`);
  console.log(`   - تم تخطيها (موجودة): ${results.skipped}`);
  
  if (results.errors.length > 0) {
    console.log(`   - أخطاء: ${results.errors.length}`);
    results.errors.forEach(e => {
      console.log(`     ❌ ${e.groupName}: ${e.error}`);
    });
  }
};

/**
 * مزامنة السور الفعالة
 */
const cmdSync = async (service, groupId = null) => {
  console.log("\n🔄 بدء مزامنة السور الفعالة...\n");
  const results = await service.syncActiveSurahsFromSections(groupId);
  
  console.log("\n📊 نتائج المزامنة:");
  console.log(`   - إجمالي الحلقات: ${results.total}`);
  console.log(`   - تم مزامنتها: ${results.synced}`);
  
  if (results.errors.length > 0) {
    console.log(`   - أخطاء: ${results.errors.length}`);
    results.errors.forEach(e => {
      console.log(`     ❌ ${e.groupName}: ${e.error}`);
    });
  }
};

/**
 * عرض معلومات حلقة
 */
const cmdInfo = async (service, groupId) => {
  if (!groupId) {
    console.error("❌ يجب تحديد معرف الحلقة");
    process.exit(1);
  }

  const info = await service.getActiveSurahInfo(groupId);
  if (!info) {
    console.error("❌ الحلقة غير موجودة");
    process.exit(1);
  }

  console.log("\n📋 معلومات الحلقة:");
  console.log(`   📌 الاسم: ${info.groupName}`);
  console.log(`   🆔 المعرف: ${info.groupId}`);
  
  console.log("\n📖 الحفظ:");
  if (info.memorization.isActive) {
    console.log(`   - السورة: ${info.memorization.surahName}`);
    console.log(`   - آخر آية: ${info.memorization.lastAyahEnd} / ${info.memorization.totalAyahs}`);
    console.log(`   - التقدم: ${info.memorization.progressPercent}%`);
    console.log(`   - متبقي: ${info.memorization.remainingAyahs} آية`);
  } else {
    console.log(`   - ${info.memorization.message}`);
  }

  console.log("\n📝 المراجعة:");
  if (info.review.isActive) {
    console.log(`   - السورة: ${info.review.surahName}`);
    console.log(`   - آخر آية: ${info.review.lastAyahEnd} / ${info.review.totalAyahs}`);
    console.log(`   - التقدم: ${info.review.progressPercent}%`);
    console.log(`   - متبقي: ${info.review.remainingAyahs} آية`);
  } else {
    console.log(`   - ${info.review.message}`);
  }

  console.log("\n✅ السور المكتملة:");
  console.log(`   - حفظ: ${info.completedSurahs.memorization?.length || 0} سورة`);
  console.log(`   - مراجعة: ${info.completedSurahs.review?.length || 0} سورة`);
};

/**
 * عرض إحصائيات حلقة
 */
const cmdStats = async (service, groupId) => {
  if (!groupId) {
    console.error("❌ يجب تحديد معرف الحلقة");
    process.exit(1);
  }

  const stats = await service.getGroupStats(groupId);
  
  console.log("\n📊 إحصائيات الحلقة:");
  console.log(`   📌 الاسم: ${stats.groupName}`);
  console.log(`   👥 عدد الطلاب: ${stats.studentsCount}`);
  
  console.log("\n📄 المقاطع:");
  console.log(`   - حفظ: ${stats.sections.memorization}`);
  console.log(`   - مراجعة: ${stats.sections.review}`);
  console.log(`   - إجمالي: ${stats.sections.total}`);
  
  console.log("\n✅ السور المكتملة:");
  console.log(`   - حفظ: ${stats.completedSurahs.memorization}`);
  console.log(`   - مراجعة: ${stats.completedSurahs.review}`);
  console.log(`   - إجمالي: ${stats.completedSurahs.total}`);
  
  console.log("\n📖 السور الفعالة:");
  console.log(`   - حفظ: ${stats.activeSurahs.memorization || '-'}`);
  console.log(`   - مراجعة: ${stats.activeSurahs.review || '-'}`);
};

/**
 * تقرير شامل
 */
const cmdReport = async (service) => {
  console.log("\n📊 جارٍ إعداد التقرير...\n");
  const report = await service.generateGroupsReport();
  
  console.log(`\n📈 تقرير الحلقات - ${new Date(report.generatedAt).toLocaleDateString('ar-SA')}`);
  console.log(`${'='.repeat(80)}`);
  console.log(`إجمالي الحلقات: ${report.totalGroups}\n`);
  
  // Header
  console.log(`${'─'.repeat(80)}`);
  console.log(`الحلقة`.padEnd(20) + 
              `طلاب`.padEnd(8) + 
              `حفظ (سورة)`.padEnd(15) + 
              `مقاطع`.padEnd(8) + 
              `مراجعة (سورة)`.padEnd(15) + 
              `مقاطع`.padEnd(8));
  console.log(`${'─'.repeat(80)}`);
  
  // Data rows
  for (const g of report.groups) {
    const memStatus = g.memorization.activeSurah + (g.memorization.isCompleted ? ' ✓' : '');
    const revStatus = g.review.activeSurah + (g.review.isCompleted ? ' ✓' : '');
    
    console.log(
      g.name.substring(0, 18).padEnd(20) +
      String(g.studentsCount).padEnd(8) +
      memStatus.substring(0, 13).padEnd(15) +
      String(g.memorization.sectionsCount).padEnd(8) +
      revStatus.substring(0, 13).padEnd(15) +
      String(g.review.sectionsCount).padEnd(8)
    );
  }
  
  console.log(`${'─'.repeat(80)}`);
};

/**
 * فحص وإصلاح التسلسل
 */
const cmdRepair = async (service, groupId) => {
  if (!groupId) {
    console.error("❌ يجب تحديد معرف الحلقة");
    process.exit(1);
  }

  console.log("\n🔍 فحص تسلسل المقاطع...\n");
  const result = await service.repairGroupSequence(groupId);
  
  console.log(`📋 الحلقة: ${result.groupName}`);
  
  if (!result.hasIssues) {
    console.log("\n✅ لا توجد مشاكل في التسلسل");
    return;
  }
  
  console.log("\n⚠️ تم اكتشاف مشاكل:\n");
  
  if (result.repairs.memorization.length > 0) {
    console.log("📖 الحفظ:");
    result.repairs.memorization.forEach(r => {
      console.log(`   - مقطع ${r.sectionId}: فجوة بين ${r.expected} و ${r.actual}`);
    });
  }
  
  if (result.repairs.review.length > 0) {
    console.log("\n📝 المراجعة:");
    result.repairs.review.forEach(r => {
      console.log(`   - مقطع ${r.sectionId}: فجوة بين ${r.expected} و ${r.actual}`);
    });
  }
};

/**
 * إعادة تعيين السورة الفعالة
 */
const cmdReset = async (service, groupId, type) => {
  if (!groupId || !type) {
    console.error("❌ يجب تحديد معرف الحلقة ونوع السورة (memorization/review)");
    process.exit(1);
  }

  if (!['memorization', 'review'].includes(type)) {
    console.error("❌ النوع يجب أن يكون memorization أو review");
    process.exit(1);
  }

  console.log(`\n🔄 إعادة تعيين السورة الفعالة (${type})...`);
  const result = await service.resetActiveSurah(groupId, type);
  console.log(`✅ ${result.message}`);
};

/**
 * عرض جميع الحلقات
 */
const cmdList = async (Group) => {
  const groups = await Group.find({})
    .select('name students activeMemorizationSurah activeReviewSurah')
    .sort({ name: 1 })
    .lean();
  
  console.log("\n📋 قائمة الحلقات:\n");
  console.log(`${'─'.repeat(70)}`);
  console.log(`المعرف`.padEnd(28) + `الاسم`.padEnd(25) + `طلاب`.padEnd(8) + `حالة`);
  console.log(`${'─'.repeat(70)}`);
  
  for (const g of groups) {
    const hasActive = g.activeMemorizationSurah?.surahNumber || g.activeReviewSurah?.surahNumber;
    const status = hasActive ? '🟢' : '⚪';
    
    console.log(
      String(g._id).padEnd(28) +
      g.name.substring(0, 23).padEnd(25) +
      String(g.students?.length || 0).padEnd(8) +
      status
    );
  }
  
  console.log(`${'─'.repeat(70)}`);
  console.log(`\n📊 إجمالي: ${groups.length} حلقة`);
};

/**
 * عرض المساعدة
 */
const showHelp = () => {
  console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║             DailyMark Groups Management Script                                ║
║             سكريبت إدارة حلقات العلامات اليومية                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

الاستخدام:
  node scripts/dailymark-groups.js <command> [options]

الأوامر المتاحة:
  migrate              تهجير جميع الحلقات لدعم نظام السور الفعالة
  sync [groupId]       مزامنة السور الفعالة من المقاطع الموجودة
  info <groupId>       عرض معلومات السورة الفعالة لحلقة
  stats <groupId>      عرض إحصائيات حلقة
  report               تقرير شامل عن جميع الحلقات
  repair <groupId>     فحص وإصلاح تسلسل المقاطع
  reset <groupId> <type>  إعادة تعيين السورة الفعالة (memorization/review)
  list                 عرض جميع الحلقات
  help                 عرض هذه المساعدة

أمثلة:
  node scripts/dailymark-groups.js migrate
  node scripts/dailymark-groups.js sync
  node scripts/dailymark-groups.js sync 507f1f77bcf86cd799439011
  node scripts/dailymark-groups.js info 507f1f77bcf86cd799439011
  node scripts/dailymark-groups.js report
  node scripts/dailymark-groups.js reset 507f1f77bcf86cd799439011 memorization
  node scripts/dailymark-groups.js list
`);
};

// ============================================================================
// Main
// ============================================================================

const main = async () => {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command || command === 'help' || command === '--help' || command === '-h') {
    showHelp();
    process.exit(0);
  }

  // Connect to database
  await connectDB();
  
  // Load services
  const { GroupActiveSurahService, Group } = loadServices();

  try {
    switch (command) {
      case 'migrate':
        await cmdMigrate(GroupActiveSurahService);
        break;
        
      case 'sync':
        await cmdSync(GroupActiveSurahService, args[1]);
        break;
        
      case 'info':
        await cmdInfo(GroupActiveSurahService, args[1]);
        break;
        
      case 'stats':
        await cmdStats(GroupActiveSurahService, args[1]);
        break;
        
      case 'report':
        await cmdReport(GroupActiveSurahService);
        break;
        
      case 'repair':
        await cmdRepair(GroupActiveSurahService, args[1]);
        break;
        
      case 'reset':
        await cmdReset(GroupActiveSurahService, args[1], args[2]);
        break;
        
      case 'list':
        await cmdList(Group);
        break;
        
      default:
        console.error(`❌ الأمر غير معروف: ${command}`);
        showHelp();
        process.exit(1);
    }
    
    console.log("\n✅ تم بنجاح!\n");
    
  } catch (error) {
    console.error("\n❌ خطأ:", error.message);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("📤 تم قطع الاتصال بقاعدة البيانات");
  }
};

main();
