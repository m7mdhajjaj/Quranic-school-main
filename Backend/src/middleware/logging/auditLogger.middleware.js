/**
 * ============================================================================
 * Audit Logger Middleware - تسجيل العمليات الحساسة
 * ============================================================================
 * 
 * يسجل جميع العمليات الحساسة (create/update/delete) في ملف منفصل
 * يحفظ: المستخدم، العملية، البيانات، التاريخ والوقت
 */

const fs = require('fs');
const path = require('path');

// إنشاء مجلد logs إذا لم يكن موجوداً
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * كتابة log في ملف
 * @param {string} logEntry - محتوى الـ log
 */
const writeLogToFile = (logEntry) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const logFile = path.join(logsDir, `audit-${today}.log`);
    
    fs.appendFileSync(logFile, logEntry + '\n', 'utf8');
  } catch (error) {
    console.error('❌ Error writing audit log:', error);
  }
};

/**
 * Audit Logger Middleware
 * يسجل العمليات الحساسة
 * 
 * @param {Object} options - خيارات التسجيل
 * @returns {Function} Express middleware
 */
const auditLogger = (options = {}) => {
  const {
    logCreate = true,
    logUpdate = true,
    logDelete = true,
    logBody = true,
    excludeFields = ['password', 'newPassword', 'currentPassword', 'token'],
  } = options;

  return (req, res, next) => {
    // تحديد إذا كانت العملية تحتاج تسجيل
    const method = req.method;
    const shouldLog = 
      (method === 'POST' && logCreate) ||
      (method === 'PUT' && logUpdate) ||
      (method === 'PATCH' && logUpdate) ||
      (method === 'DELETE' && logDelete);

    if (!shouldLog) {
      return next();
    }

    // Store original json function
    const originalJson = res.json.bind(res);

    res.json = function (data) {
      // تسجيل العملية فقط إذا كانت ناجحة
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const logEntry = {
          timestamp: new Date().toISOString(),
          method: req.method,
          path: req.originalUrl,
          userId: req.user?._id?.toString(),
          userName: req.user?.name || req.user?.username,
          userRole: req.user?.role,
          ip: req.ip,
          userAgent: req.get('user-agent')?.substring(0, 100),
          statusCode: res.statusCode,
        };

        // إضافة البيانات المرسلة
        if (logBody && req.body && Object.keys(req.body).length > 0) {
          const sanitizedBody = { ...req.body };
          
          // حذف الحقول الحساسة
          excludeFields.forEach(field => {
            if (sanitizedBody[field]) {
              sanitizedBody[field] = '[REDACTED]';
            }
          });
          
          logEntry.requestBody = sanitizedBody;
        }

        // إضافة params إذا موجودة
        if (req.params && Object.keys(req.params).length > 0) {
          logEntry.params = req.params;
        }

        // كتابة الـ log
        const logString = JSON.stringify(logEntry);
        writeLogToFile(logString);
        
        // طباعة في console أيضاً
        console.log('📋 Audit Log:', {
          method: req.method,
          path: req.path,
          user: req.user?.name || req.user?.username,
          role: req.user?.role,
        });
      }

      return originalJson(data);
    };

    next();
  };
};

/**
 * قراءة logs من ملف معين
 * @param {string} date - التاريخ بصيغة YYYY-MM-DD
 * @returns {Array} مصفوفة من الـ logs
 */
const readAuditLogs = (date) => {
  try {
    const logFile = path.join(logsDir, `audit-${date}.log`);
    
    if (!fs.existsSync(logFile)) {
      return [];
    }
    
    const content = fs.readFileSync(logFile, 'utf8');
    const lines = content.trim().split('\n');
    
    return lines.map(line => {
      try {
        return JSON.parse(line);
      } catch (e) {
        return null;
      }
    }).filter(Boolean);
  } catch (error) {
    console.error('❌ Error reading audit logs:', error);
    return [];
  }
};

/**
 * حذف logs أقدم من عدد أيام محدد
 * @param {number} days - عدد الأيام
 */
const cleanOldLogs = (days = 30) => {
  try {
    const files = fs.readdirSync(logsDir);
    const now = Date.now();
    const maxAge = days * 24 * 60 * 60 * 1000; // تحويل لـ milliseconds
    
    files.forEach(file => {
      const filePath = path.join(logsDir, file);
      const stats = fs.statSync(filePath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Deleted old audit log: ${file}`);
      }
    });
  } catch (error) {
    console.error('❌ Error cleaning old logs:', error);
  }
};

module.exports = {
  auditLogger,
  readAuditLogs,
  cleanOldLogs,
};
