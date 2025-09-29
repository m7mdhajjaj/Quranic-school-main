// Frontend/src/App.tsx
import "./App.css";
import Header from "./components/Header";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Goals from "./pages/Goals";
import News from "./pages/news";
import Footer from "./components/Footer";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Arrangement from "./pages/Arrangement";
import Activities from "./pages/Activities";
import DailyMarks from "./pages/DailyMarks";
import Absence from "./pages/Absence";
import NotFound from "./pages/NotFound";
import Chat from "./pages/Chat";
import Managment from "./pages/managment";
import Test from "./pages/Test";
import PrayerTimes from "./pages/PrayerTimes";
import QuranPage from "./pages/QuranPage";
import QuranAudio from "./pages/QuranAudio";
import ChangePass from "./pages/ChangePass";
import Soon from "./components/Soon";
import Reports from "./pages/Reports";
import Timetable from "./pages/Timetable";
import ExamSchedule from "./pages/ExamSchedule";
import AdminDashboard from "./pages/AdminDashboard";
import AdminManagement from "./pages/AdminManagement";
import AdminHeader from "./components/AdminHeader";
import Loading from "./components/Loading";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./hooks/useAuth";
import { UserStatusProvider } from "./contexts/UserStatusContext";

function AppContent() {
  const location = useLocation();
  const { isLoading, isAuthenticated } = useAuth();
  
  const isLoginPage = location.pathname === "/login";
  const isChatPage = location.pathname === "/chat";
  const isQuranPage =
    location.pathname === "/quran" || location.pathname === "/quran-audio";
  const isAdminPage = location.pathname.startsWith("/admin");

  // عرض Loading أثناء تحميل بيانات المصادقة
  if (isLoading) {
    return <Loading fullscreen message="جاري تحميل بيانات المستخدم..." />;
  }

  // إعادة التوجه للمسارات المحمية إذا لم يكن مسجلاً دخوله
  if (!isAuthenticated && !isLoginPage) {
    return (
      <>
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      </>
    );
  }

  return (
    <>
      {isAdminPage && <AdminHeader />}
      {!isLoginPage && !isAdminPage && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/daily-marks" element={<DailyMarks />} />
        <Route path="/arrangement" element={<Arrangement />} />
        <Route path="/activities" element={<Activities />} />
        <Route path="/news" element={<News />} />
        <Route path="/absence" element={<Absence />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/managment" element={<Managment />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/timetable" element={<Timetable />} />
        <Route path="/test" element={<Test />} />
        <Route path="/exam-schedule" element={<ExamSchedule />} />
        <Route path="/soon" element={<Soon />} />
        <Route path="/prayer-times" element={<PrayerTimes />} />
        <Route path="/quran" element={<QuranPage />} />
        <Route path="/quran-audio" element={<QuranAudio />} />
        <Route path="/change-password" element={<ChangePass />} />
        <Route path="/profile" element={<Profile />} />
        {/* Admin Routes - Protected */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/management" element={<AdminManagement />} />
        {/* Redirect /admin to /admin/dashboard */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isLoginPage && !isChatPage && !isQuranPage && !isAdminPage && (
        <Footer />
      )}
    </>
  );
}

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
