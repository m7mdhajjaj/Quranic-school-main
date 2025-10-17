# 🏆 نظام المنافسة الشهرية - دليل شامل

## 📋 نظرة عامة

تم تحديث نظام لعبة النقاط ليصبح **منافسة شهرية** تبدأ في اليوم الأول من كل شهر ميلادي وتنتهي في آخر يوم، مع تتويج **بطل الشهر** تلقائياً.

---

## 🎮 كيف يعمل النظام؟

### 1️⃣ **النقاط اليومية** (DailyPoints)

```
- يسجل الطالب نشاطاته كل يوم
- النقاط تُحسب تلقائياً
- تُحفظ في قاعدة البيانات
```

### 2️⃣ **النقاط الشهرية** (MonthlyPoints)

```javascript
// يتم التحديث التلقائي عند حفظ النقاط اليومية
{
  studentId: "670d1234...",
  month: 1,        // يناير
  year: 2025,
  totalPoints: 2450,  // مجموع الشهر
  activeDays: 25,     // عدد الأيام النشطة
  group: "حلقة الفجر",
  teacher: "670d5678..."
}
```

**المميزات:**

- ✅ تحديث تلقائي
- ✅ مجموع دقيق للنقاط
- ✅ عزل بين الحلقات
- ✅ ترتيب سريع

### 3️⃣ **أبطال الشهر** (MonthlyChampion)

```javascript
// يُنشأ تلقائياً في بداية كل شهر جديد
{
  studentId: "670d1234...",
  studentName: "محمد أحمد",
  month: 12,       // ديسمبر
  year: 2024,
  monthName: "ديسمبر",
  totalPoints: 2800,
  group: "حلقة الفجر",
  rank: 1,         // المركز الأول
  badgeData: {
    icon: "👑",
    description: "بطل ديسمبر 2024 - 2800 نقطة",
    awardedAt: "2025-01-01T00:01:00.000Z"
  }
}
```

### 4️⃣ **شارة البطل** (StudentBadge)

```javascript
// تُمنح تلقائياً للبطل
{
  badgeId: "champion_2024_ديسمبر",
  name: "👑 بطل ديسمبر",
  icon: "👑",
  description: "حصل على المركز الأول في منافسة ديسمبر 2024",
  requirement: "2800 نقطة",
  count: 1,
  firstEarnedAt: "2025-01-01T00:01:00.000Z"
}
```

---

## 📅 **الجدول الزمني**

### **خلال الشهر (1-30/31):**

```
1. الطالب يسجل نشاطاته يومياً
2. النقاط تتراكم في MonthlyPoints
3. الترتيب يتحدث مباشرة
4. المنافسة مستمرة!
```

### **منتصف الليل - آخر يوم في الشهر:**

```
23:59:59 → انتهاء الشهر
00:00:00 → بداية شهر جديد
```

### **الساعة 00:01 - أول يوم من الشهر الجديد:**

```
✅ Cron Job يعمل تلقائياً
✅ جلب أفضل طالب في كل حلقة
✅ حفظ البطل في MonthlyChampion
✅ منح شارة البطل في StudentBadge
✅ النقاط تبدأ من صفر
```

---

## 🔄 **دورة حياة المنافسة**

### **مثال: شهر يناير 2025**

#### **1 يناير - الساعة 00:01:**

```javascript
// Cron Job يتويج أبطال ديسمبر 2024
POST /api/points-game/crown-champions
→ يحفظ البطل في MonthlyChampion
→ يمنح الشارة في StudentBadge
→ النقاط الشهرية تبدأ من صفر تلقائياً
```

#### **1-31 يناير:**

```javascript
// كل يوم:
POST /api/points-game/daily
→ حفظ النقاط اليومية
→ تحديث MonthlyPoints تلقائياً
→ الترتيب يتحدث مباشرة

// عرض الترتيب:
GET /api/points-game/rankings/points
→ يعرض ترتيب يناير 2025 فقط
```

#### **1 فبراير - الساعة 00:01:**

```javascript
// Cron Job يتويج أبطال يناير 2025
→ بطل يناير يُحفظ
→ النقاط تتصفر
→ فبراير يبدأ من صفر
```

---

## 🛠️ **API Endpoints الجديدة**

### **1. تتويج الأبطال (Admin/Cron)**

```http
POST /api/points-game/crown-champions
Authorization: Bearer <ADMIN_TOKEN>
```

**الاستجابة:**

```json
{
  "success": true,
  "message": "تم تتويج 5 بطل لشهر ديسمبر 2024",
  "data": [
    {
      "studentName": "محمد أحمد",
      "monthName": "ديسمبر",
      "year": 2024,
      "totalPoints": 2800,
      "group": "حلقة الفجر"
    }
  ]
}
```

---

### **2. جلب أبطال الأشهر السابقة**

```http
GET /api/points-game/champions
Authorization: Bearer <STUDENT_TOKEN>
```

**الاستجابة:**

```json
{
  "success": true,
  "data": [
    {
      "studentName": "محمد أحمد",
      "month": 12,
      "year": 2024,
      "monthName": "ديسمبر",
      "totalPoints": 2800,
      "rank": 1,
      "badgeData": {
        "icon": "👑",
        "description": "بطل ديسمبر 2024 - 2800 نقطة"
      }
    },
    {
      "studentName": "عبدالله سعيد",
      "month": 11,
      "year": 2024,
      "monthName": "نوفمبر",
      "totalPoints": 2650,
      "rank": 1
    }
  ]
}
```

---

### **3. الترتيب الشهري (محدّث)**

