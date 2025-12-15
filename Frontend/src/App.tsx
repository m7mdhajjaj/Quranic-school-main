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
import { createBrowserRouter, RouterProvider, Routes, Route, useLocation, Navigate } from "react-router-dom";
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
const Goals = lazy(() => import("./pages/Goals/Goals"));

import Login from "./pages/Auth/Login/index";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Privacy from "./pages/Privacy/Privacy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact/components/Contact";

// ============================================================================
// Page Components - Academic
// ============================================================================
const DailyMarks = lazy(() => import("./pages/DailyMarks/DailyMarksPage"));
const Ranking = lazy(() => import("./pages/Ranking"));
const Test = lazy(() => import("./pages/Test/TestPage"));
import ExamSchedule from "./pages/ExamSchedule";
import Reports from "./pages/Reports";
import Timetable from "./pages/Timetable/TimetablePage";
// import MyStudents from "./pages/MyStudents";

// ============================================================================
// Page Components - Communication & Activities
// ============================================================================
// import Chat from "./pages/Chat";
import Activities from "./pages/Activities";

// ============================================================================
// Page Components - Attendance & Management
// ============================================================================
const Absence = lazy(() => import("./pages/Attendance/index"));

// ============================================================================
// Page Components - Islamic Resources
// ============================================================================
import { PrayerTimesPage } from "./pages/PrayerTimes";
const QuranPage = lazy(() => import("./pages/QuranPage"));
const QuranAudio = lazy(() => import("./pages/QuranAudio"));
const Azkar = lazy(() => import("./pages/Azkar"));

// ============================================================================
// Page Components - Warnings & Discipline
// ============================================================================
const Warnings = lazy(() => import("./pages/Warnings/WarningsPage"));

// ============================================================================
// Page Components - Teacher Student Management
// ============================================================================
const TeacherStudentManagement = lazy(() => import("./pages/Teacher"));

