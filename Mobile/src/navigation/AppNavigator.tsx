import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useAuth } from "../Context";
import Login from "../pages/Auth/Login";
import Home from "../pages/Home";

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

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
          <Stack.Screen name="Home" component={Home} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
export default AppNavigator;
