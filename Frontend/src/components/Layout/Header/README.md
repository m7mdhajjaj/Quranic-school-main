# 📑 Header Component Documentation

## 📁 هيكل المجلد

```
Header/
├── components/          # مكونات الـHeader
│   ├── Header.tsx      # المكون الرئيسي
│   ├── Navigation/     # مكونات التنقل
│   │   ├── TabNavigation.tsx        # التنقل في Desktop
│   │   └── DropdownNavItem.tsx      # عنصر التنقل المنسدل
│   └── MobileMenu/     # قائمة الموبايل
│       ├── MobileMenu.tsx           # القائمة الرئيسية
│       └── MobileMenuButton.tsx     # زر فتح القائمة
├── constants/          # الثوابت
│   └── navigationItems.ts           # عناصر التنقل
├── hooks/             # Custom Hooks
│   └── useNavigation.ts            # Hook لإدارة التنقل
├── types/             # TypeScript Types
│   └── navigation.types.ts         # أنواع البيانات
├── utils/             # دوال مساعدة
│   └── navigation.utils.ts         # دوال مشتركة
├── index.tsx          # Entry point
└── README.md          # هذا الملف
```

---

## 🎯 الوظائف الرئيسية

### 1. **Header Component** ([Header.tsx](components/Header.tsx))
المكون الرئيسي للـHeader يحتوي على:
- **اللوجو**: مع رابط للصفحة الرئيسية
- **التنقل**: TabNavigation (Desktop) و MobileMenu (Mobile)
- **الأدوات**: الإشعارات، Profile Menu
- **الأمان**: Redirect للـLogin إذا لم يكن المستخدم مسجل دخول

#### الاستخدام:
```tsx
import Header from '@/components/Layout/Header';

<Header className="custom-class" />
```

---

### 2. **Navigation Components**

#### **TabNavigation** ([TabNavigation.tsx](components/Navigation/TabNavigation.tsx))
- يدمج `primaryItems` و `secondaryItems` في قائمة واحدة
- يعرض جميع العناصر في شريط متحرك أفقياً
- يدعم العناصر العادية والمنسدلة (DropdownNavItem)

#### **DropdownNavItem** ([DropdownNavItem.tsx](components/Navigation/DropdownNavItem.tsx))
- عنصر تنقل منسدل للعناصر التي تحتوي على `subItems`
- يغلق تلقائياً عند النقر خارجه أو الضغط على ESC
- يظهر مؤشر نشط للعنصر الحالي

#### **MobileMenu** ([MobileMenu.tsx](components/MobileMenu/MobileMenu.tsx))
- قائمة جانبية للموبايل
- تحتوي على بطاقة المستخدم وجميع عناصر التنقل
- تدعم العناصر المنسدلة

---

### 3. **Utils** ([utils/navigation.utils.ts](utils/navigation.utils.ts))

#### دوال مساعدة مشتركة:

**`checkIsActive(itemPath, currentPath)`**
- تتحقق من أن المسار نشط
- تعامل خاص للصفحة الرئيسية `/`

**`hasActiveSubItem(subItems, currentPath)`**
- تتحقق من وجود عنصر فرعي نشط

**`mergeNavigationItems(primaryItems, secondaryItems)`**
- تدمج العناصر الرئيسية والثانوية

---

### 4. **Navigation Items** ([constants/navigationItems.ts](constants/navigationItems.ts))

يحتوي على:
- **`getPrimaryNavItems`**: العناصر الرئيسية حسب نوع المستخدم
- **`getSecondaryNavItems`**: العناصر الثانوية

#### مثال على عنصر تنقل:
```typescript
{
  to: "/quran",
  label: "القرآن الكريم",
  icon: BookOpen,
  color: "from-teal-500 to-cyan-500",
  subItems: [
    {
      to: "/quran",
      label: "قرآن شفهي",
      icon: BookOpen,
      color: "from-teal-500 to-cyan-500",
    },
    {
      to: "/quran-audio",
      label: "قرآن صوتي",
      icon: Headphones,
      color: "from-blue-500 to-indigo-500",
    }
  ]
}
```

