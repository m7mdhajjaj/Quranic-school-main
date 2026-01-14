/**
 * ============================================================================
 * Security Middleware - وسيطات الأمان
 * ============================================================================
 * 
 * يوفر حماية إضافية للتطبيق ضد:
 * - XSS attacks
 * - CSRF attacks
 * - SQL/NoSQL injection
 * - Parameter pollution
 */

/**
 * Sanitize request data to prevent NoSQL injection
 * يمنع هجمات حقن NoSQL
 */
const sanitizeNoSQL = (req, res, next) => {
  const sanitize = (obj) => {
    if (obj === null || obj === undefined) return obj;
    
    if (typeof obj === 'string') {
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    
    if (typeof obj === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        // Remove keys starting with $ (MongoDB operators)
        if (key.startsWith('$')) {
          console.log(`⚠️ Security: Blocked MongoDB operator in input: ${key}`);
          continue;
        }
        sanitized[key] = sanitize(value);
      }
      return sanitized;
    }
    
    return obj;
  };

  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);
  
  next();
};

/**
 * HTTP Parameter Pollution Protection
 * حماية من تلوث المعاملات HTTP
 */
const preventHPP = (whitelist = []) => {
  return (req, res, next) => {
    if (req.query) {
      const cleanQuery = {};
      
      for (const [key, value] of Object.entries(req.query)) {
        if (Array.isArray(value)) {
          // Allow whitelisted params to be arrays
          if (whitelist.includes(key)) {
            cleanQuery[key] = value;
          } else {
            // Take the last value for non-whitelisted params
            cleanQuery[key] = value[value.length - 1];
          }
        } else {
          cleanQuery[key] = value;
        }
      }
      
      req.query = cleanQuery;
    }
    
    next();
  };
};

/**
 * Request size limiter
 * يحد من حجم الطلب
 */
const limitRequestSize = (maxSize = '10mb') => {
  const sizes = {
    'kb': 1024,
    'mb': 1024 * 1024,
    'gb': 1024 * 1024 * 1024,
  };
  
  const parseSize = (size) => {
    if (typeof size === 'number') return size;
    const match = size.toLowerCase().match(/^(\d+)(kb|mb|gb)?$/);
    if (!match) return 10 * 1024 * 1024; // default 10MB
    return parseInt(match[1]) * (sizes[match[2]] || 1);
  };
  
  const maxBytes = parseSize(maxSize);
  
  return (req, res, next) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    
    if (contentLength > maxBytes) {
      return res.status(413).json({
        success: false,
        message: 'حجم الطلب كبير جداً',
        errorCode: 'PAYLOAD_TOO_LARGE',
        maxSize: maxSize,
      });
    }
    
    next();
  };
};

/**
 * Block suspicious user agents
 * حظر user agents مشبوهة
 */
const blockSuspiciousUA = (req, res, next) => {
  const ua = req.headers['user-agent'] || '';
  
  const suspiciousPatterns = [
    /sqlmap/i,
    /nikto/i,
    /nessus/i,
    /nmap/i,
    /masscan/i,
    /dirbuster/i,
    /gobuster/i,
    /wfuzz/i,
    /hydra/i,
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(ua)) {
      console.log(`🚫 Blocked suspicious UA: ${ua} from ${req.ip}`);
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }
  }
  
  next();
};

/**
 * Add security headers
 * إضافة headers الأمان
 */
const securityHeaders = (req, res, next) => {
  // Prevent XSS attacks
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  
  // Control referrer information
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Enable browser XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Prevent DNS prefetching
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');
  
  next();
};

/**
 * IP whitelist/blacklist
 * قائمة IP المسموحة/المحظورة
 */
const ipFilter = (options = {}) => {
  const { whitelist = [], blacklist = [], mode = 'blacklist' } = options;
  
  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    
    if (mode === 'whitelist') {
      if (!whitelist.includes(clientIP)) {
        console.log(`🚫 IP not in whitelist: ${clientIP}`);
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }
    } else {
      if (blacklist.includes(clientIP)) {
        console.log(`🚫 Blocked IP: ${clientIP}`);
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }
    }
    
    next();
  };
};

/**
 * Request ID generator
 * توليد معرف فريد للطلب
 */
const requestId = (req, res, next) => {
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  req.requestId = id;
  res.setHeader('X-Request-Id', id);
  next();
};

module.exports = {
  sanitizeNoSQL,
  preventHPP,
  limitRequestSize,
  blockSuspiciousUA,
  securityHeaders,
  ipFilter,
  requestId,
};
