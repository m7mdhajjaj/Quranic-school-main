# دليل استخدام المكونات - Components Guide

## 📁 الهيكل الجديد للمكونات

تم إعادة تنظيم جميع المكونات في مجلدات منطقية لتسهيل الاستخدام والصيانة.

## 🎯 كيفية الاستيراد

### ✅ الطريقة الصحيحة (بعد إعادة التنظيم)

```typescript
// استيراد من مجلد Form
import { Input, Button, Select, Textarea } from '../components/shared/Form';

// استيراد من مجلد UI
import { Card, Modal, Alert, Badge, Table } from '../components/shared/UI';

// استيراد من مجلد Feedback
import { LoadingSpinner, ProgressBar } from '../components/shared/Feedback';

// استيراد من مجلد common
import { Avatar, MarksBarChart } from '../components/common';

// استيراد من مجلد utils
import { showToast, showAlert } from '../components/utils';
```

### ❌ الطريقة القديمة (لا تستخدم بعد الآن)

```typescript
// هذه المسارات لم تعد صحيحة
import { Input } from '../components/shared/Input';
import { Button } from '../components/shared/Button';
import { Card } from '../components/shared/Card';
```

## 📚 قائمة المكونات حسب المجلدات

### 1️⃣ Form Components (`shared/Form/`)
مكونات النماذج وإدخال البيانات

```typescript
import { 
  Input,           // حقل إدخال نصي
  Select,          // قائمة منسدلة
  Textarea,        // مربع نص متعدد الأسطر
  Button,          // زر
  ToggleSwitch,    // مفتاح تبديل
  RangeSlider,     // شريط تمرير
  ImageUpload,     // رفع صورة
  AvatarUpload     // رفع صورة شخصية
} from '../components/shared/Form';
```

**مثال استخدام:**
```typescript
<Input 
  label="الاسم"
  value={name}
  onChange={(e) => setName(e.target.value)}
/>

<Button variant="primary" onClick={handleSubmit}>
  حفظ
</Button>
```

### 2️⃣ UI Components (`shared/UI/`)
مكونات واجهة المستخدم الأساسية

```typescript
import { 
  Card,           // بطاقة
  Modal,          // نافذة منبثقة
  Alert,          // تنبيه
  Badge,          // شارة
  Tabs,           // تبويبات
  Table,          // جدول
  Tooltip,        // تلميح
  EmptyState,     // حالة فارغة
  UserStatus      // حالة المستخدم
} from '../components/shared/UI';
```

**استيراد أنواع Table:**
```typescript
import { Table } from '../components/shared/UI';
import type { Column } from '../components/shared/UI/Table';
```

**مثال استخدام:**
```typescript
<Card title="العنوان">
  <p>المحتوى هنا</p>
</Card>

<Modal isOpen={isOpen} onClose={handleClose}>
  <h2>عنوان النافذة</h2>
</Modal>
```

### 3️⃣ Feedback Components (`shared/Feedback/`)
مكونات التغذية الراجعة والتقدم

```typescript
import { 
  LoadingSpinner,  // دوار تحميل
  ProgressBar,     // شريط تقدم
  ProgressCircle   // دائرة تقدم
} from '../components/shared/Feedback';
```

**مثال استخدام:**
```typescript
{loading && <LoadingSpinner />}

<ProgressBar value={75} max={100} />
```

### 4️⃣ Layout Components (`shared/Layout/`)
مكونات التخطيط والهيكل

```typescript
import { 
  Layout,         // تخطيط عام
  Header,         // رأس الصفحة
  AdminHeader,    // رأس صفحة الإدارة
  Footer,         // تذييل الصفحة
  PageHeader      // رأس صفحة داخلية
} from '../components/shared/Layout';
```

**مثال استخدام:**
```typescript
<Layout>
  <PageHeader title="العنوان" />
  <div>المحتوى</div>
</Layout>
```

### 5️⃣ Filter Components (`shared/Filter/`)
مكونات الفلترة والبحث

```typescript
import { 
  FilterContainer,
  FilterButtons,
  FilterChips,
  FilterSelect,
  AdvancedFilter,
  SearchInput
} from '../components/shared/Filter';
```

### 6️⃣ Navigation Components (`shared/Navigation/`)
مكونات التنقل

```typescript
import { 
  ResponsivePagination  // ترقيم الصفحات
} from '../components/shared/Navigation';
```

**مثال استخدام:**
```typescript
<ResponsivePagination
  currentPage={page}
  totalPages={totalPages}
  onPageChange={setPage}
/>
```

### 7️⃣ Auth Components (`shared/Auth/`)
مكونات المصادقة والأمان

```typescript
import { 
  AuthBackground,
  PasswordRequirements,
  PasswordStrengthIndicator,
  SecurityTips
} from '../components/shared/Auth';
```

### 8️⃣ Animation Components (`shared/Animation/`)
مكونات الحركة والتأثيرات

```typescript
import { Reveal } from '../components/shared/Animation';
```

### 9️⃣ Features Components (`shared/Features/`)
مكونات الميزات الخاصة

```typescript
import { 
  FeatureList,
  StatCard,
  Logo
} from '../components/shared/Features';
```

### 🔟 Theme Components (`shared/Theme/`)
مكونات الثيم والمظهر

```typescript
import { ThemeToggle } from '../components/shared/Theme';
```

### 1️⃣1️⃣ Common Components (`common/`)
مكونات مشتركة عامة

