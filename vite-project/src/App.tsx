import "./App.css";
import Header from "./components/Header";
import Home from "./pages/Home";
import Login from "./pages/Login";
import TeacherLogin from "./pages/TeacherLogin";
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
function AppContent() {
  const location = useLocation();
  const isLoginPage =
    location.pathname === "/login" || location.pathname === "/teacher-login";
  const isChatPage = location.pathname === "/chat";
  return (
    <>
      {!isLoginPage && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/teacher-login" element={<TeacherLogin />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/daily-marks" element={<DailyMarks />} />
        <Route path="/arrangement" element={<Arrangement />} />
        <Route path="/activities" element={<Activities />} />
        <Route path="/news" element={<News />} />
        <Route path="/absence" element={<Absence />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/managment" element={<Managment />} />
        {/* Add more routes as needed */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isLoginPage && !isChatPage && <Footer />}
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
