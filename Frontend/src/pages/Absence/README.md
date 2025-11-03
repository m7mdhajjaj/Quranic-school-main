# 📋 صفحة الحضور والغياب (Absence Page)

## 🎯 نظرة عامة

صفحة متكاملة لإدارة سجل الحضور والغياب للطلاب، مع واجهات منفصلة للمعلمين والإداريين والطلاب.

## 📁 هيكل المشروع

```
pages/Absence/
├── AbsencePage.tsx          # الصفحة الرئيسية
├── index.ts                 # Export file
├── types/                   # TypeScript Types
│   └── absence.types.ts     # جميع الـ interfaces
├── utils/                   # Helper Functions
│   ├── dateHelpers.ts       # دوال التاريخ
│   └── teacherHelpers.ts    # دوال المعلم
├── hooks/                   # Custom React Hooks
│   ├── useAbsenceData.ts    # جلب البيانات
│   └── useTeacherGroups.ts  # حلقات المعلم
└── components/              # React Components
    ├── index.ts
    ├── SocketIndicator.tsx  # مؤشر الاتصال
    ├── TeacherToolbar.tsx   # شريط أدوات المعلم
    ├── StudentsTable.tsx    # جدول الطلاب
    └── StudentView.tsx      # واجهة الطالب
```

## 🧩 المكونات (Components)

### 1️⃣ SocketIndicator

**الوظيفة**: عرض حالة الاتصال بالـ WebSocket
**استخدام UI Components**:

- لا يستخدم UI components (مؤشر بسيط)

### 2️⃣ TeacherToolbar

**الوظيفة**: شريط أدوات للمعلم (تحديد التاريخ، الحلقة، البحث، الإحصائيات)
**استخدام UI Components**:

- ✅ `Card` - للإحصائيات والأدوات
- ✅ `Input` - حقل التاريخ والبحث
- ✅ `Select` - اختيار الحلقة
- ✅ `Button` - زر تحديد الكل
- ✅ `Alert` - تحذير التاريخ القديم

### 3️⃣ StudentsTable

**الوظيفة**: جدول الطلاب مع الإجراءات (حضور/غياب)
**استخدام UI Components**:

- ✅ `Table` - الجدول الرئيسي
- ✅ `Badge` - عرض الحلقة والحالة
- ✅ `Button` - أزرار الإجراءات
- ✅ `Modal` - عرض سجل الحضور

### 4️⃣ StudentView

**الوظيفة**: واجهة الطالب لعرض سجل الحضور الشخصي
**استخدام UI Components**:

- ✅ `Card` - بطاقات الإحصائيات
- ✅ `Badge` - تصنيف المعدل
- ✅ `ProgressBar` - معدل الحضور
- ✅ `Modal` - تفاصيل الشهر
- ✅ `Button` - أزرار التفاعل
- ✅ `EmptyState` - حالة عدم وجود بيانات

### 5️⃣ AbsencePage (Main)

**الوظيفة**: الصفحة الرئيسية التي تدير العرض حسب دور المستخدم
**استخدام UI Components**:

- ✅ `LoadingSpinner` - شاشة التحميل
- ✅ `Card` - الحاويات
- ✅ `Button` - زر الحفظ
- ✅ `EmptyState` - حالات الفراغ

## 🎨 مكتبة الـ UI Components المستخدمة

جميع المكونات تستخدم مكتبة `components/UI`:

| Component        | الاستخدام                                                          |
| ---------------- | ------------------------------------------------------------------ |
| `Card`           | حاويات البطاقات (default, outlined, elevated, gradient)            |
| `Button`         | جميع الأزرار (primary, secondary, success, danger, warning, ghost) |
| `Table`          | جدول الطلاب مع pagination وfiltration                              |
| `Badge`          | عرض الحالات والتصنيفات                                             |
| `Modal`          | النوافذ المنبثقة                                                   |
| `Input`          | حقول الإدخال                                                       |
| `Select`         | القوائم المنسدلة                                                   |
| `Alert`          | التحذيرات والإشعارات                                               |
| `ProgressBar`    | معدل الحضور                                                        |
| `EmptyState`     | حالات عدم وجود بيانات                                              |
| `LoadingSpinner` | شاشات التحميل                                                      |

## 🔄 دورة العمل (Workflow)

### للمعلم/الإداري:

1. اختيار التاريخ والحلقة
2. البحث عن طلاب محددين (optional)
3. تحديد الحضور/الغياب
4. حفظ السجل

### للطالب:

1. عرض الملخص السنوي
2. عرض الإحصائيات الشهرية
3. عرض تفاصيل كل شهر

## 📊 Types المستخدمة

```typescript
interface LoggedInUser {
  _id: string;
  firstName: string;
  lastName?: string;
  role: "student" | "teacher" | "admin";
  groups?: string[];
}

interface AttendanceStudent {
  _id: string;
  name: string;
  group?: string;
  isPresent: boolean;
  totalAbsences?: number;
  absenceDates?: string[];
}

interface MonthlyAbsence {
  month: string;
  absenceCount: number;
  totalDays: number;
  rate: number;
}

interface MonthlyAttendanceStats {
  presentDays: number;
  absentDays: number;
  totalDays: number;
  attendanceRate: number;
}
```

## 🎯 المميزات

✅ **استخدام كامل للـ UI Components** - لا توجد عناصر HTML مخصصة
✅ **Responsive Design** - يعمل على جميع الشاشات
✅ **Real-time Updates** - WebSocket integration
✅ **TypeScript** - Type safety كامل
✅ **Custom Hooks** - فصل المنطق عن العرض
✅ **Modular Structure** - سهولة الصيانة والتطوير
✅ **Arabic RTL Support** - دعم كامل للغة العربية

## 🚀 كيفية الاستخدام

```typescript
import AbsencePage from "./pages/Absence";

// في Router
<Route path="/absence" element={<AbsencePage />} />;
```

## 📝 ملاحظات مهمة

- ❌ **لا تستخدم** `<div>` أو `<button>` أو HTML tags مباشرة
- ✅ **استخدم** UI Components الجاهزة دائماً
- 🎨 **التصميم** موحد عبر التطبيق بفضل UI library
- 🔧 **الصيانة** سهلة - تعديل واحد في UI component يؤثر على كل التطبيق

## 🎓 التطويرات المستقبلية

- [ ] إضافة تصدير Excel للإحصائيات
- [ ] إضافة رسوم بيانية (Charts)
- [ ] إضافة نظام الإشعارات للغياب المتكرر
- [ ] إضافة تقارير PDF

---

✨ **تم التطوير باستخدام UI Components الجاهزة بالكامل**
