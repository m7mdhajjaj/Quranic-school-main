# Middleware Documentation
# توثيق الوسيطات

## 📁 هيكل الفولدر

```
middleware/
├── index.js                 # نقطة التصدير المركزية
├── auth/                    # المصادقة والصلاحيات
│   ├── index.js
│   ├── protect.middleware.js
│   └── role.middleware.js
├── cache/                   # التخزين المؤقت (Redis)
│   ├── index.js
│   ├── cache.middleware.js
│   └── cacheKeys.js
├── errorHandler/            # معالجة الأخطاء
│   ├── index.js
│   └── errorHandler.middleware.js
├── logging/                 # التسجيل والمراقبة
│   ├── index.js
│   └── logging.middleware.js
├── rateLimiter/             # محدد معدل الطلبات
│   ├── index.js
│   └── rateLimiter.middleware.js
├── security/                # وسيطات الأمان
│   ├── index.js
│   └── security.middleware.js
└── validation/              # التحقق من صحة البيانات
    ├── index.js
    └── validate.middleware.js
```

---

## 🔐 Auth Middleware

### الاستخدام الأساسي

```javascript
const { protect, adminProtect, teacherProtect } = require('./middleware');

// حماية route للمستخدمين المسجلين
router.get('/profile', protect, getProfile);

// للمديرين فقط
router.post('/users', adminProtect, createUser);

// للمعلمين والمديرين
router.get('/students', teacherProtect, getStudents);

// للسكرتير والمديرين
router.get('/reports', secretaryOrAdminProtect, getReports);

// للموظفين (معلم، سكرتير، مدير)
router.get('/dashboard', staffProtect, getDashboard);
```

---

## 💾 Cache Middleware (Redis)

### إعداد Redis

في ملف `.env`:
```env
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_password
```

### الاستخدام

```javascript
const { cacheResponse, invalidateCache, CACHE_TTL, CACHE_KEYS } = require('./middleware');

// تخزين مؤقت بسيط (5 دقائق افتراضياً)
router.get('/students', cacheResponse(), getStudents);

// مع TTL مخصص
router.get('/rankings', cacheResponse({ ttl: CACHE_TTL.SHORT }), getRankings);

// مع key generator مخصص
router.get('/students/:id', cacheResponse({ 
  keyGenerator: (req) => CACHE_KEYS.STUDENTS.BY_ID(req.params.id)
}), getStudent);

// إبطال Cache عند التعديل
router.post('/students', invalidateCache([CACHE_KEYS.STUDENTS.PATTERN]), createStudent);
```

### مفاتيح Cache المتاحة

```javascript
CACHE_KEYS.STUDENTS.ALL          // 'students:all'
CACHE_KEYS.STUDENTS.BY_ID(id)    // 'students:123'
CACHE_KEYS.RANKINGS.GLOBAL       // 'rankings:global'
CACHE_KEYS.NEWS.LATEST           // 'news:latest'
```

### مدد التخزين

```javascript
CACHE_TTL.SHORT      // 60 ثانية
CACHE_TTL.DEFAULT    // 300 ثانية (5 دقائق)
CACHE_TTL.MEDIUM     // 900 ثانية (15 دقيقة)
CACHE_TTL.LONG       // 1800 ثانية (30 دقيقة)
CACHE_TTL.HOUR       // 3600 ثانية
CACHE_TTL.DAY        // 86400 ثانية
```

---

## ⏱️ Rate Limiter

### المحددات المتاحة

```javascript
const { 
  authLimiter,           // 10 محاولات / 15 دقيقة (تسجيل الدخول)
  messageLimiter,        // 100 رسالة / دقيقة
  apiLimiter,            // 1000 طلب / 15 دقيقة
  uploadLimiter,         // 50 رفع / ساعة
  passwordResetLimiter,  // 5 محاولات / ساعة
  aiLimiter,             // 10 طلبات / دقيقة
  strictLimiter,         // 10 طلبات / ساعة
} = require('./middleware');

router.post('/login', authLimiter, login);
router.post('/messages', messageLimiter, sendMessage);
```

