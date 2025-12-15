import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthStorage } from "../utils/storage";
import type { AuthUser, AuthContextType } from "../pages/Auth/types";
import { API_URL } from "../config/config";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // تحميل بيانات المستخدم عند بدء التطبيق
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const savedToken = await AuthStorage.getToken();
      const savedUser = await AuthStorage.getUser<AuthUser>();

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(savedUser);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userData: AuthUser, userToken: string) => {
    setToken(userToken);
    setUser(userData);

    try {
      await AuthStorage.saveToken(userToken);
      await AuthStorage.saveUser(userData);
    } catch (error) {
      console.error("Error saving login data:", error);
    }
  };

  const logout = async () => {
    try {
      const currentToken = token;

      // مثل الـ Frontend: إرسال logout للـ Backend لتحديث lastSeen (إن أمكن)
      if (currentToken) {
        try {
          await fetch(`${API_URL}/auth/logout`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${currentToken}`,
            },
          });
        } catch {
          // تجاهل أخطاء الشبكة/الخادم - الأهم تنظيف الجلسة محلياً
        }
      }

      // مسح الحالة أولاً لإخراج المستخدم مباشرة
      setToken(null);
      setUser(null);

      // مثل localStorage.clear() بالـ Frontend
      try {
        await AuthStorage.logout();
      } catch (storageError) {
        console.error("Error clearing auth data:", storageError);
      }
    } catch (error) {
      console.error("Error clearing auth data:", error);
    }
  };

  const updateUser = async (updatedUser: Partial<AuthUser>) => {
    try {
      const nextUser = { ...(user || {}), ...(updatedUser || {}) } as AuthUser;
      await AuthStorage.saveUser(nextUser);
      setUser(nextUser);
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
