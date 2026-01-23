# 📂 مجلد بيانات القرآن الآمن

هذا المجلد هو المكان الوحيد المسموح لملفات JSON عند استيراد بيانات القرآن.

## ✅ الملفات المسموحة
- `surahs.json` - بيانات السور
- `ayahs.json` - بيانات الآيات  
- `tafsir.json` - تفسير ابن كثير

## 🔒 الحماية
- **Path Traversal Protection**: لا يمكن الوصول لملفات خارج هذا المجلد
- **Extension Validation**: فقط ملفات `.json` مسموحة
- **Admin Only**: فقط المسؤولين يمكنهم استيراد البيانات

## 📝 طريقة الاستيراد

```bash
POST /api/quran/import
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "type": "surahs",
  "filePath": "surahs.json"
}
```

## ⚠️ ملاحظة
ضع ملفات JSON هنا قبل محاولة الاستيراد.
