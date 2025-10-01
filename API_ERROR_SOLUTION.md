# حل مشكلة "SyntaxError: Unexpected token '<', "<!DOCTYPE"... is not valid JSON"

## 🔍 تحليل المشكلة

هذه المشكلة تحدث عندما يتوقع الكود الأمامي (Frontend) استجابة JSON من الخادم، لكنه يحصل بدلاً من ذلك على مستند HTML - غالباً صفحة خطأ مثل 404 أو 500.

## 🧠 أسباب المشكلة

1. **عنوان API غير صحيح أو مفقود**
2. **الخادم الخلفي (Backend) متوقف أو غير مُكوَّن بشكل صحيح**
3. **خطأ في إعدادات البروكسي في Vite**
4. **الخادم الخلفي يرجع HTML بدلاً من JSON**

## ✅ الحلول المُطبقة

### 1. إضافة البروكسي في vite.config.ts

```typescript
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:5005',
      changeOrigin: true,
      secure: false,
    }
  }
}
```

### 2. إنشاء ملف .env للفرونت اند

```env
VITE_API_URL=http://localhost:5005
```

### 3. تحسين معالجة الأخطاء في AdminDashboard

```typescript
const fetchWithErrorHandling = async (url: string) => {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status} for ${url}`);
  }
  
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error(`Expected JSON but received ${contentType} for ${url}`);
  }
  
  return await response.json();
};
```

## 🚀 خطوات التشغيل

### 1. تشغيل الباك اند

```bash
cd Backend
npm run dev
```

الباك اند سيعمل على المنفذ: `http://localhost:5005`

### 2. تشغيل الفرونت اند

```bash
cd Frontend  
npm run dev
```

الفرونت اند سيعمل على المنفذ: `http://localhost:5173`

## 🔧 اختبار الحلول

### 1. اختبار نقاط النهاية مباشرة

افتح المتصفح وجرب:
- `http://localhost:5005/api/students`
- `http://localhost:5005/api/teachers`
- `http://localhost:5005/api/exams`

### 2. اختبار البروكسي

بعد تشغيل الفرونت اند، جرب:
- `http://localhost:5173/api/students`

## 📋 نقاط النهاية المتوفرة في الباك اند

```javascript
app.use("/api/students", require("./routes/studentRoutes"));
app.use("/api/teachers", require("./routes/teacherRoutes"));
app.use("/api/admins", require("./routes/adminRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/news", require("./routes/newsRoutes"));
app.use("/api/activities", require("./routes/activityRoutes"));
app.use("/api/rankings", require("./routes/rankingRoutes"));
app.use("/api/sections", require("./routes/sectionRoutes"));
app.use("/api/marks", require("./routes/markRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/settings", require("./routes/settingsRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/exams", require("./routes/examRoutes"));
app.use("/api/exam-marks", require("./routes/examMarkRoutes"));
```

## 🛠️ نصائح إضافية

### 1. إضافة معالجة أخطاء شاملة

```typescript
try {
  const res = await fetch('/api/statistics');
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  const data = await res.json();
} catch (err) {
  console.error('Error fetching statistics:', err);
}
```

### 2. فحص نوع المحتوى

```typescript
const contentType = response.headers.get('content-type');
if (!contentType?.includes('application/json')) {
  throw new Error('Response is not JSON');
}
```

### 3. استخدام مكتبة axios بدلاً من fetch

```typescript
import api from '../api'; // يستخدم axios مع baseURL مُكوَّن مسبقاً

const studentsData = await api.get('/students');
```

## 🔍 استكشاف الأخطاء

إذا استمرت المشكلة:

1. **تأكد من تشغيل الباك اند**: `npm run dev` في مجلد Backend
2. **فحص Console للأخطاء**: افتح F12 وتحقق من تبويب Console
3. **فحص Network tab**: تحقق من الطلبات المرسلة والاستجابات
4. **تأكد من الـ Bearer Token**: تحقق من وجود التوكن في localStorage

## 📝 ملاحظات مهمة

- تم إعداد البروكسي فقط للتطوير (Development)
- في الإنتاج، يجب تكوين الخادم بشكل صحيح
- تأكد من تطابق المنافذ في الإعدادات
- الباك اند يعمل على منفذ 5005 والفرونت اند على 5173