```typescript
import { 
  AddedAgo,                    // عرض الوقت منذ
  Avatar,                      // صورة شخصية
  FormatTime12Arabic,          // تنسيق الوقت
  IsTimeWithinAllowedRange,    // التحقق من الوقت
  MarksBarChart                // مخطط الدرجات
} from '../components/common';
```

**مثال استخدام:**
```typescript
<Avatar 
  src={userAvatar} 
  alt={userName}
  size="md"
/>

<AddedAgo date={createdAt} />
```

### 1️⃣2️⃣ Utils (`utils/`)
دوال مساعدة

```typescript
import { 
  showToast,
  showSuccessToast,
  showErrorToast
} from '../components/utils/toastUtils';

import { 
  showSuccessMessage,
  showErrorMessage,
  showCenteredSwal
} from '../components/utils/sweetalertUtils';

import { 
  showLogoutConfirmation,
  handleLogout
} from '../components/utils/logoutUtils';
```

**مثال استخدام:**
```typescript
// عرض toast
showSuccessToast('تم الحفظ بنجاح');
showErrorToast('حدث خطأ');

// عرض SweetAlert
showSuccessMessage('تمت العملية بنجاح');
showErrorMessage('فشلت العملية');

// تسجيل خروج
await showLogoutConfirmation();
```

## 🔄 جدول التحويل السريع

| المسار القديم | المسار الجديد |
|--------------|---------------|
| `../components/Input` | `../components/shared/Form` |
| `../components/Button` | `../components/shared/Form` |
| `../components/Select` | `../components/shared/Form` |
| `../components/Card` | `../components/shared/UI` |
| `../components/Modal` | `../components/shared/UI` |
| `../components/Alert` | `../components/shared/UI` |
| `../components/Table` | `../components/shared/UI` |
| `../components/LoadingSpinner` | `../components/shared/Feedback` |
| `../components/ProgressBar` | `../components/shared/Feedback` |
| `../components/Avatar` | `../components/common` |
| `../components/ResponsivePagination` | `../components/shared/Navigation` |
| `../components/PageHeader` | `../components/shared/Layout` |
| `../components/toastUtils` | `../components/utils/toastUtils` |
| `../components/sweetalertUtils` | `../components/utils/sweetalertUtils` |

## 📝 أمثلة عملية

### مثال 1: صفحة تسجيل دخول

```typescript
import { Card } from '../components/shared/UI';
import { Input, Button } from '../components/shared/Form';
import { Logo } from '../components/shared/Features';
import { AuthBackground } from '../components/shared/Auth';
import { showSuccessMessage, showErrorMessage } from '../components/utils/sweetalertUtils';

function LoginPage() {
  return (
    <AuthBackground>
      <Card>
        <Logo />
        <Input label="البريد الإلكتروني" type="email" />
        <Input label="كلمة المرور" type="password" />
        <Button onClick={handleLogin}>تسجيل الدخول</Button>
      </Card>
    </AuthBackground>
  );
}
```

### مثال 2: صفحة قائمة بيانات

```typescript
import { Card } from '../components/shared/UI';
import { SearchInput } from '../components/shared/Filter';
import { Table } from '../components/shared/UI';
import type { Column } from '../components/shared/UI/Table';
import { ResponsivePagination } from '../components/shared/Navigation';
import { LoadingSpinner } from '../components/shared/Feedback';

function DataList() {
  if (loading) return <LoadingSpinner />;
  
  return (
    <Card>
      <SearchInput onSearch={handleSearch} />
      <Table columns={columns} data={data} />
      <ResponsivePagination 
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </Card>
  );
}
```

### مثال 3: نموذج بيانات

```typescript
import { Modal, Card } from '../components/shared/UI';
import { Input, Select, Button } from '../components/shared/Form';
import { showSuccessToast } from '../components/utils/toastUtils';

function DataForm({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Card>
        <Input label="الاسم" value={name} onChange={handleNameChange} />
        <Select label="الفئة" options={categories} />
        <Button onClick={handleSubmit}>حفظ</Button>
      </Card>
    </Modal>
  );
}
```

## 🎨 Skeleton Components

للتحميل الهيكلي، استخدم:

```typescript
import { 
  SkeletonBox,
  SkeletonText,
  SkeletonAvatar,
  SkeletonButton
} from '../components/shared/Skeleton/Base';

import { SkeletonTable } from '../components/shared/Skeleton/Table';
import { SkeletonCard } from '../components/shared/Skeleton/Image';
import { SkeletonForm } from '../components/shared/Skeleton/Form';
```

## ⚠️ ملاحظات هامة

1. **الاستيراد المجمع**: يمكنك استيراد عدة مكونات من نفس المجلد في سطر واحد
2. **Type Imports**: عند استيراد الأنواع من Table، استخدم مسار محدد
3. **Default vs Named**: معظم المكونات تستخدم named exports ما عدا بعض الاستثناءات
4. **Utils**: جميع الدوال المساعدة في `components/utils`

## 🚀 فوائد الهيكل الجديد

✅ تنظيم أفضل وأوضح  
✅ سهولة في البحث عن المكونات  
✅ تقليل تكرار الكود  
✅ استيرادات أقصر وأوضح  
✅ صيانة أسهل  
✅ إضافة مكونات جديدة أسرع  

## 📞 المساعدة

في حال واجهت مشكلة في العثور على مكون:
1. تحقق من هذا الدليل
2. ابحث في الملف `COMPONENTS_STRUCTURE.md`
3. راجع ملفات `index.ts` في كل مجلد
