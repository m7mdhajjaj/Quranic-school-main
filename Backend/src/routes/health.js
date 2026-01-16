// ============================================================================
// Health Check Route - للحفاظ على السيرفر مستيقظ على Render/Railway
// ============================================================================

const express = require('express');
const router = express.Router();
const os = require('os');

/**
 * Health Check Endpoint
 * GET /api/health
 * يستخدم من خدمات cron-job.org للحفاظ على السيرفر مستيقظ
 */
router.get('/health', (req, res) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: {
      seconds: Math.floor(uptime),
      formatted: formatUptime(uptime)
    },
    memory: {
      used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`
    },
    system: {
      platform: os.platform(),
      nodeVersion: process.version
    },
    message: 'السيرفر يعمل بشكل صحيح ✅'
  });
});

/**
 * تحويل وقت التشغيل إلى تنسيق مقروء
 */
function formatUptime(seconds) {
  const days = Math.floor(seconds / (24 * 60 * 60));
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);
  const secs = Math.floor(seconds % 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);
  
  return parts.join(' ');
}

module.exports = router;
