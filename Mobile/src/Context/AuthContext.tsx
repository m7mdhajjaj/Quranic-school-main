import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthStorage } from "../utils/storage";
import type { AuthUser, AuthContextType } from "../pages/Auth/types";

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
      const savedUser = await AuthStorage.getUser();

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

  const login = async (userToken: string, userData: AuthUser) => {
    try {
      await AuthStorage.saveToken(userToken);
      await AuthStorage.saveUser(userData);
      setToken(userToken);
      setUser(userData);
    } catch (error) {
      console.error("Error saving login data:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AuthStorage.clearAuth();
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error("Error clearing auth data:", error);
      throw error;
    }
  };

  const updateUser = async (updatedUser: AuthUser) => {
    try {
      await AuthStorage.saveUser(updatedUser);
      setUser(updatedUser);
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
