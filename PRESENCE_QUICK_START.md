# ⚡ Real-time Presence - دليل البداية السريعة

## 🎯 في دقيقتين فقط!

### Backend - استخدام PresenceService

```javascript
// في أي Controller أو Route
const { isUserOnline, onlineUsersManager } = require('./services/PresenceService');

// ✅ مثال: إرسال رسالة فقط للمستخدمين Online
router.post('/send-message', async (req, res) => {
  const { recipientId, message } = req.body;
  
  if (isUserOnline(recipientId)) {
    // المستخدم Online - أرسل عبر Socket
    const userData = onlineUsersManager.getUserData(recipientId);
    io.to(userData.socketId).emit('new-message', message);
    res.json({ delivered: true, method: 'socket' });
  } else {
    // المستخدم Offline - احفظ في DB
    await Message.create({ recipientId, message });
    res.json({ delivered: false, method: 'database' });
  }
});

// ✅ مثال: الحصول على إحصائيات
router.get('/stats', (req, res) => {
  res.json(onlineUsersManager.getStats());
});

// ✅ مثال: قائمة المعلمين Online
router.get('/online-teachers', (req, res) => {
  const onlineTeachers = onlineUsersManager.getUsersByRole('teacher');
  res.json({ count: onlineTeachers.length, teachers: onlineTeachers });
});
```

---

### Frontend - استخدام UserStatusContext

```tsx
import { useContext } from 'react';
import { UserStatusContext } from '@/Context/UserStatusContext';

function MyComponent() {
  const statusContext = useContext(UserStatusContext);
  
  // ✅ التحقق من مستخدم واحد
  const isOnline = statusContext?.isUserOnline(userId);
  
  // ✅ الحصول على جميع المستخدمين Online
  const onlineUsers = statusContext?.getOnlineUsers() || [];
  
  return (
    <div>
      <p>المستخدمون المتصلون: {onlineUsers.length}</p>
      {isOnline && <span>🟢 متصل الآن</span>}
    </div>
  );
}
```

---

### UI Components - استخدام Avatar & OnlineStatus

```tsx
import { Avatar } from '@/components/Avatar';

// ✅ مثال 1: Avatar بسيط مع Status
function UserCard({ user }) {
  return (
    <Avatar 
      user={user}
      size="lg"
      showStatus={true}  // ← سيظهر نقطة خضراء/رمادية
    />
  );
}

// ✅ مثال 2: مع نص Status
function UserProfile({ user }) {
  return (
    <Avatar 
      user={user}
      size="xl"
      showStatus={true}
      showStatusText={true}  // ← سيظهر "نشط الآن" أو "غير نشط"
    />
  );
}

// ✅ مثال 3: OnlineStatus منفصل
import { OnlineStatus } from '@/components/Avatar';

function CustomCard({ user }) {
  return (
    <div className="relative">
      <img src={user.avatar} alt={user.name} />
      <OnlineStatus 
        user={user}
        size="md"
        position="absolute"
      />
    </div>
  );
}
```

---

## 🔍 Debugging

### Backend Logs

```javascript
// تفعيل Logs
console.log('Online count:', onlineUsersManager.getOnlineCount());
console.log('Stats:', onlineUsersManager.getStats());
console.log('User data:', onlineUsersManager.getUserData(userId));
```

ستظهر Logs تلقائية:
```
✅ [Presence] User أحمد (123abc) is now ONLINE
📊 [Presence] Total online users: 5
👋 [Presence] User أحمد (123abc) is now OFFLINE
```

### Frontend Logs

```tsx
const statusContext = useContext(UserStatusContext);
console.log('Context:', statusContext);
console.log('All statuses:', statusContext?.userStatuses);
console.log('Online users:', statusContext?.getOnlineUsers());
```

ستظهر Logs تلقائية:
```
👂 [Presence] Setting up listener for user-status events
🟢 [Presence] Status update: { userId: '123', isActive: true, ... }
```

---

## 🧪 اختبار سريع

### 1. افتح النافذة الأولى وسجل دخول
- يجب أن ترى في Console:
  ```
  ✅ User connected
  ✅ [Presence] User ... is now ONLINE
  ```

### 2. افتح نافذة ثانية (Incognito) وسجل دخول
- في النافذة الأولى سترى:
  ```
  🟢 [Presence] Status update: { userId: '...', isActive: true }
  ```

### 3. أغلق النافذة الثانية
- بعد 5 ثوان سترى:
  ```
  👋 [Presence] User ... is now OFFLINE
  🟢 [Presence] Status update: { userId: '...', isActive: false }
  ```

---

## ⚙️ الإعدادات

### تغيير Grace Period (Backend)

```javascript
// في Backend/src/services/PresenceService/OnlineUsersManager.js
this.gracePeriod = 3000; // 3 ثوان بدلاً من 5
```

### تعطيل Dev Logs (Frontend)

```tsx
// في UserStatusContext.tsx
if (process.env.NODE_ENV === 'development') {
  console.log('🟢 [Presence] Status update:', data);
}
// احذف هذا الـ block أو اجعل الشرط false
```

---

## 🚀 نصائح للإنتاج

1. **استخدم Environment Variables:**
   ```javascript
   const GRACE_PERIOD = process.env.PRESENCE_GRACE_PERIOD || 5000;
   ```

2. **أضف Metrics:**
   ```javascript
   // Track peak online users
   setInterval(() => {
     const count = onlineUsersManager.getOnlineCount();
     metrics.gauge('presence.online_users', count);
   }, 60000);
   ```

3. **Error Handling:**
   ```javascript
   socket.on('disconnect', async (reason) => {
     try {
       // ... presence logic
     } catch (error) {
       console.error('[Presence] Error on disconnect:', error);
       // Don't crash the server
     }
   });
   ```

---

## 📖 المزيد من المعلومات

راجع الدليل الشامل: [REAL_TIME_PRESENCE_GUIDE.md](./REAL_TIME_PRESENCE_GUIDE.md)

---

**أسئلة سريعة؟**

- **Q:** هل أحتاج Redis؟  
  **A:** لا، ما لم يكن لديك multiple servers.

- **Q:** ماذا عن isActive في DB؟  
  **A:** لم يعد مستخدماً. احذفه أو اتركه للتوافق القديم.

- **Q:** كيف أتأكد أن النظام يعمل؟  
  **A:** افتح نافذتين، سجل دخول، أغلق واحدة - ستلاحظ التغيير فوراً!

---

**بالتوفيق! 🎉**
