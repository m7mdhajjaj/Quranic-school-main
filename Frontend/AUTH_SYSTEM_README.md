# نظام إدارة المصادقة العالمي (Global Auth System)

نظام شامل لإدارة المصادقة في التطبيق باستخدام React Context و Hooks مخصصة.

## 🚀 المميزات الرئيسية

### ✅ **إدارة حالة عالمية للمصادقة**
- تتبع حالة تسجيل الدخول في جميع أنحاء التطبيق
- تحديث تلقائي للحالة عند تسجيل الدخول/الخروج
- حفظ البيانات في localStorage تلقائياً

### ✅ **دعم جميع أنواع المستخدمين**
- الطلاب (`student`)
- المعلمين (`teacher`) 
- الإدارة (`admin`)

### ✅ **حماية المسارات (Route Protection)**
- منع الوصول للصفحات المحمية
- إعادة توجيه تلقائية لصفحة تسجيل الدخول
- فحص الأدوار والصلاحيات

### ✅ **أمان محسن**
- تشفير البيانات الحساسة
- إدارة JWT tokens
- مسح آمن للبيانات عند تسجيل الخروج

## 📁 بنية الملفات

```
src/
├── contexts/
│   └── AuthContext.tsx      # Context الرئيسي للمصادقة
├── hooks/
│   └── useAuth.ts          # Hooks مخصصة للمصادقة
├── components/
│   └── Loading.tsx         # مكون التحميل
└── pages/
    └── Login.tsx           # صفحة تسجيل الدخول (محدثة)
```

## 🔧 الاستخدام

### 1. **إعداد AuthProvider**

تم إضافة `AuthProvider` في `App.tsx` لتغطية جميع المكونات:

```tsx
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
```

### 2. **استخدام useAuth في أي مكون**

```tsx
import { useAuth } from '../hooks/useAuth';

const MyComponent = () => {
  const { 
    user, 
    isAuthenticated, 
    isLoading,
    login, 
    logout,
    isStudent,
    isTeacher,
    isAdmin 
  } = useAuth();

  if (isLoading) {
    return <div>جاري التحميل...</div>;
  }

  if (!isAuthenticated) {
    return <div>يرجى تسجيل الدخول</div>;
  }

  return (
    <div>
      <h1>مرحباً {user?.firstName || user?.name}!</h1>
      <p>نوع المستخدم: {user?.role}</p>
      
      {isStudent() && <div>محتوى خاص بالطلاب</div>}
      {isTeacher() && <div>محتوى خاص بالمعلمين</div>}
      {isAdmin() && <div>محتوى خاص بالإدارة</div>}
      
      <button onClick={logout}>تسجيل الخروج</button>
    </div>
  );
};
```

### 3. **حماية المسارات**

```tsx
import { useAuthGuard } from '../hooks/useAuth';

const ProtectedPage = () => {
  const { isAuthenticated, isLoading } = useAuthGuard('/login');

  if (isLoading) return <Loading />;
  if (!isAuthenticated) return null; // سيتم إعادة التوجه تلقائياً

  return <div>صفحة محمية</div>;
};
```

### 4. **التحقق من الأدوار**

```tsx
import { useRoleGuard } from '../hooks/useAuth';

const AdminOnlyPage = () => {
  const { hasPermission, isLoading } = useRoleGuard(['admin']);

  if (isLoading) return <Loading />;
  
  if (!hasPermission) {
    return <div>ليس لديك صلاحية للوصول لهذه الصفحة</div>;
  }

  return <div>صفحة الإدارة</div>;
};
```

## 🎯 API المتاحة

### AuthContext

```tsx
interface AuthContextType {
  // الحالة
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // الوظائف
  login: (userData: User, authToken: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  
  // المساعدات
  isStudent: () => boolean;
  isTeacher: () => boolean;
  isAdmin: () => boolean;
  getUserName: () => string;
  getUserId: () => string;
}
```

### Hooks المتاحة

#### `useAuth()`
- Hook رئيسي للوصول لجميع وظائف المصادقة

#### `useAuthGuard(redirectTo?)`
- حماية تلقائية للمسارات مع إعادة توجيه

#### `useRoleGuard(allowedRoles[])`
- التحقق من الأدوار والصلاحيات

## 🔄 تدفق العمل

### 1. **تسجيل الدخول**
```
المستخدم يدخل البيانات → 
API Call → 
login(userData, token) →
حفظ في localStorage →
تحديث الحالة العالمية →
إعادة التوجه للصفحة المناسبة
```

### 2. **تسجيل الخروج**
```
المستخدم يضغط تسجيل الخروج →
logout() →
مسح localStorage →
مسح الحالة العالمية →
إعادة التوجه لصفحة تسجيل الدخول
```

### 3. **حماية المسارات**
```
المستخدم يحاول الوصول لصفحة →
فحص isAuthenticated →
إذا false: إعادة توجه لـ /login →
إذا true: عرض الصفحة
```

## 🛡️ الأمان

### حماية البيانات
- جميع tokens محفوظة بأمان
- مسح تلقائي عند انتهاء الصلاحية
- تشفير البيانات الحساسة

### التحقق من الصحة
- فحص صحة البيانات قبل الحفظ
- التعامل مع الأخطاء بأمان
- إعادة تعيين الحالة عند الأخطاء

## 🔧 الإعدادات المخصصة

### تخصيص مدة تسجيل الدخول
```tsx
// يمكن إضافة إعدادات مخصصة للـ tokens
const authSettings = {
  tokenExpiry: 7 * 24 * 60 * 60 * 1000, // 7 أيام
  autoLogout: true,
  rememberMe: true
};
```

### تخصيص إعادة التوجه
```tsx
// تخصيص المسارات حسب نوع المستخدم
const getRedirectPath = (userRole: string) => {
  switch (userRole) {
    case 'admin': return '/admin';
    case 'teacher': return '/teacher-dashboard';
    case 'student': return '/student-dashboard';
    default: return '/';
  }
};
```

## ✅ المميزات المضافة

### ✅ **فلاغ isActive**
- تتبع حالة النشاط للمستخدم
- يصبح `true` عند تسجيل الدخول
- يصبح `false` عند تسجيل الخروج
- متاح في جميع أنحاء التطبيق

### ✅ **حالة التحميل المحسنة**
- شاشة تحميل أثناء فحص المصادقة
- منع وميض الشاشة
- تحسين تجربة المستخدم

### ✅ **إدارة أفضل للأخطاء**
- معالجة أخطاء localStorage
- إعادة تعيين الحالة عند البيانات التالفة
- رسائل خطأ واضحة

## 🚀 الخطوات القادمة

- [ ] إضافة نظام refresh tokens
- [ ] دعم 2FA (المصادقة الثنائية)
- [ ] تشفير محسن للبيانات
- [ ] نظام جلسات متقدم
- [ ] تتبع نشاط المستخدم