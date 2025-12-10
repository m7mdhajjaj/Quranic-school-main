import apiClient from "./apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_ENDPOINTS } from "../config/api";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "student" | "teacher" | "admin";
  profilePicture?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  // تسجيل الدخول
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.LOGIN, credentials);
    const { token, user } = response.data;

    // حفظ التوكن والمستخدم
    await AsyncStorage.setItem("token", token);
    await AsyncStorage.setItem("user", JSON.stringify(user));

    return response.data;
  },

  // تسجيل الخروج
  logout: async (): Promise<void> => {
    try {
      await apiClient.post(API_ENDPOINTS.LOGOUT);
    } catch (error) {
      console.log("Logout error:", error);
    } finally {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
    }
  },

  // الحصول على المستخدم المحفوظ
  getCurrentUser: async (): Promise<User | null> => {
    const userStr = await AsyncStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  // التحقق من حالة تسجيل الدخول
  isLoggedIn: async (): Promise<boolean> => {
    const token = await AsyncStorage.getItem("token");
    return !!token;
  },

  // الحصول على التوكن
  getToken: async (): Promise<string | null> => {
    return await AsyncStorage.getItem("token");
  },
};
