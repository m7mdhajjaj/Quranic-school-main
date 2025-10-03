# أمثلة API للحلقات الجديدة

## 1. إنشاء معلم جديد بالحلقات

### Request POST /api/teachers

```json
{
  "firstName": "أحمد",
  "lastName": "محمد", 
  "email": "ahmed@example.com",
  "phoneNumber": "0512345678",
  "idNumber": "123456789",
  "password": "securepassword",
  "birthDate": "1990-05-15",
  "gender": "ذكر",
  "residence": "الرياض",
  "groups": [
    {
      "id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "name": "حلقة تحفيظ القرآن المتقدمة",
      "number": 1
    },
    {
      "id": "60f7b3b3b3b3b3b3b3b3b3b4", 
      "name": "حلقة التجويد الأساسية",
      "number": 2
    }
  ]
}
```

### Response 201 Created

```json
{
  "success": true,
  "message": "تم إنشاء المعلم بنجاح",
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b5",
    "teacherId": 200001,
    "firstName": "أحمد",
    "lastName": "محمد",
    "email": "ahmed@example.com",
    "phoneNumber": "0512345678",
    "idNumber": "123456789",
    "birthDate": "1990-05-15",
    "age": 35,
    "gender": "ذكر",
    "residence": "الرياض",
    "groups": [
      {
        "id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "name": "حلقة تحفيظ القرآن المتقدمة",
        "number": 1
      },
      {
        "id": "60f7b3b3b3b3b3b3b3b3b3b4",
        "name": "حلقة التجويد الأساسية", 
        "number": 2
      }
    ],
    "role": "teacher",
    "isActive": false,
    "createdAt": "2025-10-03T10:00:00.000Z",
    "updatedAt": "2025-10-03T10:00:00.000Z"
  }
}
```

## 2. الحصول على جميع المعلمين

### Request GET /api/teachers

### Response 200 OK

```json
{
  "success": true,
  "data": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b5",
      "teacherId": 200001,
      "firstName": "أحمد", 
      "lastName": "محمد",
      "email": "ahmed@example.com",
      "phoneNumber": "0512345678",
      "groups": [
        {
          "id": "60f7b3b3b3b3b3b3b3b3b3b3",
          "name": "حلقة تحفيظ القرآن المتقدمة",
          "number": 1
        },
        {
          "id": "60f7b3b3b3b3b3b3b3b3b3b4",
          "name": "حلقة التجويد الأساسية",
          "number": 2
        }
      ],
      "role": "teacher",
      "isActive": true,
      "createdAt": "2025-10-03T10:00:00.000Z"
    }
  ]
}
```

## 3. تحديث معلم موجود

### Request PUT /api/teachers/:id

```json
{
  "firstName": "أحمد المحدث",
  "groups": [
    {
      "id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "name": "حلقة تحفيظ القرآن المتقدمة",
      "number": 1
    },
    {
      "id": "60f7b3b3b3b3b3b3b3b3b3b6",
      "name": "حلقة جديدة",
      "number": 3
    }
  ]
}
```

## 4. البحث عن معلمين بناءً على الحلقة

### Request GET /api/teachers/for-student/:studentId

يبحث عن المعلمين المسؤولين عن حلقات الطالب

### Response 200 OK

```json
{
  "success": true,
  "data": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b5",
      "firstName": "أحمد",
      "lastName": "محمد",
      "groups": [
        {
          "id": "60f7b3b3b3b3b3b3b3b3b3b3",
          "name": "حلقة تحفيظ القرآن المتقدمة", 
          "number": 1
        }
      ]
    }
  ]
}
```

## 5. أخطاء شائعة

### خطأ في validation الحلقات

```json
{
  "success": false,
  "message": "خطأ في التحقق من صحة البيانات",
  "errors": {
    "groups": "كل حلقة يجب أن تحتوي على اسم ورقم ومعرف صالح."
  }
}
```

### بيانات حلقة ناقصة

```json
{
  "success": false, 
  "message": "بيانات الحلقة غير مكتملة",
  "details": "يجب توفير id و name و number لكل حلقة"
}
```

## ملاحظات للمطورين

1. **البنية الجديدة**: استخدم دائماً الكائن `{id, name, number}` للحلقات
2. **التوافق العكسي**: النظام يدعم البيانات القديمة (strings) مؤقتاً
3. **Migration**: استخدم السكريبت المتوفر لتحويل البيانات القديمة
4. **Validation**: تأكد من صحة بيانات الحلقة قبل الإرسال

## أدوات مساعدة للاختبار

### cURL للإنشاء

```bash
curl -X POST http://localhost:5005/api/teachers \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "أحمد",
    "lastName": "محمد", 
    "email": "ahmed@test.com",
    "phoneNumber": "0512345678",
    "password": "testpass",
    "groups": [
      {
        "id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "name": "حلقة تجريبية", 
        "number": 1
      }
    ]
  }'
```

### JavaScript للعرض في Frontend

```javascript
// عرض الحلقات في الجدول
const renderGroups = (groups) => {
  if (!groups || groups.length === 0) return '-';
  
  return groups.map(group => {
    const name = typeof group === 'string' ? group : group.name;
    const number = typeof group === 'object' && group.number ? ` (${group.number})` : '';
    return `${name}${number}`;
  }).join('، ');
};
```