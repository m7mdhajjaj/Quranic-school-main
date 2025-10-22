# Home Page Structure

## 📁 الهيكل الحديث للصفحة (مطابق لـ ExamSchedule)

```
Frontend/src/pages/Home/
├── index.ts              # نقطة التصدير الرئيسية
├── Home.tsx              # المكون الرئيسي للصفحة
├── components/           # جميع المكونات الفرعية
│   ├── index.ts          # تصدير جميع المكونات
│   ├── HeroSection.tsx   # قسم البانر الرئيسي مع صورة الهيرو
│   ├── VisionSection.tsx # قسم الرؤية (التلاوة، الحفظ، العلوم)
│   └── ValuesSection.tsx # قسم القيم (10 قيم)
└── README.md            # التوثيق
```

## 🎯 المكونات

### 1. Home.tsx (المكون الرئيسي)
- إدارة حالة صورة الهيرو
- معالجة رفع الصورة
- تهيئة AOS للحركات
- تجميع جميع الأقسام

### 2. HeroSection.tsx
- عرض صورة الهيرو
- رسالة الترحيب المخصصة حسب دور المستخدم
- زر "ابدأ رحلتك التعليمية"
- إمكانية تعديل الصورة للمعلمين والإداريين
- حالة تحميل (skeleton)

### 3. VisionSection.tsx
- ثلاث بطاقات رئيسية:
  - تلاوة متقنة
  - حفظ القرآن
  - علوم القرآن
- تأثيرات حركة AOS

### 4. ValuesSection.tsx
- عشر قيم أساسية:
  - التحفيز
  - العمل
  - الدعاء
  - التطوير
  - الصبر
  - التعاون
  - العطاء والإحسان
  - الحلم
  - الطموح
- تصميم موحد مع أيقونات

## 📦 الاستيراد والتصدير

### في App.tsx:
```typescript
import Home from './pages/Home';
```

### في index.ts (الرئيسي):
```typescript
// Export all components
export * from './components';

// Export main page
export { default } from './Home';
```

### في components/index.ts:
```typescript
export { default as HeroSection } from './HeroSection';
export { default as VisionSection } from './VisionSection';
export { default as ValuesSection } from './ValuesSection';
```

### في Home.tsx:
```typescript
import { HeroSection, VisionSection, ValuesSection } from './components';
```

## ✨ المزايا

1. **تنظيم أفضل**: كل قسم في ملف منفصل
2. **سهولة الصيانة**: تعديل أي قسم بدون التأثير على الباقي
3. **إعادة استخدام**: يمكن استخدام المكونات في أماكن أخرى
4. **وضوح الكود**: كل ملف له مسؤولية واحدة
5. **لا دوائر مرجعية**: هيكل استيراد واضح ومباشر

## 🔧 التعديلات المستقبلية

لإضافة قسم جديد:
1. أنشئ ملف المكون الجديد في `Home/components/`
2. صدره من `components/index.ts`
3. استورده واستخدمه في `Home.tsx`

مثال:
```typescript
// في components/index.ts
export { default as NewSection } from './NewSection';

// في Home.tsx
import { HeroSection, VisionSection, ValuesSection, NewSection } from './components';

// استخدمه في return
<NewSection />
```

## 📦 مطابقة لهيكل ExamSchedule

هذا الهيكل يتبع نفس النمط المستخدم في:
- `pages/ExamSchedule/`
- وجميع الصفحات الحديثة في المشروع

الفوائد:
- ✅ تنظيم موحد عبر المشروع
- ✅ سهولة إضافة مكونات جديدة
- ✅ فصل واضح بين المكونات والصفحة الرئيسية
- ✅ قابلية التوسع والصيانة
