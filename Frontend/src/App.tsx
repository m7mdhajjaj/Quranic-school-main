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
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
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
import { lazy } from "react";

// Lazy load Home and News pages
const Home = lazy(() => import("./pages/Home"));
const News = lazy(() => import("./pages/News"));

import Login from "./pages/Auth/Login/index";
import Goals from "./pages/Goals/Goals";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Privacy from "./pages/Privacy/Privacy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact/components/Contact";

// ============================================================================
// Page Components - Academic
// ============================================================================
const DailyMarks = lazy(() => import("./pages/DailyMarks/DailyMarksPage"));
import Arrangement from "./pages/Arrangement";
import Test from "./pages/Test/TestPage";
import ExamSchedule from "./pages/ExamSchedule";
import Reports from "./pages/Reports";
import Timetable from "./pages/Timetable/TimetablePage";
import MyStudents from "./pages/MyStudents";

// ============================================================================
// Page Components - Communication & Activities
// ============================================================================
// import Chat from "./pages/Chat";
import Activities from "./pages/Activities";

// ============================================================================
// Page Components - Attendance & Management
// ============================================================================
import Absence from "./pages/Absence/index";

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
import Warnings from "./pages/Warnings/Warnings";

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

// ============================================================================
// Other Components
// ============================================================================
import Soon from "./pages/Soon";
import NotificationPermissionPrompt from "./components/Notifications/NotificationPermissionPrompt";

// ============================================================================
// Admin Routes Component
// ============================================================================
/**
 * Handles all routing for admin users
 * - Shows unified Header with admin-specific navigation items
 * - Provides access to admin dashboard and management pages
 * - Footer is now displayed for admin pages
 */
