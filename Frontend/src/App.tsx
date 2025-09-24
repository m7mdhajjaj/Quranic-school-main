import "./App.css";
import Header from "./components/Header";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Goals from "./pages/Goals";
import News from "./pages/news";
import Footer from "./components/Footer";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useLocation } from "react-router-dom";
import useAuthGuard from "./hooks/useAuthGuard";
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
function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isChatPage = location.pathname === "/chat";
  const isQuranPage =
    location.pathname === "/quran" || location.pathname === "/quran-audio";

  // استخدام hook الحماية
  useAuthGuard();

  return (
    <>
      {!isLoginPage && <Header />}
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
        {/* Add more routes as needed */}
        <Route path="/test" element={<Test />} />
        <Route path="/soon" element={<Soon />} />
        <Route path="/prayer-times" element={<PrayerTimes />} />
        <Route path="/quran" element={<QuranPage />} />
        <Route path="/quran-audio" element={<QuranAudio />} />
        <Route path="/change-password" element={<ChangePass />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isLoginPage && !isChatPage && !isQuranPage && <Footer />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
