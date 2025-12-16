# Socket System - نظام الاتصال الفوري 🔌

نظام Socket.IO مركزي لإدارة الاتصالات الفورية (Real-time) في تطبيق React Native.

## 📁 الملفات

```
Socket/
├── SocketManager.ts     # المدير المركزي للاتصالات
├── StatusSocket.ts      # Hook لحالة المستخدمين (Online/Offline)
├── index.ts             # تصدير مركزي
└── README.md            # هذا الملف
```

---

## 🔌 SocketManager

المدير المركزي لجميع اتصالات Socket.IO في التطبيق.

### الميزات الرئيسية:

✅ **Singleton Pattern** - نسخة واحدة فقط في التطبيق
✅ **Auto Reconnection** - إعادة اتصال تلقائية (5 محاولات)
✅ **Heartbeat** - نبضات قلب كل 30 ثانية للحفاظ على الاتصال
✅ **Connection Callbacks** - الاشتراك في تحديثات حالة الاتصال
✅ **Event Management** - إدارة مركزية للأحداث

### الاستخدام الأساسي:

```typescript
import { socketManager } from "@/Socket";

// الاتصال
socketManager.connect(userId, userRole);

// التحقق من الاتصال
if (socketManager.isConnected()) {
  console.log("Connected!");
}

// إرسال حدث
socketManager.emit("myEvent", { data: "value" });

// الاستماع لحدث
socketManager.on("myEvent", (data) => {
  console.log("Received:", data);
});

// إزالة مستمع
socketManager.off("myEvent");

// قطع الاتصال
socketManager.disconnect();
```

### الاشتراك في تحديثات الاتصال:

```typescript
import { socketManager } from '@/Socket';
import { useEffect, useState } from 'react';

function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const unsubscribe = socketManager.onConnectionChange((connected) => {
      setIsOnline(connected);
    });

    return unsubscribe;
  }, []);

  return (
    <View>
      <Text>{isOnline ? '🟢 متصل' : '🔴 غير متصل'}</Text>
    </View>
  );
}
```

---

## 👥 StatusSocket (useUserStatusSocket)

Hook للاستماع لتحديثات حالة المستخدمين (Online/Offline) في الوقت الفعلي.

### الواجهة:

```typescript
const { isConnected, joinRoom, leaveRoom } = useUserStatusSocket(
  onStatusChange,
  userType
);
```

### المعاملات:

- `onStatusChange`: Callback عند تغيير حالة مستخدم
- `userType`: نوع المستخدم ('teacher' | 'student' | 'admin')

### الاستخدام:

#### 1. الاستماع لحالة جميع المستخدمين:

```typescript
import { useUserStatusSocket } from '@/Socket';

function UsersList() {
  const handleStatusChange = (data) => {
    console.log('User status changed:', data);
    // data: { userId, isActive, lastSeen }
  };

  const { isConnected } = useUserStatusSocket(handleStatusChange);

  return (
    <View>
      <Text>Socket: {isConnected ? 'متصل' : 'غير متصل'}</Text>
    </View>
  );
}
```

#### 2. الانضمام لغرفة المعلمين:

```typescript
import { useUserStatusSocket } from '@/Socket';
import { useEffect } from 'react';

function TeachersScreen() {
  const { isConnected, joinRoom, leaveRoom } = useUserStatusSocket(
    (data) => {
      console.log('Teacher status:', data);
    },
    'teacher'
  );

  useEffect(() => {
    if (isConnected) {
      joinRoom('teachers');
    }

    return () => {
      if (isConnected) {
        leaveRoom('teachers');
      }
    };
  }, [isConnected]);

  return <TeachersList />;
}
```

#### 3. استخدام Alias للمعلمين:

```typescript
import { useTeachersSocket } from '@/Socket';

function TeachersStatus() {
  const { isConnected } = useTeachersSocket((data) => {
    console.log('Teacher:', data);
  });

  return <Text>{isConnected ? 'متصل' : 'غير متصل'}</Text>;
}
```