```http
GET /api/points-game/rankings/points
Authorization: Bearer <STUDENT_TOKEN>
```

**الاستجابة:**

```json
{
  "success": true,
  "month": "يناير",
  "year": 2025,
  "data": [
    {
      "rank": 1,
      "studentId": "670d1234...",
      "name": "محمد أحمد",
      "points": 850,
      "activeDays": 17,
      "badgesCount": 5,
      "totalBadgeRepeats": 12
    }
  ]
}
```

---

## ⚙️ **إعدادات Cron Job**

### **في `MonthlyChampionService.js`:**

```javascript
// يعمل في 00:01 من أول يوم كل شهر
cron.schedule(
  "1 0 1 * *",
  async () => {
    await crownChampions();
  },
  {
    timezone: "Asia/Riyadh", // توقيت السعودية
  }
);
```

### **التوقيت:**

- **Cron Expression**: `1 0 1 * *`
- **المعنى**: دقيقة 1، ساعة 0، يوم 1، كل شهر، كل يوم من الأسبوع
- **المنطقة الزمنية**: Asia/Riyadh (UTC+3)

---

## 🧪 **اختبار النظام**

### **1. اختبار Cron Job يدوياً:**

```bash
# في Terminal
node -e "
const service = require('./src/services/MonthlyChampionService');
service.testCrownChampions();
"
```

### **2. اختبار عبر API:**

```bash
# استدعاء API مباشرة (يحتاج توكن أدمن)
curl -X POST http://localhost:5005/api/points-game/crown-champions \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json"
```

### **3. اختبار في Postman:**

```
POST http://localhost:5005/api/points-game/crown-champions
Headers:
  Authorization: Bearer <ADMIN_TOKEN>
  Content-Type: application/json
```

---

## 📊 **قاعدة البيانات**

### **Collections الجديدة:**

1. **monthlypoints** - النقاط الشهرية

   - Indexes:
     - `{ studentId: 1, year: 1, month: 1 }` (unique)
     - `{ year: 1, month: 1, group: 1 }`
     - `{ teacher: 1, group: 1, year: 1, month: 1 }`

2. **monthlychampions** - أبطال الأشهر
   - Indexes:
     - `{ year: 1, month: 1, group: 1 }`
     - `{ studentId: 1, year: 1, month: 1 }` (unique)
     - `{ teacher: 1, group: 1, year: 1, month: 1 }`

---

## 🎯 **المميزات**

### ✅ **تصفير تلقائي:**

- النقاط تتصفر في بداية كل شهر
- لا حاجة لتدخل يدوي

### ✅ **تتويج تلقائي:**

- البطل يُتوَّج تلقائياً
- الشارة تُمنح تلقائياً

### ✅ **عدالة:**

- كل طالب يبدأ من صفر
- فرصة متساوية كل شهر

### ✅ **تحفيز:**

- منافسة شهرية مستمرة
- شارات خاصة للأبطال
- سجل دائم للإنجازات

### ✅ **أداء عالي:**

- Indexes محسّنة
- استعلامات سريعة
- لا تأثير على الأداء

---

## 🔧 **ملاحظات تقنية**

### **1. التعامل مع الشهور:**

```javascript
// الشهر الحالي
const { month, year } = getCurrentMonth();

// اسم الشهر بالعربية
const monthName = getMonthName(month);
```

### **2. فلترة الحلقات:**

```javascript
// كل استعلام يفلتر حسب:
{
  group: student.group,
  teacher: student.teacher
}
```

### **3. الشارات الفريدة:**

```javascript
// كل شهر = شارة فريدة
badgeId: `champion_${year}_${monthName}`;
```

---

## 🚀 **الخطوات التالية**

### **في الفرونت إند:**

1. ✅ إضافة صفحة "أبطال الأشهر"
2. ✅ عرض الترتيب الشهري
3. ✅ إشعار عند الفوز بالبطولة
4. ✅ لوحة شرف للأبطال

---

## ❓ **الأسئلة الشائعة**

### **س: ماذا يحدث للنقاط القديمة؟**

ج: النقاط اليومية تبقى في `DailyPoints` للأبد (للإحصائيات)، لكن فقط نقاط الشهر الحالي تظهر في الترتيب.

### **س: هل الشارات تُحذف؟**

ج: ❌ لا، الشارات دائمة (مدى الحياة).

### **س: ماذا لو لم يكن هناك أي طالب نشط في الشهر؟**

ج: لا يتم تتويج أي بطل (الشرط: totalPoints > 0).

### **س: كيف أعرف من هو البطل الحالي؟**

ج: استدعِ `GET /api/points-game/champions` - أول عنصر هو البطل الأخير.

### **س: هل يمكن إعادة تشغيل Cron Job؟**

ج: نعم، أعد تشغيل السيرفر أو استخدم `MonthlyChampionService.start()`.

---

## ✅ **الملخص**

| الميزة      | القيمة                    |
| ----------- | ------------------------- |
| **المدة**   | شهر ميلادي (1-30/31)      |
| **التصفير** | تلقائي في 00:01 من كل شهر |
| **التتويج** | تلقائي عبر Cron Job       |
| **الشارات** | دائمة (لا تُحذف)          |
| **الترتيب** | حسب الحلقة فقط            |
| **السجل**   | محفوظ للأبد               |

---

**تم بحمد الله! 🎉**

الآن النظام يعمل بشكل تلقائي كامل - المنافسة تبدأ وتنتهي تلقائياً، والبطل يُتوَّج تلقائياً! 👑
