# 🚀 دليل نظام التحديثات الفورية (Real-time System)

## 📋 المحتويات
1. [نظرة عامة](#نظرة-عامة)
2. [الهندسة المعمارية](#الهندسة-المعمارية)
3. [الميزات المطبقة](#الميزات-المطبقة)
4. [كيفية الاستخدام](#كيفية-الاستخدام)
5. [التوسع والتطوير](#التوسع-والتطوير)

---

## 🎯 نظرة عامة

النظام يستخدم **Socket.IO** لتوفير تحديثات فورية بين Server والـ Frontend بدون الحاجة لإعادة تحميل الصفحة.

### ✅ الميزات المطبقة حالياً:

#### 📊 1. تحديث الإحصائيات (Dashboard Stats)
- **الوظيفة**: تحديث أرقام Dashboard فور حدوث أي تغيير
- **المكونات المتأثرة**:
  - إجمالي الطلاب/المعلمين/المجموعات
  - متوسط العلامات
  - نسبة الحضور
  - الامتحانات القادمة

#### 👥 2. حالة المستخدمين (Online/Offline Status)
- **الوظيفة**: معرفة من متصل ومن غير متصل في الوقت الفعلي
- **التطبيق**:
  - عند Login → `isActive = true`
  - عند Logout/Disconnect → `isActive = false`
  - تحديث `lastSeen` تلقائياً

#### 📝 3. تحديثات البيانات الفورية
- **الطلاب**: إضافة/تعديل/حذف طالب
- **المعلمين**: إضافة/تعديل/حذف معلم
- **المجموعات**: تحديثات توزيع الطلاب
- **العلامات**: تحديث الترتيب فور إضافة علامات جديدة
- **الحضور**: تحديث سجل الحضور والغياب

---

## 🏗️ الهندسة المعمارية

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │            SocketContext.tsx                          │   │
│  │  • يدير الاتصال بـ Socket.IO                         │   │
│  │  • يخزن حالة الاتصال (connected/disconnected)        │   │
│  │  • يوفر functions للـ emit/listen                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                         ⬇️                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              useSocket Hook                           │   │
│  │  • يوفر وصول سهل لـ SocketContext                    │   │
│  │  • يرمي خطأ إذا استُخدم خارج SocketProvider          │   │
│  └──────────────────────────────────────────────────────┘   │
│                         ⬇️                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          useDashboardStats Hook                       │   │
│  │  • يستمع للتحديثات من Socket                         │   │
│  │  • يحدث State تلقائياً عند وصول بيانات جديدة          │   │
│  └──────────────────────────────────────────────────────┘   │
│                         ⬇️                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │            Dashboard Component                        │   │
│  │  • يعرض الإحصائيات المحدثة فورياً                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                            ⬆️ ⬇️
                      Socket.IO (WebSocket)
                            ⬆️ ⬇️
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Express + Socket.IO)             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │               app.js                                  │   │
│  │  • ينشئ Server و Socket.IO                           │   │
│  │  • يستمع للـ connections                              │   │
│  │  • يدير الـ rooms (dashboard, students, teachers)    │   │
│  └──────────────────────────────────────────────────────┘   │
│                         ⬇️                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │            Controllers (Student, Teacher, etc)        │   │
│  │  • عند إضافة/تعديل/حذف → emit event                  │   │
│  │  • io.to('dashboard').emit('dashboardUpdate', data)  │   │
│  └──────────────────────────────────────────────────────┘   │
│                         ⬇️                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              MongoDB                                  │   │
│  │  • حفظ البيانات                                       │   │
│  │  • تحديث isActive و lastSeen                          │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 الميزات المطبقة بالتفصيل

### 1️⃣ تحديث إحصائيات Dashboard

#### Frontend: `useDashboardStats.ts`
```typescript
const { onDashboardUpdate, joinDashboard, leaveDashboard } = useSocket();

useEffect(() => {
  // الانضمام لغرفة dashboard
  joinDashboard();
  
  // الاستماع للتحديثات
  const handleUpdate = (payload: DashboardUpdatePayload) => {
    if (payload.type === 'stats') {
      setStats(prev => ({ ...prev, ...payload.data }));
    } else if (payload.type === 'groups') {
      setGroupsDistribution(payload.data);
    } else if (payload.type === 'full') {
      fetchStats(); // إعادة جلب كل البيانات
    }
  };
  
  onDashboardUpdate(handleUpdate);
  
  return () => {
    offDashboardUpdate(handleUpdate);
    leaveDashboard();
  };
}, []);
```

#### Backend: عند إضافة طالب جديد
```javascript
// في studentController.js
const student = await Student.create(studentData);

// إرسال تحديث لكل من في غرفة dashboard
io.to('dashboard').emit('dashboardUpdate', {
  type: 'stats',
  data: { totalStudents: await Student.countDocuments() },
  timestamp: new Date().toISOString()
});
```

### 2️⃣ حالة المستخدمين (Online/Offline)

#### Frontend: عند Login
```typescript
// في AuthContext.tsx
socket.emit('login', {
  userId: user._id,
  role: user.role,
  firstName: user.firstName
});
```

#### Backend: معالجة Login
```javascript
socket.on('login', async (userData) => {
  const { userId, role, firstName } = userData;
  
  // حفظ المستخدم في Map
  onlineUsers.set(userId, {
    socketId: socket.id,
    role: role,
    firstName: firstName,
    loginTime: new Date().toISOString()
  });
  
  // تحديث Database
  await Student.findByIdAndUpdate(userId, {
    isActive: true,
    lastSeen: new Date()
  });
  
  // إعلام الجميع بتغيير الحالة
  io.emit('userStatusChange', {
    userId: userId,
    isActive: true,
    lastSeen: new Date().toISOString()
  });
});
```

#### عند Disconnect
```javascript
socket.on('disconnect', async () => {
  // البحث عن المستخدم في onlineUsers
  for (const [userId, userData] of onlineUsers.entries()) {
    if (userData.socketId === socket.id) {
      // تحديث Database
      await Student.findByIdAndUpdate(userId, {
        isActive: false,
        lastSeen: new Date()
      });
      
      // إزالة من Map
      onlineUsers.delete(userId);
      
      // إعلام الجميع
      io.emit('userStatusChange', {
        userId: userId,
        isActive: false,
        lastSeen: new Date().toISOString()
      });
      break;
    }
  }
});
```

### 3️⃣ تحديثات الطلاب/المعلمين

#### عند إضافة طالب
```javascript
// Backend - studentController.js
const student = await Student.create(studentData);

// إرسال event لكل من في غرفة students
io.to('students').emit('studentCreated', student);

// تحديث Dashboard
io.to('dashboard').emit('dashboardUpdate', {
  type: 'full',
  timestamp: new Date().toISOString()
});
```

#### Frontend - الاستماع للتحديثات
```typescript
const { onStudentUpdate } = useSocket();

useEffect(() => {
  const handleStudentUpdate = (event: StudentUpdateEvent) => {
    if (event.type === 'created') {
      setStudents(prev => [...prev, event.student]);
    } else if (event.type === 'updated') {
      setStudents(prev => 
        prev.map(s => s._id === event.student._id ? event.student : s)
      );
    } else if (event.type === 'deleted') {
      setStudents(prev => 
        prev.filter(s => s._id !== event.studentId)
      );
    }
  };
  
  onStudentUpdate(handleStudentUpdate);
  
  return () => offStudentUpdate(handleStudentUpdate);
}, []);
```

---

## 🔧 كيفية الاستخدام

### للمطورين: إضافة تحديث فوري جديد

#### 1. في Backend Controller:
```javascript
// مثال: عند تعديل علامات طالب
exports.updateMark = async (req, res) => {
  try {
    const mark = await Mark.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    // ✅ إرسال تحديث فوري
    req.app.get('io').to('marks').emit('markUpdated', {
      mark: mark,
      timestamp: new Date().toISOString()
    });
    
    res.json(mark);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

#### 2. في Frontend Component:
```typescript
import { useSocket } from '../hooks/useSocket';

const MarksPage = () => {
  const [marks, setMarks] = useState([]);
  const { socket, on, off } = useSocket();
  
  useEffect(() => {
    // الانضمام للغرفة
    socket?.emit('joinMarks');
    
    // الاستماع للتحديثات
    const handleMarkUpdate = (data) => {
      setMarks(prev => 
        prev.map(m => m._id === data.mark._id ? data.mark : m)
      );
    };
    
    on('markUpdated', handleMarkUpdate);
    
    return () => {
      off('markUpdated', handleMarkUpdate);
      socket?.emit('leaveMarks');
    };
  }, [socket]);
  
  return (
    // ... UI
  );
};
```

---

## 📚 الـ Rooms المتاحة

| Room Name | الوصف | متى تستخدمه |
|-----------|-------|-------------|
| `dashboard` | Dashboard الرئيسية | تحديثات الإحصائيات العامة |
| `students` | إدارة الطلاب | إضافة/تعديل/حذف طالب |
| `teachers` | إدارة المعلمين | إضافة/تعديل/حذف معلم |
| `groups` | إدارة المجموعات | تعديل توزيع الطلاب |
| `marks` | العلامات والترتيب | تحديث علامات الطلاب |
| `attendance` | الحضور والغياب | تسجيل حضور/غياب |
| `activities` | الأنشطة | إضافة/تعديل أنشطة |

---

## 🎨 Events المتاحة

### Dashboard Events
```typescript
// Backend يرسل:
io.to('dashboard').emit('dashboardUpdate', {
  type: 'stats' | 'groups' | 'full',
  data: any,
  timestamp: string
});

// Frontend يستمع:
onDashboardUpdate((payload) => { ... });
```

### Student Events
```typescript
// Backend يرسل:
io.to('students').emit('studentCreated', student);
io.to('students').emit('studentUpdated', student);
io.to('students').emit('studentDeleted', { studentId });

// Frontend يستمع:
onStudentUpdate((event) => {
  // event.type = 'created' | 'updated' | 'deleted'
  // event.student = بيانات الطالب
});
```

### Teacher Events
```typescript
// Backend يرسل:
io.to('teachers').emit('teacherCreated', teacher);
io.to('teachers').emit('teacherUpdated', teacher);
io.to('teachers').emit('teacherDeleted', { _id });

// Frontend يستمع:
onTeacherUpdate((event) => {
  // event.type = 'created' | 'updated' | 'deleted'
  // event.teacher = بيانات المعلم
});
```

### User Status Events
```typescript
// Backend يرسل لكل الـ clients:
io.emit('userStatusChange', {
  userId: string,
  isActive: boolean,
  lastSeen: string
});

// Frontend يستمع (automatic في SocketContext):
socket.on('userStatusChange', (data) => {
  // يحدث onlineUsers Map تلقائياً
});
```

---

## 🚀 التوسع والتطوير

### إضافة Room جديدة

#### 1. في Backend (app.js):
```javascript
socket.on('joinExams', (data) => {
  socket.join('exams');
  console.log(`📝 User ${socket.id} joined exams room`);
});

socket.on('leaveExams', (data) => {
  socket.leave('exams');
  console.log(`📝 User ${socket.id} left exams room`);
});
```

#### 2. في Backend Controller:
```javascript
// عند إضافة امتحان جديد
const exam = await Exam.create(examData);

req.app.get('io').to('exams').emit('examCreated', {
  exam: exam,
  timestamp: new Date().toISOString()
});
```

#### 3. في Frontend (SocketContext.tsx):
```typescript
// إضافة functions جديدة
const joinExams = () => {
  if (socket) socket.emit('joinExams');
};

const leaveExams = () => {
  if (socket) socket.emit('leaveExams');
};

// إضافة للـ value
const value: SocketContextType = {
  // ... existing
  joinExams,
  leaveExams,
};
```

#### 4. استخدامها في Component:
```typescript
const { joinExams, leaveExams, on, off } = useSocket();

useEffect(() => {
  joinExams();
  
  const handleExamCreated = (data) => {
    console.log('امتحان جديد:', data.exam);
  };
  
  on('examCreated', handleExamCreated);
  
  return () => {
    off('examCreated', handleExamCreated);
    leaveExams();
  };
}, []);
```

---

## 🐛 Debugging و Troubleshooting

### تحقق من الاتصال:
```typescript
const { isConnected, socket } = useSocket();

console.log('Socket connected:', isConnected);
console.log('Socket ID:', socket?.id);
```

### تتبع Events:
```javascript
// في Backend
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // تتبع كل events
  socket.onAny((eventName, ...args) => {
    console.log(`Event: ${eventName}`, args);
  });
});
```

### مشاكل شائعة:

#### ❌ المشكلة: "useSocket must be used within a SocketProvider"
**الحل**: تأكد أن Component داخل `<SocketProvider>`

#### ❌ المشكلة: Events لا تصل
**الحل**: 
1. تحقق من `isConnected = true`
2. تأكد أنك انضممت للـ Room: `joinDashboard()`
3. تحقق من console في Backend

#### ❌ المشكلة: Memory Leaks
**الحل**: تأكد من cleanup في useEffect:
```typescript
useEffect(() => {
  onDashboardUpdate(handleUpdate);
  
  return () => {
    offDashboardUpdate(handleUpdate); // ✅ مهم جداً!
  };
}, []);
```

---

## 📊 أمثلة عملية

### مثال 1: عرض عدد المستخدمين المتصلين
```typescript
const OnlineUsersCount = () => {
  const { onlineUsers } = useSocket();
  
  return (
    <div className="badge">
      👥 متصل الآن: {onlineUsers.size}
    </div>
  );
};
```

### مثال 2: إشعار عند إضافة طالب جديد
```typescript
const { onStudentUpdate } = useSocket();

useEffect(() => {
  const handleNewStudent = (event: StudentUpdateEvent) => {
    if (event.type === 'created') {
      toast.success(`تم إضافة الطالب: ${event.student.firstName}`);
    }
  };
  
  onStudentUpdate(handleNewStudent);
  
  return () => offStudentUpdate(handleNewStudent);
}, []);
```

### مثال 3: تحديث Dashboard تلقائياً
```typescript
const AdminDashboard = () => {
  const { stats, lastUpdated } = useDashboardStats();
  
  return (
    <div>
      <h1>إجمالي الطلاب: {stats.totalStudents}</h1>
      <p>آخر تحديث: {lastUpdated?.toLocaleString()}</p>
    </div>
  );
};
```

---

## ✅ الخلاصة

النظام مطبق بالكامل ويعمل على:
- ✅ تحديث Dashboard فورياً
- ✅ تتبع حالة المستخدمين
- ✅ تحديثات الطلاب/المعلمين
- ✅ Rooms لكل قسم من النظام
- ✅ Error handling و reconnection

**كل شيء جاهز ويعمل! 🚀**

للاستفسارات أو المساعدة في إضافة ميزات جديدة، راجع هذا الملف.