// ============================================================================
// Page Components - Points Game
// ============================================================================
const PointsGame = lazy(() => import("./pages/PointsGame/PointsGamePage"));

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
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* ============================================
            صفحات الإدارة - Management Pages
            ============================================ */}
        <Route path="/admin/students" element={<StudentsManagement />} />
        <Route path="/admin/teachers" element={<TeachersManagement />} />
        <Route path="/admin/groups" element={<GroupManagement />} />
        <Route path="/admin/settings" element={<NotFound />} />

        {/* ============================================
            الصفحات الأكاديمية - Academic Pages
            ============================================ */}
        <Route path="/timetable" element={<Timetable />} />

        {/* ============================================
            صفحات التواصل - Communication Pages
            ============================================ */}
        <Route path="/chat" element={<NotFound />} />

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
  // Loading fallback component
  const LoadingFallback = ({ message }: { message: string }) => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 via-gray-50 to-slate-100">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );

  return (
    <Layout>
      <Routes>
        {/* ============================================
            الصفحة الرئيسية وتسجيل الدخول
            ============================================ */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* ============================================
            الصفحات الأكاديمية - Academic Pages
            ============================================ */}
        <Route 
          path="/goals" 
          element={
            <React.Suspense fallback={<LoadingFallback message="جاري تحميل الأهداف..." />}>
              <Goals />
            </React.Suspense>
          } 
        />
        <Route 
          path="/daily-marks" 
          element={
            <React.Suspense fallback={<LoadingFallback message="جاري تحميل العلامات اليومية..." />}>
              <DailyMarks />
            </React.Suspense>
          } 
        />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/test" element={<NotFound />} />
        <Route path="/exam-schedule" element={<ExamSchedule />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/timetable" element={<Timetable />} />

        {/* ============================================
            التواصل والأنشطة - Communication & Activities
            ============================================ */}
        <Route 
          path="/news" 
          element={
            <React.Suspense fallback={<LoadingFallback message="جاري تحميل الأخبار..." />}>
              <News />
            </React.Suspense>
          } 
        />
        <Route path="/chat" element={<NotFound />} />
        <Route path="/activities" element={<Activities />} />

        {/* ============================================
            الحضور والإدارة - Attendance & Management
            ============================================ */}
        <Route 
          path="/absence" 
          element={
            <React.Suspense fallback={<LoadingFallback message="جاري تحميل الحضور والغياب..." />}>
              <Absence />
            </React.Suspense>
          } 
        />
        <Route path="/warnings" element={<Warnings />} />
        <Route 
          path="/students-management" 
          element={
            <React.Suspense fallback={<LoadingFallback message="جاري تحميل إدارة الطلاب..." />}>
              <TeacherStudentManagement />
            </React.Suspense>
          } 
        />

        {/* ============================================
            لعبة النقاط - Points Game
            ============================================ */}
        <Route 
          path="/points-game" 
          element={
            <React.Suspense fallback={<LoadingFallback message="جاري تحميل لعبة النقاط..." />}>
              <PointsGame />
            </React.Suspense>
          } 
        />

        {/* ============================================
            الموارد الإسلامية - Islamic Resources
            ============================================ */}
        <Route path="/prayer-times" element={<PrayerTimesPage />} />
        <Route 
          path="/quran" 
          element={
            <React.Suspense fallback={<LoadingFallback message="جاري تحميل القرآن الكريم..." />}>
              <QuranPage />
            </React.Suspense>
          } 
        />
        <Route 
          path="/quran-audio" 
          element={
            <React.Suspense fallback={<LoadingFallback message="جاري تحميل القرآن الصوتي..." />}>
              <QuranAudio />
            </React.Suspense>
          } 
        />
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
const StudentRoutes: React.FC = () => {
  // Loading fallback component
  const LoadingFallback = ({ message }: { message: string }) => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 via-gray-50 to-slate-100">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );

  return (
    <Layout>
      <Routes>
        {/* ============================================
            الصفحة الرئيسية وتسجيل الدخول
            ============================================ */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* ============================================
            الصفحات الأكاديمية - Academic Pages
            ============================================ */}
        <Route 
          path="/goals" 
          element={
            <React.Suspense fallback={<LoadingFallback message="جاري تحميل الأهداف..." />}>
              <Goals />
            </React.Suspense>
          } 
        />
        <Route 
          path="/daily-marks" 
          element={
            <React.Suspense fallback={<LoadingFallback message="جاري تحميل العلامات اليومية..." />}>
              <DailyMarks />
            </React.Suspense>
          } 
        />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/exam-schedule" element={<ExamSchedule />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/timetable" element={<Timetable />} />
        <Route 
          path="/test" 
          element={
            <React.Suspense fallback={<LoadingFallback message="جاري تحميل الاختبار..." />}>
              <Test />
            </React.Suspense>
          } 
        />

        {/* ============================================
            التواصل والأنشطة - Communication & Activities
            ============================================ */}
        <Route 
          path="/news" 
          element={
            <React.Suspense fallback={<LoadingFallback message="جاري تحميل الأخبار..." />}>
              <News />
            </React.Suspense>
          } 
        />
        <Route path="/chat" element={<NotFound />} />
        <Route path="/activities" element={<Activities />} />

        {/* ============================================
            الحضور والغياب - Attendance (View Only)
            ============================================ */}
        <Route 
          path="/absence" 
          element={
            <React.Suspense fallback={<LoadingFallback message="جاري تحميل الحضور والغياب..." />}>
              <Absence />
            </React.Suspense>
          } 
        />
        <Route path="/warnings" element={<Warnings />} />

        {/* ============================================
            لعبة النقاط - Points Game
            ============================================ */}
        <Route 
          path="/points-game" 
          element={
            <React.Suspense fallback={<LoadingFallback message="جاري تحميل لعبة النقاط..." />}>
              <PointsGame />
            </React.Suspense>
          } 
        />

        {/* ============================================
            الموارد الإسلامية - Islamic Resources
            ============================================ */}
        <Route path="/prayer-times" element={<PrayerTimesPage />} />
        <Route 
          path="/quran" 
          element={
            <React.Suspense fallback={<LoadingFallback message="جاري تحميل القرآن الكريم..." />}>
              <QuranPage />
            </React.Suspense>
          } 
        />
        <Route 
          path="/quran-audio" 
          element={
            <React.Suspense fallback={<LoadingFallback message="جاري تحميل القرآن الصوتي..." />}>
              <QuranAudio />
            </React.Suspense>
          } 
        />
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 via-gray-50 to-slate-100">
        <div className="text-center">
          <div className="relative inline-flex">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-indigo-600 rounded-full opacity-20 animate-pulse"></div>
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
    ),
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
