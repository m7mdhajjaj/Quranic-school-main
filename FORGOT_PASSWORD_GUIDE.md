# نظام نسيان كلمة السر - دليل التوثيق

## نظرة عامة
نظام نسيان كلمة السر يدعم جميع أنواع المستخدمين في النظام:
- 👨‍🎓 **الطلاب** (Students)
- 👨‍🏫 **المعلمين** (Teachers)  
- 👨‍💼 **المسؤولين** (Admins)

## كيفية العمل

### المرحلة الأولى: التحقق من الهوية
يجب على المستخدم إدخال جميع البيانات الشخصية التالية:
1. الاسم الأول
2. اسم الأب
3. اسم الجد
4. اسم العائلة
5. اسم الأم
6. رقم الهوية
7. تاريخ الميلاد

**API Endpoint:** `POST /auth/verify-identity`

**Request Body:**
```json
{
  "firstName": "محمد",
  "fatherName": "أحمد",
  "grandFatherName": "علي",
  "lastName": "الحسن",
  "motherName": "فاطمة",
  "idNumber": "12345678",
  "birthDate": "2000-01-01"
}
```

**Response:**
```json
{
  "success": true,
  "message": "تم التحقق من البيانات بنجاح",
  "userType": "student",
  "userId": "507f1f77bcf86cd799439011"
}
```

### المرحلة الثانية: إعادة تعيين كلمة المرور
بعد نجاح التحقق، يدخل المستخدم كلمة المرور الجديدة.

**API Endpoint:** `POST /auth/reset-password`

**Request Body:**
```json
{
  "firstName": "محمد",
  "fatherName": "أحمد",
  "grandFatherName": "علي",
  "lastName": "الحسن",
  "motherName": "فاطمة",
  "idNumber": "12345678",
  "birthDate": "2000-01-01",
  "newPassword": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "تم تغيير كلمة المرور بنجاح"
}
```

## الملفات المعنية

### Backend
1. **Controller:** `Backend/src/controllers/authController.js`
   - `exports.verifyIdentity` - التحقق من الهوية
   - `exports.resetPassword` - إعادة تعيين كلمة المرور

2. **Routes:** `Backend/src/routes/authRoutes.js`
   - `POST /auth/verify-identity`
   - `POST /auth/reset-password`

3. **Validation:** `Backend/src/Validation/AuthValidation.js`
   - `validateVerifyIdentity` - التحقق من صحة بيانات الهوية
   - `validateResetPassword` - التحقق من صحة كلمة المرور الجديدة

### Frontend
1. **API:** `Frontend/src/Api/authApi.ts`
   - `verifyIdentity()` - استدعاء API التحقق
   - `resetPassword()` - استدعاء API إعادة التعيين

2. **Modal Component:** `Frontend/src/pages/Auth/ForgotPasswordModal.tsx`
   - مكون النافذة المنبثقة لنسيان كلمة السر
   - يحتوي على مرحلتين (التحقق + إعادة التعيين)

3. **Login Page:** `Frontend/src/pages/Auth/Login.tsx`
   - يحتوي على زر "نسيت كلمة المرور؟"
   - يفتح الـ Modal عند الضغط عليه

## آلية البحث في قاعدة البيانات

النظام يبحث تلقائياً في الترتيب التالي:

1. **جدول الطلاب (Students)**
   - يبحث بـ `idNumber` أو `studentId`
   - يطابق جميع البيانات الشخصية
   - إذا وجد تطابق، يحدد `userType: "student"`

2. **جدول المعلمين (Teachers)**
   - يبحث بـ `idNumber` أو `teacherId`
   - يطابق جميع البيانات الشخصية
   - إذا وجد تطابق، يحدد `userType: "teacher"`

3. **جدول المسؤولين (Admins)**
   - يبحث بـ `idNumber` أو `adminId`
   - يطابق جميع البيانات الشخصية
   - إذا وجد تطابق، يحدد `userType: "admin"`

## الأمان

### التشفير
- كلمات المرور يتم تشفيرها باستخدام `bcrypt`
- Salt rounds: 10
- التشفير يتم في الـ Backend فقط

### التحقق
- يجب تطابق **جميع** البيانات الشخصية السبعة
- تاريخ الميلاد يتم التحقق منه بدقة (YYYY-MM-DD)
- رقم الهوية يجب أن يكون فريداً في قاعدة البيانات

### Validation
- الأسماء: يجب أن تكون نصوص غير فارغة
- رقم الهوية: يجب أن يكون 8 أرقام
- كلمة المرور: يجب أن تكون 6 أحرف على الأقل
- تاريخ الميلاد: يجب أن يكون تاريخ صالح

## رسائل الخطأ

| الحالة | الرسالة |
|--------|---------|
| بيانات غير مكتملة | "الرجاء إدخال جميع البيانات المطلوبة" |
| بيانات غير صحيحة | "البيانات المدخلة غير صحيحة. تأكد من جميع البيانات الشخصية." |
| كلمة مرور قصيرة | "كلمة المرور يجب أن تكون 6 أحرف على الأقل" |
| عدم تطابق كلمة المرور | "كلمة المرور وتأكيد كلمة المرور غير متطابقتين" |
| خطأ في الخادم | "حدث خطأ أثناء معالجة الطلب" |

## الاستخدام من الـ Frontend

```typescript
import { verifyIdentity, resetPassword } from '../../Api/authApi';

// المرحلة 1: التحقق من الهوية
const verifyData = {
  firstName: "محمد",
  fatherName: "أحمد",
  grandFatherName: "علي",
  lastName: "الحسن",
  motherName: "فاطمة",
  idNumber: "12345678",
  birthDate: "2000-01-01"
};

const verifyResponse = await verifyIdentity(verifyData);

if (verifyResponse.success) {
  // المرحلة 2: إعادة تعيين كلمة المرور
  const resetData = {
    ...verifyData,
    newPassword: "newPassword123"
  };
  
  const resetResponse = await resetPassword(resetData);
  
  if (resetResponse.success) {
    alert("تم تغيير كلمة المرور بنجاح!");
  }
}
```

## الملاحظات المهمة

1. ✅ النظام يدعم الطلاب والمعلمين والمسؤولين **تلقائياً**
2. ✅ لا يحتاج المستخدم لتحديد نوعه - النظام يكتشف ذلك تلقائياً
3. ✅ كل المطابقات تتم بدون حساسية لحالة الأحرف (case-insensitive)
4. ✅ البيانات يتم تنظيفها (sanitize) قبل المعالجة
5. ✅ كلمات المرور يتم تشفيرها قبل الحفظ في قاعدة البيانات

## التحديثات الأخيرة

### ✨ الميزات المضافة
- ✅ دعم المسؤولين (Admins) في نظام نسيان كلمة السر
- ✅ النافذة المنبثقة (Modal) بدلاً من صفحة منفصلة
- ✅ تصميم responsive ومتناسق
- ✅ رسائل خطأ واضحة ومفصلة

### 🔧 التحسينات
- تحسين آلية البحث في قاعدة البيانات
- تحسين رسائل الخطأ للمستخدم
- إضافة التحقق المزدوج (Backend + Frontend)

---

**تاريخ آخر تحديث:** 2025-10-13
**الإصدار:** 2.0
