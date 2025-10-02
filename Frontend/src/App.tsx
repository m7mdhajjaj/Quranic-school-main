// ============================================================================
// App.tsx - Main Application Component
// ============================================================================
// This file manages the routing and layout structure for the application.
// It handles authentication, role-based routing, and conditional rendering
// of headers and footers based on user roles and current routes.
// ============================================================================

import "./App.css";

// ============================================================================
// External Dependencies
// ============================================================================
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import React from "react";

// ============================================================================
// Contexts & Hooks
// ============================================================================
import { AuthProvider } from "./contexts/AuthContext";
import { UserStatusProvider } from "./contexts/UserStatusContext";
import { useAuth } from "./hooks/useAuth";

// ============================================================================
// Layout Components
// ============================================================================
import Header from "./components/Headers/Header";
import AdminHeader from "./components/Headers/AdminHeader";
import Footer from "./components/Footer";
import Loading from "./components/Loading/Loading";

// ============================================================================
// Page Components - General
// ============================================================================
import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import ChangePass from "./pages/ChangePass";
import NotFound from "./pages/NotFound";

// ============================================================================
// Page Components - Academic
// ============================================================================
import Goals from "./pages/Goals";
import DailyMarks from "./pages/DailyMarks";
import Arrangement from "./pages/Arrangement";
import Test from "./pages/Test";
import ExamSchedule from "./pages/ExamSchedule";
import Reports from "./pages/Reports";
import Timetable from "./pages/Timetable";

// ============================================================================
// Page Components - Communication & Activities
// ============================================================================
import News from "./pages/news";
// import Chat from "./pages/Chat";
import Activities from "./pages/Activities";

// ============================================================================
// Page Components - Attendance & Management
// ============================================================================
import Absence from "./pages/Absence";
import Managment from "./pages/managment";

// ============================================================================
// Page Components - Islamic Resources
// ============================================================================
import PrayerTimes from "./pages/PrayerTimes";
import QuranPage from "./pages/QuranPage";
import QuranAudio from "./pages/QuranAudio";

// ============================================================================
// Page Components - Admin
// ============================================================================
import AdminDashboard from "./pages/AdminDashboard";
// import AdminManagement from "./pages/Managments/AdminManagement";
import StudentsManagement from "./pages/Managments/StudentsManagement";
import TeachersManagement from "./pages/Managments/TeachersManagement";
import GroupManagement from "./pages/Managments/GroupManagement";

// ============================================================================
// Other Components
// ============================================================================
import Soon from "./components/Soon";

// ============================================================================
// Route Configurations
// ============================================================================

/**
 * Routes that should hide the footer
 */
const ROUTES_WITHOUT_FOOTER = ["/login", "/chat", "/quran", "/quran-audio"];

/**
 * Check if current path should hide footer
 */
const shouldHideFooter = (pathname: string): boolean => {
  return ROUTES_WITHOUT_FOOTER.some(route => pathname === route);
};

// ============================================================================
// Admin Routes Component
// ============================================================================
/**
 * Handles all routing for admin users
 * - Shows AdminHeader instead of regular Header
 * - Provides access to admin dashboard and management pages
 * - Footer is now displayed for admin pages
 */
