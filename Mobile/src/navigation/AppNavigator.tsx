import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useAuth } from "../Context";
import Login from "../pages/Auth/Login";
import Home from "../pages/Home";
import Goals from "../pages/Goals";
import ComingSoon from "../pages/NotFound/ComingSoon";
import { UserLayout } from "../components/Layout/User";
import { useRoleLayout } from "../hooks";

type AppStackParamList = {
  Login: undefined;
  Home: undefined;
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
  const { isAuthenticated, isLoading } = useAuth();
  const { userRole } = useRoleLayout();

  if (isLoading) {
    return null; // يمكن إضافة شاشة تحميل هنا لاحقاً
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
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
              component={createComingSoonWrapped("الأذكار")}
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
