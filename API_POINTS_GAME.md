# API Documentation - لعبة النقاط والشارات

## Base URL

```
http://localhost:3000/api/points-game
```

---

## 🔐 Authentication

جميع الـ endpoints تحتاج إلى Authorization header:

```
Authorization: Bearer <token>
```

---

## 📋 Endpoints

### 1. حفظ النقاط اليومية

**POST** `/daily`

**Description:** حفظ أو تحديث النقاط اليومية للطالب مع التحقق من الشارات تلقائياً

**Request Body:**

```json
{
  "prayers": {
    "fajr": "mosque",
    "dhuhr": "home",
    "asr": "mosque",
    "maghrib": "mosque",
    "isha": "late"
  },
  "nawafel": {
    "duha": true,
    "qiyamAlayl": false,
    "rawatib": true,
    "witr": true
  },
  "parentRespect": 10,
  "schoolAttendance": true,
  "dailyStudy": 2,
  "adhkar": {
    "morning": true,
    "evening": true,
    "sleep": false,
    "afterPrayer": true
  },
  "halaqah": {
    "memorizedMinutes": 30,
    "reviewedMinutes": 20
  },
  "date": "2025-10-17" // اختياري - افتراضياً اليوم الحالي
}
```

**Response:**

```json
{
  "success": true,
  "message": "تم حفظ النقاط بنجاح",
  "data": {
    "_id": "...",
    "studentId": "...",
    "date": "2025-10-17T00:00:00.000Z",
    "prayers": { ... },
    "nawafel": { ... },
    "parentRespect": 10,
    "schoolAttendance": true,
    "dailyStudy": 2,
    "adhkar": { ... },
    "halaqah": { ... },
    "totalPoints": 87,
    "group": "حلقة الفجر",
    "teacher": "أحمد محمد",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### 2. الحصول على النقاط اليومية

**GET** `/daily/:date?`

**Description:** جلب النقاط اليومية للطالب (اليوم الحالي أو تاريخ محدد)

**Parameters:**

- `date` (optional): التاريخ بصيغة YYYY-MM-DD، افتراضياً اليوم الحالي

**Examples:**

```bash
GET /api/points-game/daily
GET /api/points-game/daily/2025-10-17
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "studentId": "...",
    "date": "2025-10-17T00:00:00.000Z",
    "prayers": { ... },
    "totalPoints": 87,
    ...
  }
}
```

**Response (No Data):**

```json
{
  "success": true,
  "message": "لا توجد نقاط لهذا اليوم",
  "data": null
}
```

---

### 3. الحصول على شارات الطالب

**GET** `/badges`

**Description:** جلب جميع الشارات المكتسبة والتقدم نحو الشارات غير المكتسبة

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "studentId": "...",
    "badgeProgress": {
      "mosquePrayerStreak": 15,
      "adhkarStreak": 5,
      "parentRespectPerfect": 3,
      "schoolAttendanceStreak": 20,
      "overallStreak": 10,
      "sunanStreak": 6,
      "mosqueTwoPrayersWeek": 4
    },
    "earnedBadges": [
      {
        "badgeId": "adhkar_7_days",
        "name": "نجم الأذكار",
        "icon": "⭐",
        "description": "قرأ الأذكار 7 أيام متتالية",
        "requirement": "7 أيام متتالية",
        "count": 1,
        "firstEarnedAt": "2025-10-10T00:00:00.000Z",
        "lastEarnedAt": "2025-10-10T00:00:00.000Z"
      }
    ],
    "totalBadgeRepeats": 1,
    "group": "حلقة الفجر",
    "teacher": "أحمد محمد",
    "lastUpdated": "2025-10-17T12:00:00.000Z"
  }
}
```

**Response (No Badges Yet):**

```json
{
  "success": true,
  "data": {
    "badgeProgress": {
      "mosquePrayerStreak": 0,
      "adhkarStreak": 0,
      "parentRespectPerfect": 0,
      "schoolAttendanceStreak": 0,
      "overallStreak": 0,
      "sunanStreak": 0,
      "mosqueTwoPrayersWeek": 0
    },
    "earnedBadges": [],
    "totalBadgeRepeats": 0
  }
}
```

---

### 4. ترتيب الطلاب حسب النقاط

**GET** `/rankings/points`