### إنشاء محدد مخصص

```javascript
const { createRateLimiter } = require('./middleware');

const customLimiter = createRateLimiter({
  windowMs: 60 * 1000,    // 1 دقيقة
  max: 20,                // 20 طلب
  keyPrefix: 'custom',
  message: 'رسالة خطأ مخصصة',
});
```

---

## ✅ Validation Middleware

### الاستخدام مع Zod

```javascript
const { z } = require('zod');
const { validate, validateMultiple, requireFields } = require('./middleware');

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
});

router.post('/users', validate(createUserSchema), createUser);

// التحقق من params و body معاً
router.put('/users/:id', validateMultiple({
  params: z.object({ id: z.string() }),
  body: updateUserSchema,
}), updateUser);

// التحقق من الحقول المطلوبة
router.post('/contact', requireFields(['name', 'email', 'message']), sendContact);
```

---

## ❌ Error Handling

### الاستخدام

```javascript
const { 
  asyncHandler, 
  AppError, 
  NotFoundError,
  ValidationError,
} = require('./middleware');

// التفاف async functions
router.get('/users', asyncHandler(async (req, res) => {
  const users = await User.find();
  res.json({ success: true, data: users });
}));

// رمي أخطاء مخصصة
router.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new NotFoundError('المستخدم غير موجود');
  }
  res.json({ success: true, data: user });
}));
```

### أنواع الأخطاء

| الخطأ | الكود | الاستخدام |
|-------|-------|----------|
| `AppError` | 500 | أخطاء عامة |
| `ValidationError` | 400 | أخطاء التحقق |
| `UnauthorizedError` | 401 | غير مصرح |
| `ForbiddenError` | 403 | ممنوع |
| `NotFoundError` | 404 | غير موجود |
| `ConflictError` | 409 | تعارض |
| `RateLimitError` | 429 | تجاوز الحد |

---

## 🛡️ Security Middleware

```javascript
const { 
  sanitizeNoSQL,      // منع NoSQL injection
  preventHPP,         // منع HTTP Parameter Pollution
  securityHeaders,    // إضافة security headers
  requestId,          // إضافة request ID
  blockSuspiciousUA,  // حظر user agents مشبوهة
} = require('./middleware');

// في app.js
app.use(requestId);
app.use(securityHeaders);
app.use(sanitizeNoSQL);
app.use(preventHPP(['sort', 'filter'])); // whitelist arrays
```

---

## 📝 Logging Middleware

```javascript
const { 
  requestLogger, 
  performanceMonitor,
  correlationId,
} = require('./middleware');

// تسجيل الطلبات
app.use(requestLogger({
  logBody: process.env.NODE_ENV === 'development',
  slowThreshold: 1000,
}));

// مراقبة الأداء
app.use(performanceMonitor({
  slowThreshold: 1000,
  collectMetrics: true,
}));
```

---

## 🚀 الاستخدام في app.js

```javascript
const express = require('express');
const {
  // Security
  requestId,
  securityHeaders,
  sanitizeNoSQL,
  preventHPP,
  
  // Logging
  requestLogger,
  
  // Rate Limiting
  apiLimiter,
  
  // Error Handling
  globalErrorHandler,
  notFound,
} = require('./middleware');

const app = express();

// ============ Security Middleware ============
app.use(requestId);
app.use(securityHeaders);
app.use(sanitizeNoSQL);
app.use(preventHPP());

// ============ Logging ============
app.use(requestLogger());

// ============ Rate Limiting ============
app.use('/api', apiLimiter);

// ============ Routes ============
app.use('/api/students', require('./routes/studentRoutes'));
// ... other routes

// ============ Error Handling ============
app.use(notFound);
app.use(globalErrorHandler);
```

---

## 📦 الاستيراد الموحد

```javascript
// استيراد كل شيء
const middleware = require('./middleware');

// استيراد مجموعات
const { auth, cache, rateLimiter, security } = require('./middleware');

// استيراد فردي
const { protect, cacheResponse, validate } = require('./middleware');
```
