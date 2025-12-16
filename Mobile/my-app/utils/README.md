# Utils - الأدوات المساعدة 🛠️

مجلد يحتوي على جميع الدوال والثوابت المساعدة المستخدمة في التطبيق.

## 📁 هيكل المجلد

```
utils/
├── AudioManager.ts          # إدارة الأصوات
├── alertUtils.ts           # رسائل Alert (بديل SweetAlert)
├── toastUtils.ts           # رسائل Toast
├── constants/              # الثوابت
│   └── arabicMonths.ts    # أسماء الأشهر العربية
├── helpers/                # الدوال المساعدة
│   ├── dateHelpers.ts     # دوال التاريخ
│   ├── userHelpers.ts     # دوال المستخدمين
│   └── index.ts           # تصدير الدوال
└── index.ts                # تصدير جميع Utils
```

## 🎵 AudioManager

إدارة تشغيل الأصوات مع caching وdebouncing.

### الاستخدام:

```typescript
import { audioManager } from "@/utils";

// تشغيل صوت
await audioManager.play("successful.mp3", 0.5);

// تحميل صوت مسبقاً
await audioManager.preload("notification.mp3");

// إزالة صوت من الذاكرة
await audioManager.remove("error.wav");

// تنظيف جميع الأصوات
await audioManager.clearCache();
```

### الأصوات المتاحة:

- `successful.mp3` - صوت النجاح
- `error.wav` - صوت الخطأ
- `Adhan.mp3` - صوت الأذان
- `notification.mp3` - صوت الإشعار

---

## 🔔 Alert Utils

رسائل تنبيه باستخدام React Native Alert API (بديل SweetAlert2).

### الاستخدام:

```typescript
import {
  showSuccessMessage,
  showErrorMessage,
  showConfirmDialog,
} from "@/utils";

// رسالة نجاح
showSuccessMessage("تم بنجاح", "تم حفظ البيانات", () => {
  console.log("User clicked OK");
});

// رسالة خطأ
showErrorMessage("خطأ", "فشل في حفظ البيانات");

// رسالة تأكيد
showConfirmDialog(
  "حذف",
  "هل أنت متأكد من الحذف؟",
  () => console.log("Confirmed"),
  () => console.log("Cancelled")
);
```

### الدوال المتاحة:

- `showSuccessMessage()` - رسالة نجاح مع صوت
- `showErrorMessage()` - رسالة خطأ مع صوت
- `showWarningMessage()` - رسالة تحذير
- `showConfirmMessage()` - رسالة تأكيد مع خيارات
- `showConfirmDialog()` - رسالة تأكيد الحذف
- `showInfoMessage()` - رسالة معلومات

---

## 🍞 Toast Utils

رسائل Toast باستخدام `react-native-toast-message`.

### الاستخدام:

```typescript
import { showSuccessToast, showErrorToast, showInfoToast } from "@/utils";

// Toast نجاح
showSuccessToast("تم الحفظ بنجاح");

// Toast خطأ
showErrorToast("فشل في الاتصال بالخادم", "خطأ في الشبكة");

// Toast معلومات
showInfoToast("يرجى الانتظار...", "جاري التحميل");

// إخفاء Toast
hideToast();
```

### الدوال المتاحة:

- `showSuccessToast()` - Toast نجاح مع صوت
- `showErrorToast()` - Toast خطأ مع صوت
- `showInfoToast()` - Toast معلومات
- `showWarningToast()` - Toast تحذير
- `showCustomToast()` - Toast مخصص
- `hideToast()` - إخفاء Toast

**ملاحظة:** يجب إضافة `<Toast />` في App.tsx:

```typescript
import Toast from 'react-native-toast-message';

export default function App() {
  return (
    <>
      {/* Your app content */}
      <Toast />
    </>
  );
}
```

---

## 📅 Date Helpers

دوال مساعدة للتعامل مع التواريخ.

### الاستخدام:

```typescript
import {
  formatArabicDate,
  formatTime12Arabic,
  calculateAge,
  getTodayDate,
} from "@/utils";

// تحويل التاريخ لصيغة عربية
const arabicDate = formatArabicDate(new Date());
// "٢٤ أكتوبر ٢٠٢٥"

// تحويل الوقت لصيغة 12 ساعة
const time = formatTime12Arabic("14:30");
// "2:30 مساءً"

// حساب العمر
const age = calculateAge("2000-05-15");
// 25

// تاريخ اليوم
const today = getTodayDate();
// "2025-10-24"
```

### الدوال المتاحة:

