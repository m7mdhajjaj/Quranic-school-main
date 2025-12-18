# ✅ قائمة الاختبار - نظام Presence الجديد

## 🎯 اختبار سريع (5 دقائق)

### ✅ الخطوة 1: تشغيل المشروع

```bash
# Terminal 1 - Backend
cd Backend
npm start

# Terminal 2 - Frontend
cd Frontend
npm start
```

**يجب أن ترى:**
- Backend: `Server running on port 5005`
- Frontend: `Local: http://localhost:5173`

---

### ✅ الخطوة 2: تسجيل الدخول

1. افتح المتصفح: `http://localhost:5173`
2. سجل دخول بأي مستخدم
3. افتح Console (F12)

**يجب أن ترى في Console:**
```
✅ Socket connected: xyz123...
👂 [Presence] Setting up listener for user-status events
🔌 [Presence] Socket connected: true
🟢 [Presence] Status update received: { userId: '675...', isActive: true, timestamp: '...' }
📊 [Presence] Updated userStatuses: { '675...': { isActive: true, timestamp: '...' } }
```

---

### ✅ الخطوة 3: تحقق من Profile Menu

1. اضغط على **صورتك** في أعلى الصفحة
2. يجب أن ترى:
   - ✅ **نقطة خضراء** بجانب الصورة
   - ✅ نص **"نشط الآن"** (إذا كان showStatusText مفعّل)

**في Console يجب أن ترى:**
```
🟢 [OnlineStatus] Using Context for user 675...: { status: { isActive: true }, isOnline: true }
```

---

### ✅ الخطوة 4: اختبار نافذتين

1. **افتح نافذة جديدة** (Ctrl + Shift + N - Incognito)
2. سجل دخول **بمستخدم آخر**
3. ارجع للنافذة الأولى

**في Console النافذة الأولى:**
```
🟢 [Presence] Status update received: { userId: '678...', isActive: true }
```

4. افتح صفحة تعرض المستخدمين (مثلاً Students List)
5. يجب أن ترى **نقطة خضراء** بجانب المستخدم الثاني

---

### ✅ الخطوة 5: اختبار Disconnect

1. **أغلق النافذة الثانية**
2. في النافذة الأولى، **انتظر 5 ثوان**

**في Console:**
```
🟢 [Presence] Status update received: { userId: '678...', isActive: false }
```

3. النقطة بجانب المستخدم الثاني يجب أن تتحول **لرمادي**

---

### ✅ الخطوة 6: اختبار API

افتح Console واكتب:

```javascript
// اختبار getUserStatus API
fetch('http://localhost:5005/api/profile/users/USER_ID/status', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
})
.then(r => r.json())
.then(data => console.log('Status API:', data));
```

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "isActive": true,  // ← Real-time من Socket
  "lastSeen": "2025-12-18T..."
}
```

---

## 🔍 اختبارات متقدمة

### Test 1: إحصائيات المعلمين

```javascript
fetch('http://localhost:5005/api/teachers/stats', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
})
.then(r => r.json())
.then(data => console.log('Teacher Stats:', data));
```

**يجب أن ترى:**
```json
{
  "success": true,
  "data": {
    "total": 50,
    "active": 8,    // ← Real-time (المتصلون الآن)
    "inactive": 42  // ← Real-time
  }
}
```

---

### Test 2: Activity Notifications

1. **أنشئ نشاط جديد** من لوحة Admin
2. **تحقق من Backend Console:**

```
✅ Activity notifications: 8 sent to online, 42 saved for offline (total: 50)
```

3. **الطلاب المتصلون** يستقبلون Notification **فوراً**
4. **الطلاب غير المتصلين** يشوفونها عند login

---

### Test 3: Multiple Tabs لنفس المستخدم

1. افتح **3 tabs** بنفس المستخدم
2. الحالة يجب أن تبقى **Online** في الجميع
3. أغلق **tab واحد** → يبقى Online
4. أغلق **tab ثاني** → يبقى Online
5. أغلق **آخر tab** → بعد 5 ثوان يصير Offline

---

### Test 4: Backend Global Access

في أي Controller، جرب:

```javascript
// في أي ملف Backend
console.log('User online?', global.isUserOnline('USER_ID'));
console.log('Stats:', global.onlineUsersManager.getStats());
```

---

## 📊 النتائج المتوقعة

| الاختبار | النتيجة المتوقعة | الوقت |
|---------|------------------|-------|
| Login | نقطة خضراء | < 1 ثانية |
| Logout | نقطة رمادية | 5 ثوان (grace period) |
| User 2 login | نقطة خضراء في كل النوافذ | < 1 ثانية |
| getUserStatus API | `isActive: true` من Socket | < 50ms |
| Stats API | عدد real-time | < 100ms |
| Notifications | للـ online فوري | < 100ms |

---

## ❌ مشاكل شائعة

### 1. "نقطة رمادية دائماً"

**السبب:**
- Socket غير متصل
- أو userId خطأ
- أو Context لا يتحدث

**الحل:**
```javascript
// تحقق
console.log('Socket:', socketManager.isConnected());
console.log('User ID:', user?._id);
console.log('Statuses:', statusContext?.userStatuses);
```

---

### 2. "Console مليان Logs"

**السبب:** Console.log للـ debugging

**الحل:** احذفها إذا بدك (في production):
```tsx
// في OnlineStatus.tsx - احذف السطور:
console.log(`🟢 [OnlineStatus] Using Context...`);

// في UserStatusContext.tsx - احذف:
console.log('🟢 [Presence] Status update received:', data);
```

---

### 3. "Backend يطبع errors"

**الأخطاء الشائعة:**
```
❌ Error setting user online: ...
```

**الحل:**
- تحقق من أن PresenceService موجود
- تحقق من Global access في app.js

---

### 4. "Stats تعطي 0 دائماً"

**السبب:** `getUsersByRole` يعيد array فاضي

**الحل:**
- تأكد أن المستخدمين سجلوا دخول عبر Socket
- تحقق من `role` في handshake.auth

---

## 🎯 Checklist نهائي

قبل ما تقول "اشتغل":

- [ ] Backend شغال على port 5005
- [ ] Frontend شغال على port 5173
- [ ] Console.log في Browser يطبع status updates
- [ ] نقطة خضراء ظاهرة في Profile Menu
- [ ] getUserStatus API يعيد isActive: true
- [ ] Stats API يعيد أرقام real-time
- [ ] نافذتين: الحالات تتحدث في الاثنين
- [ ] Disconnect: يتحول لـ offline بعد 5 ثوان

---

## 🆘 إذا ما اشتغل

1. **اقرأ** [DEBUGGING_PRESENCE.md](./DEBUGGING_PRESENCE.md)
2. **جمع Debug Info:**
   ```javascript
   const debugInfo = {
     socketConnected: socketManager.isConnected(),
     socketId: socketManager.getSocketId(),
     userId: user?._id,
     userStatuses: statusContext?.userStatuses,
     onlineCount: statusContext?.getOnlineUsers()?.length,
   };
   console.log('🐛 DEBUG:', JSON.stringify(debugInfo, null, 2));
   ```
3. **شارك** النتيجة معي

---

## ✅ النجاح!

إذا كل الاختبارات نجحت:
- 🎉 **تهانينا!** النظام يعمل 100%
- ⚡ الحالات Real-time
- 📊 الإحصائيات دقيقة
- 🟢 النقاط الخضراء تعمل

**مبروك! نظام Presence شغال بنجاح!** 🚀
