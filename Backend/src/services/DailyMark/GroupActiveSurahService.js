/**
 * ============================================================================
 * GroupActiveSurahService - خدمة إدارة السور الفعالة للحلقات
 * ============================================================================
 * 
 * خدمة مركزية لإدارة نظام السور الفعالة (Active Surah System) في الحلقات
 * 
 * 📚 الوظائف الرئيسية:
 * - تتبع السورة الفعالة لكل حلقة (حفظ ومراجعة)
 * - إدارة إكمال السور
 * - تتبع التقدم والإحصائيات
 * - سكريبتات الصيانة والتهجير
 * 
 * ============================================================================
 */

const Group = require("../../schema/Group");
const Section = require("../../schema/DailyMark/Section");
const { getSurahByNumber, surahData } = require("../../utils/Quran/dailyMarkQuranMetadata");
const { createLogger } = require("../../utils/logger");
const { toDateKey, TIMEZONE } = require("../../config/timezone");

const logger = createLogger('GroupActiveSurahService');

class GroupActiveSurahService {
  
  /**
   * ============================================================================
   * الحصول على معلومات السورة الفعالة لحلقة
   * ============================================================================
   */
  async getActiveSurahInfo(groupId) {
    return await Group.getActiveSurahInfo(groupId);
  }

  /**
   * ============================================================================
   * تفعيل سورة جديدة لحلقة
   * ============================================================================
   * @param {string} groupId - معرف الحلقة
   * @param {number} surahNumber - رقم السورة
   * @param {string} type - 'memorization' أو 'review'
   */
  async activateSurah(groupId, surahNumber, type = 'memorization') {
    const surahInfo = getSurahByNumber(surahNumber);
    if (!surahInfo) {
      throw new Error(`سورة رقم ${surahNumber} غير موجودة`);
    }

    // التحقق من إمكانية تفعيل سورة جديدة
    const canActivate = await Group.canAddSegment(groupId, surahNumber, type);
    if (!canActivate.allowed && canActivate.reason !== 'new_surah_allowed') {
      throw new Error(canActivate.reason);
    }

    // تفعيل السورة
    const result = await Group.activateSurah(groupId, surahNumber, surahInfo.name, 0, type);
    
    return {
      success: true,
      message: `تم تفعيل سورة ${surahInfo.name} لـ${type === 'memorization' ? 'الحفظ' : 'المراجعة'}`,
      group: result
    };
  }

  /**
   * ============================================================================
   * تحديث آخر آية تم الوصول إليها
   * ============================================================================
   */
  async updateProgress(groupId, ayahEnd, type = 'memorization') {
    const surahInfo = await this.getActiveSurahInfo(groupId);
    if (!surahInfo) {
      throw new Error('الحلقة غير موجودة');
    }

    const activeInfo = type === 'memorization' ? surahInfo.memorization : surahInfo.review;
    if (!activeInfo.isActive) {
      throw new Error(`لا توجد سورة فعالة لـ${type === 'memorization' ? 'الحفظ' : 'المراجعة'}`);
    }

    // تحديث آخر آية
    await Group.updateLastAyah(groupId, ayahEnd, type);

    // التحقق من إكمال السورة تلقائياً
    const surahs = getSurahByNumber(activeInfo.surahNumber);
    const totalAyahs = surahs?.ayahCount || 0;
    
    if (ayahEnd >= totalAyahs) {
      // السورة مكتملة
      const completion = await Group.checkAndCompleteSurah(groupId, ayahEnd, totalAyahs, type);
      return {
        success: true,
        surahCompleted: true,
        ...completion
      };
    }

    return {
      success: true,
      surahCompleted: false,
      currentProgress: {
        lastAyahEnd: ayahEnd,
        totalAyahs,
        remainingAyahs: totalAyahs - ayahEnd,
        progressPercent: Math.round((ayahEnd / totalAyahs) * 100)
      }
    };
  }

