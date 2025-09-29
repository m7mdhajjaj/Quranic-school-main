# دمج PresenceIndicator في Avatar - التحديث الجديد

## التغييرات المنجزة

### ❌ **تم حذف:**
- `PresenceIndicator.tsx` (مكون منفصل غير مستخدم)

### ✅ **تم تحسين:**
- `Avatar.tsx` - دمج وظائف PresenceIndicator

## المميزات الجديدة في Avatar

### 🎯 **خصائص جديدة:**
```tsx
interface AvatarProps {
  // ... الخصائص الموجودة
  
  /** Show status text next to avatar */
  showStatusText?: boolean;
  
  /** Status indicator size (separate from avatar size) */
  statusSize?: 'sm' | 'md' | 'lg';
}
```

### 🔧 **طرق الاستخدام الجديدة:**

#### 1. Avatar عادي (كما كان):
```tsx
<Avatar
  src={user.avatar}
  userName={user.name}
  userId={user.id}
  showStatus={true}
/>
```

#### 2. Avatar مع نص الحالة:
```tsx
<Avatar
  src={user.avatar}
  userName={user.name}
  userId={user.id}
  showStatus={true}
  showStatusText={true}
  statusSize="md"
/>
```

#### 3. في قائمة المستخدمين:
```tsx
<div className="user-list">
  {users.map(user => (
    <div key={user.id} className="user-item">
      <Avatar
        src={user.avatar}
        userName={user.name}
        userId={user.id}
        showStatus={true}
        showStatusText={true}
        size="md"
        statusSize="sm"
      />
    </div>
  ))}
</div>
```

#### 4. في الدردشة:
```tsx
<div className="chat-header">
  <Avatar
    src={chatUser.avatar}
    userName={chatUser.name}
    userId={chatUser.id}
    showStatus={true}
    showStatusText={true}
    size="lg"
    statusSize="md"
  />
</div>
```

## الحالات المدعومة

### 📊 **أنواع الحالات:**
- 🟢 **متصل الآن** (أخضر): `isOnline && isActive`
- 🟡 **نشط** (أصفر): `isActive` فقط
- ⚪ **غير متصل** (رمادي): `!isActive && !isOnline`

### 🎨 **أحجام النقاط:**
- `statusSize="sm"` - نقطة صغيرة (2x2)
- `statusSize="md"` - نقطة متوسطة (3x3) - افتراضي
- `statusSize="lg"` - نقطة كبيرة (4x4)

## الفوائد المحققة

### 🎯 **التبسيط:**
- مكون واحد بدلاً من اثنين
- نفس الواجهة البرمجية
- إدارة أسهل

### 🚀 **الأداء:**
- أقل حجم للحزمة
- استيرادات أقل
- rendering محسن

### 🔧 **المرونة:**
- خيارات أكثر للعرض
- تحكم أكبر في التصميم
- سهولة في التخصيص

## مثال شامل

```tsx
import Avatar from './components/Avatar';

function UserProfile({ user }) {
  return (
    <div className="profile">
      {/* Avatar كبير مع نص الحالة */}
      <Avatar
        src={user.avatar}
        userName={user.name}
        userId={user.id}
        size="2xl"
        showStatus={true}
        showStatusText={true}
        statusSize="lg"
        gender={user.gender}
        clickable={true}
        onClick={() => openProfile(user.id)}
      />
      
      {/* معلومات المستخدم */}
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}
```

الآن `Avatar` أصبح مكون شامل يدعم جميع احتياجات عرض حالة المستخدم! 🎉