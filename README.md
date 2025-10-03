# Quranic School Management System

## نظام إدارة المدرسة القرآنية

### 📋 متطلبات التشغيل

- Node.js (الإصدار 16 أو أحدث)
- npm (مدير الحزم)
- اتصال بالإنترنت (لقاعدة البيانات)

### 🚀 طرق التشغيل

#### الطريقة السريعة (الموصى بها)
انقر نقراً مزدوجاً على ملف `start-both.bat` في المجلد الرئيسي

#### التشغيل المنفصل

**تشغيل الخادم الخلفي:**
```bash
cd Backend
npm start
```
أو انقر على `Backend/start-backend.bat`

**تشغيل الواجهة الأمامية:**
```bash
cd Frontend
npm run dev
```
أو انقر على `Frontend/start-frontend.bat`

### 🌐 المنافذ المستخدمة

- **Backend (API + Socket)**: http://localhost:5005
- **Frontend (React)**: http://localhost:5173

### 🛠️ حل المشاكل الشائعة

#### خطأ `ERR_CONNECTION_REFUSED`
هذا الخطأ يعني أن الخادم الخلفي (Backend) غير شغال. الحلول:

1. **تأكد من تشغيل Backend أولاً**:
   - انقر على `Backend/start-backend.bat`
   - انتظر حتى ترى رسالة "Server running on port 5005"

2. **إذا استمر الخطأ**:
   ```bash
   cd Backend
   npm install  # إعادة تثبيت التبعيات
   npm start
   ```

3. **فحص المنفذ**:
   ```bash
   netstat -an | findstr :5005
   ```

#### خطأ في قاعدة البيانات
تأكد من اتصالك بالإنترنت، فقاعدة البيانات موجودة على MongoDB Atlas.

#### خطأ في Socket.IO
Socket.IO يحتاج Backend ليعمل. تأكد من تشغيل الخادم الخلفي أولاً.

### 📁 هيكل المشروع

```
Quranic-school-main/
├── Backend/              # الخادم الخلفي (Node.js + Express)
│   ├── src/
│   │   ├── app.js       # نقطة البداية
│   │   ├── models/      # نماذج قاعدة البيانات
│   │   ├── routes/      # مسارات API
│   │   └── controllers/ # منطق الأعمال
│   └── package.json
├── Frontend/             # الواجهة الأمامية (React + TypeScript)
│   ├── src/
│   │   ├── components/  # المكونات
│   │   ├── pages/       # الصفحات
│   │   ├── contexts/    # إدارة الحالة
│   │   └── hooks/       # React Hooks
│   └── package.json
└── start-both.bat       # تشغيل المشروع كاملاً
```

### 🔧 أوامر مفيدة

```bash
# Backend
cd Backend
npm install          # تثبيت التبعيات
npm start           # تشغيل الإنتاج
npm run dev         # تشغيل التطوير (مع nodemon)

# Frontend  
cd Frontend
npm install          # تثبيت التبعيات
npm run dev         # تشغيل التطوير
npm run build       # بناء للإنتاج
```

### 📞 الدعم الفني

في حالة واجهت مشاكل:
1. تأكد من تثبيت Node.js
2. تأكد من تشغيل Backend قبل Frontend
3. تحقق من اتصالك بالإنترنت
4. أعد تشغيل التطبيق