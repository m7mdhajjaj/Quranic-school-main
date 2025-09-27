import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

interface AuthFlagContextType {
  isAuthenticated: boolean;
  userRole: string | null;
  setAuthFlag: (authenticated: boolean, role?: string | null) => void;
  logout: () => void;
}

const AuthFlagContext = createContext<AuthFlagContextType | undefined>(
  undefined
);

interface AuthFlagProviderProps {
  children: ReactNode;
}

export const AuthFlagProvider: React.FC<AuthFlagProviderProps> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing authentication on app load
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");

    if (token && role) {
      setIsAuthenticated(true);
      setUserRole(role);
    }
  }, []);

  const setAuthFlag = (authenticated: boolean, role: string | null = null) => {
    setIsAuthenticated(authenticated);
    setUserRole(role);

    if (authenticated && role) {
      localStorage.setItem("userRole", role);
    } else {
      localStorage.removeItem("userRole");
      localStorage.removeItem("token");
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
  };

  const value = {
    isAuthenticated,
    userRole,
    setAuthFlag,
    logout,
  };

  return (
    <AuthFlagContext.Provider value={value}>
      {children}
    </AuthFlagContext.Provider>
  );
};

export const useAuthFlag = () => {
  const context = useContext(AuthFlagContext);
  if (context === undefined) {
    throw new Error("useAuthFlag must be used within an AuthFlagProvider");
  }
  return context;
};
