/**
 * ============================================================================
 * Logging Middleware - وسيطات التسجيل
 * ============================================================================
 * 
 * يوفر:
 * - تسجيل الطلبات
 * - تتبع الأداء
 * - تسجيل الأخطاء
 */

/**
 * Request Logger
 * تسجيل تفاصيل الطلبات
 */
const requestLogger = (options = {}) => {
  const {
    logBody = false,
    logHeaders = false,
    excludePaths = ['/health', '/favicon.ico'],
    slowThreshold = 1000, // ms
  } = options;

  return (req, res, next) => {
    // Skip excluded paths
    if (excludePaths.some(path => req.path.startsWith(path))) {
      return next();
    }

    const startTime = Date.now();
    const startHrTime = process.hrtime();

    // Store original end function
    const originalEnd = res.end.bind(res);

    res.end = function (chunk, encoding) {
      const duration = Date.now() - startTime;
      const hrDuration = process.hrtime(startHrTime);
      const durationMs = hrDuration[0] * 1000 + hrDuration[1] / 1000000;

      const logData = {
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        duration: `${durationMs.toFixed(2)}ms`,
        ip: req.ip,
        userId: req.user?._id,
        userAgent: req.get('user-agent')?.substring(0, 50),
        requestId: req.requestId,
      };

      // Add body if enabled (exclude passwords)
      if (logBody && req.body) {
        const sanitizedBody = { ...req.body };
        if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
        if (sanitizedBody.newPassword) sanitizedBody.newPassword = '[REDACTED]';
        if (sanitizedBody.currentPassword) sanitizedBody.currentPassword = '[REDACTED]';
        logData.body = sanitizedBody;
      }

      // Add headers if enabled
      if (logHeaders) {
        logData.headers = {
          authorization: req.headers.authorization ? '[PRESENT]' : '[ABSENT]',
          contentType: req.headers['content-type'],
        };
      }

      // Log with appropriate level
      if (res.statusCode >= 500) {
        console.error('❌ Request Error:', JSON.stringify(logData));
      } else if (res.statusCode >= 400) {
        console.warn('⚠️ Request Warning:', JSON.stringify(logData));
      } else if (duration > slowThreshold) {
        console.warn('🐢 Slow Request:', JSON.stringify(logData));
      } else {
        console.log('📝 Request:', `${req.method} ${req.path} ${res.statusCode} - ${durationMs.toFixed(0)}ms`);
      }

      return originalEnd(chunk, encoding);
    };

    next();
  };
};

/**
 * Performance Monitor
 * مراقبة الأداء
 */
const performanceMonitor = (options = {}) => {
  const {
    slowThreshold = 1000,
    logSlowRequests = true,
    collectMetrics = false,
  } = options;

  // Simple in-memory metrics (replace with proper monitoring in production)
  const metrics = {
    totalRequests: 0,
    slowRequests: 0,
    errorRequests: 0,
    avgResponseTime: 0,
    totalResponseTime: 0,
  };

  return (req, res, next) => {
    const startTime = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - startTime;

      if (collectMetrics) {
        metrics.totalRequests++;
        metrics.totalResponseTime += duration;
        metrics.avgResponseTime = metrics.totalResponseTime / metrics.totalRequests;

        if (duration > slowThreshold) {
          metrics.slowRequests++;
        }

        if (res.statusCode >= 500) {
          metrics.errorRequests++;
        }
      }

      if (logSlowRequests && duration > slowThreshold) {
        console.warn(`🐢 Slow Request: ${req.method} ${req.path} took ${duration}ms`);
      }
    });

    // Attach metrics getter to request for debugging
    req.getMetrics = () => ({ ...metrics });

    next();
  };
};

/**
 * Get current metrics
 */
const getMetrics = () => {
  return {
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    cpuUsage: process.cpuUsage(),
  };
};

/**
 * Correlation ID middleware
 * ربط الطلبات ببعضها
 */
const correlationId = (req, res, next) => {
  const correlationHeader = 'x-correlation-id';
  let id = req.headers[correlationHeader];

  if (!id) {
    id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  req.correlationId = id;
  res.setHeader('X-Correlation-Id', id);

  next();
};

module.exports = {
  requestLogger,
  performanceMonitor,
  getMetrics,
  correlationId,
};