---

## 🔄 التكامل مع Context

### في AuthContext:

```typescript
import { socketManager } from "@/Socket";

const login = async (userData, token) => {
  // ... حفظ البيانات

  // الاتصال بـ Socket
  socketManager.connect(userData._id, userData.role);

  setTimeout(() => {
    socketManager.emit("login", {
      userId: userData._id,
      role: userData.role,
    });
  }, 300);
};

const logout = async () => {
  // إرسال حدث logout
  if (user) {
    socketManager.emit("logout", {
      userId: user._id,
      role: user.role,
    });
  }

  // قطع الاتصال
  socketManager.disconnect();

  // ... تنظيف البيانات
};
```

### في UserStatusContext:

```typescript
import { useUserStatusSocket } from "@/Socket";

export const UserStatusProvider = ({ children }) => {
  const handleUserStatusChange = (data) => {
    setUserStatuses((prev) => ({
      ...prev,
      [data.userId]: {
        isActive: data.isActive,
        lastSeen: new Date(data.lastSeen),
      },
    }));
  };

  useUserStatusSocket(handleUserStatusChange);

  // ... باقي الكود
};
```

---

## 🎯 الأحداث المتاحة

### أحداث النظام:

| الحدث           | الوصف              | البيانات                  |
| --------------- | ------------------ | ------------------------- |
| `connect`       | عند الاتصال الناجح | -                         |
| `disconnect`    | عند قطع الاتصال    | `reason: string`          |
| `connect_error` | خطأ في الاتصال     | `error: Error`            |
| `reconnect`     | إعادة اتصال ناجحة  | `attemptNumber: number`   |
| `ping`          | إرسال heartbeat    | `{ timestamp, clientId }` |
| `pong`          | استقبال heartbeat  | -                         |

### أحداث التطبيق:

| الحدث              | الوصف                 | البيانات                         |
| ------------------ | --------------------- | -------------------------------- |
| `login`            | تسجيل دخول مستخدم     | `{ userId, role, firstName }`    |
| `logout`           | تسجيل خروج مستخدم     | `{ userId, role }`               |
| `userStatusChange` | تغيير حالة مستخدم     | `{ userId, isActive, lastSeen }` |
| `joinTeachers`     | انضمام لغرفة المعلمين | `{ timestamp }`                  |
| `leaveTeachers`    | مغادرة غرفة المعلمين  | `{ timestamp }`                  |
| `joinStudents`     | انضمام لغرفة الطلاب   | `{ timestamp }`                  |
| `leaveStudents`    | مغادرة غرفة الطلاب    | `{ timestamp }`                  |

---

## 🔧 التعديلات من Frontend

### الفروقات الرئيسية:

| الميزة           | Frontend                | Mobile                           |
| ---------------- | ----------------------- | -------------------------------- |
| Type Annotations | `NodeJS.Timeout`        | `ReturnType<typeof setInterval>` |
| Animation Frame  | `requestAnimationFrame` | `setTimeout`                     |
| Dev Mode Check   | `process.env.NODE_ENV`  | `__DEV__`                        |
| Notifications    | ✅ (Browser API)        | ❌ (يُستخدم Push Notifications)  |
| Audio            | ✅ (HTML Audio)         | ❌ (يُستخدم expo-av)             |

### التعديلات المطبقة:

1. ✅ **setTimeout** بدلاً من requestAnimationFrame
2. ✅ ****DEV**** بدلاً من process.env.NODE_ENV
3. ✅ **ReturnType<typeof setInterval>** للتوافق مع React Native
4. ✅ **إزالة Browser Notifications** (غير متوفر في React Native)
5. ✅ **إزالة Audio** (سيُستخدم expo-av للإشعارات الصوتية)

---

## 📦 المكتبة المطلوبة

```bash
npm install socket.io-client
```

---

