import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useAuth } from "../Context";
import Login from "../pages/Auth/Login";

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
          <Stack.Screen name="Home" component={HomeScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// شاشة Home مؤقتة للاختبار
const HomeScreen = () => {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>مرحباً!</Text>
      <Text style={styles.subtitle}>
        {user?.firstName || user?.name || "المستخدم"}
      </Text>
      <Text style={styles.info}>تم تسجيل الدخول بنجاح</Text>

      <TouchableOpacity style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>تسجيل الخروج</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#065f46",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 24,
    color: "#047857",
    marginBottom: 16,
  },
  info: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 32,
  },
  button: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default AppNavigator;
