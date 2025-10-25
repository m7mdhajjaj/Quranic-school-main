# 🔊 دليل استخدام الأصوات في النظام

## ملف useSounds.ts

تم إضافة نغمات تسجيل الخروج والدخول إلى الـ hook.

### الأصوات المتوفرة:

```typescript
import { useSounds } from '@/hooks/useSounds';

const sounds = useSounds();

// الأصوات المتوفرة:
sounds.playAdd();          // إضافة عنصر
sounds.playUpdate();       // تحديث عنصر
sounds.playDelete();       // حذف عنصر
sounds.playError();        // خطأ
sounds.playSuccess();      // نجاح
sounds.playNotification(); // إشعار
sounds.playLogout();       // تسجيل خروج ⭐ جديد
sounds.playLogin();        // تسجيل دخول ⭐ جديد
```

## 📝 أمثلة الاستخدام

### 1. في React Component لتسجيل الدخول

```tsx
import React from 'react';
import { useSounds } from '@/hooks/useSounds';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const sounds = useSounds();
  const navigate = useNavigate();

  const handleLogin = async (credentials) => {
    try {
      const response = await loginAPI(credentials);
      
      if (response.success) {
        sounds.playLogin(); // 🔊 تشغيل صوت الدخول
        navigate('/dashboard');
      }
    } catch (error) {
      sounds.playError(); // 🔊 تشغيل صوت خطأ
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      {/* Login form */}
    </form>
  );
};
```

### 2. في React Component لتسجيل الخروج

```tsx
import React from 'react';
import { useSounds } from '@/hooks/useSounds';
import { handleLogout } from '@/components/utils/logoutUtils';

const LogoutButton = () => {
  const sounds = useSounds();

  const onLogout = async () => {
    sounds.playLogout(); // 🔊 تشغيل صوت الخروج
    
    await handleLogout({
      userType: 'user',
      onConfirm: () => {
        console.log('تم تسجيل الخروج بنجاح');
      }
    });
  };

  return (
    <button onClick={onLogout}>
      تسجيل الخروج
    </button>
  );
};
```

### 3. في Utility Function (خارج React)

للاستخدام في الدوال العادية (مثل `logoutUtils.ts`):

```typescript
// استخدام مباشر للأصوات
const playLogoutSound = (soundFile: string) => {
  const audio = new Audio(`/sounds/${soundFile}`);
  audio.volume = 0.5;
  audio.play().catch(console.warn);
};

// في دالة تسجيل الخروج
export const showLogoutConfirmation = async (options) => {
  playLogoutSound('notification.mp3'); // صوت التنبيه
  
  // ... باقي الكود
  
  if (confirmed) {
    playLogoutSound('successful.mp3'); // صوت النجاح
    cleanupSession();
  }
};
```

## 🎵 ملفات الصوت المطلوبة

تأكد من وجود هذه الملفات في `/public/sounds/`:

```
public/
└── sounds/
    ├── successful.mp3    ✅ (موجود - للنجاح والدخول)
    ├── error.wav         ✅ (موجود - للأخطاء)
    └── notification.mp3  ✅ (موجود - للإشعارات والخروج)
```

## ⚙️ التكوين

### تعديل مستوى الصوت:

```typescript
// في useSounds.ts
const playLogout = () => {
  const audio = new Audio('/sounds/notification.mp3');
  audio.volume = 0.5; // 0.0 إلى 1.0
  audio.play();
};
```

### استخدام ملف صوت مخصص:

إذا أردت إضافة ملف صوت خاص لتسجيل الخروج:

1. أضف الملف إلى `/public/sounds/logout.mp3`
2. عدل في `useSounds.ts`:

```typescript
const playLogout = () => {
  const audio = new Audio('/sounds/logout.mp3'); // ملف مخصص
  audio.volume = 0.5;
  audio.play().catch(console.warn);
};
```

## 🔄 التكامل الحالي

### في logoutUtils.ts:

```typescript
// تشغيل صوت عند فتح نافذة التأكيد
playLogoutSound('notification.mp3');

// تشغيل صوت عند النجاح
playLogoutSound('successful.mp3');

// تشغيل صوت عند الخطأ
playLogoutSound('error.wav');
```

### في sweetalertUtils.ts:

```typescript
// تشغيل صوت النجاح
playSound('successful.mp3');

// تشغيل صوت الخطأ
playSound('error.wav');
```

## 💡 نصائح

1. **استخدم `useSounds` في React Components**
2. **استخدم الدوال المباشرة في Utility Files**
3. **اضبط مستوى الصوت حسب الحاجة (0.5 - 0.7 مناسب)**
4. **تعامل مع الأخطاء بـ `.catch()` لتجنب Console Errors**

## 🎯 الفرق بين playLogout و playLogin

| الدالة | الصوت | الاستخدام | مستوى الصوت |
|--------|-------|-----------|-------------|
| `playLogout()` | `notification.mp3` | عند تسجيل الخروج | 0.5 |
| `playLogin()` | `successful.mp3` | عند تسجيل الدخول | 0.6 |

---

✨ **ملاحظة**: جميع الأصوات تعمل بشكل تلقائي مع معالجة الأخطاء المناسبة!
