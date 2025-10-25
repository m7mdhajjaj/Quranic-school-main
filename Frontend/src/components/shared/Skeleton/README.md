# مكونات Skeleton

مجموعة شاملة من مكونات Skeleton لعرض حالات التحميل في التطبيق.

## المكونات الأساسية

### 1. Skeleton
مكون أساسي قابل لإعادة الاستخدام يمكن تخصيصه بالكامل.

#### الاستخدام:
```tsx
import { Skeleton } from '@/components/shared/Skeleton';

// نص بسيط
<Skeleton />

// عدة أسطر
<Skeleton lines={3} />

// دائري (للصور الرمزية)
<Skeleton variant="circular" width={48} height={48} />

// مستطيل مع حواف دائرية
<Skeleton variant="rounded" height={200} />

// بدون حركة
<Skeleton animation="none" />

// حركة موجية
<Skeleton animation="wave" />
```

#### الخصائص:
- `lines` (number): عدد الأسطر - الافتراضي: 1
- `variant` (text | circular | rectangular | rounded): الشكل - الافتراضي: text
- `width` (number | string): العرض
- `height` (number | string): الارتفاع
- `className` (string): فئات CSS إضافية
- `animation` (pulse | wave | none): نوع الحركة - الافتراضي: pulse

---

### 2. SkeletonCard
مكون لعرض بطاقات تحميل.

#### الاستخدام:
```tsx
import { SkeletonCard } from '@/components/shared/Skeleton';

// بطاقة واحدة مع صورة
<SkeletonCard />

// عدة بطاقات
<SkeletonCard count={3} />

// بدون صورة
<SkeletonCard showImage={false} />

// مع عدد أسطر مخصص
<SkeletonCard contentLines={5} />
```

#### الخصائص:
- `count` (number): عدد البطاقات - الافتراضي: 1
- `showImage` (boolean): عرض الصورة - الافتراضي: true
- `contentLines` (number): عدد أسطر المحتوى - الافتراضي: 3
- `className` (string): فئات CSS إضافية
- `animation` (pulse | wave | none): نوع الحركة - الافتراضي: pulse

---

### 3. SkeletonTable
مكون لعرض جداول تحميل.

#### الاستخدام:
```tsx
import { SkeletonTable } from '@/components/shared/Skeleton';

// جدول بسيط
<SkeletonTable />

// جدول مخصص
<SkeletonTable rows={10} columns={5} />

// بدون رأس
<SkeletonTable showHeader={false} />
```

#### الخصائص:
- `rows` (number): عدد الصفوف - الافتراضي: 5
- `columns` (number): عدد الأعمدة - الافتراضي: 4
- `showHeader` (boolean): عرض الرأس - الافتراضي: true
- `className` (string): فئات CSS إضافية
- `animation` (pulse | wave | none): نوع الحركة - الافتراضي: pulse

---

### 4. SkeletonList
مكون لعرض قوائم تحميل.

#### الاستخدام:
```tsx
import { SkeletonList } from '@/components/shared/Skeleton';

// قائمة بسيطة
<SkeletonList />

// قائمة مع أيقونات
<SkeletonList showIcon={true} />

// قائمة بدون صور رمزية
<SkeletonList showAvatar={false} />

// عدد مخصص من العناصر
<SkeletonList items={10} />
```

#### الخصائص:
- `items` (number): عدد العناصر - الافتراضي: 5
- `showAvatar` (boolean): عرض الصورة الرمزية - الافتراضي: true
- `showIcon` (boolean): عرض الأيقونة - الافتراضي: false
- `className` (string): فئات CSS إضافية
- `animation` (pulse | wave | none): نوع الحركة - الافتراضي: pulse

---

### 5. SkeletonForm
مكون لعرض نماذج تحميل.

#### الاستخدام:
```tsx
import { SkeletonForm } from '@/components/shared/Skeleton';

// نموذج بسيط
<SkeletonForm />

// نموذج مخصص
<SkeletonForm fields={6} showTitle={false} />

// بدون أزرار
<SkeletonForm showButtons={false} />
```

#### الخصائص:
- `fields` (number): عدد الحقول - الافتراضي: 4
- `showButtons` (boolean): عرض الأزرار - الافتراضي: true
- `showTitle` (boolean): عرض العنوان - الافتراضي: true
- `className` (string): فئات CSS إضافية
- `animation` (pulse | wave | none): نوع الحركة - الافتراضي: pulse

---

## المكونات المخصصة للصفحات

تحتوي المكتبة أيضاً على مكونات Skeleton مخصصة لصفحات معينة:

- `TestSkeleton`: لصفحة الاختبارات
- `TestQuestionSkeleton`: لأسئلة الاختبارات
- `ReportsSkeleton`: لصفحة التقارير
- `QuranAudioSkeleton`: لمشغل الصوت القرآني
- `QuranPageSkeleton`: لصفحة القرآن
- `QuranReadingSkeleton`: لقراءة القرآن
- `DailyMarksSkeleton`: للعلامات اليومية
- `GoalsSkeleton`: لصفحة الأهداف
- `AbsenceSkeleton`: لصفحة الغياب
- `ArrangementSkeleton`: لصفحة الترتيب
- `ActivitySkeleton`: لصفحة الأنشطة
- `ProfileSkeleton`: لصفحة الملف الشخصي
- `HomeSkeleton`: للصفحة الرئيسية
- `NewsSkeleton`: لصفحة الأخبار

### مثال على الاستخدام:
```tsx
import { ProfileSkeleton } from '@/components/shared/Skeleton';

function ProfilePage() {
  const { data, isLoading } = useProfile();

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  return <ProfileContent data={data} />;
}
```

---

## أمثلة متقدمة

### استخدام Skeleton في Grid:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <SkeletonCard count={6} animation="wave" />
</div>
```

### استخدام Skeleton مع Suspense:
```tsx
import { Suspense } from 'react';
import { SkeletonCard } from '@/components/shared/Skeleton';

function MyComponent() {
  return (
    <Suspense fallback={<SkeletonCard count={3} />}>
      <LazyComponent />
    </Suspense>
  );
}
```

### إنشاء skeleton مخصص:
```tsx
import { Skeleton } from '@/components/shared/Skeleton';

function CustomSkeleton() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <div className="flex items-center gap-4 mb-4">
        <Skeleton variant="circular" width={64} height={64} />
        <div className="flex-1">
          <Skeleton height={24} width="60%" className="mb-2" />
          <Skeleton height={16} width="40%" />
        </div>
      </div>
      <Skeleton lines={4} />
    </div>
  );
}
```

---

## ملاحظات

1. **الحركة**: يدعم المكتبة ثلاثة أنواع من الحركات:
   - `pulse`: حركة نبض (الافتراضي)
   - `wave`: حركة موجية
   - `none`: بدون حركة

2. **التخصيص**: جميع المكونات تدعم فئات Tailwind CSS الإضافية عبر prop `className`

3. **الاستجابة**: المكونات مصممة لتكون متجاوبة وتعمل على جميع أحجام الشاشات

4. **الأداء**: المكونات خفيفة ولا تؤثر على أداء التطبيق

---

## الخلاصة

استخدم مكونات Skeleton لتحسين تجربة المستخدم أثناء تحميل البيانات. اختر المكون المناسب بناءً على نوع المحتوى الذي تعرضه.
