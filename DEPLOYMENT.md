# 🚀 Deploy على Render.com

## 📋 الـ Cron Jobs المفعلة:

### 1. **Auto Attendance Service** ✅
- **التوقيت:** كل يوم الساعة **23:59** (توقيت القدس)
- **الوظيفة:** تسجيل حضور تلقائي للطلاب اللي ما تم تسجيل حضورهم
- **الملف:** `Backend/src/services/Attendance/AttendanceService.js`

### 2. **Dashboard Attendance Service** ✅
- **التوقيت:** 
  - منتصف الليل (00:00) - تحديث قائمة الغياب
  - كل ساعة - تحديث الإحصائيات
- **الوظيفة:** تحديث Dashboard للطلاب الغائبين
- **الملف:** `Backend/src/services/DashboardService/GetStudentAbsence.js`

### 3. **Prayer Notifications** 🕌
- **التوقيت:** 
  - منتصف الليل (00:00) - حساب أوقات الصلاة اليومية
  - الساعة 20:00 - تذكير بقراءة القرآن
  - عند كل أذان
- **الملف:** `Backend/src/Notifications/Jobs/PrayerJob.js`

### 4. **Schedule Reminders** 🔔
- **التوقيت:** كل 3 ساعات
- **الوظيفة:** تذكير بمواعيد الحلقات
- **الملف:** `Backend/src/Notifications/Jobs/ScheduleReminderJob.js`

### 5. **Monthly Champions** 🏆
- **التوقيت:** أول يوم من كل شهر الساعة 00:05
- **الوظيفة:** تتويج أبطال الشهر
- **الملف:** `Backend/src/services/ChampionService/index.js`

### 6. **Warning Enforcement** ⚠️
- **التوقيت:** كل يوم الساعة 03:00
- **الوظيفة:** تنفيذ قرارات الفصل وإزالة الطلاب المفصولين
- **الملف:** `Backend/src/Notifications/Jobs/WarningJob.js`

### 7. **Token Cleanup** 🧹
- **التوقيت:** كل يوم الساعة 03:00
- **الوظيفة:** حذف FCM tokens القديمة (أكثر من 90 يوم)
- **الملف:** `Backend/src/Notifications/Jobs/TokenCleanupJob.js`

---

## 🔧 خطوات الـ Deployment:

### 1. إنشاء حساب MongoDB Atlas (مجاني):
```bash
1. اذهب إلى: https://www.mongodb.com/cloud/atlas
2. أنشئ Cluster مجاني (512MB)
3. أنشئ Database User (username + password)
4. أضف IP: 0.0.0.0/0 (Allow from anywhere)
5. احصل على Connection String:
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/quranic-school?retryWrites=true&w=majority
```

### 2. رفع المشروع على GitHub:
```bash
git add .
git commit -m "Deploy to Render with all Cron Jobs"
git push origin coco
```

### 3. Deploy على Render:
```bash
1. اذهب إلى: https://render.com
2. سجل دخول بـ GitHub
3. اختر "New +" → "Blueprint"
4. اختر repo: Quranic-school-main
5. اختر branch: coco
6. Render سيقرأ render.yaml تلقائياً
```

### 4. إضافة Environment Variables:
في Render Dashboard → Backend Service → Environment:
```
MONGO_URI = mongodb+srv://...
JWT_SECRET = (سيتم توليده تلقائياً)
```

### 5. حل مشكلة النوم (Sleep after 15 min):

**استخدم cron-job.org (مجاني):**
```bash
1. اذهب إلى: https://cron-job.org
2. أنشئ حساب
3. أضف Cron Job جديد:
   - Title: Keep Render Awake
   - URL: https://quranic-school-backend.onrender.com/api/health
   - Schedule: Every 10 minutes
   - Enabled: Yes
```

هذا سيبقي السيرفر مستيقظ ويضمن عمل الـ Cron Jobs 24/7! ✅

---

## 🧪 اختبار الـ Health Endpoint:

```bash
# بعد Deploy، اختبر:
curl https://quranic-school-backend.onrender.com/api/health

# سيرجع:
{
  "status": "ok",
  "timestamp": "2026-01-17T...",
  "uptime": {
    "seconds": 3600,
    "formatted": "1h 0m 0s"
  },
  "memory": {
    "used": "150MB",
    "total": "200MB"
  },
  "message": "السيرفر يعمل بشكل صحيح ✅"
}
```

---

## 📊 مراقبة الـ Cron Jobs:

بعد Deploy، راقب logs في Render Dashboard:
```bash
✅ "🏆 خدمة تتويج الأبطال الشهرية تم تفعيلها"
✅ "📊 خدمة Dashboard للطلاب الغائبين تم تفعيلها"
✅ "✅ خدمة الحضور التلقائي تم تفعيلها (23:59 يومياً)"
✅ "⚠️ خدمة إنفاذ قرارات الفصل تم تفعيلها"
✅ "🧹 خدمة تنظيف FCM tokens القديمة تم تفعيلها"
✅ "🕌 خدمة إشعارات الصلاة تم تفعيلها"
✅ "🔔 خدمة تذكير بالمواعيد تم تفعيلها"
```

---

## 💡 نصائح:

1. **MongoDB Atlas:** استخدم M0 (Free Tier) - 512MB كافية للبداية
2. **Render Sleep:** استخدم cron-job.org لإبقاء السيرفر مستيقظ
3. **Logs:** راقب logs في Render Dashboard للتأكد من عمل الـ Cron Jobs
4. **Timezone:** كل الـ Cron Jobs تستخدم توقيت القدس (Asia/Jerusalem)
5. **Backup:** اعمل backup للـ MongoDB كل أسبوع

---

## 🆘 حل المشاكل:

### المشكلة: Cron Jobs لا تعمل
**الحل:**
```bash
# تحقق من logs:
1. اذهب إلى Render Dashboard
2. Backend Service → Logs
3. ابحث عن "تم تفعيلها"
4. إذا لم تظهر، أعد تشغيل السيرفر
```

### المشكلة: السيرفر ينام بعد 15 دقيقة
**الحل:**
```bash
# استخدم cron-job.org:
- أضف job يستدعي /api/health كل 10 دقائق
- هذا سيبقي السيرفر مستيقظ 24/7
```

### المشكلة: MongoDB connection error
**الحل:**
```bash
# تحقق من:
1. Connection String صحيح
2. IP Whitelist: 0.0.0.0/0
3. Database User موجود وكلمة المرور صحيحة
```

---

## 📞 دعم:

إذا واجهت أي مشكلة:
1. تحقق من Render Logs
2. تحقق من MongoDB Atlas Logs
3. تحقق من cron-job.org Status

---

**جاهز للانطلاق! 🚀**
