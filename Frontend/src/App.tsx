import "./App.css";
import { lazy, Suspense, useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useLocation } from "react-router-dom";
import useAuthGuard from "./hooks/useAuthGuard";

// Lazy load pages for better performance with preloading hints
const Home = lazy(() => import("./pages/Home"));
const Profile = lazy(() => 
  import(/* webpackChunkName: "profile" */ "./pages/Profile")
    .then(module => {
      // Preload related components that might be needed
      import("./components/UserInfoModal");
      return module;
    })
);
const Login = lazy(() => import(/* webpackChunkName: "auth" */ "./pages/Login"));
const Goals = lazy(() => import(/* webpackChunkName: "goals" */ "./pages/Goals"));
const News = lazy(() => import(/* webpackChunkName: "news" */ "./pages/news"));
const Arrangement = lazy(() => import(/* webpackChunkName: "arrangement" */ "./pages/Arrangement"));
const Activities = lazy(() => import(/* webpackChunkName: "activities" */ "./pages/Activities"));
const DailyMarks = lazy(() => import(/* webpackChunkName: "marks" */ "./pages/DailyMarks"));
const Absence = lazy(() => import(/* webpackChunkName: "absence" */ "./pages/Absence"));
const NotFound = lazy(() => import(/* webpackChunkName: "notfound" */ "./pages/NotFound"));
const Chat = lazy(() => import(/* webpackChunkName: "chat" */ "./pages/Chat"));
const Managment = lazy(() => import(/* webpackChunkName: "managment" */ "./pages/managment"));
const Test = lazy(() => import(/* webpackChunkName: "test" */ "./pages/Test"));
const PrayerTimes = lazy(() => import(/* webpackChunkName: "prayer" */ "./pages/PrayerTimes"));
const QuranPage = lazy(() => import(/* webpackChunkName: "quran" */ "./pages/QuranPage"));
const QuranAudio = lazy(() => import(/* webpackChunkName: "quran-audio" */ "./pages/QuranAudio"));
const ChangePass = lazy(() => import(/* webpackChunkName: "change-pass" */ "./pages/ChangePass"));
const Soon = lazy(() => import(/* webpackChunkName: "soon" */ "./components/Soon"));
const Reports = lazy(() => import(/* webpackChunkName: "reports" */ "./pages/Reports"));
const Timetable = lazy(() => import(/* webpackChunkName: "timetable" */ "./pages/Timetable"));
const ExamSchedule = lazy(() => import(/* webpackChunkName: "exam-schedule" */ "./pages/ExamSchedule"));
// Profile-specific skeleton
const ProfileSkeleton = () => (
  <div className="p-4 md:p-6" dir="rtl">
    {/* Loading progress bar */}
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200">
      <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 loading-bar"></div>
    </div>
    
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header skeleton */}
      <div className="relative rounded-3xl p-5 md:p-6 shadow-md overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-600 to-emerald-700 ring-1 ring-emerald-500/20">
        <div className="absolute inset-0 bg-white/5 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent profile-skeleton-wave"></div>
        <div className="relative flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="h-8 bg-white/20 rounded-lg w-48 animate-pulse relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_ease-in-out_infinite]"></div>
            </div>
            <div className="h-6 bg-white/15 rounded-full w-32 animate-pulse relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_ease-in-out_infinite] animation-delay-200"></div>
            </div>
          </div>
          <div className="w-20 h-20 md:w-24 md:h-24 bg-white/20 rounded-full animate-pulse relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_ease-in-out_infinite] animation-delay-400 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Content grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main profile card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100/50 to-transparent profile-skeleton-wave"></div>
            <div className="relative">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-6 animate-pulse"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                    <div className="h-10 bg-gray-100 border border-gray-200 rounded-lg animate-pulse relative overflow-hidden">
                      <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-[shimmer_2s_ease-in-out_infinite] animation-delay-${i * 100}`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar skeleton */}
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100/50 to-transparent profile-skeleton-wave"></div>
            <div className="relative">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4 animate-pulse"></div>
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded flex-1 animate-pulse relative overflow-hidden">
                      <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-[shimmer_2s_ease-in-out_infinite] animation-delay-${Math.min(i * 100, 600)}`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Generic loading skeleton for other pages
const PageLoadingSkeleton = () => {
  const location = useLocation();
  
  // Show profile-specific skeleton for profile page
  if (location.pathname === '/profile') {
    return <ProfileSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Page header skeleton */}
        <div className="mb-8">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/3 mb-4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
        </div>
        
        {/* Content skeleton */}
        <div className="grid gap-6">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4 animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse"></div>
              </div>
            </div>
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4 animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isChatPage = location.pathname === "/chat";
  const isQuranPage =
    location.pathname === "/quran" || location.pathname === "/quran-audio";

  // استخدام hook الحماية
  useAuthGuard();

  // Performance monitoring for lazy loading (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const startTime = performance.now();
      return () => {
        const endTime = performance.now();
        console.log(`Route ${location.pathname} loaded in ${(endTime - startTime).toFixed(2)}ms`);
      };
    }
  }, [location.pathname]);

  return (
    <>
      {!isLoginPage && <Header />}
      <Suspense fallback={<PageLoadingSkeleton />}>
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
        <Route path="/exam-schedule" element={<ExamSchedule />} />
        <Route path="/soon" element={<Soon />} />
        <Route path="/prayer-times" element={<PrayerTimes />} />
        <Route path="/quran" element={<QuranPage />} />
        <Route path="/quran-audio" element={<QuranAudio />} />
  <Route path="/change-password" element={<ChangePass />} />
  <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
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
