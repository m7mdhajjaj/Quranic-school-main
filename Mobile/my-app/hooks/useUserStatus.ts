import { useContext } from "react";
import {
  UserStatusContext,
  type UserStatusContextType,
} from "../Context/UserStatusContext";

/**
 * Hook مخصص لاستخدام UserStatusContext في React Native
 */
export const useUserStatus = (): UserStatusContextType => {
  const context = useContext(UserStatusContext);

  if (context === undefined) {
    throw new Error("useUserStatus يجب أن يُستخدم داخل UserStatusProvider");
  }

  return context;
};
