# Custom Hooks - React Native/Expo

مجموعة من الـ Custom Hooks المُصممة لتطبيق المدرسة القرآنية على React Native.

## 📁 الملفات

### 🔐 Authentication Hooks

#### `useAuth.ts`

- **الغرض**: الوصول إلى بيانات المستخدم المُسجّل ووظائف المصادقة
- **الاستخدام**:

```typescript
const { user, token, loading, login, logout } = useAuth();
const role = useRole(); // shortcut للحصول على الرول فقط
```

#### `useUserStatus.ts`

- **الغرض**: الوصول إلى حالة المستخدم (online/offline/away)
- **الاستخدام**:

```typescript
const { onlineUsers, userStatuses, sendStatusUpdate } = useUserStatus();
```

---

### 🧭 Navigation & Layout Hooks

#### `useRoleLayout.ts`

- **الغرض**: إدارة عناصر القائمة (Navigation) حسب رول المستخدم
- **التكيّف**: `lucide-react` → `lucide-react-native`
- **الاستخدام**:

```typescript
const { navItems, navGroups, getPageInfo, getRoleLabel, userRole } =
  useRoleLayout();

// navGroups: مجموعات منظمة حسب الفئة
// navItems: قائمة مسطحة لجميع العناصر
// getPageInfo(pathname): معلومات الصفحة الحالية
// getRoleLabel(role): اسم الرول بالعربية
```

**مثال على الاستخدام**:

```typescript
// للحصول على عناصر القائمة
navGroups.map(group => (
  <View key={group.title}>
    <Text>{group.title}</Text>
    {group.items.map(item => {
      const Icon = item.icon;
      return (
        <TouchableOpacity key={item.to} onPress={() => navigate(item.to)}>
          <Icon size={20} />
          <Text>{item.label}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
))
```

---

### 🔔 Notification Hooks

#### `useFirebaseMessaging.ts`

- **الغرض**: إدارة Push Notifications في React Native
- **التكيّف الرئيسي**: Firebase Web → Expo Notifications
- **الاستخدام**:

```typescript
const {
  isPermissionGranted,
  expoPushToken,
  requestPermission,
  lastNotification,
} = useFirebaseMessaging();

// طلب الصلاحيات
await requestPermission();

// استخدام آخر إشعار
useEffect(() => {
  if (lastNotification) {
    console.log("New notification:", lastNotification);
  }
}, [lastNotification]);
```

**ملاحظات هامة**:

- يتطلب جهاز حقيقي (لا يعمل على المحاكي)
- يحتاج `projectId` في `app.json` للعمل مع Expo Push Notifications
- يُسجّل Token تلقائياً مع الباكيند عند تسجيل الدخول

**الإعداد المطلوب في `app.json`**:

```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "your-expo-project-id"
      }
    }
  }
}
```

---

### 🎨 UI Hooks

#### `useDisableBodyScroll.ts`

- **الغرض**: تعطيل الـ scroll عند فتح Modal (للتوافق مع الويب)
- **ملاحظة**: في React Native، Modal يمنع التفاعل تلقائياً
- **الاستخدام** (للتوافق فقط):

```typescript
useDisableBodyScroll(isModalOpen);
```

**بدلاً من ذلك**: استخدم `scrollEnabled={!isModalOpen}` في ScrollView

---

### 🎨 Expo Default Hooks

#### `use-color-scheme.ts` و `use-theme-color.ts`

- **الغرض**: إدارة الـ Dark Mode والألوان
- **المصدر**: Expo defaults (لا تحتاج تعديل)

---

## 📦 التبعيات المطلوبة

```json
{
  "expo-notifications": "~0.29.14",
  "expo-device": "~7.0.4",
  "lucide-react-native": "^0.x.x",
  "@react-native-async-storage/async-storage": "^1.23.1",
  "socket.io-client": "^4.5.0"
}
```

### التثبيت:

```bash
npx expo install expo-notifications expo-device
npm install lucide-react-native socket.io-client
```

---

## 🔄 التكيفات الرئيسية من Web إلى React Native

| Web                   | React Native          | الملف                |
| --------------------- | --------------------- | -------------------- |
| `lucide-react`        | `lucide-react-native` | useRoleLayout        |
| Firebase Web SDK      | Expo Notifications    | useFirebaseMessaging |
| `document.body.style` | No-op (Modal handles) | useDisableBodyScroll |
| `window.Notification` | `expo-notifications`  | useFirebaseMessaging |

---

## 🚀 الاستخدام في التطبيق

### في `app/_layout.tsx`:

```typescript
import { AuthProvider } from '../Context/AuthContext';
import { UserStatusProvider } from '../Context/UserStatusContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <UserStatusProvider>
        {/* ... */}
      </UserStatusProvider>
    </AuthProvider>
  );
}
```

### في أي Component:

```typescript
import { useAuth, useRoleLayout, useFirebaseMessaging } from '../hooks';

function MyScreen() {
  const { user } = useAuth();
  const { navItems } = useRoleLayout();
  const { requestPermission } = useFirebaseMessaging();

  return (
    <View>
      <Text>مرحباً {user?.firstName}</Text>
      {/* ... */}
    </View>
  );
}
```

---

## ✅ حالة الملفات

| Hook                 | الحالة  | الملاحظات                  |
| -------------------- | ------- | -------------------------- |
| useAuth              | ✅ جاهز | مُبسّط (بدون react-router) |
| useUserStatus        | ✅ جاهز | يعمل مع Context            |
| useRoleLayout        | ✅ جاهز | أيقونات RN متوافقة         |
| useDisableBodyScroll | ✅ جاهز | No-op (للتوافق)            |
| useFirebaseMessaging | ✅ جاهز | ⚠️ يحتاج projectId         |

---

## ⚠️ ملاحظات هامة

### useFirebaseMessaging:

1. **لا يعمل على المحاكي**: يتطلب جهاز حقيقي للاختبار
2. **ProjectId مطلوب**: أضف `projectId` في `app.json`
3. **Permissions**: يطلب الصلاحيات تلقائياً عند استدعاء `requestPermission()`

### useRoleLayout:

1. **الأيقونات**: استخدم `<Icon size={20} color="..." />` في React Native
2. **التنقل**: استخدم `router.push()` من Expo Router بدلاً من `react-router`

### useAuth:

1. **لا يحتوي على navigate**: تمت إزالة `useNavigate` dependency
2. **AsyncStorage**: جميع العمليات async

---

## 📝 TODO

- [ ] إضافة `projectId` في `app.json` لـ Expo Notifications
- [ ] اختبار useFirebaseMessaging على جهاز حقيقي
- [ ] إضافة navigation handling في useFirebaseMessaging (عند النقر على إشعار)
- [ ] إضافة useKeyboard و useNotifications hooks (إذا كانت موجودة في Frontend)

---

## 🔗 الملفات المرتبطة

- **Context**: `../Context/AuthContext.tsx`, `../Context/UserStatusContext.tsx`
- **Socket**: `../Socket/SocketManager.ts`, `../Socket/StatusSocket.ts`
- **API**: `../Api/api.ts`

---

تم النسخ والتكيّف من `Frontend/src/hooks/` ✨
