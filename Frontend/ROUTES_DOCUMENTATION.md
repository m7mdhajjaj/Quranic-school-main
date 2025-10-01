# 📍 Application Routes Documentation

## Overview
This document provides a comprehensive overview of the routing structure for the Quranic School application, organized by user role.

---

## 🎭 Role-Based Routing System

### 1️⃣ **Admin Routes** (`user.role === 'admin'`)

#### Layout
- **Header**: AdminHeader (special admin navigation)
- **Footer**: No footer for admin pages

#### Available Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | AdminDashboard | Default admin landing page |
| `/admin` | AdminDashboard | Admin dashboard |
| `/admin/dashboard` | AdminDashboard | Full admin dashboard |
| `/admin/management` | AdminManagement | Manage users, sections, groups |
| `/profile` | Profile | View/edit admin profile |
| `/change-password` | ChangePass | Change password |
| `/login` | Login | Login page |
| `*` (fallback) | AdminDashboard | Redirect to dashboard |

#### Restricted Access
- Admins have full access to all features
- Can manage teachers, students, sections, and groups

---

### 2️⃣ **Teacher Routes** (`user.role === 'teacher'`)

#### Layout
- **Header**: Regular Header (student/teacher navigation)
- **Footer**: Shown on most pages (hidden on login, chat, Quran pages)

#### Available Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Home | Teacher home page |
| `/login` | Login | Login page |
| **Academic** |
| `/goals` | Goals | View/manage student goals |
| `/daily-marks` | DailyMarks | Daily student marks |
| `/arrangement` | Arrangement | Class arrangements/rankings |
| `/test` | Test | Exam management |
| `/exam-schedule` | ExamSchedule | View exam schedules |
| `/reports` | Reports | Student reports |
| `/timetable` | Timetable | Class timetables |
| **Communication** |
| `/news` | News | School news and announcements |
| `/chat` | Chat | Communication with students/teachers |
| `/activities` | Activities | School activities |
| **Management** |
| `/absence` | Absence | Student attendance tracking |
| `/managment` | Managment | Teacher management features |
| **Islamic Resources** |
| `/prayer-times` | PrayerTimes | Prayer times |
| `/quran` | QuranPage | Quran reader |
| `/quran-audio` | QuranAudio | Quran audio player |
| **Settings** |
| `/profile` | Profile | View/edit profile |
| `/change-password` | ChangePass | Change password |
| **Special** |
| `/soon` | Soon | Coming soon page |

#### Restricted Access
- ❌ Cannot access `/admin/*` routes (redirects to NotFound)
- ✅ Full access to management and academic features

---

### 3️⃣ **Student Routes** (`user.role === 'student'`)

#### Layout
- **Header**: Regular Header (student/teacher navigation)
- **Footer**: Shown on most pages (hidden on login, chat, Quran pages)

#### Available Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Home | Student home page |
| `/login` | Login | Login page |
| **Academic (View Only)** |
| `/goals` | Goals | View personal goals |
| `/daily-marks` | DailyMarks | View daily marks |
| `/arrangement` | Arrangement | View class rankings |
| `/exam-schedule` | ExamSchedule | View exam schedules |
| `/reports` | Reports | View personal reports |
| `/timetable` | Timetable | View class timetables |
| **Communication** |
| `/news` | News | School news and announcements |
| `/chat` | Chat | Communication with teachers/students |
| `/activities` | Activities | School activities |
| **Attendance** |
| `/absence` | Absence | View personal attendance |
| **Islamic Resources** |
| `/prayer-times` | PrayerTimes | Prayer times |
| `/quran` | QuranPage | Quran reader |
| `/quran-audio` | QuranAudio | Quran audio player |
| **Settings** |
| `/profile` | Profile | View/edit profile |
| `/change-password` | ChangePass | Change password |
| **Special** |
| `/soon` | Soon | Coming soon page |

#### Restricted Access
- ❌ Cannot access `/admin/*` routes (redirects to NotFound)
- ❌ Cannot access `/managment` (teacher-only feature)
- ❌ Cannot access `/test` (teacher-only feature)
- ✅ View-only access to academic pages

---

## 🔐 Authentication Flow

### Unauthenticated Users
- **All routes** redirect to `/login`
- Must authenticate before accessing any features

### Loading State
- Shows loading spinner with message: "جاري تحميل بيانات المستخدم..."
- Displayed while authentication status is being verified

### Role Detection
The system automatically detects user role and routes accordingly:
```typescript
switch (user?.role) {
  case 'admin':   → AdminRoutes
  case 'teacher': → TeacherRoutes
  case 'student': → StudentRoutes
  default:        → Login (fallback for invalid roles)
}
```

---

## 🎨 Layout Configuration

### Header Display
- **Hidden on**: Login page only
- **AdminHeader**: Admin users only
- **Regular Header**: Teachers and Students

### Footer Display
Footer is hidden on the following routes:
- `/login`
- `/chat`
- `/quran`
- `/quran-audio`

All other routes show the footer (except admin routes which never show footer).

---

## 📝 Route Permission Matrix

| Feature | Admin | Teacher | Student |
|---------|:-----:|:-------:|:-------:|
| Admin Dashboard | ✅ | ❌ | ❌ |
| Admin Management | ✅ | ❌ | ❌ |
| Student Management | ✅ | ✅ | ❌ |
| Test Management | ✅ | ✅ | ❌ |
| View Marks | ✅ | ✅ | ✅ (own) |
| Chat | ✅ | ✅ | ✅ |
| News | ✅ | ✅ | ✅ |
| Activities | ✅ | ✅ | ✅ |
| Quran Resources | ✅ | ✅ | ✅ |
| Prayer Times | ✅ | ✅ | ✅ |
| Profile Settings | ✅ | ✅ | ✅ |

---

## 🚀 Future Enhancements

Consider implementing:
1. **Route Guards**: Middleware for more granular permission checking
2. **Lazy Loading**: Code splitting for better performance
3. **Breadcrumbs**: Navigation trail for better UX
4. **Dynamic Routes**: User-specific routes based on permissions
5. **Analytics**: Track route usage by role

---

## 📚 Related Files

- **Main Router**: `Frontend/src/App.tsx`
- **Auth Context**: `Frontend/src/contexts/AuthContext.tsx`
- **Auth Hook**: `Frontend/src/hooks/useAuth.tsx`
- **Components**: `Frontend/src/components/`
- **Pages**: `Frontend/src/pages/`

---

*Last Updated: October 1, 2025*
