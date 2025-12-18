# 🔍 تشخيص مشكلة Presence System

## المشكلة الحالية
الحالة (Status) تبقى دائماً **Offline** رغم أن المستخدم متصل.

---

## خطوات التشخيص السريعة

### 1️⃣ افتح Console في المتصفح (F12)

عند تسجيل الدخول، يجب أن ترى هذه الرسائل بالترتيب:

```
✅ Socket connected: abc123xyz...
👂 [Presence] Setting up listener for user-status events
🔌 [Presence] Socket connected: true
🟢 [Presence] Status update received: { userId: '...', isActive: true, timestamp: '...' }
📊 [Presence] Updated userStatuses: { '...': { isActive: true, ... } }
🟢 [OnlineStatus] Using Context for user ...: { status: { isActive: true }, isOnline: true }
```

---

### 2️⃣ تحقق من حالات الـ Socket

افتح Console واكتب:

```javascript
// تحقق من اتصال Socket
socketManager.isConnected()
// يجب أن يُعيد: true

// تحقق من Socket ID
socketManager.getSocketId()
// يجب أن يُعيد: string (مثل: "abc123xyz")
```

---

### 3️⃣ تحقق من UserStatusContext

```javascript
// في أي مكون يستخدم Context
console.log('Context:', statusContext);
console.log('User Statuses:', statusContext?.userStatuses);
console.log('Is current user online?', statusContext?.isUserOnline(user._id));
```

---

## 🐛 المشاكل الشائعة والحلول

### مشكلة 1: Socket غير متصل

**الأعراض:**
```
⚠️ [Presence] Socket not connected, waiting...
```

**الحل:**
1. تحقق من Backend يعمل: `http://localhost:5005`
2. تحقق من SOCKET_URL في `Frontend/src/config/config.ts`
3. تحقق من CORS settings في `Backend/src/app.js`

---

### مشكلة 2: Events لا تصل

**الأعراض:**
- لا ترى `🟢 [Presence] Status update received`
- Context يبقى فارغاً: `{}`

**الحل:**

#### Backend Check:
افتح Backend console، يجب أن ترى:
```
✅ [Presence] User أحمد (123abc) is now ONLINE
📊 [Presence] Total online users: 1
```

إذا لم ترى هذا، المشكلة في Backend!

#### Frontend Check:
```javascript
// تحقق من Event Listeners
socketManager.getSocket()?._callbacks
// يجب أن ترى '$user-status' في القائمة
```

---

### مشكلة 3: userId غير صحيح

**الأعراض:**
```
⚪ [OnlineStatus] No status found for user undefined
```

**الحل:**
تحقق من أن `user._id` موجود:
```javascript
console.log('Current user:', user);
console.log('User ID:', user?._id);
```

إذا كان `undefined`، المشكلة في AuthContext!

---

### مشكلة 4: Event Name خاطئ

**التحقق:**

**Backend** يرسل:
```javascript
io.emit('user-status', { userId, isActive, timestamp });
```

**Frontend** يستقبل:
```javascript
socketManager.on('user-status', handleUserStatus);
```

يجب أن يكون الاسم متطابقاً تماماً: **`user-status`**

---

## 🔧 الإصلاح السريع

### إذا المشكلة مستمرة، جرب هذا:

1. **أعد تشغيل Backend:**
   ```bash
   cd Backend
   npm start
   ```

2. **أعد تشغيل Frontend:**
   ```bash
   cd Frontend
   npm start
   ```

3. **امسح Cache:**
   - افتح المتصفح
   - Ctrl + Shift + Delete
   - Clear cache
   - أعد تحميل الصفحة (Ctrl + F5)

4. **سجل خروج ثم دخول مرة أخرى**

---

## 📊 اختبار شامل

### Test 1: Backend يرسل Events

في Backend console، يجب أن ترى عند كل login:
```
✅ User أحمد (123abc) logged in successfully as student
📊 Online users: 1
```

### Test 2: Frontend يستقبل Events

في Browser console:
```javascript
// أضف listener مؤقت للاختبار
socketManager.on('user-status', (data) => {
  console.log('🧪 TEST: Received event:', data);
});
```

سجل دخول، يجب أن ترى:
```
🧪 TEST: Received event: { userId: '...', isActive: true, ... }
```

### Test 3: Context يتحدث

```javascript
// قبل
console.log('Before:', statusContext.userStatuses);

// سجل دخول مستخدم آخر في نافذة أخرى

// بعد (بعد ثانية)
console.log('After:', statusContext.userStatuses);
// يجب أن ترى المستخدم الجديد في القائمة
```

---

## 🆘 إذا لم يعمل شيء

### جمع معلومات Debug:

افتح Console واكتب:

```javascript
const debugInfo = {
  socketConnected: socketManager.isConnected(),
  socketId: socketManager.getSocketId(),
  currentUser: user?._id,
  userStatuses: statusContext?.userStatuses,
  onlineCount: statusContext?.getOnlineUsers()?.length,
};

console.log('🐛 DEBUG INFO:', JSON.stringify(debugInfo, null, 2));
```

انسخ النتيجة وشاركها.

---

## ✅ التحقق من الإصلاح

بعد الإصلاح، يجب أن ترى:

1. **في Profile Menu:**
   - نقطة خضراء بجانب صورتك
   - نص "نشط الآن"

2. **في Console:**
   ```
   🟢 [OnlineStatus] Using Context for user YOUR_ID: { status: { isActive: true }, isOnline: true }
   ```

3. **اختبار نافذتين:**
   - افتح نافذة ثانية
   - سجل دخول مستخدم آخر
   - يجب أن ترى النقطة الخضراء في كلا النافذتين

---

## 📝 ملاحظات مهمة

1. **Grace Period:** عند Disconnect، ينتظر النظام **5 ثوان** قبل تحديث Status لـ Offline
2. **Real-time:** التحديثات يجب أن تظهر **فوراً** (< 1 ثانية)
3. **Multiple Tabs:** إذا فتحت عدة tabs لنفس المستخدم، الحالة يجب أن تبقى Online حتى تُغلق آخر tab

---

## 🎯 الخلاصة

المشكلة الأكثر شيوعاً هي أن **Socket Events لا تصل للـ Frontend**.

تحقق من:
1. ✅ Socket متصل
2. ✅ Backend يرسل events
3. ✅ Frontend يستمع لـ events
4. ✅ Event name صحيح: `user-status`
5. ✅ userId موجود وصحيح

إذا كل هذا صحيح، المشكلة غالباً في **timing** - أي أن listener يُضاف بعد إرسال event.

**الإصلاح:** أضفت في التحديث الأخير أن listener يُضاف حتى لو Socket غير متصل، لحل هذه المشكلة.

---

**جرب الآن وأخبرني بالنتيجة!** 🚀