  /**
   * ============================================================================
   * إكمال السورة يدوياً
   * ============================================================================
   */
  async completeSurah(groupId, type = 'memorization') {
    const surahInfo = await this.getActiveSurahInfo(groupId);
    if (!surahInfo) {
      throw new Error('الحلقة غير موجودة');
    }

    const activeInfo = type === 'memorization' ? surahInfo.memorization : surahInfo.review;
    if (!activeInfo.isActive) {
      throw new Error(`لا توجد سورة فعالة لـ${type === 'memorization' ? 'الحفظ' : 'المراجعة'}`);
    }

    // حساب عدد المقاطع
    const metaField = type === 'memorization' ? 'memorizationMeta' : 'reviewMeta';
    const totalSegments = await Section.countDocuments({
      group: groupId,
      [`${metaField}.surahNumber`]: activeInfo.surahNumber
    });

    // إكمال السورة
    await Group.completeSurah(groupId, type, totalSegments);

    return {
      success: true,
      message: `تم إكمال سورة ${activeInfo.surahName} لـ${type === 'memorization' ? 'الحفظ' : 'المراجعة'}`,
      surahNumber: activeInfo.surahNumber,
      surahName: activeInfo.surahName,
      totalSegments
    };
  }

  /**
   * ============================================================================
   * إعادة تعيين السورة الفعالة
   * ============================================================================
   */
  async resetActiveSurah(groupId, type = 'memorization') {
    await Group.resetActiveSurah(groupId, type);
    
    return {
      success: true,
      message: `تم إعادة تعيين السورة الفعالة لـ${type === 'memorization' ? 'الحفظ' : 'المراجعة'}`
    };
  }

  /**
   * ============================================================================
   * الحصول على السور المكتملة لحلقة
   * ============================================================================
   */
  async getCompletedSurahs(groupId) {
    const group = await Group.findById(groupId)
      .select('completedSurahs name')
      .lean();

    if (!group) {
      throw new Error('الحلقة غير موجودة');
    }

    // إضافة تفاصيل السور
    const enrichSurahs = (surahs) => {
      return (surahs || []).map(s => {
        const info = getSurahByNumber(s.surahNumber);
        return {
          ...s,
          surahName: info?.name || s.surahName,
          ayahCount: info?.ayahCount || 0
        };
      });
    };

    return {
      groupId,
      groupName: group.name,
      memorization: enrichSurahs(group.completedSurahs?.memorization),
      review: enrichSurahs(group.completedSurahs?.review)
    };
  }

  /**
   * ============================================================================
   * إحصائيات الحلقة
   * ============================================================================
   */
  async getGroupStats(groupId) {
    const group = await Group.findById(groupId)
      .select('name activeMemorizationSurah activeReviewSurah completedSurahs students')
      .lean();

    if (!group) {
      throw new Error('الحلقة غير موجودة');
    }

    // إحصائيات المقاطع
    const [memorizationSections, reviewSections] = await Promise.all([
      Section.countDocuments({ group: groupId, 'memorizationMeta.surahNumber': { $exists: true } }),
      Section.countDocuments({ group: groupId, 'reviewMeta.surahNumber': { $exists: true } })
    ]);

    // إحصائيات السور المكتملة
    const completedMemorization = group.completedSurahs?.memorization?.length || 0;
    const completedReview = group.completedSurahs?.review?.length || 0;

    return {
      groupId,
      groupName: group.name,
      studentsCount: group.students?.length || 0,
      sections: {
        memorization: memorizationSections,
        review: reviewSections,
        total: memorizationSections + reviewSections
      },
      completedSurahs: {
        memorization: completedMemorization,
        review: completedReview,
        total: completedMemorization + completedReview
      },
      activeSurahs: {
        memorization: group.activeMemorizationSurah?.surahName || null,
        review: group.activeReviewSurah?.surahName || null
      }
    };
  }

  // ============================================================================
  // 🔧 سكريبتات الصيانة والتهجير
  // ============================================================================