const AdminRoutes: React.FC = () => {
  return (
    <Layout>
      <Routes>
        {/* ====== Admin Dashboard Routes ====== */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/students" element={<StudentsManagement />} />
        <Route path="/admin/teachers" element={<TeachersManagement />} />
        <Route path="/admin/groups" element={<GroupManagement />} />
        <Route path="/admin/settings" element={<NotFound />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/" element={<AdminDashboard />} />

        {/* ====== Admin - User Settings ====== */}
        <Route path="/profile" element={<Profile />} />

        {/* ====== Admin - Authentication ====== */}
        <Route path="/login" element={<Login />} />

        {/* ====== Special Pages ====== */}
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/contact" element={<Contact />} />

        {/* ====== Fallback - Redirect to Dashboard ====== */}
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
 * - Shows unified Header with teacher-specific navigation
 * - Has access to management features and academic tools
 * - Can view and manage student data
 * - Restricted from admin-only pages
 */
const TeacherRoutes: React.FC = () => {
  return (
    <Layout>
      <Routes>
        {/* ====== Home & Authentication ====== */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* ====== Academic Pages - Teacher Access ====== */}
        <Route path="/goals" element={<Goals />} />
        <Route path="/daily-marks" element={
          <React.Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-gray-600 font-medium">جاري تحميل العلامات اليومية...</p>
              </div>
            </div>
          }>
            <DailyMarks />
          </React.Suspense>
        } />
        <Route path="/arrangement" element={<Arrangement />} />
        <Route path="/test" element={<Test />} />
        <Route path="/exam-schedule" element={<ExamSchedule />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/timetable" element={<Timetable />} />

        {/* ====== Communication & Activities ====== */}
        <Route path="/news" element={
          <React.Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-gray-600 font-medium">جاري تحميل الأخبار...</p>
              </div>
            </div>
          }>
            <News />
          </React.Suspense>
        } />
        {/* <Route path="/chat" element={<Chat />} /> */}
        <Route path="/activities" element={<Activities />} />

        {/* ====== Attendance & Management - Teacher Features ====== */}
        <Route path="/absence" element={<Absence />} />
        <Route path="/my-students" element={<MyStudents />} />
        <Route path="/warnings" element={<Warnings />} />

        {/* ====== Points Game ====== */}
        <Route path="/points-game" element={<PointsGame />} />

        {/* ====== Islamic Resources ====== */}
        <Route path="/prayer-times" element={<PrayerTimesPage />} />
        <Route path="/quran" element={<QuranPage />} />
        <Route path="/quran-audio" element={<QuranAudio />} />
        <Route path="/azkar" element={<Azkar />} />

        {/* ====== User Settings ====== */}
        <Route path="/profile" element={<Profile />} />
        {/* ====== Special Pages ====== */}
        <Route path="/soon" element={<Soon />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/contact" element={<Contact />} />

        {/* ====== Protected & Fallback Routes ====== */}
        {/* Block access to admin routes */}
        <Route path="/admin/*" element={<NotFound />} />
        {/* 404 page for undefined routes */}
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
 * - Shows unified Header with student-specific navigation
 * - Limited access compared to teachers
 * - Can view their own data and resources
 * - Cannot access management or admin features
 */
const StudentRoutes: React.FC = () => {
  return (
    <Layout>
      <Routes>
        {/* ====== Home & Authentication ====== */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* ====== Academic Pages - Student View Only ====== */}
        <Route path="/goals" element={<Goals />} />
        <Route path="/daily-marks" element={
          <React.Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-gray-600 font-medium">جاري تحميل العلامات اليومية...</p>
              </div>
            </div>
          }>
            <DailyMarks />
          </React.Suspense>
        } />
        <Route path="/arrangement" element={<Arrangement />} />
        <Route path="/exam-schedule" element={<ExamSchedule />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/timetable" element={<Timetable />} />
        <Route path="/test" element={<Test />} />
        {/* ====== Communication & Activities ====== */}
        <Route path="/news" element={
          <React.Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-gray-600 font-medium">جاري تحميل الأخبار...</p>
              </div>
            </div>
          }>
            <News />
          </React.Suspense>
        } />
        {/* <Route path="/chat" element={<Chat />} /> */}
        <Route path="/activities" element={<Activities />} />

        {/* ====== Attendance - View Only ====== */}
        <Route path="/absence" element={<Absence />} />
        <Route path="/warnings" element={<Warnings />} />

        {/* ====== Points Game ====== */}
        <Route path="/points-game" element={<PointsGame />} />

        {/* ====== Islamic Resources ====== */}
        <Route path="/prayer-times" element={<PrayerTimesPage />} />
        <Route path="/quran" element={<QuranPage />} />
        <Route path="/quran-audio" element={<QuranAudio />} />
        <Route path="/azkar" element={<Azkar />} />

        {/* ====== User Settings ====== */}
        <Route path="/profile" element={<Profile />} />
        {/* ====== Special Pages ====== */}
        <Route path="/soon" element={<Soon />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/contact" element={<Contact />} />

        {/* ====== Protected & Fallback Routes ====== */}
        {/* Block access to management features (teacher-only) */}
        <Route path="/test" element={<NotFound />} />
        {/* Block access to admin routes */}
        <Route path="/admin/*" element={<NotFound />} />
        {/* 404 page for undefined routes */}
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
    if (location.pathname !== '/login' && location.pathname !== '/') {
      sessionStorage.setItem('lastVisitedPage', location.pathname);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="relative inline-flex">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full opacity-20 animate-pulse"></div>
            </div>
          </div>
          <p className="mt-4 text-gray-600 font-medium animate-pulse">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // ====== Unauthenticated State ======
  // Redirect to login page if user is not authenticated
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  // ====== Authenticated State - Role-Based Routing ======
  // Route to appropriate component based on user role
  let routeComponent;
  switch (user?.role) {
    case "admin":
      routeComponent = <AdminRoutes />;
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
      {/* Show notification permission prompt after login */}
      <NotificationPermissionPrompt autoShow={true} />
    </>
  );
}

// ============================================================================
// Main App Component
// ============================================================================
/**
 * Root application component
 * Wraps the entire app with necessary providers:
 * - BrowserRouter: Enables routing
 * - AuthProvider: Manages authentication state
 * - UserStatusProvider: Manages user online/offline status
 *
 * Prayer notifications: ✅ Handled by NotificationHeader + PrayerTimes with Sweet Alert
 *
 * NOTE: SocketProvider (القديم) تم حذفه ✅
 * استخدم النظام الجديد Socket/SocketManager
 * كل صفحة تستخدم الـ hook المناسب (useDashboardSocket, useStudentsSocket, etc.)
 */
function App() {
  return (
    <BrowserRouter>
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
              zIndex: 9999,
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
    </BrowserRouter>
  );
}

export default App;
