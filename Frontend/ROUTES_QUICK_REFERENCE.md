# 🎯 Quick Route Reference Guide

## Role-Based Route Access

### 🔴 Admin Only Routes
```
/admin
/admin/dashboard
/admin/management
```

### 🟡 Teacher Only Routes
```
/managment
/test
```

### 🟢 Shared Routes (All Roles)
```
/
/login
/profile
/change-password
/goals
/daily-marks
/arrangement
/exam-schedule
/reports
/timetable
/news
/chat
/activities
/absence
/prayer-times
/quran
/quran-audio
/soon
```

---

## Route Access Summary

```
┌─────────────────────────────────────────────────────────┐
│                    AUTHENTICATION                        │
│                                                          │
│  Unauthenticated → All Routes → /login                  │
│  Loading → Loading Screen                               │
└─────────────────────────────────────────────────────────┘
                           ↓
                    User Role Check
                           ↓
        ┌──────────────────┴──────────────────┐
        ↓                  ↓                   ↓
   ┌────────┐        ┌─────────┐        ┌─────────┐
   │ ADMIN  │        │ TEACHER │        │ STUDENT │
   └────────┘        └─────────┘        └─────────┘
        ↓                  ↓                   ↓
   AdminHeader          Header              Header
   No Footer            Footer*             Footer*
        ↓                  ↓                   ↓
   ┌────────┐        ┌─────────┐        ┌─────────┐
   │  Full  │        │ Manage  │        │  View   │
   │ Access │        │ Access  │        │  Only   │
   └────────┘        └─────────┘        └─────────┘

   * Footer hidden on: /login, /chat, /quran, /quran-audio
```

---

## Component Structure

```
App.tsx
├── BrowserRouter
│   ├── AuthProvider
│   │   ├── UserStatusProvider
│   │   │   └── AppContent
│   │   │       ├── Loading (if loading)
│   │   │       ├── Login (if not authenticated)
│   │   │       └── Role-Based Routes
│   │   │           ├── AdminRoutes (admin role)
│   │   │           │   ├── AdminHeader
│   │   │           │   └── Routes
│   │   │           ├── TeacherRoutes (teacher role)
│   │   │           │   ├── Header
│   │   │           │   ├── Routes
│   │   │           │   └── Footer (conditional)
│   │   │           └── StudentRoutes (student role)
│   │   │               ├── Header
│   │   │               ├── Routes
│   │   │               └── Footer (conditional)
```

---

## Route Permission Quick Check

### How to check if a user can access a route:

1. **Is user authenticated?**
   - ❌ No → Redirect to `/login`
   - ✅ Yes → Continue to step 2

2. **What is user role?**
   - `admin` → AdminRoutes → All routes except NotFound
   - `teacher` → TeacherRoutes → All routes except `/admin/*`
   - `student` → StudentRoutes → Limited routes (no `/admin/*`, `/managment`, `/test`)

3. **Is route in allowed list for role?**
   - ✅ Yes → Render component
   - ❌ No → Show NotFound (404)

---

## Development Tips

### Adding a New Route

1. **Import the page component** in `App.tsx`
2. **Add route to appropriate role component(s)**
3. **Consider:**
   - Should it show header? (set `isLoginPage` logic)
   - Should it show footer? (add to `ROUTES_WITHOUT_FOOTER` if no)
   - Which roles can access? (add to relevant route components)

### Example - Adding `/resources` route:

```tsx
// 1. Import component
import Resources from "./pages/Resources";

// 2. Add to TeacherRoutes and StudentRoutes
<Route path="/resources" element={<Resources />} />

// 3. Optionally hide footer
const ROUTES_WITHOUT_FOOTER = [
  "/login", 
  "/chat", 
  "/quran", 
  "/quran-audio",
  "/resources" // Add here if footer should be hidden
];
```

---

## Testing Routes by Role

### Test as Admin
```typescript
// Mock user object
{ role: 'admin', ...otherProps }

// Should access:
✅ /admin, /admin/dashboard, /admin/management
✅ /profile, /change-password
✅ All routes redirect to AdminDashboard if not found
```

### Test as Teacher
```typescript
// Mock user object
{ role: 'teacher', ...otherProps }

// Should access:
✅ /, /managment, /test, /goals, /daily-marks, etc.
❌ /admin/* → NotFound
```

### Test as Student
```typescript
// Mock user object
{ role: 'student', ...otherProps }

// Should access:
✅ /, /goals, /daily-marks, /chat, /news, etc.
❌ /admin/* → NotFound
❌ /managment → NotFound
❌ /test → NotFound
```

---

## Common Issues & Solutions

### Issue: Route not working
**Check:**
1. Is component imported?
2. Is route added to correct role component?
3. Is path spelled correctly?
4. Is user authenticated with correct role?

### Issue: Footer showing when it shouldn't
**Solution:** Add route to `ROUTES_WITHOUT_FOOTER` array

### Issue: Header showing on login page
**Check:** `isLoginPage` condition in route component

### Issue: User can access restricted route
**Solution:** Ensure route is in correct role component or add to NotFound routes

---

*Quick Reference - See ROUTES_DOCUMENTATION.md for full details*