  /**
   * تهجير جميع الحلقات لدعم نظام السور الفعالة
   * يضيف الحقول الافتراضية للحلقات القديمة
   */
  async migrateAllGroups() {
    const results = {
      total: 0,
      migrated: 0,
      skipped: 0,
      errors: []
    };

    const groups = await Group.find({}).lean();
    results.total = groups.length;

    for (const group of groups) {
      try {
        // التحقق من وجود الحقول
        const needsMigration = !group.activeMemorizationSurah || !group.activeReviewSurah;
        
        if (needsMigration) {
          await Group.findByIdAndUpdate(group._id, {
            $set: {
              activeMemorizationSurah: group.activeMemorizationSurah || {
                surahNumber: null,
                surahName: null,
                startedAt: null,
                lastAyahEnd: 0,
                isCompleted: false,
                completedAt: null
              },
              activeReviewSurah: group.activeReviewSurah || {
                surahNumber: null,
                surahName: null,
                startedAt: null,
                lastAyahEnd: 0,
                isCompleted: false,
                completedAt: null
              },
              completedSurahs: group.completedSurahs || {
                memorization: [],
                review: []
              }
            }
          });
          results.migrated++;
        } else {
          results.skipped++;
        }
      } catch (error) {
        results.errors.push({
          groupId: group._id,
          groupName: group.name,
          error: error.message
        });
      }
    }

    logger.info('📊 نتائج التهجير:', results);
    return results;
  }

  /**
   * مزامنة السور الفعالة من المقاطع الموجودة
   * يكتشف آخر سورة تم العمل عليها ويعينها كفعالة
   * ✅ إذا لم توجد مقاطع، يمسح السورة الفعالة
   */
  async syncActiveSurahsFromSections(groupId = null) {
    const results = {
      total: 0,
      synced: 0,
      cleared: 0,
      errors: []
    };

    const query = groupId ? { _id: groupId } : {};
    const groups = await Group.find(query).lean();
    results.total = groups.length;

    for (const group of groups) {
      try {
        // البحث عن آخر مقطع حفظ
        const lastMemorizationSection = await Section.findOne({
          groupId: group._id,
          'memorizationMeta.surahNumber': { $exists: true, $ne: null }
        })
          .sort({ date: -1, createdAt: -1 })
          .lean();

        // البحث عن آخر مقطع مراجعة
        const lastReviewSection = await Section.findOne({
          groupId: group._id,
          'reviewMeta.surahNumber': { $exists: true, $ne: null }
        })
          .sort({ date: -1, createdAt: -1 })
          .lean();

        const updates = {};

        // مزامنة الحفظ
        if (lastMemorizationSection?.memorizationMeta?.surahNumber) {
          const meta = lastMemorizationSection.memorizationMeta;
          const surahInfo = getSurahByNumber(meta.surahNumber);
          
          updates.activeMemorizationSurah = {
            surahNumber: meta.surahNumber,
            surahName: surahInfo?.name || `سورة ${meta.surahNumber}`,
            startedAt: lastMemorizationSection.date,
            lastAyahEnd: meta.ayahEnd || 0,
            isCompleted: surahInfo ? (meta.ayahEnd >= surahInfo.ayahCount) : false,
            completedAt: null
          };
        } else {
          // ✅ لا توجد مقاطع حفظ - مسح السورة الفعالة
          updates.activeMemorizationSurah = null;
        }

        // مزامنة المراجعة
        if (lastReviewSection?.reviewMeta?.surahNumber) {
          const meta = lastReviewSection.reviewMeta;
          const surahInfo = getSurahByNumber(meta.surahNumber);
          
          updates.activeReviewSurah = {
            surahNumber: meta.surahNumber,
            surahName: surahInfo?.name || `سورة ${meta.surahNumber}`,
            startedAt: lastReviewSection.date,
            lastAyahEnd: meta.ayahEnd || 0,
            isCompleted: surahInfo ? (meta.ayahEnd >= surahInfo.ayahCount) : false,
            completedAt: null
          };
        } else {
          // ✅ لا توجد مقاطع مراجعة - مسح السورة الفعالة
          updates.activeReviewSurah = null;
        }

        // تطبيق التحديثات
        await Group.findByIdAndUpdate(group._id, { $set: updates });
        
        if (!lastMemorizationSection && !lastReviewSection) {
          results.cleared++;
          logger.debug(`🧹 تم مسح السور الفعالة لحلقة ${group.name} (لا توجد مقاطع)`);
        } else {
          results.synced++;
          logger.debug(`✅ مزامنة حلقة ${group.name}`);
        }

      } catch (error) {
        results.errors.push({
          groupId: group._id,
          groupName: group.name,
          error: error.message
        });
      }
    }

    logger.info('📊 نتائج المزامنة:', results);
    return results;
  }

