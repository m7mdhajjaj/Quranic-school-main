# توثيق API تسجيل الدخول الموحد

## نظرة عامة
تم توحيد نظام تسجيل الدخول ليستخدم **endpoint واحد فقط** لجميع أنواع المستخدمين (طلاب، معلمين، إداريين).

الباك إند يحدد نوع المستخدم تلقائياً بناءً على المعرف المدخل، ولا يحتاج الفرونت إند لإرسال `userType`.

---

## Endpoint

### تسجيل الدخول الموحد
```
POST /api/auth/login
```

#### Request Body
```json
{
  "identifier": "string",    // رقم الطالب أو رقم المعلم أو رقم الإداري
  "password": "string",       // كلمة المرور
  "rememberMe": boolean       // اختياري - افتراضياً false
}
```

**حقول بديلة مدعومة (للتوافق مع الكود القديم):**
- `studentId` بدلاً من `identifier`
- `teacherId` بدلاً من `identifier`
- `adminId` بدلاً من `identifier`
- `idNumber` بدلاً من `password`

#### آلية عمل البحث التلقائي:
1. **البحث كطالب**: إذا كان identifier رقم، يبحث في `Student` بحقل `studentId`
2. **البحث كمعلم**: يبحث في `Teacher` بحقل `teacherId`
3. **البحث كإداري**: يبحث في `Admin` بحقل `adminId`

#### Response - Success (200)
```json
{
  "success": true,
  "token": "JWT_TOKEN",
  "user": {
    "_id": "string",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "gender": "string",
    "avatar": "string",
    "role": "student" | "teacher" | "admin",  // يحدد تلقائياً من الباك إند
    "isActive": true,
    // حقول إضافية حسب نوع المستخدم:
    // للطلاب:
    "studentId": number,
    "fatherName": "string",
    "group": "string",
    // للمعلمين:
    "teacherId": "string",
    "groups": ["string"],
    // للإداريين:
    "adminId": "string"
  }
}
```

#### Response - Error (400)
```json
{
  "success": false,
  "message": "الرجاء إدخال المعرف وكلمة المرور"
}
```

#### Response - Error (401)
```json
{
  "success": false,
  "message": "المعرف غير صحيح أو غير موجود"
}
// أو
{
  "success": false,
  "message": "كلمة المرور غير صحيحة"
}
```

#### Response - Error (500)
```json
{
  "success": false,
  "message": "حدث خطأ أثناء تسجيل الدخول",
  "error": {  // في حالة development فقط
    "name": "string",
    "message": "string",
    "details": "string"
  }
}
```

---

## أمثلة على الاستخدام

### مثال 1: تسجيل دخول طالب
```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    identifier: "12345",  // رقم الطالب
    password: "studentPassword",
    rememberMe: false
  })
});

const data = await response.json();
// data.user.role === "student"
```

### مثال 2: تسجيل دخول معلم
```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    identifier: "TCH001",  // رقم المعلم
    password: "teacherPassword",
    rememberMe: true
  })
});

const data = await response.json();
// data.user.role === "teacher"
```

### مثال 3: تسجيل دخول إداري
```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    identifier: "ADM001",  // رقم الإداري
    password: "adminPassword",
    rememberMe: true
  })
});

const data = await response.json();
// data.user.role === "admin"
```

---

## ملاحظات مهمة

### 🔒 الأمان
- كلمات المرور مشفرة باستخدام bcrypt
- JWT tokens محمية ب secret key
- مدة الجلسة: 30 دقيقة (عادي) أو 7 أيام (مع rememberMe)

### ✅ المزايا
1. **endpoint واحد فقط** - تبسيط الكود
2. **تحديد تلقائي للنوع** - الباك إند يحدد role المستخدم
3. **أمان أعلى** - الفرونت إند لا يتحكم في تحديد النوع
4. **توافق مع الكود القديم** - يدعم الحقول القديمة

### 📝 التغييرات المطلوبة في الفرونت إند
1. إزالة إرسال `userType` في body
2. استخدام `identifier` بدلاً من حقول منفصلة (اختياري)
3. الاعتماد على `user.role` من الاستجابة لتحديد نوع المستخدم

### 🔄 التوافق مع الكود القديم
النظام الجديد يدعم جميع الطرق القديمة:
- ✅ `studentId` + `idNumber`
- ✅ `teacherId` + `password`
- ✅ `adminId` + `password`
- ✅ `identifier` + `password` (الطريقة الموحدة الجديدة)

---

## Routes المتاحة

| Method | Endpoint | الوصف |
|--------|----------|-------|
| POST | `/api/auth/login` | تسجيل دخول موحد لجميع الأنواع |
| POST | `/api/auth/logout` | تسجيل خروج (يحتاج Authentication) |

---

## مثال كامل بـ Axios

```javascript
import axios from 'axios';

async function unifiedLogin(identifier, password, rememberMe = false) {
  try {
    const response = await axios.post('/api/auth/login', {
      identifier,
      password,
      rememberMe
    });
    
    const { token, user } = response.data;
    
    // حفظ token
    localStorage.setItem('token', token);
    
    // التوجيه حسب نوع المستخدم
    switch(user.role) {
      case 'student':
        window.location.href = '/student/dashboard';
        break;
      case 'teacher':
        window.location.href = '/teacher/dashboard';
        break;
      case 'admin':
        window.location.href = '/admin/dashboard';
        break;
    }
    
    return { success: true, user };
  } catch (error) {
    console.error('Login failed:', error.response?.data?.message);
    return { 
      success: false, 
      message: error.response?.data?.message || 'فشل تسجيل الدخول'
    };
  }
}
```

---

## الخلاصة

### ✨ النظام الجديد (موحد)
```javascript
// بغض النظر عن نوع المستخدم - نفس الكود!
POST /api/auth/login
{
  "identifier": "أي_رقم_معرف",
  "password": "كلمة_المرور"
}
```

### ❌ النظام القديم (غير مستخدم الآن)
```javascript
// كان يحتاج تحديد userType من الفرونت إند
POST /api/auth/login
{
  "identifier": "12345",
  "password": "pass",
  "userType": "student"  // ❌ لم يعد مطلوباً
}
```

**الباك إند يحدد نوع المستخدم تلقائياً! 🎯**