## ⚠️ ملاحظات مهمة

### 1. Singleton Pattern:

```typescript
// ✅ صحيح - استخدام النسخة المُصدّرة
import { socketManager } from "@/Socket";

// ❌ خطأ - إنشاء نسخة جديدة
import SocketManager from "@/Socket";
const manager = new SocketManager(); // DON'T DO THIS
```

### 2. Cleanup في useEffect:

```typescript
useEffect(() => {
  const handleEvent = (data) => {
    console.log(data);
  };

  socketManager.on("myEvent", handleEvent);

  return () => {
    socketManager.off("myEvent", handleEvent);
  };
}, []);
```

### 3. التحقق من الاتصال قبل الإرسال:

```typescript
// ✅ صحيح
if (socketManager.isConnected()) {
  socketManager.emit("myEvent", data);
}

// ❌ خطأ - قد يفشل إذا لم يكن متصل
socketManager.emit("myEvent", data);
```

### 4. Heartbeat تلقائي:

- يُرسل تلقائياً كل 30 ثانية
- لا تحتاج لإرسال ping يدوياً
- يتوقف تلقائياً عند قطع الاتصال

---

## 🚀 أمثلة متقدمة

### مثال 1: Chat Screen مع Socket

```typescript
import { socketManager } from '@/Socket';
import { useEffect, useState } from 'react';

function ChatScreen({ roomId }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // الانضمام للغرفة
    socketManager.emit('joinRoom', { roomId });

    // الاستماع للرسائل
    const handleNewMessage = (message) => {
      setMessages(prev => [...prev, message]);
    };

    socketManager.on('newMessage', handleNewMessage);

    return () => {
      // المغادرة والتنظيف
      socketManager.emit('leaveRoom', { roomId });
      socketManager.off('newMessage', handleNewMessage);
    };
  }, [roomId]);

  const sendMessage = (text) => {
    socketManager.emit('sendMessage', {
      roomId,
      text,
      timestamp: Date.now(),
    });
  };

  return (
    <View>
      <FlatList data={messages} />
      <TextInput onSubmit={sendMessage} />
    </View>
  );
}
```

### مثال 2: Live Dashboard

```typescript
import { socketManager } from '@/Socket';
import { useEffect, useState } from 'react';

function LiveDashboard() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    socketManager.emit('joinDashboard');

    const handleStatsUpdate = (data) => {
      setStats(data);
    };

    socketManager.on('dashboardUpdate', handleStatsUpdate);

    return () => {
      socketManager.emit('leaveDashboard');
      socketManager.off('dashboardUpdate', handleStatsUpdate);
    };
  }, []);

  return (
    <View>
      <Text>Students: {stats.totalStudents}</Text>
      <Text>Teachers: {stats.totalTeachers}</Text>
    </View>
  );
}
```

---

## 📊 الإحصائيات

| المؤشر             | القيمة                                     |
| ------------------ | ------------------------------------------ |
| الملفات            | 3 ملفات                                    |
| Hooks              | 2 (useUserStatusSocket, useTeachersSocket) |
| Events             | 10+ أحداث                                  |
| Heartbeat          | 30 ثانية                                   |
| Reconnect Attempts | 5 محاولات                                  |
| TypeScript         | ✅ كامل                                    |

---

## 🔮 التوسعات المستقبلية

يمكن إضافة Hooks إضافية لاحقاً:

- [ ] `useNotificationsSocket` - للإشعارات الفورية
- [ ] `useGroupsSocket` - لتحديثات الحلقات
- [ ] `useRankingSocket` - لتحديثات الترتيب
- [ ] `useDashboardSocket` - لتحديثات لوحة التحكم
- [ ] `useExamScheduleSocket` - لتحديثات جدول الامتحانات

---

تم التحديث: 2025-12-16
الحالة: ✅ منسوخ من Frontend ومُعدَّل لـ React Native
المتطلبات: socket.io-client
