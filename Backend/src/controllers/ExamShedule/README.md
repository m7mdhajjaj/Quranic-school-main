# Exam Controller - البنية المقسمة

تم تقسيم `examController.js` إلى ملفات منفصلة لسهولة التعديل والصيانة.

## 📁 هيكل الملفات

```
ExamShedule/
├── index.js              - نقطة الدخول الرئيسية (يصدر جميع الوظائف)
├── examHelpers.js        - دوال مساعدة مشتركة
├── examNotifications.js  - إدارة الإشعارات للطلاب
├── getExams.js           - جلب جميع الامتحانات
├── addExam.js            - إضافة امتحان جديد
├── updateExam.js         - تعديل امتحان موجود
└── deleteExam.js         - حذف امتحان وعلاماته
```

## 🛠️ الدوال المساعدة (examHelpers.js)

- `isTimeWithinAllowedRange(timeStr)` - التحقق من أن الوقت بين 09:00 و 19:00
- `buildDuplicateQuery(date, group)` - بناء استعلام للتحقق من التكرار

## 🔔 نظام الإشعارات (examNotifications.js)

ملف منفصل لإدارة إرسال الإشعارات للطلاب بشكل فوري:

- `notifyExamCreated(exam, io)` - إرسال إشعار عند إضافة امتحان جديد
- `notifyExamDeleted(exam, io)` - إرسال إشعار عند حذف امتحان
- `notifyExamUpdated(exam, io)` - إرسال إشعار عند تعديل امتحان

**ميزات نظام الإشعارات:**
- 🚀 **إرسال فوري (Real-time)**: باستخدام Socket.IO للإشعارات الفورية
- 📱 **إشعارات Push**: عبر Firebase Cloud Messaging (FCM)
- 💾 **حفظ دائم**: تخزين في قاعدة البيانات
- 🎯 **إرسال ذكي**: فقط للطلاب في الحلقة المحددة
- 🔄 **ثلاث طرق إرسال**:
  1. Socket.IO → إشعار فوري يظهر في NotificationHeader مباشرة
  2. Firebase → إشعار Push للهاتف حتى لو التطبيق مغلق
  3. Database → حفظ دائم يمكن الوصول إليه لاحقاً
- ⚡ **أولوية عالية**: جميع إشعارات الامتحانات لها أولوية `high`
- 🛡️ **آمن**: فشل الإشعار لا يؤثر على العملية الأساسية
- 📊 **معلومات كاملة**: (اسم الامتحان، التاريخ، الوقت، الحلقة، نوع العملية)

## 📝 الوظائف الرئيسية

### 1. getExams (GET /api/exams)
- جلب جميع الامتحانات من قاعدة البيانات
- لا يتطلب معاملات

### 2. addExam (POST /api/exams)
- إضافة امتحان جديد
- التحقق من:
  - الحقول المطلوبة (name, date, time)
  - الوقت المسموح (09:00 - 19:00)
  - عدم التكرار (نفس التاريخ ونفس الحلقة)
- إرسال حدث Socket.IO: `examCreated` (للواجهة)
- 🔔 إرسال إشعار فوري لجميع طلاب الحلقة:
  - 🚀 Socket.IO: يظهر في NotificationHeader مباشرة
  - 📱 Firebase: إشعار Push للهاتف
  - 💾 Database: حفظ دائم

### 3. updateExam (PUT /api/exams/:examId)
- تعديل امتحان موجود
- نفس التحققات كـ addExam
- إرسال حدث Socket.IO: `examUpdated` (للواجهة)
- 🔔 إرسال إشعار فوري لجميع طلاب الحلقة:
  - 🚀 Socket.IO: يظهر في NotificationHeader مباشرة
  - 📱 Firebase: إشعار Push للهاتف
  - 💾 Database: حفظ دائم

### 4. deleteExam (DELETE /api/exams/:examId)
- حذف امتحان وجميع علاماته المرتبطة
- حذف من ExamMark أيضاً
- 🔔 إرسال إشعار فوري لجميع طلاب الحلقة قبل الحذف:
  - 🚀 Socket.IO: يظهر في NotificationHeader مباشرة
  - 📱 Firebase: إشعار Push للهاتف
  - 💾 Database: حفظ دائم
- إرسال حدث Socket.IO: `examDeleted` (للواجهة)

## 🔌 Socket.IO Events

جميع العمليات ترسل أحداث Socket.IO إلى room "exams":
- `examCreated` - عند إضافة امتحان
- `examUpdated` - عند تعديل امتحان
- `examDeleted` - عند حذف امتحان

## ✅ ملاحظات

- **نظام إشعارات منفصل ومتكامل**: تم فصل منطق الإشعارات في `examNotifications.js`
- **ثلاث طرق إرسال متزامنة**:
  1. 🚀 **Socket.IO** → إشعار فوري يظهر في `NotificationHeader` مباشرة (Live)
  2. 📱 **Firebase (FCM)** → إشعار Push للهاتف حتى لو التطبيق مغلق
  3. 💾 **Database** → حفظ دائم في جدول `Notification` للوصول لاحقاً
- **Socket.IO للواجهة**: أحداث `examCreated`, `examUpdated`, `examDeleted` لتحديث صفحة الامتحانات
- **إشعارات ذكية**: فقط لطلاب الحلقة المحددة
- **أولوية عالية**: جميع إشعارات الامتحانات `priority: "high"`
- **التحقق من الوقت**: جميع الامتحانات يجب أن تكون بين 09:00 صباحاً و 07:00 مساءً
- **منع التكرار**: لا يمكن إضافة امتحانين لنفس الحلقة في نفس اليوم
- **مرونة عالية**: فشل إرسال الإشعار لا يؤثر على العملية الأساسية

## 📱 كيف يعمل نظام الإشعارات الفوري؟

### عند إضافة/تعديل/حذف امتحان:

1. **Backend** (`examNotifications.js`):
   - يجلب جميع الطلاب النشطين في الحلقة
   - يستدعي `global.notificationService.createNotification()` لكل طالب
   
2. **NotificationService** (`services/NotificationService.js`):
   - يحفظ الإشعار في قاعدة البيانات (`Notification` schema)
   - يرسل عبر Socket.IO → `io.to(studentId).emit('newNotification', data)`
   - يرسل عبر Firebase FCM → `FCMService.sendToTokens(tokens, payload)`
   
3. **Frontend** (`NotificationHeader.tsx`):
   - يستمع لحدث `newNotification` عبر Socket
   - يعرض الإشعار فوراً في القائمة المنسدلة
   - يشغل صوت التنبيه
   - يحدث العداد (+1 unread)
   - يظهر بشكل Live بدون تحديث الصفحة!

### مميزات الإشعار الفوري:

- ⚡ **سرعة فائقة**: الإشعار يصل خلال أقل من ثانية
- 🔔 **صوت تنبيه**: يشغل `/sounds/notification.mp3` تلقائياً
- 🎨 **تصميم جذاب**: إشعارات غير مقروءة بخلفية ملونة + أيقونات
- 📊 **إحصائيات دقيقة**: عداد الإشعارات يتحدث فوراً
- 💪 **موثوقية عالية**: إذا فشل Socket، يرسل عبر Firebase
- 🔄 **تحديث تلقائي**: Frontend يتحدث كل دقيقة كخطة احتياطية

## 🔧 كيفية التعديل

لتعديل أي وظيفة:
1. افتح الملف المطلوب (مثل `addExam.js`)
2. قم بالتعديلات المطلوبة
3. احفظ الملف
4. أعد تشغيل السيرفر

لا حاجة لتعديل `index.js` إلا إذا أضفت وظائف جديدة.
