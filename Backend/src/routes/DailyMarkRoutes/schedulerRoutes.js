const express = require("express");
const router = express.Router();
const schedulerController = require("../../controllers/DailyMarkController/schedulerController");
const { protect, adminProtect } = require("../../middleware/auth");

/**
 * ============================================================================
 * Smart Scheduler Routes
 * ============================================================================
 * API endpoints للجدولة الذكية وسد الفجوات
 * 
 * Base path: /api/daily-marks/scheduler
 */

// Middleware للتحقق من الصلاحية
router.use(protect);

/**
 * POST /suggest-gaps
 * اقتراح جدول كامل لسد فجوات سورة معينة
 * 
 * Body: { groupId, surahNumber, chunkSize?, priorityDate?, preferredDays?, maxChunks?, type? }
 * 
 * مثال:
 * {
 *   "groupId": "64a1b2c3d4e5f6789012345",
 *   "surahNumber": 2,
 *   "chunkSize": 10,
 *   "maxChunks": 6
 * }
 */
router.post("/suggest-gaps", schedulerController.suggestGapFilling);

/**
 * POST /suggest-date
 * اقتراح تاريخ واحد لمقطع جديد
 * 
 * Body: { groupId, surahNumber, ayahStart, ayahEnd? }
 * 
 * مثال:
 * {
 *   "groupId": "64a1b2c3d4e5f6789012345",
 *   "surahNumber": 2,
 *   "ayahStart": 51
 * }
 */
router.post("/suggest-date", schedulerController.suggestSingleDate);

/**
 * POST /validate
 * التحقق من صلاحية تاريخ معين قبل الإدراج
 * 
 * Body: { groupId, surahNumber, ayahStart, ayahEnd, proposedDate }
 * 
 * مثال:
 * {
 *   "groupId": "64a1b2c3d4e5f6789012345",
 *   "surahNumber": 2,
 *   "ayahStart": 51,
 *   "ayahEnd": 60,
 *   "proposedDate": "2026-01-20"
 * }
 */
router.post("/validate", schedulerController.validateBeforeInsert);

/**
 * GET /available-dates
 * جلب التواريخ المتاحة لحلقة معينة
 * 
 * Query: ?groupId=xxx&count=10&startDate=2026-01-15
 */
router.get("/available-dates", schedulerController.getAvailableDates);

/**
 * GET /gaps/:groupId/:surahNumber
 * اكتشاف الفجوات في سورة معينة
 * 
 * Query: ?type=memorization|review
 */
router.get("/gaps/:groupId/:surahNumber", schedulerController.detectGaps);

/**
 * POST /split-chunk
 * تقسيم فجوة معينة إلى مقاطع (للمعاينة)
 * 
 * Body: { surahNumber, ayahStart, ayahEnd, chunkSize? }
 */
router.post("/split-chunk", schedulerController.splitChunk);

/**
 * GET /weekly-usage/:groupId
 * استعراض استخدام الأسابيع القادمة
 * 
 * Query: ?weeks=6
 */
router.get("/weekly-usage/:groupId", schedulerController.getWeeklyUsage);

/**
 * POST /validate-auto-fix
 * التحقق من صلاحية التاريخ مع إصلاح تلقائي
 * إذا التاريخ غير صالح، يقترح تاريخ بديل تلقائياً
 * 
 * Body: { groupId, surahNumber, ayahStart, ayahEnd, proposedDate, autoFix? }
 * 
 * مثال:
 * {
 *   "groupId": "64a1b2c3d4e5f6789012345",
 *   "surahNumber": 2,
 *   "ayahStart": 51,
 *   "ayahEnd": 60,
 *   "proposedDate": "2026-01-20",
 *   "autoFix": true
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "isValid": false,
 *   "autoFixed": true,
 *   "suggestedDate": { "dateKey": "2026-01-22", "reason": "..." }
 * }
 */
router.post("/validate-auto-fix", schedulerController.validateAndAutoFix);

/**
 * GET /debug-order/:groupId/:surahNumber
 * عرض الترتيب الحالي للمقاطع (للتصحيح والفحص)
 * يُظهر إذا كان الترتيب الزمني يطابق الترتيب القرآني
 * ⚠️ محمي بصلاحيات المشرف فقط
 */
router.get("/debug-order/:groupId/:surahNumber", adminProtect, schedulerController.debugOrder);

module.exports = router;
