# ExamMark Controller - البنية المقسمة

## 📁 هيكل المجلد

```
ExamMark/
├── index.js                    - نقطة الدخول الرئيسية
├── getMarks.js                 - جلب العلامات
├── setMarks.js                 - إضافة علامات متعددة (bulk)
├── updateMark.js               - تعديل علامة واحدة
├── deleteMark.js               - حذف علامة
├── examAverage.js              - حساب متوسط الامتحان
├── examMarkNotifications.js    - نظام الإشعارات
└── README.md                   - التوثيق (هذا الملف)
```

## 📝 الوظائف

### 1. getMarks.js - جلب العلامات

#### `getStudentMarks(req, res)`
- **Route**: `GET /api/exam-marks/student/:studentId`
- **الوصف**: جلب جميع علامات طالب محدد
- **المعاملات**: `studentId` في URL
- **الإرجاع**: قائمة العلامات مع بيانات الامتحانات

#### `getExamMarks(req, res)`
- **Route**: `GET /api/exam-marks/exam/:examId`
- **الوصف**: جلب جميع علامات امتحان محدد
- **المعاملات**: `examId` في URL
- **الإرجاع**: قائمة العلامات مع بيانات الطلاب

---

### 2. setMarks.js - إضافة علامات متعددة

#### `setExamMarks(req, res)`
- **Route**: `POST /api/exam-marks/exam/:examId`
- **الوصف**: إضافة/تحديث علامات لعدة طلاب دفعة واحدة
- **المعاملات**: 
  - `examId` في URL
  - `marks` في body: `[{ student, mark, detail }]`
- **الإجراءات**:
  1. Bulk write operation
  2. تحديث متوسط الامتحان
  3. إرسال إشعارات لجميع الطلاب
  4. Emit Socket.IO event
- **الإشعارات**: يرسل إشعار منفصل لكل طالب بعلامته

---

### 3. updateMark.js - تعديل علامة واحدة

#### `updateStudentMark(req, res)`
- **Route**: `PUT /api/exam-marks/exam/:examId/student/:studentId`
- **الوصف**: تعديل أو إضافة علامة لطالب واحد
- **المعاملات**: 
  - `examId`, `studentId` في URL
  - `mark`, `detail` في body
- **الإجراءات**:
  1. Update/upsert operation
  2. تحديث متوسط الامتحان
  3. إرسال إشعار للطالب
  4. Emit Socket.IO event
- **الإشعار**: "✏️ تم تعديل علامتك"

---

### 4. deleteMark.js - حذف علامة

#### `deleteStudentMark(req, res)`
- **Route**: `DELETE /api/exam-marks/exam/:examId/student/:studentId`
- **الوصف**: حذف علامة طالب
- **المعاملات**: `examId`, `studentId` في URL
- **الإجراءات**:
  1. إرسال إشعار قبل الحذف
  2. حذف العلامة
  3. تحديث متوسط الامتحان
  4. Emit Socket.IO event
- **الإشعار**: "🗑️ تم حذف علامة"

---

### 5. examAverage.js - حساب المتوسط

#### `updateExamAverage(examId)` - دالة مساعدة
- **الوصف**: حساب وتحديث متوسط امتحان
- **الاستخدام**: داخلي (تُستدعى من ملفات أخرى)
- **الإرجاع**: متوسط الدرجات أو null
- **التقريب**: رقمين عشريين

#### `getExamAverage(req, res)`
- **Route**: `GET /api/exam-marks/exam/:examId/average`
- **الوصف**: جلب متوسط امتحان
- **الإرجاع**: `{ average, count }`
- **الذكاء**: إذا كان محفوظاً يُرجعه، وإلا يحسبه ويحفظه

---

### 6. examMarkNotifications.js - نظام الإشعارات

#### `notifyMarkAdded(examMark, io)`
- **الوصف**: إرسال إشعار عند إضافة علامة واحدة
- **الإشعار**: "📊 علامة جديدة"
- **الأولوية**: HIGH

#### `notifyMarksAdded(examId, marks, io)`
- **الوصف**: إرسال إشعارات عند إضافة علامات متعددة
- **الآلية**: Loop على كل طالب وإرسال إشعار منفصل
- **الأولوية**: HIGH

#### `notifyMarkUpdated(examMark, io)`
- **الوصف**: إرسال إشعار عند تعديل علامة
- **الإشعار**: "✏️ تم تعديل علامتك"
- **الأولوية**: HIGH

#### `notifyMarkDeleted(examId, studentId, io)`
- **الوصف**: إرسال إشعار عند حذف علامة
- **الإشعار**: "🗑️ تم حذف علامة"
- **الأولوية**: MEDIUM

---

