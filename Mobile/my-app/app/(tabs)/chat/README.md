# نظام المحادثات - Chat System

## 📱 الملفات والمكونات

### الصفحات (Pages)

- **app/(tabs)/chat/index.tsx** - الصفحة الرئيسية للمحادثات
- **app/(tabs)/chat/[chatId].tsx** - نافذة المحادثة (Chat Window)
- **app/(tabs)/chat/\_layout.tsx** - تخطيط الشات

### المكونات (Components)

- **components/chat/ConversationItem.tsx** - عنصر المحادثة في القائمة
- **components/chat/MessageItem.tsx** - عنصر الرسالة

### Hooks

- **hooks/chat/useConversations.ts** - إدارة المحادثات
- **hooks/chat/useConversationItem.ts** - منطق عنصر المحادثة

### الأنواع (Types)

- **types/chat/index.ts** - تعريفات الأنواع للشات

### API

- **Api/chatApi.ts** - استدعاءات API للشات

## 🎯 المزايا

### ✅ الصفحة الرئيسية (Chat List)

- عرض قائمة المحادثات
- البحث في المحادثات
- التبويب بين المحادثات وجهات الاتصال
- عرض عدد الرسائل غير المقروءة
- زر إنشاء محادثة جديدة

### ✅ نافذة المحادثة (Chat Window)

- عرض الرسائل في قائمة
- إرسال رسائل جديدة
- عرض حالة الرسالة (مُرسل، مُستلم، مقروء)
- دعم المحادثات الفردية والجماعية
- عرض اسم المرسل في المجموعات
- التمرير التلقائي للأسفل عند إرسال رسالة

### ✅ المزايا الإضافية

- دعم RTL (من اليمين لليسار)
- تصميم متجاوب للهاتف
- مؤشرات التحميل
- معالجة الأخطاء

## 📋 الاستخدام

### الانتقال إلى الشات

```typescript
// من القائمة الجانبية (Drawer)
router.push("/chat");

// الانتقال إلى محادثة محددة
router.push({
  pathname: "/chat/[chatId]",
  params: {
    chatId: conv._id,
    chatType: "DM", // أو 'GROUP'
    targetId: targetId,
    targetName: targetName,
    targetAvatar: targetAvatar,
  },
});
```

### إرسال رسالة

```typescript
// رسالة فردية (DM)
const res = await api.post("/chat/messages", {
  chatType: "DM",
  receiver: userId,
  text: messageText,
});

// رسالة جماعية (GROUP)
const res = await api.post("/chat/messages", {
  chatType: "GROUP",
  groupId: groupId,
  text: messageText,
});
```

## 🔄 تم النقل من Frontend

تم نقل نظام الشات من Frontend إلى Mobile مع الالتزام بالقواعد التالية:

1. ✅ نفس التصميم المتجاوب للهاتف
2. ✅ نفس الوظائف بدون زيادة أو نقصان
3. ✅ نفس الترتيب والتقسيم
4. ✅ استخدام مكونات React Native بدلاً من HTML/CSS

## 🎨 التصميم

التصميم يتبع نفس نمط Frontend مع:

- ألوان Emerald للعناصر النشطة
- تصميم مسطح وعصري
- أيقونات Lucide React Native
- دعم الوضع الليلي (قريباً)

## 📝 ملاحظات

- النظام جاهز للعمل الأساسي
- Socket.IO للرسائل الفورية سيتم إضافته لاحقاً
- جهات الاتصال ستكون متاحة قريباً
- دعم المرفقات (الصور/الملفات) قريباً
