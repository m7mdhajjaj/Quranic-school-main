# Loading Skeletons Documentation

## 📖 نظرة عامة

مكونات التحميل (Loading Skeletons) هي مكونات UI تُظهر للمستخدم شكلاً مرئياً لما سيبدو عليه المحتوى أثناء تحميل البيانات من الخادم. هذا يحسن من تجربة المستخدم ويقلل من الشعور بالانتظار.

## 🎨 الميزات المتاحة

### ✨ تأثيرات بصرية متقدمة
- **Shimmer Animation**: تأثير لامع ينتقل عبر العناصر
- **Gradient Backgrounds**: خلفيات متدرجة جميلة
- **Floating Elements**: عناصر تطفو بسلاسة
- **Glow Effects**: تأثيرات توهج للعناصر التفاعلية
- **Multi-layered Spinners**: مؤشرات تحميل متعددة الطبقات

### 🎯 استجابة تامة
- تصميم متجاوب يعمل على جميع أحجام الشاشات
- دعم الوضع المظلم (Dark Mode)
- دعم تقليل الحركة (Reduced Motion) للمستخدمين الذين يفضلون ذلك

## 🔧 المكونات المتاحة

### 1. **DashboardSkeleton**
مكون تحميل لوحة التحكم الرئيسية
```tsx
import { DashboardSkeleton } from '../components/Loading/LoadingSkeleton';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);

  if (loading) return <DashboardSkeleton />;
  
  return <div>محتوى لوحة التحكم</div>;
};
```

### 2. **ProfilePageSkeleton**
مكون تحميل الصفحة الشخصية الكاملة
```tsx
import { ProfilePageSkeleton } from '../components/Loading/LoadingSkeleton';

const Profile = () => {
  const [loading, setLoading] = useState(true);

  if (loading) return <ProfilePageSkeleton />;
  
  return <div>محتوى الصفحة الشخصية</div>;
};
```

### 3. **ChatSkeleton**
مكون تحميل صفحة الدردشة
```tsx
import { ChatSkeleton } from '../components/Loading/LoadingSkeleton';

const Chat = () => {
  const [loading, setLoading] = useState(true);

  if (loading) return <ChatSkeleton />;
  
  return <div>محتوى الدردشة</div>;
};
```

### 4. **ActivitySkeleton**
مكون تحميل صفحة الأنشطة
```tsx
import { ActivitySkeleton } from '../components/Loading/LoadingSkeleton';
```

### 5. **NewsSkeleton**
مكون تحميل صفحة الأخبار
```tsx
import { NewsSkeleton } from '../components/Loading/LoadingSkeleton';
```

### 6. **TestSkeleton**
مكون تحميل صفحة الامتحانات
```tsx
import { TestSkeleton } from '../components/Loading/LoadingSkeleton';
```

### 7. **AbsenceSkeleton**
مكون تحميل صفحة الغياب
```tsx
import { AbsenceSkeleton } from '../components/Loading/LoadingSkeleton';
```

### 8. **GoalsSkeleton**
مكون تحميل صفحة الأهداف
```tsx
import { GoalsSkeleton } from '../components/Loading/LoadingSkeleton';
```

### 9. **DailyMarksSkeleton**
مكون تحميل صفحة الدرجات اليومية
```tsx
import { DailyMarksSkeleton } from '../components/Loading/LoadingSkeleton';
```

### 10. **ArrangementSkeleton**
مكون تحميل صفحة الترتيب
```tsx
import { ArrangementSkeleton } from '../components/Loading/LoadingSkeleton';
```

### 11. **QuranPageSkeleton**
مكون تحميل صفحة القرآن الرئيسية
```tsx
import { QuranPageSkeleton } from '../components/Loading/LoadingSkeleton';
```

### 12. **QuranReadingSkeleton**
مكون تحميل صفحة قراءة القرآن
```tsx
import { QuranReadingSkeleton } from '../components/Loading/LoadingSkeleton';
```

### 13. **QuranAudioSkeleton**
مكون تحميل صفحة الاستماع للقرآن
```tsx
import { QuranAudioSkeleton } from '../components/Loading/LoadingSkeleton';
```

### 14. **ReportsSkeleton**
مكون تحميل صفحة التقارير
```tsx
import { ReportsSkeleton } from '../components/Loading/LoadingSkeleton';
```

### 15. **LoadingSkeleton** (المكون الافتراضي)
مكون تحميل عام قابل للتخصيص
```tsx
import LoadingSkeleton from '../components/Loading/LoadingSkeleton';

const CustomComponent = () => {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return (
      <LoadingSkeleton 
        title="جاري تحميل بيانات الطلاب..." 
        description="الرجاء الانتظار بينما نقوم بجلب أحدث البيانات"
      />
    );
  }

  return <div>المحتوى</div>;
};
```

