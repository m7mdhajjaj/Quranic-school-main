// ============================================================================
// App.tsx - Main Application Component
// ============================================================================
// This file manages the routing and layout structure for the application.
// It handles authentication, role-based routing, and conditional rendering
// of headers and footers based on user roles and current routes.
// ============================================================================

// ============================================================================
// External Dependencies
// ============================================================================
import {
  createBrowserRouter,
  RouterProvider,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import React, { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ============================================================================
// Contexts & Hooks
// ============================================================================
import { AuthProvider } from "./Context/AuthContext";
import { UserStatusProvider } from "./Context/UserStatusContext";
import { useAuth } from "./hooks/useAuth";
import { useFirebaseMessaging } from "./hooks/useFirebaseMessaging";

// ============================================================================
// Layout Components
// ============================================================================
import { Layout } from "./components/Layout";

// ============================================================================
// Page Components - General
// ============================================================================
// import { lazy } from "react";

// Normal Imports
import Home from "./pages/Home";
import News from "./pages/News";
import Goals from "./pages/Goals/Goals";

import Login from "./pages/Auth/Login/index";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

// ============================================================================
// Guest Pages - صفحات الضيوف
// ============================================================================
import { About, Contact, Privacy, Terms } from "./pages/Guest";

// ============================================================================
// Page Components - Academic
// ============================================================================
import DailyMarks from "./pages/DailyMarks/DailyMarksPage";
import Ranking from "./pages/Ranking";
import Test from "./pages/Test/TestPage";
import ExamSchedule from "./pages/ExamSchedule";
import Reports from "./pages/Reports";
import Timetable from "./pages/Timetable/Views/TimetablePage";
// import MyStudents from "./pages/MyStudents";

// ============================================================================
// Page Components - Communication & Activities
// ============================================================================
// import Chat from "./pages/Chat";

// ============================================================================
// Page Components - Attendance & Management
// ============================================================================
import Absence from "./pages/Attendance/index";

// ============================================================================
// Page Components - Islamic Resources
// ============================================================================
import { PrayerTimesPage } from "./pages/PrayerTimes";
import QuranPage from "./pages/QuranPage";
import QuranAudio from "./pages/QuranAudio";
import Azkar from "./pages/Azkar";

// ============================================================================
// Page Components - Warnings & Discipline
// ============================================================================
import Warnings from "./pages/Warnings/WarningsPage";

// ============================================================================
// Page Components - Teacher Student Management
// ============================================================================
import TeacherStudentManagement from "./pages/Teacher";

// ============================================================================
// Page Components - Points Game
// ============================================================================
import PointsGame from "./pages/PointsGame/PointsGamePage";

// ============================================================================
// Page Components - Admin
// ============================================================================
import AdminDashboard from "./pages/Admin/Dashboard/index";
// import AdminManagement from "./pages/Managments/AdminManagement";
import StudentsManagement from "./pages/Admin/StudentsManagement/index";
import TeachersManagement from "./pages/Admin/TeachersManagement/index";
import GroupManagement from "./pages/Admin/GroupManagement/index";
import SecretaryManagement from "./pages/Admin/SecretaryManagement/index";
import TeacherAssistantManagement from "./pages/Admin/TeacherAssistantManagement/index";

// ============================================================================
// Chat Components
// ============================================================================
import StudentChatView from "./pages/chat/Views/StudentChatView";
import TeacherChatView from "./pages/chat/Views/TeacherChatView";
import AdminChatView from "./pages/chat/Views/AdminChatView";
import SecretaryChatView from "./pages/chat/Views/SecretaryChatView";
import TeacherAssistantChatView from "./pages/chat/Views/TeacherAssistantChatView";

// ============================================================================
// Other Components
// ============================================================================
import Soon from "./pages/Soon";

// ============================================================================
// Guest Routes Component
// ============================================================================
/**
 * Handles all routing for guest users (unauthenticated)
 * - Shows Layout with isGuest=true for allowed pages
 * - Provides access to public pages only
 *
 * Guest Routes Structure:
 * 1. Welcome Page (no header)
 * 2. Login Page (no header)
 * 3. Information Pages (Privacy, Terms, Contact) - with header
 */
const GuestRoutes: React.FC = () => {
  return (
    <Routes>
      {/* ============================================
          صفحات بدون هيدر - No Header Pages
          ============================================ */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/welcome" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />

      {/* ============================================
          الصفحة الرئيسية للضيوف - مع هيدر
          ============================================ */}
      <Route
        path="/home"
        element={
          <Layout isGuest={true}>
            <Home />
          </Layout>
        }
      />

      {/* ============================================
          صفحة الأهداف للضيوف
          ============================================ */}
      <Route
        path="/goals"
        element={
          <Layout isGuest={true}>
            <Goals />
          </Layout>
        }
      />

      {/* ============================================
          صفحات المعلومات - Information Pages
          ============================================ */}
      <Route
        path="/privacy"
        element={
          <Layout isGuest={true}>
            <Privacy />
          </Layout>
        }
      />
      <Route
        path="/terms"
        element={
          <Layout isGuest={true}>
            <Terms />
          </Layout>
        }
      />
      <Route
        path="/contact"
        element={
          <Layout isGuest={true}>
            <Contact />
          </Layout>
        }
      />
      <Route
        path="/about"
        element={
          <Layout isGuest={true}>
            <About />
          </Layout>
        }
      />

      {/* ============================================
          Fallback - إعادة توجيه لصفحة تسجيل الدخول
          ============================================ */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

// ============================================================================
// Admin Routes Component
// ============================================================================
/**
 * Handles all routing for admin users
 * - Shows AdminLayout with AdminHeader and AdminSidebar
 * - Provides access to admin dashboard and management pages
 * - Footer is NOT displayed for admin pages (only for teacher and student)
 *
 * Admin Routes Structure:
 * 1. Dashboard & Management Pages (/admin/*)
 * 2. Academic Pages (shared with teachers)
 * 3. Communication Pages
 * 4. User Settings
 * 5. Special Pages (Privacy, Terms, Contact)
 */
const AdminRoutes: React.FC = () => {
  return (
    <Layout>
      <Routes>
        {/* ============================================
            الصفحة الرئيسية - Dashboard
            ============================================ */}
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/welcome" element={<Navigate to="/login" replace />} />
        <Route
          path="/admin"
          element={<Navigate to="/admin/dashboard" replace />}
        />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* ============================================
            صفحات الإدارة - Management Pages
            ============================================ */}
        <Route path="/admin/students" element={<StudentsManagement />} />
        <Route path="/admin/teachers" element={<TeachersManagement />} />
        <Route path="/admin/groups" element={<GroupManagement />} />
        <Route path="/admin/secretaries" element={<SecretaryManagement />} />
        <Route
          path="/admin/assistants"
          element={<TeacherAssistantManagement />}
        />
        <Route path="/admin/settings" element={<NotFound />} />

        {/* ============================================
            الصفحات الأكاديمية - Academic Pages
            ============================================ */}
        <Route path="/timetable" element={<Timetable />} />

        {/* ============================================
            صفحات التواصل - Communication Pages
            ============================================ */}
        <Route path="/chat" element={<AdminChatView />} />

        {/* ============================================
            الحضور والغياب - Attendance Management
            ============================================ */}
        <Route path="/attendance" element={<Absence />} />

        {/* ============================================
            الإعدادات الشخصية - User Settings
            ============================================ */}
        <Route path="/profile" element={<Profile />} />

        {/* ============================================
            صفحات خاصة - Special Pages
            ============================================ */}
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/contact" element={<Contact />} />

        {/* ============================================
            تسجيل الدخول - Authentication
            ============================================ */}
        <Route path="/login" element={<Login />} />

        {/* ============================================
            Fallback - إعادة توجيه للداشبورد
            ============================================ */}
        <Route path="*" element={<AdminDashboard />} />
      </Routes>
    </Layout>
  );
};

// ============================================================================
// Teacher Routes Component
// ============================================================================
/**
 * Handles all routing for teacher users
 * - Shows Header and Footer (Layout component)
 * - Has access to management features and academic tools
 * - Can view and manage student data
 * - Restricted from admin-only pages
 *
 * Teacher Routes Structure:
 * 1. Home & Authentication
 * 2. Academic Pages (Goals, Marks, Ranking, Tests, Reports, Timetable)
 * 3. Communication & Activities (News, Chat, Activities)
 * 4. Attendance & Management (Absence, Warnings)
 * 5. Points Game
 * 6. Islamic Resources (Prayer Times, Quran, Azkar)
 * 7. User Settings & Special Pages
 */
const TeacherRoutes: React.FC = () => {
  return (
    <Layout>
      <Routes>
        {/* ============================================
            الصفحة الرئيسية وتسجيل الدخول
            ============================================ */}
        <Route path="/" element={<Home />} />
        <Route path="/welcome" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        {/* ============================================
            الصفحات الأكاديمية - Academic Pages
            ============================================ */}
        <Route path="/goals" element={<Goals />} />
        <Route path="/daily-marks" element={<DailyMarks />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/test" element={<NotFound />} />
        <Route path="/exam-schedule" element={<ExamSchedule />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/timetable" element={<Timetable />} />

        {/* ============================================
            التواصل والأنشطة - Communication & Activities
            ============================================ */}
        <Route path="/news" element={<News />} />
        {/* <Route path="/chat" element={<NotFound />} /> */}
        <Route path="/chat" element={<StudentChatView />} />

        {/* ============================================
            الحضور والإدارة - Attendance & Management
            ============================================ */}
        <Route path="/attendance" element={<Absence />} />
        <Route
          path="/absence"
          element={<Navigate to="/attendance" replace />}
        />
        <Route path="/warnings" element={<Warnings />} />
        <Route
          path="/students-management"
          element={<TeacherStudentManagement />}
        />

        {/* ============================================
            لعبة النقاط - Points Game
            ============================================ */}
        <Route path="/points-game" element={<PointsGame />} />

        {/* ============================================
            الموارد الإسلامية - Islamic Resources
            ============================================ */}
        <Route path="/prayer-times" element={<PrayerTimesPage />} />
        <Route path="/quran" element={<QuranPage />} />
        <Route path="/quran-audio" element={<QuranAudio />} />
        <Route path="/azkar" element={<Azkar />} />

        {/* ============================================
            الإعدادات الشخصية - User Settings
            ============================================ */}
        <Route path="/profile" element={<Profile />} />

        {/* ============================================
            صفحات خاصة - Special Pages
            ============================================ */}
        <Route path="/soon" element={<Soon />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/contact" element={<Contact />} />

        {/* ============================================
            Protected & Fallback Routes
            ============================================ */}
        <Route path="/admin/*" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
};

// ============================================================================
// Student Routes Component
// ============================================================================
/**
 * Handles all routing for student users
 * - Shows Header and Footer (Layout component)
 * - Limited access compared to teachers
 * - Can view their own data and resources
 * - Cannot access management or admin features
 *
 * Student Routes Structure:
 * 1. Home & Authentication
 * 2. Academic Pages (Goals, Marks, Ranking, Tests, Reports, Timetable)
 * 3. Communication & Activities (News, Chat, Activities)
 * 4. Attendance (View Only)
 * 5. Points Game
 * 6. Islamic Resources (Prayer Times, Quran, Azkar)
 * 7. User Settings & Special Pages
 */

// ============================================================================
// Secretary Routes Component
// ============================================================================
/**
 * Handles all routing for secretary users
 * - Simplified menu: Home, Goals, Profile only
 * - No management or admin features in header menu
 * - Can still access other pages via direct navigation
 *
 * Secretary Routes Structure:
 * 1. Home & Goals (shown in profile menu)
 * 2. Profile
 * 3. Authentication
 */
const SecretaryRoutes: React.FC = () => {
  return (
    <Layout>
      <Routes>
        {/* ============================================
            الصفحة الرئيسية - Home
            ============================================ */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/welcome" element={<Navigate to="/login" replace />} />
        <Route path="/secretary" element={<Navigate to="/" replace />} />
        <Route
          path="/secretary/dashboard"
          element={<Navigate to="/" replace />}
        />

        {/* ============================================
            الأهداف - Goals
            ============================================ */}
        <Route path="/goals" element={<Goals />} />

        {/* ============================================
            إدارة الطلاب - Students Management
            ============================================ */}
        <Route path="/students" element={<StudentsManagement />} />

        {/* ============================================
            عرض المعلمين - Teachers View (Read Only)
            ============================================ */}
        <Route path="/teachers" element={<TeachersManagement />} />

        {/* ============================================
            عرض الحلقات - Groups View
            ============================================ */}
        <Route path="/groups" element={<GroupManagement />} />

        {/* ============================================
            الجدول - Timetable (View Only)
            ============================================ */}
        <Route path="/timetable" element={<Timetable />} />

        {/* ============================================
            المحادثات - Chat (with Teachers & Admin only)
            ============================================ */}
        <Route path="/chat" element={<SecretaryChatView />} />

        {/* ============================================
            الإعدادات الشخصية - User Settings
            ============================================ */}
        <Route path="/profile" element={<Profile />} />

        {/* ============================================
            تسجيل الدخول - Authentication
            ============================================ */}
        <Route path="/login" element={<Login />} />

        {/* ============================================
            صفحات خاصة - Special Pages
            ============================================ */}
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/contact" element={<Contact />} />

        {/* ============================================
            Blocked Routes - منع الوصول لصفحات الإدارة
            ============================================ */}
        <Route path="/admin/*" element={<Navigate to="/" replace />} />

        {/* ============================================
            Fallback - إعادة توجيه للصفحة الرئيسية
            ============================================ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

// ============================================================================
// Teacher Assistant Routes Component
// ============================================================================
/**
 * Handles all routing for teacher assistant users
 * - Simple menu: Home, Goals only
 * - No management or admin features
 * - Limited access compared to teachers
 *
 * Teacher Assistant Routes Structure:
 * 1. Home (الصفحة الرئيسية)
 * 2. Goals (الأهداف)
 * 3. Profile (الملف الشخصي)
 */
const TeacherAssistantRoutes: React.FC = () => {
  return (
    <Layout>
      <Routes>
        {/* ============================================
            الصفحة الرئيسية - Home
            ============================================ */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/welcome" element={<Navigate to="/login" replace />} />

        {/* ============================================
            الأهداف - Goals
            ============================================ */}
        <Route path="/goals" element={<Goals />} />

        {/* ============================================
            العلامات اليومية - Daily Marks (للحلقات المسموح بها فقط)
            ============================================ */}
        <Route path="/daily-marks" element={<DailyMarks />} />

        {/* ============================================
            المحادثة مع المعلم - Chat with Teacher
            ============================================ */}
        <Route path="/chat" element={<TeacherAssistantChatView />} />

        {/* ============================================
            مواعيد الحلقات - Timetable (View Only)
            ============================================ */}
        <Route path="/timetable" element={<Timetable />} />

        {/* ============================================
            الأخبار - News
            ============================================ */}
        <Route path="/news" element={<News />} />

        {/* ============================================
            القرآن والأذكار - Religious Content
            ============================================ */}
        <Route path="/quran" element={<QuranPage />} />
        <Route path="/quran-audio" element={<QuranAudio />} />
        <Route path="/azkar" element={<Azkar />} />
        <Route path="/prayer-times" element={<PrayerTimesPage />} />

        {/* ============================================
            الإعدادات الشخصية - User Settings
            ============================================ */}
        <Route path="/profile" element={<Profile />} />

        {/* ============================================
            تسجيل الدخول - Authentication
            ============================================ */}
        <Route path="/login" element={<Login />} />

        {/* ============================================
            صفحات خاصة - Special Pages
            ============================================ */}
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/contact" element={<Contact />} />

        {/* ============================================
            Blocked Routes - منع الوصول لصفحات الإدارة
            ============================================ */}
        <Route path="/admin/*" element={<Navigate to="/" replace />} />

        {/* ============================================
            Fallback - إعادة توجيه للصفحة الرئيسية
            ============================================ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

const StudentRoutes: React.FC = () => {
  return (
    <Layout>
      <Routes>
        {/* ============================================
            الصفحة الرئيسية وتسجيل الدخول
            ============================================ */}
        <Route path="/" element={<Home />} />
        <Route path="/welcome" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        {/* ============================================
            الصفحات الأكاديمية - Academic Pages
            ============================================ */}
        <Route path="/goals" element={<Goals />} />
        <Route path="/daily-marks" element={<DailyMarks />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/exam-schedule" element={<ExamSchedule />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/timetable" element={<Timetable />} />
        <Route path="/test" element={<Test />} />

        {/* ============================================
            التواصل والأنشطة - Communication & Activities
            ============================================ */}
        <Route path="/news" element={<News />} />
        <Route path="/chat" element={<StudentChatView />} />

        {/* ============================================
            الحضور والغياب - Attendance (View Only)
            ============================================ */}
        <Route path="/attendance" element={<Absence />} />
        <Route
          path="/absence"
          element={<Navigate to="/attendance" replace />}
        />
        <Route path="/warnings" element={<Warnings />} />

        {/* ============================================
            لعبة النقاط - Points Game
            ============================================ */}
        <Route path="/points-game" element={<PointsGame />} />

        {/* ============================================
            الموارد الإسلامية - Islamic Resources
            ============================================ */}
        <Route path="/prayer-times" element={<PrayerTimesPage />} />
        <Route path="/quran" element={<QuranPage />} />
        <Route path="/quran-audio" element={<QuranAudio />} />
        <Route path="/azkar" element={<Azkar />} />

        {/* ============================================
            الإعدادات الشخصية - User Settings
            ============================================ */}
        <Route path="/profile" element={<Profile />} />

        {/* ============================================
            صفحات خاصة - Special Pages
            ============================================ */}
        <Route path="/soon" element={<Soon />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/contact" element={<Contact />} />

        {/* ============================================
            Protected & Fallback Routes
            ============================================ */}
        <Route path="/admin/*" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
};

// ============================================================================
// App Content Component
// ============================================================================
/**
 * Main content component that handles authentication state and role-based routing
 * This component:
 * 1. Shows loading screen while checking authentication
 * 2. Redirects to login if not authenticated
 * 3. Routes to appropriate layout based on user role (admin vs user)
 */
// Component to track last visited page
const PageTracker: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // حفظ آخر صفحة تمت زيارتها (ماعدا صفحة Login)
    if (location.pathname !== "/login" && location.pathname !== "/") {
      sessionStorage.setItem("lastVisitedPage", location.pathname);
    }
  }, [location]);

  return null;
};

function AppContent() {
  const { isLoading, isAuthenticated, user } = useAuth();

  // ====== Firebase Cloud Messaging - Initialize notifications ======
  const { isPermissionGranted, lastNotification } = useFirebaseMessaging();

  // Optional: Log notification status for debugging
  React.useEffect(() => {
    if (isPermissionGranted) {
      console.log("✅ Firebase notifications enabled");
    }
    if (lastNotification) {
      console.log("📩 New notification received:", lastNotification);
    }
  }, [isPermissionGranted, lastNotification]);

  // ====== Loading State ======
  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 via-gray-50 to-slate-100">
        <div className="text-center contain-layout">
          <div className="relative inline-flex contain-layout">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin will-change-transform"></div>
            <div className="absolute inset-0 flex items-center justify-center contain-layout">
              <div className="w-8 h-8 bg-indigo-600 rounded-full opacity-20"></div>
            </div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // ====== Unauthenticated State ======
  // Show guest routes for unprotected pages
  if (!isAuthenticated) {
    return <GuestRoutes />;
  }

  // ====== Authenticated State - Role-Based Routing ======
  // Route to appropriate component based on user role
  let routeComponent;
  switch (user?.role) {
    case "admin":
      routeComponent = <AdminRoutes />;
      break;
    case "secretary":
      routeComponent = <SecretaryRoutes />;
      break;
    case "teacherAssistant":
      routeComponent = <TeacherAssistantRoutes />;
      break;
    case "teacher":
      routeComponent = <TeacherRoutes />;
      break;
    case "student":
      routeComponent = <StudentRoutes />;
      break;
    default:
      // Fallback to login if role is undefined or invalid
      routeComponent = (
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      );
  }

  return (
    <>
      <PageTracker />
      {routeComponent}
    </>
  );
}

// ============================================================================
// Main App Component
// ============================================================================
/**
 * Root application component
 * Wraps the entire app with necessary providers:
 * - RouterProvider with createBrowserRouter: Enables modern routing with data APIs
 * - AuthProvider: Manages authentication state
 * - UserStatusProvider: Manages user online/offline status
 *
 * Prayer notifications: ✅ Handled by NotificationHeader + PrayerTimes with Sweet Alert
 *
 * NOTE: SocketProvider (القديم) تم حذفه ✅
 * استخدم النظام الجديد Socket/SocketManager
 * كل صفحة تستخدم الـ hook المناسب (useDashboardSocket, useStudentsSocket, etc.)
 */

// Create router instance
const router = createBrowserRouter([
  {
    path: "*",
    element: (
      <AuthProvider>
        <UserStatusProvider>
          <AppContent />
          {/* Toast Container with modern styling - RTL positioned on right */}
          <ToastContainer
            position="top-left"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick={true}
            rtl={true}
            pauseOnFocusLoss={false}
            draggable={true}
            pauseOnHover={true}
            theme="light"
            limit={3}
            style={{
              zIndex: 99999, // High z-index to ensure visibility over Modals and SweetAlerts
              top: "1.5rem",
              right: "1.5rem",
              left: "auto",
            }}
            toastStyle={{
              borderRadius: "12px",
              padding: "16px",
              fontSize: "15px",
              fontWeight: "500",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
              backdropFilter: "blur(8px)",
            }}
          />
        </UserStatusProvider>
      </AuthProvider>
    ),
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
