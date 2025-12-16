# Context - إدارة الحالة العامة 🔄

مجلد يحتوي على جميع Context Providers لإدارة الحالة العامة في التطبيق.

## 📁 الملفات

```
Context/
├── AuthContext.tsx          # إدارة المصادقة والمستخدم
├── UserStatusContext.tsx    # إدارة حالة المستخدمين (Online/Offline)
├── index.ts                 # تصدير مركزي
└── README.md                # هذا الملف
```

---

## 🔐 AuthContext

إدارة المصادقة، تسجيل الدخول/الخروج، وحالة المستخدم.

### الواجهة (Interface):

```typescript
interface AuthContextType {
  // الحالة
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  socket: Socket | null;

  // الوظائف
  login: (userData: User, authToken: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;

  // المساعدات
  isStudent: () => boolean;
  isTeacher: () => boolean;
  isAdmin: () => boolean;
  getUserName: () => string;
  getUserId: () => string;
}
```

### الاستخدام:

#### 1. إضافة Provider في App:

```typescript
import { AuthProvider } from '@/Context';

export default function RootLayout() {
  return (
    <AuthProvider>
      {/* باقي التطبيق */}
    </AuthProvider>
  );
}
```

#### 2. استخدام في المكونات:

```typescript
import { useAuth } from '@/hooks';

function ProfileScreen() {
  const { user, isAuthenticated, logout, getUserName } = useAuth();

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <View>
      <Text>مرحباً {getUserName()}</Text>
      <Text>البريد: {user?.email}</Text>
      <Button title="تسجيل خروج" onPress={logout} />
    </View>
  );
}
```

#### 3. التحقق من الدور:

```typescript
import { useAuth } from '@/hooks';

function AdminPanel() {
  const { isAdmin, isTeacher, isStudent } = useAuth();

  if (isAdmin()) {
    return <AdminDashboard />;
  }

  if (isTeacher()) {
    return <TeacherDashboard />;
  }

  if (isStudent()) {
    return <StudentDashboard />;
  }

  return <AccessDenied />;
}
```

### الميزات الرئيسية:

✅ **AsyncStorage Persistence** - حفظ البيانات محلياً
✅ **Auto Token Verification** - التحقق التلقائي من صلاحية التوكن
✅ **Socket Integration** - اتصال تلقائي بـ Socket عند الدخول
✅ **Auto Logout** - تسجيل خروج تلقائي عند انتهاء الجلسة (كل 5 دقائق)
✅ **Clean Storage** - تنظيف كامل للبيانات عند الخروج

---

## 👥 UserStatusContext

إدارة حالة المستخدمين (متصل/غير متصل) مع تحديثات فورية عبر Socket.

### الواجهة (Interface):

```typescript
interface UserStatusContextType {
  userStatus: UserStatusState;
  userStatuses: Record<string, UserStatusState>;
  getUserStatus: (userId?: string) => UserStatusState;
  refreshStatus: () => void;
}

interface UserStatusState {
  isActive: boolean;
  lastSeen?: Date;
  isLoading: boolean;
}
```

### الاستخدام:

#### 1. إضافة Provider في App:

```typescript
import { AuthProvider, UserStatusProvider } from '@/Context';

export default function RootLayout() {
  return (
    <AuthProvider>
      <UserStatusProvider>
        {/* باقي التطبيق */}
      </UserStatusProvider>
    </AuthProvider>
  );
}
```

**ملاحظة:** يجب أن يكون `UserStatusProvider` داخل `AuthProvider`.

#### 2. عرض حالة المستخدم:

```typescript
import { useUserStatus } from '@/hooks';
import { View, Text } from 'react-native';

function UserCard({ userId, name }) {
  const { getUserStatus } = useUserStatus();
  const status = getUserStatus(userId);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {/* نقطة الحالة */}
      <View
        style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: status.isActive ? '#10b981' : '#6b7280',
        }}
      />

      <Text>{name}</Text>

      {!status.isActive && status.lastSeen && (
        <Text style={{ fontSize: 12, color: '#6b7280' }}>
          آخر ظهور: {formatArabicDate(status.lastSeen)}
        </Text>
      )}
    </View>
  );
}
```

#### 3. قائمة المستخدمين مع الحالة:

```typescript
import { useUserStatus } from '@/hooks';
import { FlatList } from 'react-native';

function UsersList({ users }) {
  const { userStatuses } = useUserStatus();

  return (
    <FlatList
      data={users}
      renderItem={({ item }) => {
        const status = userStatuses[item._id];
        return (
          <UserCard
            user={item}
            isOnline={status?.isActive}
          />
        );
      }}
    />
  );
}
```

### الميزات الرئيسية:

