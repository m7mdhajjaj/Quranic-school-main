# دليل حل مشاكل نظام إدارة المدرسة القرآنية

## الملخص السريع لحل المشكلة:

### 1. تشغيل اختبار قاعدة البيانات:
```
ادخل إلى مجلد Backend وشغل:
node test-connection.js
```

### 2. فحص وإنشاء admin (إذا لزم الأمر):
```
node check-admin.js
```

### 3. تشغيل Backend:
```
اضغط مرتين على: start-backend.bat
أو شغل: node src/app.js
```

### 4. تشغيل Frontend:
```
في مجلد منفصل: cd Frontend && npm run dev
```

---

## التفاصيل الكاملة:

### مشاكل محتملة وحلولها:

#### 1. خطأ 500 في تسجيل الدخول:
**السبب**: Backend غير متصل أو مشاكل في قاعدة البيانات
**الحل**:
- تأكد من تشغيل Backend على Port 5005
- اختبر: http://localhost:5005/api/auth/test
- تحقق من logs في terminal

#### 2. مشاكل الاتصال بـ MongoDB:
**السبب**: مشاكل في connection string أو network
**الحل**:
- شغل test-connection.js للتأكد
- تحقق من MONGODB_URI في .env
- تأكد من أن MongoDB Atlas يسمح بالاتصالات

#### 3. لا يوجد admin user:
**السبب**: قاعدة البيانات فارغة من المسؤولين
**الحل**:
- شغل check-admin.js لإنشاء admin تلقائياً
- استخدم: Username: admin, Password: admin123

#### 4. مشاكل في Dependencies:
**السبب**: node_modules تالفة أو مفقودة
**الحل**:
- شغل reset-backend.bat لإعادة التثبيت
- أو يدوياً: rm -rf node_modules && npm install

---

## معلومات النظام:

### Backend:
- **Port**: 5005
- **MongoDB**: Atlas Cloud Database
- **API Base**: http://localhost:5005/api
- **Test URL**: http://localhost:5005/api/auth/test

### Frontend:
- **Port**: 5173 (افتراضي لـ Vite)
- **API Config**: VITE_API_URL=http://localhost:5005

### Default Admin:
- **Username**: admin
- **Password**: admin123
- **Email**: admin@quranic-school.com

---

## أوامر مفيدة:

### اختبار النظام:
```powershell
# اختبار قاعدة البيانات
node test-connection.js

# فحص المسؤولين
node check-admin.js

# تشغيل Backend
node src/app.js
```

### إصلاح المشاكل:
```powershell
# إعادة تثبيت dependencies
reset-backend.bat

# تنظيف cache
npm cache clean --force
```

---

## خطوات التشخيص:

1. **تحقق من Backend**:
   - هل يعمل على http://localhost:5005?
   - هل يظهر "Server running on port 5005"?
   
2. **تحقق من قاعدة البيانات**:
   - هل test-connection.js يعمل بنجاح؟
   - هل تظهر collections في المحطة؟

3. **تحقق من Admin**:
   - هل يوجد admin user؟
   - هل كلمة المرور صحيحة؟

4. **تحقق من Frontend**:
   - هل VITE_API_URL صحيح؟
   - هل يصل الطلب للـ Backend؟

---

## رسائل الخطأ الشائعة:

- **"Cannot connect to MongoDB"**: مشكلة في MONGODB_URI
- **"Port 5005 is already in use"**: أوقف العمليات الأخرى على نفس المنفذ
- **"JWT_SECRET is not defined"**: تحقق من ملف .env
- **"Admin not found"**: شغل check-admin.js لإنشاء admin

---

## للدعم الفني:
- تحقق من console logs في المتصفح
- تحقق من terminal output في Backend
- استخدم /api/auth/test للاختبار السريع