## 🔄 آلية العمل

### إضافة علامة واحدة:
```
1. المعلم يضيف/يعدل علامة
   ↓
2. updateStudentMark() يعمل update/upsert
   ↓
3. تحديث متوسط الامتحان
   ↓
4. notifyMarkUpdated() يرسل إشعار للطالب
   ↓
5. Socket.IO event للتحديث الفوري
   ↓
6. Frontend يستلم الإشعار ويعرضه
```

### إضافة علامات متعددة:
```
1. المعلم يضيف علامات لعدة طلاب
   ↓
2. setExamMarks() يعمل bulkWrite
   ↓
3. تحديث متوسط الامتحان
   ↓
4. notifyMarksAdded() يرسل إشعار لكل طالب
   ↓
5. Socket.IO event للتحديث الفوري
   ↓
6. كل طالب يستلم إشعار بعلامته الخاصة
```

---

## 📊 البيانات المرسلة مع الإشعار

```javascript
{
  recipient: studentId,
  recipientModel: "Student",
  type: "grade",
  title: "📊 علامة جديدة",
  message: "تم إضافة علامتك في امتحان [الاسم]: [العلامة]/[الكلية]",
  data: {
    examId: "...",
    examTitle: "...",
    mark: 85,
    totalMark: 100,
    detail: "..."
  },
  priority: "high"
}
```

---

## 🔌 Socket.IO Events

### Emitted Events:
- **examMarkCreated**: عند إضافة علامات متعددة
- **examMarkUpdated**: عند تعديل علامة واحدة
- **examMarkDeleted**: عند حذف علامة

### Event Data:
```javascript
{
  examId: "...",
  studentId: "...",  // (updateMark, deleteMark only)
  marks: [...],      // (setMarks only)
  mark: {...},       // (updateMark only)
  timestamp: Date.now()
}
```

---

## 🛡️ معالجة الأخطاء

- جميع الـ functions محمية بـ try-catch
- في حالة فشل الإشعار، لا يؤثر على العملية الأساسية
- Logging تفصيلي لكل خطأ
- رسائل خطأ واضحة للـ Frontend

---

## 📝 Logging

```javascript
🔔 ========== MARK NOTIFICATION START (ADD) ==========
📝 Mark Details: { student: ..., exam: ..., mark: ... }
📚 Exam: [اسم الامتحان]
👤 Student: [اسم الطالب]
✅ Notification sent to student [studentId]
🔔 ========== MARK NOTIFICATION END (SUCCESS) ==========
```

```javascript
🔔 ========== BULK MARKS NOTIFICATION START ==========
📝 Adding marks for 15 students
📚 Exam: [اسم الامتحان]
👥 Found 15 students
✅ Notification sent to أحمد محمد
✅ Notification sent to فاطمة علي
...
📤 Sent 15 notifications successfully
🔔 ========== BULK MARKS NOTIFICATION END (SUCCESS) ==========
```

---

## ✅ المميزات

1. **منظم**: كل وظيفة في ملف منفصل
2. **قابل للصيانة**: سهل التعديل والإضافة
3. **موثق**: تعليقات وتوثيق شامل
4. **آمن**: معالجة شاملة للأخطاء
5. **فوري**: إشعارات real-time عبر Socket.IO
6. **دائم**: حفظ في Database
7. **ذكي**: حساب تلقائي للمتوسط
8. **مرن**: Upsert operations (create or update)

---

## 🧪 الاختبار

### اختبار إضافة علامة واحدة:
```
1. المعلم يضيف علامة لطالب
2. الطالب يستلم إشعار: "📊 علامة جديدة"
3. متوسط الامتحان يتحدث تلقائياً
```

### اختبار إضافة علامات متعددة:
```
1. المعلم يضيف علامات لـ 10 طلاب
2. كل طالب يستلم إشعار بعلامته الخاصة
3. متوسط الامتحان يتحدث مرة واحدة فقط
```

### اختبار تعديل علامة:
```
1. المعلم يعدل علامة
2. الطالب يستلم إشعار: "✏️ تم تعديل علامتك"
3. المتوسط يتحدث تلقائياً
```

### اختبار حذف علامة:
```
1. المعلم يحذف علامة
2. الطالب يستلم إشعار: "🗑️ تم حذف علامة"
3. المتوسط يتحدث تلقائياً
```

---

## 📚 المراجع

- **ExamMark Schema**: `Backend/src/schema/ExamMark.js`
- **Exam Schema**: `Backend/src/schema/Exam.js`
- **Student Schema**: `Backend/src/schema/Student.js`
- **NotificationService**: `Backend/src/services/NotificationService.js`
- **Routes**: `Backend/src/routes/examMarkRoutes.js`
