import { useContext } from "react";
import AuthContext, { type AuthContextType } from "../Context/AuthContext";

/**
 * Hook مخصص لاستخدام AuthContext في React Native
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth يجب أن يُستخدم داخل AuthProvider");
  }

  return context;
};

/**
 * Hook للتحقق من الأدوار
 */
export const useRole = () => {
  const {
    user,
    isStudent,
    isTeacher,
    isAdmin,
    isSecretary,
    getSecretaryPermissions,
  } = useAuth();

  return {
    role: user?.role,
    isStudent: isStudent(),
    isTeacher: isTeacher(),
    isAdmin: isAdmin(),
    isSecretary: isSecretary(),
    secretaryPermissions: getSecretaryPermissions(),
  };
};
