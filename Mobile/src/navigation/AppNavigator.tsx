import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useAuth } from "../context/AuthContext";
import { ActivityIndicator, View } from "react-native";

// Screens
import { Login, Home } from "../screens";

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  // أضف المزيد من الشاشات هنا
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          // الشاشات بعد تسجيل الدخول
          <>
            <Stack.Screen name="Home" component={Home} />
            {/* أضف المزيد من الشاشات هنا */}
          </>
        ) : (
          // شاشات قبل تسجيل الدخول
          <Stack.Screen name="Login" component={Login} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
