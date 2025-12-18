# 🟢 نظام Real-time Presence - دليل شامل

## 📋 جدول المحتويات
1. [نظرة عامة](#نظرة-عامة)
2. [معمارية النظام](#معمارية-النظام)
3. [Backend - الباك إند](#backend---الباك-إند)
4. [Frontend - الفرونت إند](#frontend---الفرونت-إند)
5. [أمثلة الاستخدام](#أمثلة-الاستخدام)
6. [الأسئلة الشائعة](#الأسئلة-الشائعة)

---

## 🎯 نظرة عامة

نظام **Real-time Presence** موحد ومتكامل يعتمد على **Socket.io** كمصدر واحد للحقيقة لتحديد حالة المستخدمين (Online/Offline).

### ✨ المميزات الرئيسية

- ✅ **Socket.io فقط** - لا يعتمد على DB أو API polling
- ✅ **Graceful Reconnection** - يسمح بإعادة الاتصال السريع (5 ثوان)
- ✅ **In-memory Store** - أداء عالي بدون overhead
- ✅ **Real-time Updates** - تحديثات فورية للجميع
- ✅ **Type-safe** - TypeScript مع types كاملة
- ✅ **Scalable** - قابل للتوسع مع Redis (مستقبلاً)

### 🚫 ما تم إزالته

- ❌ تحديث `isActive` في DB عند كل request
- ❌ منطق login/logout في API controllers
- ❌ Polling من Frontend
- ❌ Re-render tricks
- ❌ API calls للحصول على status

---

## 🏗️ معمارية النظام

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTS                              │
│  (React App - Socket.io Client)                             │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ Socket Connection (polling/websocket)
                 │
┌────────────────▼────────────────────────────────────────────┐
│                   Socket.io SERVER                          │
│                   (app.js)                                  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Events:                                            │   │
│  │  • connection (handshake.auth.userId)              │   │
│  │  • login (userId, role, firstName)                 │   │
│  │  • logout (userId)                                 │   │
│  │  • disconnect (graceful with 5s delay)             │   │
│  └─────────────────────────────────────────────────────┘   │
│                         │                                   │
│                         ▼                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │       PresenceService (In-Memory)                   │   │
│  │  ─────────────────────────────────────────────────  │   │
│  │  • onlineUsers: Map<userId, {socketId, role, ...}> │   │
│  │  • socketToUser: Map<socketId, userId>             │   │
│  │  • disconnectTimeouts: Map<userId, Timeout>        │   │
│  │  ─────────────────────────────────────────────────  │   │
│  │  Methods:                                           │   │
│  │  • setUserOnline(userId, socketId, ...)            │   │
│  │  • setUserOffline(userId, callback)                │   │
│  │  • isUserOnline(userId)                            │   │
│  │  • getUserData(userId)                             │   │
│  │  • getOnlineCount()                                │   │
│  └─────────────────────────────────────────────────────┘   │
│                         │                                   │
│                         ▼                                   │
│            Broadcast: io.emit('user-status', {              │
│              userId, isActive, timestamp                    │
│            })                                               │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   ALL CLIENTS                               │
│  (receive user-status event)                                │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  UserStatusContext                                  │   │
│  │  • userStatuses: Record<userId, UserStatusState>    │   │
│  │  • Updates on 'user-status' event                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                         │                                   │
│                         ▼                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  OnlineStatus Component                             │   │
│  │  • Green dot = Online                               │   │
│  │  • Gray dot = Offline                               │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Backend - الباك إند

### 1️⃣ PresenceService

**الملفات:**
- `Backend/src/services/PresenceService/OnlineUsersManager.js`
- `Backend/src/services/PresenceService/index.js`

#### استخدام PresenceService

```javascript
// في أي ملف Backend
const { isUserOnline, onlineUsersManager } = require('./services/PresenceService');

// ✅ التحقق من حالة المستخدم
if (isUserOnline(userId)) {
  console.log('User is online!');
}

// ✅ الحصول على بيانات المستخدم
const userData = onlineUsersManager.getUserData(userId);
console.log(userData); 
// { socketId, role, firstName, connectedAt }

// ✅ الحصول على عدد المستخدمين Online
const count = onlineUsersManager.getOnlineCount();
console.log(`${count} users online`);

// ✅ الحصول على مستخدمين حسب الدور
const onlineTeachers = onlineUsersManager.getUsersByRole('teacher');
console.log(`${onlineTeachers.length} teachers online`);

// ✅ الحصول على إحصائيات
const stats = onlineUsersManager.getStats();
console.log(stats);
// {
//   totalOnline: 15,
//   pendingDisconnects: 2,
//   usersByRole: { student: 10, teacher: 3, admin: 2 },
//   gracePeriodMs: 5000
// }
```

### 2️⃣ Socket.io Events في app.js

#### Event: `connection`

```javascript
io.on('connection', (socket) => {
  const authUserId = socket.handshake.auth?.userId;
  const authUserRole = socket.handshake.auth?.userRole;
  
  if (authUserId) {
    // تسجيل المستخدم فوراً
    onlineUsersManager.setUserOnline(
      authUserId,
      socket.id,
      authUserRole,
      'User'
    );
    
    // بث الحالة للجميع
    io.emit('user-status', {
      userId: authUserId,
      isActive: true,
      timestamp: new Date().toISOString(),
    });
  }
});
```

#### Event: `login`

```javascript
socket.on('login', async (userData) => {
  const { userId, role, firstName } = userData;
  
  // ✅ تسجيل في PresenceService
  onlineUsersManager.setUserOnline(userId, socket.id, role, firstName);
  
  // ✅ بث الحالة
  io.emit('user-status', {
    userId,
    isActive: true,
    timestamp: new Date().toISOString(),
  });
  
  // ✅ تحديث lastSeen فقط في DB (اختياري)
  await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
});
```

#### Event: `disconnect`

```javascript
socket.on('disconnect', async (reason) => {
  const userId = onlineUsersManager.getUserIdBySocket(socket.id);
  
  if (userId) {
    // ✅ Graceful Offline مع callback
    onlineUsersManager.setUserOffline(userId, async (uid) => {
      // بعد 5 ثوان (grace period)
      io.emit('user-status', {
        userId: uid,
        isActive: false,
        timestamp: new Date().toISOString(),
      });
      
      // تحديث lastSeen في DB
      await User.findByIdAndUpdate(uid, { lastSeen: new Date() });
    });
  }
});
```

### 3️⃣ Global Access

```javascript
// في أي ملف Backend
const isOnline = global.isUserOnline(userId);
const manager = global.onlineUsersManager;
```

---

## 🎨 Frontend - الفرونت إند

### 1️⃣ UserStatusContext

**الملف:** `Frontend/src/Context/UserStatusContext.tsx`

#### استخدام Context

```tsx
import { useContext } from 'react';
import { UserStatusContext } from '@/Context/UserStatusContext';

function MyComponent() {
  const statusContext = useContext(UserStatusContext);
  
  // ✅ التحقق من حالة مستخدم
  const isOnline = statusContext?.isUserOnline(userId);
  
  // ✅ الحصول على حالة مستخدم
  const userStatus = statusContext?.getUserStatus(userId);
  console.log(userStatus); // { isActive: true, timestamp: '...' }
  
  // ✅ الحصول على جميع المستخدمين Online
  const onlineUsers = statusContext?.getOnlineUsers();
  console.log(`${onlineUsers.length} users online`);
  
  return (
    <div>
      {isOnline ? '🟢 Online' : '⚪ Offline'}
    </div>
  );
}
```

### 2️⃣ OnlineStatus Component

**الملف:** `Frontend/src/components/Avatar/OnlineStatus.tsx`

#### استخدام بسيط

```tsx
import { OnlineStatus } from '@/components/Avatar';

function UserCard({ user }) {
  return (
    <div className="relative">
      <img src={user.avatar} alt={user.name} />
      {/* ✅ المؤشر يجلب الحالة تلقائياً من Context */}
      <OnlineStatus 
        user={user}
        size="md"
        position="absolute"
      />
    </div>
  );
}
```

#### Force Status

```tsx
<OnlineStatus 
  isOnline={true}  // Force online
  size="lg"
/>
```

### 3️⃣ Avatar Component

**الملف:** `Frontend/src/components/Avatar/Avatar.tsx`

```tsx
import { Avatar } from '@/components/Avatar';

function UserProfile({ user }) {
  return (
    <Avatar
      user={user}
      size="xl"
      showStatus={true}
      showStatusText={true}
      statusSize="md"
    />
  );
}
```

### 4️⃣ Socket Authentication

**تمرير userId في handshake:**

```typescript
// في SocketManager.ts
const socket = io(SOCKET_URL, {
  auth: {
    userId: currentUser._id,
    userRole: currentUser.role,
  },
});
```

---

## 💡 أمثلة الاستخدام

### مثال 1: قائمة المستخدمين Online

```tsx
import { useContext } from 'react';
import { UserStatusContext } from '@/Context/UserStatusContext';
import { Avatar } from '@/components/Avatar';

function OnlineUsersList() {
  const statusContext = useContext(UserStatusContext);
  const onlineUsers = statusContext?.getOnlineUsers() || [];
  
  return (
    <div className="space-y-2">
      <h3>المستخدمون المتصلون ({onlineUsers.length})</h3>
      {onlineUsers.map(userId => (
        <div key={userId} className="flex items-center gap-2">
          <Avatar 
            userId={userId}
            size="sm"
            showStatus={true}
          />
          <span>User {userId}</span>
        </div>
      ))}
    </div>
  );
}
```

### مثال 2: رسالة Chat مع Status

```tsx
function ChatMessage({ message, sender }) {
  const statusContext = useContext(UserStatusContext);
  const isOnline = statusContext?.isUserOnline(sender._id);
  
  return (
    <div className="flex items-start gap-3">
      <Avatar 
        user={sender}
        size="md"
        showStatus={true}
      />
      <div>
        <div className="flex items-center gap-2">
          <span className="font-semibold">{sender.firstName}</span>
          {isOnline && (
            <span className="text-xs text-green-600">متصل الآن</span>
          )}
        </div>
        <p>{message.text}</p>
      </div>
    </div>
  );
}
```

### مثال 3: Filter Users by Online Status

```tsx
function StudentsList({ students }) {
  const statusContext = useContext(UserStatusContext);
  
  const onlineStudents = students.filter(student => 
    statusContext?.isUserOnline(student._id)
  );
  
  const offlineStudents = students.filter(student => 
    !statusContext?.isUserOnline(student._id)
  );
  
  return (
    <div>
      <h3>الطلاب المتصلون ({onlineStudents.length})</h3>
      {onlineStudents.map(student => (
        <StudentCard key={student._id} student={student} />
      ))}
      
      <h3>الطلاب غير المتصلين ({offlineStudents.length})</h3>
      {offlineStudents.map(student => (
        <StudentCard key={student._id} student={student} />
      ))}
    </div>
  );
}
```

### مثال 4: Backend - إرسال رسالة فقط للمستخدمين Online

```javascript
const { isUserOnline, onlineUsersManager } = require('./services/PresenceService');

async function sendNotificationToOnlineUsers(userIds, message) {
  for (const userId of userIds) {
    if (isUserOnline(userId)) {
      const userData = onlineUsersManager.getUserData(userId);
      
      // إرسال عبر Socket
      io.to(userData.socketId).emit('notification', {
        message,
        timestamp: new Date().toISOString(),
      });
      
      console.log(`✅ Sent to online user: ${userId}`);
    } else {
      // حفظ في DB للمستخدمين Offline
      await Notification.create({ userId, message });
      console.log(`📦 Saved for offline user: ${userId}`);
    }
  }
}
```

---

## ❓ الأسئلة الشائعة

### 1. هل يتم حفظ `isActive` في DB؟

**لا.** الحقل `isActive` في DB **ليس** مصدر الحقيقة بعد الآن. يمكنك:
- إبقاءه في Schema للـ backward compatibility
- استخدامه للسجل التاريخي فقط
- أو حذفه تماماً

**المصدر الوحيد للحقيقة:** `onlineUsersManager` في الذاكرة.

### 2. ماذا يحدث عند إعادة تشغيل السيرفر؟

عند restart:
- **In-memory data تُفقد** (كل المستخدمين Offline)
- المستخدمون المتصلون **يعيدون الاتصال تلقائياً** (Socket.io reconnection)
- الـ `login` event يُرسل مرة أخرى
- النظام يعود للعمل طبيعياً في ثوانٍ

**للحفاظ على البيانات:** يمكن استخدام Redis (مستقبلاً).

### 3. ما هو Grace Period؟

**Grace Period = 5 ثوان**

عند disconnect:
1. المستخدم **يُحذف فوراً** من `onlineUsers`
2. لكن **لا يُبث** `user-status` مباشرة
3. نننتظر **5 ثوان**
4. إذا **عاد المستخدم** خلالها → يُلغى الـ timeout
5. إذا **لم يعد** → يُبث `isActive: false`

**الفائدة:** تجنب false negatives عند تغيير الشبكة أو refresh.

### 4. كيف أختبر النظام؟

```javascript
// Backend Test
console.log('Online users:', onlineUsersManager.getOnlineCount());
console.log('Stats:', onlineUsersManager.getStats());
console.log('User online?', isUserOnline('USER_ID'));

// Frontend Test
console.log('Context:', statusContext);
console.log('Online users:', statusContext.getOnlineUsers());
console.log('Is online?', statusContext.isUserOnline('USER_ID'));
```

### 5. هل يعمل مع Multiple Servers (Horizontal Scaling)?

**حالياً: لا.**

الـ in-memory store يعمل على server واحد فقط.

**للـ Horizontal Scaling:**
- استخدم **Redis** مع `socket.io-redis` adapter
- شارك `onlineUsers` بين جميع الـ servers
- ابدأ بـ Redis pub/sub

**مثال Redis Integration (مستقبلاً):**

```javascript
const redis = require('redis');
const client = redis.createClient();

// عند setUserOnline
await client.set(`user:${userId}:online`, 'true', 'EX', 300);

// عند isUserOnline
const isOnline = await client.exists(`user:${userId}:online`);
```

### 6. ماذا عن Mobile Apps؟

النظام يعمل مع **أي Socket.io client**:
- React Native
- Flutter (socket_io_client)
- iOS/Android Native

**مثال React Native:**

```javascript
import io from 'socket.io-client';

const socket = io('http://your-server.com', {
  auth: {
    userId: currentUser._id,
    userRole: currentUser.role,
  },
});

socket.on('user-status', (data) => {
  console.log('Status update:', data);
  // تحديث UI
});
```

---

## 📊 Performance Tips

### 1. تقليل Re-renders

```tsx
// ❌ BAD - يسبب re-render لكل تحديث
const allStatuses = statusContext.userStatuses;

// ✅ GOOD - re-render فقط عند تغيير userId معين
const userStatus = statusContext.getUserStatus(userId);
```

### 2. Batch Updates في Backend

```javascript
// ✅ بدلاً من emit منفصل لكل مستخدم
const updates = [];
users.forEach(user => {
  if (conditionMet(user)) {
    updates.push({ userId: user._id, isActive: true });
  }
});

// Emit مرة واحدة
io.emit('bulk-status-update', updates);
```

### 3. Debounce في Frontend

```tsx
const debouncedStatusCheck = useMemo(
  () => debounce((uid) => {
    statusContext.getUserStatus(uid);
  }, 300),
  [statusContext]
);
```

---

## 🎉 ملخص

✅ **Backend:**
- `PresenceService` - المصدر الوحيد للحقيقة
- Socket events: `connection`, `login`, `logout`, `disconnect`
- Broadcast: `user-status` event

✅ **Frontend:**
- `UserStatusContext` - يستمع لـ Socket فقط
- `OnlineStatus` - مؤشر بسيط
- `Avatar` - يدعم status مدمج

✅ **لا Polling، لا DB updates، لا API calls**

---

## 📝 التحديثات المستقبلية

- [ ] Redis integration للـ horizontal scaling
- [ ] Presence webhooks للـ external services
- [ ] Analytics dashboard (عدد المستخدمين، peak times، etc.)
- [ ] Custom presence states (away, busy, dnd)
- [ ] Last seen timestamps في UI

---

## 🆘 الدعم

إذا واجهت مشكلة:

1. تحقق من Logs:
   ```bash
   # Backend
   [Presence] User xxx is now ONLINE
   [Presence] Total online users: 5
   
   # Frontend
   🟢 [Presence] Status update: { userId, isActive, timestamp }
   ```

2. تحقق من Socket connection:
   ```javascript
   console.log('Socket connected?', socketManager.isConnected());
   ```

3. تحقق من Context:
   ```tsx
   console.log('StatusContext:', statusContext);
   ```

---

**تم إنشاؤه بواسطة:** Cursor AI  
**التاريخ:** ديسمبر 2025  
**الإصدار:** 1.0.0