- `formatDateForInput()` - تحويل لصيغة yyyy-mm-dd
- `formatArabicDate()` - تحويل لصيغة عربية قابلة للقراءة
- `formatDateTimeArabic()` - تحويل التاريخ والوقت للعربية
- `formatTime12Arabic()` - تحويل الوقت لصيغة 12 ساعة
- `formatDateDDMMYYYY()` - تحويل لصيغة dd/mm/yyyy
- `calculateAge()` - حساب العمر
- `generateYearRange()` - توليد مجموعة سنوات
- `getTodayDate()` - الحصول على تاريخ اليوم
- `isFutureDate()` - التحقق من تاريخ مستقبلي
- `isPastDate()` - التحقق من تاريخ ماضي
- `getWeekStart()` - الحصول على بداية الأسبوع
- `getWeekEnd()` - الحصول على نهاية الأسبوع

---

## 👤 User Helpers

دوال مساعدة للتعامل مع بيانات المستخدمين.

### الاستخدام:

```typescript
import { getFullName, getShortName, getInitials } from "@/utils";

const user = {
  firstName: "محمد",
  fatherName: "أحمد",
  grandFatherName: "علي",
  lastName: "السيد",
};

// الاسم الكامل
const fullName = getFullName(user);
// "محمد أحمد علي السيد"

// الاسم المختصر
const shortName = getShortName(user);
// "محمد السيد"

// الحروف الأولى للأفاتار
const initials = getInitials(user);
// "مس"
```

### الدوال المتاحة:

- `getFullName()` - الحصول على الاسم الكامل
- `getTeacherFullName()` - اسم المعلم الكامل
- `getShortName()` - الاسم المختصر
- `getInitials()` - الحروف الأولى

---

## 📆 Arabic Months

ثوابت لأسماء الأشهر العربية.

### الاستخدام:

```typescript
import { ARABIC_MONTHS, getMonthLabel, getMonthOptions } from "@/utils";

// قائمة الأشهر
console.log(ARABIC_MONTHS);
// [{ value: 1, label: 'يناير', fullLabel: 'كانون الثاني' }, ...]

// الحصول على اسم شهر
const monthName = getMonthLabel(5, "short"); // "مايو"
const monthFull = getMonthLabel(5, "full"); // "أيار"

// خيارات Picker
const options = getMonthOptions();
// [{ value: 1, label: 'يناير (1)' }, ...]
```

---

## 📦 التثبيت

### المكتبات المطلوبة:

```bash
# Audio
npm install expo-av

# Toast Messages
npm install react-native-toast-message
```

### إعدادات إضافية:

#### 1. إضافة ملفات الأصوات:

ضع ملفات الأصوات في المسار:

```
assets/sounds/
├── successful.mp3
├── error.wav
├── Adhan.mp3
└── notification.mp3
```

#### 2. إضافة Toast في App:

```typescript
import Toast from 'react-native-toast-message';

export default function App() {
  return (
    <>
      {/* Your app content */}
      <Toast />
    </>
  );
}
```

---

## 🎯 الاستيراد السريع

يمكنك استيراد جميع Utils من ملف واحد:

```typescript
import {
  // Audio
  audioManager,

  // Alerts
  showSuccessMessage,
  showErrorMessage,
  showConfirmDialog,

  // Toast
  showSuccessToast,
  showErrorToast,

  // Date
  formatArabicDate,
  formatTime12Arabic,
  getTodayDate,

  // User
  getFullName,
  getInitials,

  // Constants
  ARABIC_MONTHS,
  getMonthLabel,
} from "@/utils";
```

---

## ⚠️ ملاحظات مهمة

1. **الأصوات تعمل تلقائياً** مع رسائل النجاح والخطأ
2. **Debouncing مدمج** في AudioManager لمنع تشغيل نفس الصوت أكثر من مرة خلال ثانيتين
3. **Toast يحتاج إضافة Component** في App.tsx
4. **Alert هو بديل أصلي** عن SweetAlert2 للموبايل
5. **جميع الدوال تدعم RTL** والنصوص العربية

---

## 🚀 أمثلة متقدمة

### مثال: نموذج حفظ بيانات مع تنبيهات

```typescript
import { showSuccessToast, showErrorToast, audioManager } from "@/utils";

const handleSave = async () => {
  try {
    await saveData();
    showSuccessToast("تم حفظ البيانات بنجاح");
    audioManager.play("successful.mp3");
  } catch (error) {
    showErrorToast("فشل في حفظ البيانات", "خطأ");
  }
};
```

### مثال: عرض قائمة طلاب مع أسماء منسقة

```typescript
import { getFullName, getInitials } from '@/utils';

const StudentCard = ({ student }) => {
  const fullName = getFullName(student);
  const initials = getInitials(student);

  return (
    <View>
      <Avatar>{initials}</Avatar>
      <Text>{fullName}</Text>
    </View>
  );
};
```

---

## 📝 التحديثات المستقبلية

- [ ] إضافة دعم للألوان الديناميكية في Toast
- [ ] إضافة المزيد من الأصوات
- [ ] دعم الإشعارات Push
- [ ] دوال تحويل التقويم الهجري

---

تم التحديث: 2025-01-24