---

### 5. **Types** ([types/navigation.types.ts](types/navigation.types.ts))

أنواع البيانات المستخدمة:
- `NavigationItem`: عنصر التنقل
- `User`: بيانات المستخدم
- `HeaderProps`: خصائص الـHeader
- `MobileMenuProps`: خصائص قائمة الموبايل
- وغيرها...

---

## 🔧 كيفية الإضافة/التعديل

### إضافة عنصر تنقل جديد:

1. افتح [constants/navigationItems.ts](constants/navigationItems.ts)
2. أضف العنصر في `getPrimaryNavItems` أو `getSecondaryNavItems`:

```typescript
{
  to: "/new-page",
  label: "صفحة جديدة",
  icon: NewIcon,  // من lucide-react
  color: "from-blue-500 to-cyan-500",
}
```

### إضافة عنصر منسدل:

```typescript
{
  to: "/parent",
  label: "القائمة الأساسية",
  icon: ParentIcon,
  color: "from-blue-500 to-cyan-500",
  subItems: [
    {
      to: "/parent/child1",
      label: "العنصر الفرعي 1",
      icon: ChildIcon,
      color: "from-teal-500 to-cyan-500",
    }
  ]
}
```

---

## 🎨 التصميم

### الألوان:
- **الخلفية**: `from-emerald-600 via-emerald-500 to-teal-600`
- **العنصر النشط**: `bg-white text-emerald-600`
- **العنصر غير النشط**: `text-white/90`

### الاستجابة (Responsive):
- **Mobile**: قائمة جانبية (`sm:hidden`)
- **Desktop**: شريط تنقل (`hidden sm:flex`)

### الأحجام:
- **Mobile**: `h-14` (56px)
- **Tablet**: `sm:h-16` (64px)
- **Desktop**: `md:h-20` (80px)

---

## ⚡ الأداء

### التحسينات:
1. **استخدام `useMemo`** في [hooks/useNavigation.ts](hooks/useNavigation.ts) لمنع إعادة حساب العناصر
2. **دوال مشتركة** في [utils/navigation.utils.ts](utils/navigation.utils.ts) لتجنب التكرار
3. **حذف ملفات غير مستخدمة** لتقليل حجم Bundle

---

## 🐛 التعامل مع المشاكل

### المشكلة: العنصر لا يظهر كنشط
**الحل**: تأكد من استخدام دالة `checkIsActive` من [utils/navigation.utils.ts](utils/navigation.utils.ts)

### المشكلة: القائمة المنسدلة لا تغلق
**الحل**: تأكد من وجود `useEffect` للـ`clickOutside` و `escapeKey`

### المشكلة: الملفات لا تعمل بعد التحديث
**الحل**: نفذ `npm install` و `npm run dev` من جديد

---

## 📝 ملاحظات مهمة

1. **لا تحذف** `utils/navigation.utils.ts` - الملفات الأخرى تعتمد عليه
2. **استخدم** `checkIsActive` بدلاً من كتابة منطق التحقق يدوياً
3. **التزم** بنفس أسلوب التعليقات للحفاظ على وضوح الكود
4. **اختبر** التغييرات على جميع الأحجام (Mobile, Tablet, Desktop)

---

## 🚀 المساهمة

عند إضافة ميزات جديدة:
1. حافظ على البنية الحالية
2. أضف تعليقات واضحة
3. استخدم TypeScript بشكل صحيح
4. اختبر على جميع الأحجام

---

## 📞 للمساعدة

إذا واجهت مشكلة، راجع:
1. هذا الـREADME
2. التعليقات في الكود
3. [types/navigation.types.ts](types/navigation.types.ts) لفهم الأنواع

---

**آخر تحديث**: 7 يناير 2026
**النسخة**: 2.0.0 (بعد التنظيم الكبير)