**Description:** ترتيب طلاب **نفس الحلقة فقط** حسب مجموع النقاط في الشهر الحالي

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "studentId": "...",
      "name": "محمد أحمد",
      "points": 985,
      "badgesCount": 5,
      "totalBadgeRepeats": 12,
      "rank": 1
    },
    {
      "studentId": "...",
      "name": "عبدالله سعيد",
      "points": 920,
      "badgesCount": 4,
      "totalBadgeRepeats": 10,
      "rank": 2
    },
    ...
  ]
}
```

**Notes:**

- يعرض فقط الطلاب في **نفس الحلقة ونفس المعلم**
- مرتب من الأعلى للأدنى حسب النقاط
- النقاط محسوبة من بداية الشهر الحالي

---

### 5. ترتيب الطلاب حسب الشارات

**GET** `/rankings/badges`

**Description:** ترتيب طلاب **نفس الحلقة فقط** حسب مجموع تكرارات الشارات

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "studentId": "...",
      "name": "محمد أحمد",
      "badgesCount": 5,
      "totalBadgeRepeats": 12,
      "points": 985,
      "rank": 1
    },
    {
      "studentId": "...",
      "name": "عبدالله سعيد",
      "badgesCount": 4,
      "totalBadgeRepeats": 10,
      "points": 920,
      "rank": 2
    },
    ...
  ]
}
```

**Notes:**

- يعرض فقط الطلاب في **نفس الحلقة ونفس المعلم**
- مرتب من الأعلى للأدنى حسب `totalBadgeRepeats`
- في حالة التساوي، الترتيب حسب `badgesCount`

---

### 6. إحصائيات الطالب

**GET** `/stats`

**Description:** جلب إحصائيات سريعة للطالب (أسبوعي، شهري، ترتيب)

**Response:**

```json
{
  "success": true,
  "data": {
    "weeklyPoints": 250,
    "monthlyPoints": 980,
    "currentRank": 5
  }
}
```

---

## 🗂️ Database Schemas

### DailyPoints Schema

```javascript
{
  studentId: ObjectId,
  date: Date,
  prayers: {
    fajr: String, // "mosque" | "home" | "late" | "missed"
    dhuhr: String,
    asr: String,
    maghrib: String,
    isha: String
  },
  nawafel: {
    duha: Boolean,
    qiyamAlayl: Boolean,
    rawatib: Boolean,
    witr: Boolean
  },
  parentRespect: Number, // 0-10
  schoolAttendance: Boolean,
  dailyStudy: Number, // ساعات
  adhkar: {
    morning: Boolean,
    evening: Boolean,
    sleep: Boolean,
    afterPrayer: Boolean
  },
  halaqah: {
    memorizedMinutes: Number,
    reviewedMinutes: Number
  },
  totalPoints: Number, // محسوب تلقائياً
  group: String,
  teacher: String,
  timestamps: true
}
```

### StudentBadge Schema

```javascript
{
  studentId: ObjectId,
  badgeProgress: {
    mosquePrayerStreak: Number,
    adhkarStreak: Number,
    parentRespectPerfect: Number,
    schoolAttendanceStreak: Number,
    overallStreak: Number,
    sunanStreak: Number,
    mosqueTwoPrayersWeek: Number
  },
  earnedBadges: [{
    badgeId: String,
    name: String,
    icon: String,
    description: String,
    requirement: String,
    count: Number,
    firstEarnedAt: Date,
    lastEarnedAt: Date
  }],
  totalBadgeRepeats: Number, // محسوب تلقائياً
  group: String,
  teacher: String,
  lastUpdated: Date,
  timestamps: true
}
```

---

## 🔢 Point Calculation

### حساب النقاط:

```javascript
// الصلوات
mosque: 12 نقطة
home: 5 نقاط
late: 2 نقطة
missed: 0 نقطة

// النوافل
duha: 5 نقاط
qiyamAlayl: 10 نقاط
rawatib: 5 نقاط
witr: 5 نقاط

// بر الوالدين
0-10 نقطة (حسب التقييم)

// المدرسة
schoolAttendance: 5 نقاط

// الدراسة
كل ساعة = 2 نقطة

// الأذكار
morning: 5 نقاط
evening: 5 نقاط
sleep: 3 نقاط
afterPrayer: 5 نقاط

// الحلقة
كل 10 دقائق حفظ = 1 نقطة
كل 10 دقائق مراجعة = 1 نقطة
```

