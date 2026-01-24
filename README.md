# 📖 مدرسة القرآن الكريم - Quranic School Management System

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/Node.js-v18+-green.svg)
![React](https://img.shields.io/badge/React-19.1-61DAFB.svg)
![Expo](https://img.shields.io/badge/Expo-54-000020.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)

**نظام متكامل لإدارة المدارس القرآنية**

[العربية](#العربية) | [English](#english)

</div>

---

## العربية

### 🌟 نظرة عامة

نظام إدارة شامل للمدارس القرآنية يوفر منصة متكاملة للطلاب والمعلمين والإداريين. يتضمن النظام تطبيق ويب وتطبيق موبايل لتسهيل عملية التعليم ومتابعة التقدم.

### 🏗️ هيكل المشروع

```
Quranic-School/
├── Backend/          # خادم Node.js + Express
├── Frontend/         # تطبيق ويب React + Vite
└── Mobile/           # تطبيق موبايل Expo + React Native
```

### ✨ الميزات الرئيسية

#### 📚 إدارة التعليم
- **التسميع اليومي**: تسجيل ومتابعة تسميع الطلاب للقرآن الكريم
- **الاختبارات**: جدولة وإدارة اختبارات الحفظ والتجويد
- **الأهداف**: تحديد ومتابعة أهداف الحفظ لكل طالب
- **التقارير**: تقارير شاملة عن تقدم الطلاب

#### 👥 إدارة المستخدمين
- **نظام صلاحيات متعدد**: مدير، معلم، مساعد معلم، سكرتير، طالب
- **الملفات الشخصية**: إدارة بيانات المستخدمين
- **نظام المصادقة**: تسجيل دخول آمن مع JWT

#### 📊 المتابعة والتقييم
- **الحضور والغياب**: تسجيل ومتابعة حضور الطلاب
- **نظام النقاط**: تحفيز الطلاب عبر نظام نقاط تفاعلي
- **الترتيب**: ترتيب الطلاب حسب الأداء
- **التحذيرات**: نظام إنذارات للمخالفات

#### 💬 التواصل
- **الدردشة**: نظام محادثات داخلي
- **الإشعارات**: إشعارات فورية عبر Firebase
- **الأخبار**: نشر الأخبار والإعلانات

#### 🤖 الذكاء الاصطناعي
- **مساعد ذكي**: دردشة مع مساعد AI للاستفسارات القرآنية
- **تكامل OpenAI**: استخدام GPT للإجابة على الأسئلة

#### 🕌 أدوات إسلامية
- **مواقيت الصلاة**: عرض أوقات الصلاة حسب الموقع
- **الأذكار**: أذكار الصباح والمساء
- **القرآن الكريم**: تلاوة وقراءة القرآن

### 🛠️ التقنيات المستخدمة

#### Backend
| التقنية | الوصف |
|---------|-------|
| Node.js | بيئة التشغيل |
| Express 5 | إطار العمل |
| MongoDB + Mongoose | قاعدة البيانات |
| Redis | التخزين المؤقت |
| Socket.io | الاتصال الفوري |
| JWT | المصادقة |
| Firebase Admin | الإشعارات |
| Cloudinary | تخزين الملفات |
| OpenAI | الذكاء الاصطناعي |

#### Frontend
| التقنية | الوصف |
|---------|-------|
| React 19 | مكتبة واجهات المستخدم |
| Vite | أداة البناء |
| TypeScript | لغة البرمجة |
| TailwindCSS 4 | التنسيق |
| React Query | إدارة الحالة |
| Zustand | إدارة الحالة العامة |
| Socket.io Client | الاتصال الفوري |
| Chart.js | الرسوم البيانية |

#### Mobile
| التقنية | الوصف |
|---------|-------|
| Expo 54 | إطار العمل |
| React Native | تطوير الموبايل |
| NativeWind | التنسيق |
| Expo Router | التنقل |
| Expo Notifications | الإشعارات |

### 🚀 التشغيل

#### المتطلبات
- Node.js v18 أو أحدث
- MongoDB
- Redis (اختياري)
- حساب Cloudinary
- حساب OpenAI (اختياري)

#### تشغيل Backend
```bash
cd Backend
npm install
npm run dev
```

#### تشغيل Frontend
```bash
cd Frontend
npm install
npm run dev
```

#### تشغيل Mobile
```bash
cd Mobile/my-app
npm install
npm start
```

### ⚙️ متغيرات البيئة

#### Backend (.env)
```env
PORT=5005
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
REDIS_HOST=localhost
REDIS_PORT=6379
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
OPENAI_API_KEY=your_openai_key
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5005
VITE_SOCKET_URL=http://localhost:5005
```

### 📁 هيكل الملفات

<details>
<summary>Backend</summary>

```
Backend/src/
├── app.js              # نقطة الدخول
├── config/             # الإعدادات
├── controllers/        # المتحكمات
├── middleware/         # الوسطاء
├── routes/             # المسارات
├── services/           # الخدمات
├── sockets/            # Socket.io
├── utils/              # الأدوات المساعدة
└── Validation/         # التحقق من البيانات
```

</details>

<details>
<summary>Frontend</summary>

```
Frontend/src/
├── Api/                # طلبات API
├── components/         # المكونات
├── Context/            # سياق React
├── hooks/              # الخطافات المخصصة
├── pages/              # الصفحات
├── styles/             # التنسيقات
├── types/              # أنواع TypeScript
└── utils/              # الأدوات المساعدة
```

</details>

<details>
<summary>Mobile</summary>

```
Mobile/my-app/
├── Api/                # طلبات API
├── app/                # الشاشات (Expo Router)
├── components/         # المكونات
├── Context/            # سياق React
├── hooks/              # الخطافات المخصصة
└── utils/              # الأدوات المساعدة
```

</details>

### 🌐 النشر

المشروع مُعد للنشر على Render.com. راجع ملف `render.yaml` للتفاصيل.

---

## English

### 🌟 Overview

A comprehensive management system for Quranic schools providing an integrated platform for students, teachers, and administrators. The system includes a web application and mobile app to facilitate the learning process and track progress.

### ✨ Key Features

- **Daily Recitation**: Track and record student Quran recitations
- **Exams Management**: Schedule and manage memorization tests
- **Goals Tracking**: Set and monitor memorization goals
- **Attendance System**: Track student attendance
- **Points & Ranking**: Motivate students with a gamified points system
- **Real-time Chat**: Internal messaging system
- **Push Notifications**: Instant notifications via Firebase
- **AI Assistant**: ChatGPT-powered Q&A for Quranic inquiries
- **Prayer Times**: Location-based prayer times
- **Quran Reader**: Built-in Quran reading and audio

### 🛠️ Tech Stack

**Backend**: Node.js, Express 5, MongoDB, Redis, Socket.io, JWT, Firebase Admin, Cloudinary, OpenAI

**Frontend**: React 19, Vite, TypeScript, TailwindCSS 4, React Query, Zustand, Chart.js

**Mobile**: Expo 54, React Native, NativeWind, Expo Router

### 🚀 Quick Start

```bash
# Backend
cd Backend && npm install && npm run dev

# Frontend
cd Frontend && npm install && npm run dev

# Mobile
cd Mobile/my-app && npm install && npm start
```

### 📄 API Endpoints

| Endpoint | Description |
|----------|-------------|
| `/api/auth` | Authentication |
| `/api/students` | Student management |
| `/api/teachers` | Teacher management |
| `/api/groups` | Group management |
| `/api/daily-mark` | Daily recitation marks |
| `/api/attendance` | Attendance tracking |
| `/api/exams` | Exam scheduling |
| `/api/goals` | Goals management |
| `/api/chat` | Messaging |
| `/api/notifications` | Push notifications |
| `/api/ranking` | Student rankings |
| `/api/reports` | Reports |

---

## 📝 License

This project is licensed under the ISC License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For any inquiries, please open an issue in the repository.

---

<div align="center">

**صُنع بـ ❤️ لخدمة كتاب الله**

</div>
