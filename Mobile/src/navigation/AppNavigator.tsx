import React from "react";
import {
  createNavigationContainerRef,
  NavigationContainer,
} from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useAuth } from "../Context";
import Login from "../pages/Auth/Login";
import Home from "../pages/Home";
import Goals from "../pages/Goals";
import Azkar from "../pages/Azkar";
import ComingSoon from "../pages/NotFound/ComingSoon";
import { UserLayout } from "../components/Layout/User";
import { useRoleLayout } from "../hooks";
import { StorageHelper } from "../utils/storage";

type AppStackParamList = {
  Login: undefined;
  Home: undefined;
  AdminDashboard: undefined;
  Goals: undefined;
  DailyMarks: undefined;
  Ranking: undefined;
  ExamSchedule: undefined;
  Reports: undefined;
  Timetable: undefined;
  News: undefined;
  Chat: undefined;
  Activities: undefined;
  Attendance: undefined;
  Warnings: undefined;
  PointsGame: undefined;
  PrayerTimes: undefined;
  Quran: undefined;
  Azkar: undefined;
  Profile: undefined;
  ChangePassword: undefined;
};

const Stack = createStackNavigator<AppStackParamList>();

const navigationRef = createNavigationContainerRef<AppStackParamList>();

const LAST_VISITED_KEY = "lastVisitedRouteName";

const getDefaultRouteForRole = (
  role?: string | null
): keyof AppStackParamList => {
  if (role === "admin") return "AdminDashboard";
  return "Home";
};

const createUserWrappedScreen = (
  ScreenComponent: React.ComponentType<any>
): React.FC<any> => {
  const Wrapped: React.FC<any> = ({ navigation, route }) => {
    return (
      <UserLayout
        routeName={route.name}
        onNavigate={(name) => navigation.navigate(name)}>
        <ScreenComponent />
      </UserLayout>
    );
  };
  return Wrapped;
};

const createComingSoonWrapped = (title: string): React.FC<any> => {
  const Wrapped: React.FC<any> = ({ navigation, route }) => {
    return (
      <UserLayout
        routeName={route.name}
        onNavigate={(name) => navigation.navigate(name)}>
        <ComingSoon title={title} />
      </UserLayout>
    );
  };
  return Wrapped;
};

const AppNavigator = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { userRole } = useRoleLayout();
  const [navReady, setNavReady] = React.useState(false);

  // عند تسجيل الخروج: تأكيد الرجوع لـ Login + تنظيف آخر مسار محفوظ
  React.useEffect(() => {
    if (!navReady) return;
    if (isAuthenticated) return;

    const run = async () => {
      try {
        await StorageHelper.removeItem(LAST_VISITED_KEY);
      } catch {
        // ignore
      }

      navigationRef.resetRoot({
        index: 0,
        routes: [{ name: "Login" }],
      });
    };

    run();
  }, [navReady, isAuthenticated]);

  React.useEffect(() => {
    if (!navReady) return;
    if (!isAuthenticated || !user) return;

    const run = async () => {
      const lastVisited = await StorageHelper.getItem(LAST_VISITED_KEY);
      const fallback = getDefaultRouteForRole(user.role);

      const target =
        lastVisited && lastVisited !== "Login"
          ? (lastVisited as keyof AppStackParamList)
          : fallback;

      await StorageHelper.removeItem(LAST_VISITED_KEY);

      navigationRef.resetRoot({
        index: 0,
        routes: [{ name: target }],
      });
    };

    run();
  }, [navReady, isAuthenticated, user?._id]);

  if (isLoading) {
    return null; // يمكن إضافة شاشة تحميل هنا لاحقاً
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => setNavReady(true)}
      onStateChange={() => {
        if (!navigationRef.isReady()) return;
        const current = navigationRef.getCurrentRoute()?.name;
        if (!current || current === "Login") return;
        StorageHelper.setItem(LAST_VISITED_KEY, String(current));
      }}>
      <Stack.Navigator
        key={isAuthenticated ? "app" : "auth"}
        initialRouteName={
          isAuthenticated
            ? getDefaultRouteForRole(user?.role)
            : ("Login" as const)
        }
        screenOptions={{
          headerShown: false,
        }}>
        {!isAuthenticated ? (
          // Auth Stack - شاشات تسجيل الدخول
          <Stack.Screen name="Login" component={Login} />
        ) : (
          // Main App Stack - شاشات التطبيق الرئيسية
          <>
            <Stack.Screen
              name="AdminDashboard"
              component={createComingSoonWrapped("لوحة التحكم")}
            />

            <Stack.Screen
              name="Home"
              component={createUserWrappedScreen(Home)}
            />

            {/* Same ordering/grouping as Frontend Sidebar */}
            <Stack.Screen
              name="Goals"
              component={createUserWrappedScreen(Goals)}
            />
            <Stack.Screen
              name="DailyMarks"
              component={createComingSoonWrapped("العلامات اليومية")}
            />
            <Stack.Screen
              name="Ranking"
              component={createComingSoonWrapped("التصنيف")}
            />
            <Stack.Screen
              name="ExamSchedule"
              component={createComingSoonWrapped("جدول الامتحانات")}
            />
            <Stack.Screen
              name="Reports"
              component={createComingSoonWrapped("التقارير")}
            />
            <Stack.Screen
              name="Timetable"
              component={createComingSoonWrapped("المواعيد")}
            />
            <Stack.Screen
              name="News"
              component={createComingSoonWrapped("الأخبار")}
            />
            <Stack.Screen
              name="Chat"
              component={createComingSoonWrapped("المحادثة")}
            />
            <Stack.Screen
              name="Activities"
              component={createComingSoonWrapped("الأنشطة")}
            />
            <Stack.Screen
              name="Attendance"
              component={createComingSoonWrapped("الحضور والغياب")}
            />
            <Stack.Screen
              name="Warnings"
              component={createComingSoonWrapped("الإنذارات")}
            />
            <Stack.Screen
              name="PointsGame"
              component={createComingSoonWrapped("لعبة النقاط")}
            />
            <Stack.Screen
              name="PrayerTimes"
              component={createComingSoonWrapped("أوقات الصلاة")}
            />
            <Stack.Screen
              name="Quran"
              component={createComingSoonWrapped("القرآن الكريم")}
            />
            <Stack.Screen
              name="Azkar"
              component={createUserWrappedScreen(Azkar)}
            />

            {/* Account */}
            <Stack.Screen
              name="Profile"
              component={createComingSoonWrapped("الملف الشخصي")}
            />
            <Stack.Screen
              name="ChangePassword"
              component={createComingSoonWrapped("تغيير كلمة المرور")}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
export default AppNavigator;
