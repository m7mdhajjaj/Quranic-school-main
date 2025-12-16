# Assets - الملفات الثابتة 📁

مجلد يحتوي على جميع الملفات الثابتة المستخدمة في التطبيق.

## 📁 هيكل المجلد

```
assets/
├── sounds/                 # ملفات الأصوات
│   ├── successful.mp3     # صوت النجاح
│   ├── error.wav          # صوت الخطأ
│   ├── Adhan.mp3          # صوت الأذان
│   ├── notification.mp3   # صوت الإشعار
│   ├── Login.mp3          # صوت تسجيل الدخول
│   └── 683101__florianreichelt__quick-woosh.mp3
├── images/                 # الصور والأيقونات
│   ├── icon.png           # أيقونة التطبيق
│   ├── splash-icon.png    # شاشة البداية
│   ├── favicon.png        # Favicon
│   ├── react-logo.png     # شعار React (بدقات مختلفة)
│   ├── react-logo@2x.png
│   ├── react-logo@3x.png
│   └── android-icon-*.png # أيقونات Android
├── react.svg              # شعار React (SVG)
└── README.md              # هذا الملف
```

---

## 🔊 ملفات الأصوات

### الملفات المنسوخة من Frontend:

| الملف                                      | الوصف            | الاستخدام          |
| ------------------------------------------ | ---------------- | ------------------ |
| `successful.mp3`                           | صوت النجاح       | عند نجاح العملية   |
| `error.wav`                                | صوت الخطأ        | عند فشل العملية    |
| `Adhan.mp3`                                | صوت الأذان       | لتذكير الصلاة      |
| `notification.mp3`                         | صوت الإشعار      | للإشعارات العامة   |
| `Login.mp3`                                | صوت تسجيل الدخول | عند الدخول للتطبيق |
| `683101__florianreichelt__quick-woosh.mp3` | صوت swoosh       | لانتقالات سريعة    |

### الاستخدام مع AudioManager:

```typescript
import { audioManager } from "@/utils";

// تشغيل صوت النجاح
await audioManager.play("successful.mp3");

// تشغيل صوت الخطأ
await audioManager.play("error.wav");

// تشغيل صوت الأذان
await audioManager.play("Adhan.mp3");

// تشغيل صوت الإشعار
await audioManager.play("notification.mp3");
```

### تحميل مسبق (Preload):

```typescript
// تحميل الأصوات الشائعة عند بدء التطبيق
await audioManager.preload("successful.mp3");
await audioManager.preload("error.wav");
await audioManager.preload("notification.mp3");
```

---

## 🖼️ ملفات الصور

### أيقونات التطبيق:

- **icon.png** - الأيقونة الرئيسية (1024x1024)
- **splash-icon.png** - أيقونة شاشة البداية
- **favicon.png** - Favicon للويب

### أيقونات Android:

- **android-icon-foreground.png** - الطبقة الأمامية
- **android-icon-background.png** - الطبقة الخلفية
- **android-icon-monochrome.png** - نسخة أحادية اللون

### شعارات React:

- **react-logo.png** - دقة عادية (1x)
- **react-logo@2x.png** - دقة عالية (2x)
- **react-logo@3x.png** - دقة فائقة (3x)
- **react.svg** - نسخة SVG (للويب)

### الاستخدام:

```typescript
import { Image } from 'react-native';

// استخدام الصور
<Image
  source={require('@/assets/images/react-logo.png')}
  style={{ width: 100, height: 100 }}
/>

// React Native يختار الدقة المناسبة تلقائياً
// على شاشة Retina، سيستخدم @2x أو @3x
```

---

## 📦 إضافة ملفات جديدة

### إضافة صوت جديد:

1. ضع الملف في `assets/sounds/`
2. تأكد من الامتداد (.mp3 أو .wav)
3. أضف الملف في AudioManager إذا كنت تريد preload:

```typescript
// في AudioManager.ts
const soundMap: Record<string, any> = {
  "successful.mp3": require("../assets/sounds/successful.mp3"),
  "new-sound.mp3": require("../assets/sounds/new-sound.mp3"), // جديد
};
```

### إضافة صورة جديدة:

1. ضع الملف في `assets/images/`
2. استخدمها مباشرة:

```typescript
<Image source={require('@/assets/images/my-image.png')} />
```

---

## 🎨 أفضل الممارسات

### للأصوات:

- ✅ استخدم .mp3 للملفات الطويلة (موسيقى، أذان)
- ✅ استخدم .wav للملفات القصيرة (تنبيهات، نقرات)
- ✅ اضغط الملفات للحفاظ على حجم التطبيق صغيراً
- ✅ حمّل الأصوات الشائعة مسبقاً (preload)

### للصور:

- ✅ استخدم PNG للأيقونات والشعارات
- ✅ استخدم JPEG للصور الفوتوغرافية
- ✅ وفر دقات متعددة (@2x, @3x) للشاشات عالية الدقة
- ✅ ضغط الصور قبل إضافتها للمشروع

---

## 📊 الإحصائيات

| النوع         | العدد  | الحجم التقريبي |
| ------------- | ------ | -------------- |
| ملفات الأصوات | 6      | ~5 MB          |
| ملفات الصور   | 10     | ~2 MB          |
| **الإجمالي**  | **16** | **~7 MB**      |

---

## 🔄 التزامن مع Frontend

تم نسخ جميع ملفات assets من Frontend مع الاحتفاظ بنفس الأسماء والهيكل:

```
Frontend/src/assets/sounds/ → Mobile/my-app/assets/sounds/
Frontend/src/assets/react.svg → Mobile/my-app/assets/react.svg
```

**ملاحظة:** ملفات images/ الموجودة في Mobile تم إنشاؤها بواسطة Expo وهي خاصة بالموبايل.

---

## 🚀 التحسينات المستقبلية

- [ ] ضغط ملفات الأصوات لتقليل الحجم
- [ ] إضافة أصوات متعددة اللغات
- [ ] إضافة صور لوضع Dark Mode
- [ ] إضافة animatedpng/webp للأنيميشن

---

## 📝 ملاحظات مهمة

1. **الأصوات تعمل تلقائياً** مع AudioManager بعد نسخها
2. **الصور تستخدم بـ require()** في React Native
3. **SVG يحتاج مكتبة إضافية** (react-native-svg) في React Native
4. **Expo يدير الأيقونات تلقائياً** من app.json

---

تم التحديث: 2025-12-16
الحالة: ✅ منسوخ من Frontend