  /**
   * إصلاح تسلسل السور لحلقة معينة
   * يتحقق من التسلسل الصحيح ويصلح الأخطاء
   */
  async repairGroupSequence(groupId) {
    const group = await Group.findById(groupId).lean();
    if (!group) {
      throw new Error('الحلقة غير موجودة');
    }

    const repairs = {
      memorization: [],
      review: []
    };

    for (const type of ['memorization', 'review']) {
      const metaField = type === 'memorization' ? 'memorizationMeta' : 'reviewMeta';
      
      // جلب جميع المقاطع مرتبة
      const sections = await Section.find({
        group: groupId,
        [`${metaField}.surahNumber`]: { $exists: true, $ne: null }
      })
        .sort({ date: 1, createdAt: 1 })
        .lean();

      // تجميع المقاطع حسب السورة
      const surahSections = {};
      for (const section of sections) {
        const surahNum = section[metaField].surahNumber;
        if (!surahSections[surahNum]) {
          surahSections[surahNum] = [];
        }
        surahSections[surahNum].push(section);
      }

      // التحقق من كل سورة
      for (const [surahNum, sects] of Object.entries(surahSections)) {
        const surahInfo = getSurahByNumber(parseInt(surahNum));
        if (!surahInfo) continue;

        let lastEnd = 0;
        for (const sect of sects) {
          const meta = sect[metaField];
          if (meta.ayahStart !== lastEnd + 1) {
            repairs[type].push({
              sectionId: sect._id,
              issue: 'gap_detected',
              expected: lastEnd + 1,
              actual: meta.ayahStart,
              surahNumber: parseInt(surahNum)
            });
          }
          lastEnd = meta.ayahEnd;
        }
      }
    }

    return {
      groupId,
      groupName: group.name,
      repairs,
      hasIssues: repairs.memorization.length > 0 || repairs.review.length > 0
    };
  }

  /**
   * تقرير شامل عن جميع الحلقات
   */
  async generateGroupsReport() {
    const groups = await Group.find({})
      .select('name activeMemorizationSurah activeReviewSurah completedSurahs students')
      .lean();

    const report = [];

    for (const group of groups) {
      const [memSections, revSections] = await Promise.all([
        Section.countDocuments({ 
          group: group._id, 
          'memorizationMeta.surahNumber': { $exists: true, $ne: null } 
        }),
        Section.countDocuments({ 
          group: group._id, 
          'reviewMeta.surahNumber': { $exists: true, $ne: null } 
        })
      ]);

      report.push({
        id: group._id,
        name: group.name,
        studentsCount: group.students?.length || 0,
        memorization: {
          activeSurah: group.activeMemorizationSurah?.surahName || '-',
          isCompleted: group.activeMemorizationSurah?.isCompleted || false,
          lastAyah: group.activeMemorizationSurah?.lastAyahEnd || 0,
          sectionsCount: memSections,
          completedSurahs: group.completedSurahs?.memorization?.length || 0
        },
        review: {
          activeSurah: group.activeReviewSurah?.surahName || '-',
          isCompleted: group.activeReviewSurah?.isCompleted || false,
          lastAyah: group.activeReviewSurah?.lastAyahEnd || 0,
          sectionsCount: revSections,
          completedSurahs: group.completedSurahs?.review?.length || 0
        }
      });
    }

    return {
      totalGroups: groups.length,
      generatedAt: new Date(),
      groups: report
    };
  }
}

// تصدير نسخة واحدة من الخدمة
module.exports = new GroupActiveSurahService();