const AdminRoutes: React.FC = () => {
  const location = useLocation();
  
  // Determine layout visibility based on current route
  const isLoginPage = location.pathname === "/login";
  const shouldShowFooter = !shouldHideFooter(location.pathname);

  return (
    <>
      {/* Header - Hidden only on login page */}
      {!isLoginPage && <AdminHeader />}
      
      <Routes>
        {/* ====== Admin Dashboard Routes ====== */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        {/* <Route path="/admin/management" element={<AdminManagement />} /> */}
        <Route path="/admin/students" element={<StudentsManagement />} />
        <Route path="/admin/teachers" element={<TeachersManagement />} />
        <Route path="/admin/groups" element={<GroupManagement />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/" element={<AdminDashboard />} />
        
        {/* ====== Admin - User Settings ====== */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/change-password" element={<ChangePass />} />
        
        {/* ====== Admin - Authentication ====== */}
        <Route path="/login" element={<Login />} />
        
        {/* ====== Fallback - Redirect to Dashboard ====== */}
        <Route path="*" element={<AdminDashboard />} />
      </Routes>
      
      {/* Footer - Hidden on login and specific pages */}
      {shouldShowFooter && <Footer />}
    </>
  );
};

// ============================================================================
// Teacher Routes Component
// ============================================================================
/**
 * Handles all routing for teacher users
 * - Shows regular Header (not AdminHeader)
 * - Has access to management features and academic tools
 * - Can view and manage student data
 * - Restricted from admin-only pages
 */
const TeacherRoutes: React.FC = () => {
  const location = useLocation();
  
  // Determine layout visibility based on current route
  const isLoginPage = location.pathname === "/login";
  const shouldShowFooter = !shouldHideFooter(location.pathname);

  return (
    <>
      {/* Header - Hidden only on login page */}
      {!isLoginPage && <Header />}
      
      <Routes>
        {/* ====== Home & Authentication ====== */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        
        {/* ====== Academic Pages - Teacher Access ====== */}
        <Route path="/goals" element={<Goals />} />
        <Route path="/daily-marks" element={<DailyMarks />} />
        <Route path="/arrangement" element={<Arrangement />} />
        <Route path="/test" element={<Test />} />
        <Route path="/exam-schedule" element={<ExamSchedule />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/timetable" element={<Timetable />} />
        
        {/* ====== Communication & Activities ====== */}
        <Route path="/news" element={<News />} />
        {/* <Route path="/chat" element={<Chat />} /> */}
        <Route path="/activities" element={<Activities />} />
        
        {/* ====== Attendance & Management - Teacher Features ====== */}
        <Route path="/absence" element={<Absence />} />
        <Route path="/managment" element={<Managment />} />
        
        {/* ====== Islamic Resources ====== */}
        <Route path="/prayer-times" element={<PrayerTimes />} />
        <Route path="/quran" element={<QuranPage />} />
        <Route path="/quran-audio" element={<QuranAudio />} />
        
        {/* ====== User Settings ====== */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/change-password" element={<ChangePass />} />
        
        {/* ====== Special Pages ====== */}
        <Route path="/soon" element={<Soon />} />
        
        {/* ====== Protected & Fallback Routes ====== */}
        {/* Block access to admin routes */}
        <Route path="/admin/*" element={<NotFound />} />
        {/* 404 page for undefined routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      {/* Footer - Hidden on login, chat, and Quran pages */}
      {shouldShowFooter && <Footer />}
    </>
  );
};

// ============================================================================
// Student Routes Component
// ============================================================================
/**
 * Handles all routing for student users
 * - Shows regular Header (not AdminHeader)
 * - Limited access compared to teachers
 * - Can view their own data and resources
 * - Cannot access management or admin features
 */
const StudentRoutes: React.FC = () => {
  const location = useLocation();
  
  // Determine layout visibility based on current route
  const isLoginPage = location.pathname === "/login";
  const shouldShowFooter = !shouldHideFooter(location.pathname);

  return (
    <>
      {/* Header - Hidden only on login page */}
      {!isLoginPage && <Header />}
      
      <Routes>
        {/* ====== Home & Authentication ====== */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        
        {/* ====== Academic Pages - Student View Only ====== */}
        <Route path="/goals" element={<Goals />} />
        <Route path="/daily-marks" element={<DailyMarks />} />
        <Route path="/arrangement" element={<Arrangement />} />
        <Route path="/exam-schedule" element={<ExamSchedule />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/timetable" element={<Timetable />} />
        <Route path="/test" element={<Test />} />
        {/* ====== Communication & Activities ====== */}
        <Route path="/news" element={<News />} />
        {/* <Route path="/chat" element={<Chat />} /> */}
        <Route path="/activities" element={<Activities />} />
        
        {/* ====== Attendance - View Only ====== */}
        <Route path="/absence" element={<Absence />} />
        
        {/* ====== Islamic Resources ====== */}
        <Route path="/prayer-times" element={<PrayerTimes />} />
        <Route path="/quran" element={<QuranPage />} />
        <Route path="/quran-audio" element={<QuranAudio />} />
        
        {/* ====== User Settings ====== */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/change-password" element={<ChangePass />} />
        
        {/* ====== Special Pages ====== */}
        <Route path="/soon" element={<Soon />} />
        
        {/* ====== Protected & Fallback Routes ====== */}
        {/* Block access to management features (teacher-only) */}
        <Route path="/managment" element={<NotFound />} />
        <Route path="/test" element={<NotFound />} />
        {/* Block access to admin routes */}
        <Route path="/admin/*" element={<NotFound />} />
        {/* 404 page for undefined routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      {/* Footer - Hidden on login, chat, and Quran pages */}
      {shouldShowFooter && <Footer />}
    </>
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
function AppContent() {
  const { isLoading, isAuthenticated, user } = useAuth();

  // ====== Loading State ======
  // Show loading spinner while authentication data is being fetched
  if (isLoading) {
    return <Loading fullscreen message="جاري تحميل بيانات المستخدم..." />;
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
  switch (user?.role) {
    case 'admin':
      return <AdminRoutes />;
    case 'teacher':
      return <TeacherRoutes />;
    case 'student':
      return <StudentRoutes />;
    default:
      // Fallback to login if role is undefined or invalid
      return (
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      );
  }
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
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UserStatusProvider>
          <AppContent />
        </UserStatusProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