---

## 🏆 Badge Requirements

| الشارة               | المعرف                   | الشرط                                    |
| -------------------- | ------------------------ | ---------------------------------------- |
| 🕌 المصلي المجتهد    | `mosque_30_days`         | 30 يوم متتالي في المسجد (كل الصلوات)     |
| ⭐ نجم الأذكار       | `adhkar_7_days`          | 7 أيام متتالية (كل الأذكار)              |
| ❤️ بار بوالديه       | `parent_respect_5_times` | 5 مرات 10/10 في بر الوالدين              |
| 🎒 الطالب المنضبط    | `school_30_days`         | 30 يوم حضور متواصل                       |
| 🔥 سلسلة الإنجاز     | `overall_15_days`        | 15 يوم إنجاز شامل متواصل                 |
| 🌙 المحافظ على السنن | `sunan_keeper`           | 7 أيام متتالية (كل النوافل)              |
| 💫 المصلي النشيط     | `mosque_two_week`        | 7 أيام متتالية (صلاتين يومياً على الأقل) |
| 👑 البطل الشامل      | `all_badges`             | الحصول على جميع الشارات السابقة          |

---

## ⚠️ Important Notes

### 1. الترتيب حسب الحلقة

- كل طالب يتنافس **فقط مع طلاب نفس الحلقة**
- الطلاب من حلقات أخرى (حتى لو نفس المعلم) **لا يظهرون** في الترتيب
- يتم الفلترة حسب: `group` و `teacher`

### 2. حساب النقاط الشهرية

- يتم حساب النقاط من **بداية الشهر الحالي**
- يتم إعادة الحساب كل شهر تلقائياً

### 3. الشارات مدى الحياة

- الشارات **لا تُحذف** أبداً
- `count` يزيد مع كل تكرار للإنجاز
- `totalBadgeRepeats` = مجموع كل `count` للشارات المكتسبة

### 4. السلاسل المتتالية

- إذا انقطع الطالب عن النشاط، السلسلة تبدأ من **صفر**
- مثال: إذا صلى 25 يوم في المسجد ثم فاته يوم، `mosquePrayerStreak = 0`

### 5. التحديث التلقائي

- عند حفظ النقاط اليومية، يتم:
  - حساب النقاط تلقائياً (`pre-save` hook)
  - تحديث التقدم نحو الشارات
  - التحقق من الشارات الجديدة ومنحها تلقائياً
  - زيادة `count` للشارات المتكررة

---

## 🧪 Testing Examples

### Example 1: حفظ نقاط كاملة

```bash
curl -X POST http://localhost:3000/api/points-game/daily \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prayers": {
      "fajr": "mosque",
      "dhuhr": "mosque",
      "asr": "mosque",
      "maghrib": "mosque",
      "isha": "mosque"
    },
    "nawafel": {
      "duha": true,
      "qiyamAlayl": true,
      "rawatib": true,
      "witr": true
    },
    "parentRespect": 10,
    "schoolAttendance": true,
    "dailyStudy": 2,
    "adhkar": {
      "morning": true,
      "evening": true,
      "sleep": true,
      "afterPrayer": true
    },
    "halaqah": {
      "memorizedMinutes": 30,
      "reviewedMinutes": 20
    }
  }'
```

**Expected Points:**

- صلوات: 12×5 = 60
- نوافل: 5+10+5+5 = 25
- بر والدين: 10
- مدرسة: 5
- دراسة: 2×2 = 4
- أذكار: 5+5+3+5 = 18
- حلقة: 3+2 = 5
  **Total: 127 نقطة** 🎉

---

## 🚀 Frontend Integration

### استخدام API في React:

```typescript
// حفظ النقاط
const saveDailyPoints = async (data) => {
  const response = await fetch("/api/points-game/daily", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

// جلب الشارات
const getBadges = async () => {
  const response = await fetch("/api/points-game/badges", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};

// جلب الترتيب
const getRankings = async (type = "points") => {
  const response = await fetch(`/api/points-game/rankings/${type}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};
```

---

تم التوثيق بواسطة: GitHub Copilot 🤖✨  
التاريخ: 17 أكتوبر 2025