✅ **Real-time Updates** - تحديثات فورية عبر Socket
✅ **Smart Caching** - تخزين ذكي للحالات
✅ **Auto Refresh** - تحديث تلقائي عند الحاجة
✅ **Optimized Rendering** - تجنب إعادة الرندر غير الضرورية
✅ **Error Handling** - معالجة أخطاء API بشكل صامت

---

## 🔄 التكامل بين Contexts

### إعداد كامل في App:

```typescript
import { AuthProvider, UserStatusProvider } from '@/Context';
import { NavigationContainer } from '@react-navigation/native';

export default function App() {
  return (
    <AuthProvider>
      <UserStatusProvider>
        <NavigationContainer>
          {/* باقي التطبيق */}
        </NavigationContainer>
      </UserStatusProvider>
    </AuthProvider>
  );
}
```

### استخدام متعدد:

```typescript
import { useAuth, useUserStatus } from '@/hooks';

function ChatScreen() {
  const { user, isAuthenticated } = useAuth();
  const { getUserStatus, refreshStatus } = useUserStatus();

  const recipientStatus = getUserStatus(recipientId);

  return (
    <View>
      <Text>الدردشة مع {recipientName}</Text>
      {recipientStatus.isActive ? (
        <Text style={{ color: 'green' }}>متصل الآن</Text>
      ) : (
        <Text style={{ color: 'gray' }}>غير متصل</Text>
      )}
    </View>
  );
}
```

---

## 📦 التعديلات من Frontend

### الفروقات الرئيسية:

| الميزة     | Frontend                  | Mobile                            |
| ---------- | ------------------------- | --------------------------------- |
| Storage    | `localStorage`            | `AsyncStorage`                    |
| Navigation | `window.location.href`    | React Navigation                  |
| Functions  | Sync                      | Async (login, logout, updateUser) |
| Cleanup    | `window.addEventListener` | React useEffect cleanup           |

### التعديلات المطبقة:

1. ✅ **AsyncStorage** بدلاً من localStorage
2. ✅ **async/await** لجميع عمليات التخزين
3. ✅ **إزالة window events** (beforeunload)
4. ✅ **إزالة window.location** redirect
5. ✅ **استخدام setTimeout** بدلاً من requestAnimationFrame

---

## 🎯 Best Practices

### 1. استخدم Custom Hooks:

```typescript
// ✅ صحيح
import { useAuth } from "@/hooks";

// ❌ خطأ - لا تستخدم Context مباشرة
import { AuthContext } from "@/Context";
```

### 2. تحقق من Authentication:

```typescript
function ProtectedScreen() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <Dashboard />;
}
```

### 3. تنظيف عند Unmount:

```typescript
useEffect(() => {
  const { refreshStatus } = useUserStatus();

  // تحديث عند mount
  refreshStatus();

  // تنظيف عند unmount
  return () => {
    // أي تنظيف مطلوب
  };
}, []);
```

---

## ⚠️ ملاحظات مهمة

1. **الترتيب مهم**: `UserStatusProvider` يجب أن يكون داخل `AuthProvider`
2. **AsyncStorage**: جميع عمليات التخزين async
3. **Socket Connection**: يتم تلقائياً عند login
4. **Token Expiry**: يتم التحقق كل 5 دقائق
5. **Auto Logout**: عند انتهاء صلاحية التوكن

---

## 🚀 أمثلة متقدمة

### مثال: Login Screen

```typescript
import { useAuth } from '@/hooks';
import { useState } from 'react';

function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await loginApi(email, password);
      await login(response.user, response.token);
      // Navigation سيحدث تلقائياً
    } catch (error) {
      Alert.alert('خطأ', 'فشل تسجيل الدخول');
    }
  };

  return (
    <View>
      <TextInput value={email} onChangeText={setEmail} />
      <TextInput value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="دخول" onPress={handleLogin} />
    </View>
  );
}
```

### مثال: Profile Update

```typescript
import { useAuth } from '@/hooks';

function EditProfileScreen() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.firstName || '');

  const handleSave = async () => {
    await updateUser({ firstName: name });
    Alert.alert('نجاح', 'تم تحديث الملف الشخصي');
  };

  return (
    <View>
      <TextInput value={name} onChangeText={setName} />
      <Button title="حفظ" onPress={handleSave} />
    </View>
  );
}
```

---

## 📊 الإحصائيات

- **الملفات**: 3 ملفات
- **Contexts**: 2 (Auth + UserStatus)
- **Hooks مرتبطة**: useAuth, useUserStatus
- **Socket Integration**: ✅ نعم
- **AsyncStorage**: ✅ نعم
- **TypeScript**: ✅ كامل

---

تم التحديث: 2025-12-16
الحالة: ✅ منسوخ من Frontend ومُعدَّل لـ React Native