## 🎨 كلاسات CSS المتاحة

يمكنك استخدام هذه الكلاسات مع عناصر HTML مخصصة:

### تأثيرات Shimmer
```css
.shimmer          /* تأثير رمادي أساسي */
.shimmer-alt      /* تأثير أزرق فاتح */
.shimmer-gold     /* تأثير ذهبي */
.shimmer-gradient /* تأثير متدرج ملون */
```

### تأثيرات الحركة
```css
.float           /* حركة طفو أساسية */
.float-delayed   /* حركة طفو مؤخرة */
.glow-blue       /* توهج أزرق */
.bounce-gentle   /* ارتداد لطيف */
```

### عناصر التحميل المخصصة
```css
.loading-spinner  /* مؤشر تحميل دائري */
.loading-dots     /* نقاط تحميل */
.skeleton-card    /* بطاقة هيكلية */
.skeleton-avatar  /* صورة شخصية هيكلية */
.skeleton-progress /* شريط تقدم هيكلي */
```

## 📝 أمثلة متقدمة

### استخدام مشروط للتحميل
```tsx
const MyComponent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (error) return <ErrorComponent error={error} />;
  
  return <DataComponent data={data} />;
};
```

### تحميل أجزاء مختلفة من الصفحة
```tsx
const ComplexPage = () => {
  const [userLoading, setUserLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);

  return (
    <div>
      {userLoading ? (
        <ProfileCardSkeleton />
      ) : (
        <UserProfile />
      )}
      
      {dataLoading ? (
        <ActivitySkeleton />
      ) : (
        <ActivityList />
      )}
    </div>
  );
};
```

### تخصيص النصوص
```tsx
const CustomLoading = () => (
  <LoadingSkeleton
    title="جاري تحضير الامتحان..."
    description="نقوم بتجهيز أسئلة الامتحان وضبط الإعدادات"
  />
);
```

## 🔧 التخصيص

### إضافة تأثيرات جديدة
يمكنك إضافة تأثيرات جديدة في ملف `LoadingSkeleton.css`:

```css
@keyframes custom-animation {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.custom-effect {
  animation: custom-animation 2s ease-in-out infinite;
}
```

### إنشاء مكون تحميل مخصص
```tsx
const CustomSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50" dir="rtl">
      {/* محتوى مخصص */}
      <div className="shimmer-alt rounded-lg h-8 w-64 mb-4"></div>
      <div className="shimmer rounded h-4 w-48"></div>
    </div>
  );
};
```

## 🎯 أفضل الممارسات

### 1. **استخدم المكون المناسب**
```tsx
// ✅ جيد - استخدام مكون مخصص للصفحة
<DashboardSkeleton />

// ❌ سيء - استخدام مكون عام لكل شيء
<LoadingSkeleton />
```

### 2. **اجعل الهيكل مطابقاً للمحتوى الحقيقي**
```tsx
// ✅ جيد - هيكل مماثل للمحتوى الفعلي
const ProductSkeleton = () => (
  <div className="product-card">
    <div className="shimmer h-48 w-full mb-4"></div> {/* صورة المنتج */}
    <div className="shimmer h-6 w-3/4 mb-2"></div>   {/* اسم المنتج */}
    <div className="shimmer h-4 w-1/2"></div>        {/* السعر */}
  </div>
);
```

### 3. **استخدم أوقات تحميل واقعية**
```tsx
// ✅ جيد - عرض التحميل للعمليات الطويلة فقط
useEffect(() => {
  const timer = setTimeout(() => {
    if (loading) setShowSkeleton(true);
  }, 300); // عرض التحميل بعد 300ms

  return () => clearTimeout(timer);
}, [loading]);
```

## 🚀 النشر والأداء

- جميع التأثيرات محسنة للأداء
- استخدام CSS animations بدلاً من JavaScript
- دعم المعالجات الضعيفة من خلال `prefers-reduced-motion`
- أحجام صغيرة للملفات

## 📱 الدعم

- ✅ جميع المتصفحات الحديثة
- ✅ أجهزة الموبايل والتابلت  
- ✅ قارئات الشاشة
- ✅ الوضع المظلم
- ✅ RTL (الكتابة من اليمين لليسار)

---

**ملاحظة**: تأكد من استيراد ملف CSS في المكون الرئيسي:
```tsx
import './LoadingSkeleton.css';
```