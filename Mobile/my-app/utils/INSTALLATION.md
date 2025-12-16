# تعليمات التثبيت - Utils ⚙️

## 📦 المكتبات المطلوبة

### 1. تثبيت مكتبة expo-av للأصوات

```bash
npx expo install expo-av
```

### 2. تثبيت مكتبة Toast Messages

```bash
npm install react-native-toast-message
```

---

## 🔊 إعداد ملفات الأصوات

### 1. إنشاء مجلد الأصوات

قم بإنشاء المجلد التالي:

```
Mobile/my-app/assets/sounds/
```

### 2. إضافة ملفات الأصوات

انسخ الملفات التالية من Frontend إلى Mobile:

```
Frontend/public/src/assets/sounds/successful.mp3  →  Mobile/my-app/assets/sounds/successful.mp3
Frontend/public/src/assets/sounds/error.wav       →  Mobile/my-app/assets/sounds/error.wav
Frontend/public/src/assets/sounds/Adhan.mp3       →  Mobile/my-app/assets/sounds/Adhan.mp3
Frontend/public/src/assets/sounds/notification.mp3 →  Mobile/my-app/assets/sounds/notification.mp3
```

**ملاحظة:** إذا لم تكن الأصوات موجودة في Frontend، يمكنك استخدام أي ملفات صوتية أخرى، فقط تأكد من تطابق الأسماء.

---

## 🍞 إعداد Toast Component

### 1. فتح ملف App.tsx

افتح الملف: `Mobile/my-app/app/_layout.tsx` أو `Mobile/my-app/App.tsx`

### 2. إضافة Toast Component

أضف الكود التالي:

```typescript
import Toast from 'react-native-toast-message';

export default function RootLayout() {
  return (
    <>
      {/* المحتوى الموجود */}
      <Stack>
        {/* Routes */}
      </Stack>

      {/* إضافة Toast في النهاية */}
      <Toast />
    </>
  );
}
```

### 3. تخصيص تصميم Toast (اختياري)

يمكنك تخصيص تصميم Toast بإضافة config:

```typescript
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';

const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#10b981' }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'right',
      }}
      text2Style={{
        fontSize: 14,
        textAlign: 'right',
      }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: '#ef4444' }}
      text1Style={{
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'right',
      }}
      text2Style={{
        fontSize: 14,
        textAlign: 'right',
      }}
    />
  ),
};

export default function RootLayout() {
  return (
    <>
      <Stack />
      <Toast config={toastConfig} />
    </>
  );
}
```

---

## 🎯 إعداد TypeScript Path Alias

لاستخدام `@/utils` بدلاً من المسارات النسبية الطويلة.

### 1. فتح tsconfig.json

افتح الملف: `Mobile/my-app/tsconfig.json`

### 2. إضافة paths

تأكد من وجود:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### 3. إعداد babel (إذا لزم الأمر)

في `babel.config.js`:

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@": "./",
          },
        },
      ],
    ],
  };
};
```

إذا لم تكن مكتبة `babel-plugin-module-resolver` مثبتة:

```bash
npm install --save-dev babel-plugin-module-resolver
```

---

## ✅ التحقق من التثبيت

### 1. اختبار AudioManager

أنشئ ملف تجريبي: `test-utils.tsx`

```typescript
import { View, Button } from 'react-native';
import { audioManager } from '@/utils';

export default function TestUtils() {
  const testSound = async () => {
    await audioManager.play('successful.mp3');
  };

  return (
    <View>
      <Button title="Test Sound" onPress={testSound} />
    </View>
  );
}
```

### 2. اختبار Toast

```typescript
import { View, Button } from 'react-native';
import { showSuccessToast, showErrorToast } from '@/utils';

export default function TestToast() {
  return (
    <View>
      <Button
        title="Success Toast"
        onPress={() => showSuccessToast('تم بنجاح')}
      />
      <Button
        title="Error Toast"
        onPress={() => showErrorToast('حدث خطأ')}
      />
    </View>
  );
}
```

### 3. اختبار Alert

```typescript
import { View, Button } from 'react-native';
import { showSuccessMessage, showConfirmDialog } from '@/utils';

export default function TestAlert() {
  return (
    <View>
      <Button
        title="Success Alert"
        onPress={() => showSuccessMessage('نجاح', 'تم الحفظ')}
      />
      <Button
        title="Confirm Dialog"
        onPress={() => showConfirmDialog(
          'تأكيد',
          'هل أنت متأكد؟',
          () => console.log('Yes'),
          () => console.log('No')
        )}
      />
    </View>
  );
}
```

### 4. اختبار Date Helpers

```typescript
import { Text, View } from 'react-native';
import { formatArabicDate, formatTime12Arabic } from '@/utils';

export default function TestDate() {
  return (
    <View>
      <Text>{formatArabicDate(new Date())}</Text>
      <Text>{formatTime12Arabic('14:30')}</Text>
    </View>
  );
}
```

---

## 🚨 حل المشاكل الشائعة

### المشكلة 1: Cannot find module 'expo-av'

**الحل:**

```bash
npx expo install expo-av
```

ثم أعد تشغيل التطبيق:

```bash
npx expo start -c
```

---

### المشكلة 2: Sound files not found

**الحل:**

1. تأكد من وجود مجلد `assets/sounds/`
2. تأكد من أسماء الملفات صحيحة تماماً
3. أعد تشغيل التطبيق بعد إضافة الملفات

---

### المشكلة 3: Toast لا يظهر

**الحل:**

1. تأكد من إضافة `<Toast />` في App layout
2. تأكد من أن Toast في آخر المكونات (بعد Stack/Navigation)
3. جرب:

```typescript
import Toast from 'react-native-toast-message';

// في نهاية JSX
return (
  <>
    {/* content */}
    <Toast />
  </>
);
```

---

### المشكلة 4: Path alias @ لا يعمل

**الحل:**

1. تأكد من tsconfig.json يحتوي على paths
2. ثبت babel-plugin-module-resolver
3. أعد تشغيل Metro bundler:

```bash
npx expo start -c
```

---

### المشكلة 5: Audio لا يعمل على iOS

**الحل:**
في `app.json` أضف:

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "UIBackgroundModes": ["audio"]
      }
    }
  }
}
```

---

## 📱 اختبار على الجهاز

### Android

```bash
npx expo run:android
```

### iOS

```bash
npx expo run:ios
```

### Web (للتطوير السريع)

```bash
npx expo start --web
```

**ملاحظة:** بعض الميزات (مثل Audio) قد لا تعمل على Web.

---

## ✨ الخطوات التالية

بعد إكمال التثبيت:

1. ✅ اختبر جميع الدوال الأساسية
2. ✅ تأكد من عمل الأصوات
3. ✅ تأكد من ظهور Toast
4. ✅ اختبر Alert على iOS و Android
5. ✅ ابدأ باستخدام Utils في مكونات التطبيق

---

## 📚 الموارد

- [Expo Audio Documentation](https://docs.expo.dev/versions/latest/sdk/audio/)
- [React Native Toast Message](https://github.com/calintamas/react-native-toast-message)
- [React Native Alert](https://reactnative.dev/docs/alert)

---

تم التحديث: 2025-01-24
