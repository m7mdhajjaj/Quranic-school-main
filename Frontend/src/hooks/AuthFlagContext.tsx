// Frontend/src/contexts/AuthFlagContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";

interface AuthFlagContextType {
  isOnline: boolean;
  authFlag: boolean; // Main authentication flag
  setOnlineStatus: (status: boolean) => void;
  markUserOnline: () => void;
  markUserOffline: () => void;
  // New methods for explicit flag management
  setAuthFlag: (flag: boolean) => void;
  toggleAuthFlag: () => void;
}

const AuthFlagContext = createContext<AuthFlagContextType | undefined>(
  undefined
);

interface AuthFlagProviderProps {
  children: ReactNode;
}

const safeHasLocalStorage = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    const testKey = "__ls_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

const getAuthPresence = (): boolean => {
  if (!safeHasLocalStorage()) return false;
  const user = window.localStorage.getItem("user");
  const token = window.localStorage.getItem("token");
  return Boolean(user && token);
};

export const AuthFlagProvider: React.FC<AuthFlagProviderProps> = ({
  children,
}) => {
  // Main authentication flag state
  const [authFlag, setAuthFlagState] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(false);

  // Enhanced setOnlineStatus that also updates the auth flag
  const setOnlineStatus = useCallback((status: boolean) => {
    console.log(`🟢 Online Status Changed: ${status ? "ONLINE" : "OFFLINE"}`);
    console.log(`📊 User is now: ${status ? "✅ Online" : "❌ Offline"}`);
    
    setIsOnline(status);
    setAuthFlagState(status);
  }, []);

  // Method to set auth flag directly
  const setAuthFlag = useCallback((flag: boolean) => {
    setAuthFlagState(flag);
    setIsOnline(flag);
  }, []);

  // Method to toggle auth flag
  const toggleAuthFlag = useCallback(() => {
    setAuthFlagState(prev => {
      const newValue = !prev;
      setIsOnline(newValue);
      return newValue;
    });
  }, []);

  const markUserOnline = useCallback(() => {
    console.log("🔵 User Login Successful");
    setOnlineStatus(true);
  }, [setOnlineStatus]);

  const markUserOffline = useCallback(() => {
    console.log("🔴 User Logout Successful");
    setOnlineStatus(false);
  }, [setOnlineStatus]);

  // Initialize from localStorage + network on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const initialFromAuth = getAuthPresence();
    // If you want to also factor in real network state:
    const networkOk = typeof navigator !== "undefined" ? 
      navigator.onLine : true;

    if (initialFromAuth) {
      console.log(
        "🟡 Initial Check: User data found in localStorage"
      );
      setOnlineStatus(networkOk);
    } else {
      console.log(
        "🟡 Initial Check: No user data found"
      );
      setOnlineStatus(false);
    }
  }, [setOnlineStatus]);

  // Respond to cross-tab login/logout via localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "user" || event.key === "token") {
        const present = getAuthPresence();
        if (!present) {
          console.log(
            "🟠 Storage Change Detected: User data removed"
          );
          setOnlineStatus(false);
        } else {
          console.log(
            "🟠 Storage Change Detected: User data present"
          );
          setOnlineStatus(true);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [setOnlineStatus]);

  // React to actual network connectivity (optional but useful)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const goOnline = () => {
      // Only go ONLINE if auth presence exists
      if (getAuthPresence()) {
        console.log("🌐 Network Online");
        setOnlineStatus(true);
      }
    };
    
    const goOffline = () => {
      console.log("🌐 Network Offline");
      setOnlineStatus(false);
    };

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, [setOnlineStatus]);

  const contextValue: AuthFlagContextType = {
    isOnline,
    authFlag,
    setOnlineStatus,
    markUserOnline,
    markUserOffline,
    setAuthFlag,
    toggleAuthFlag,
  };

  return (
    <AuthFlagContext.Provider value={contextValue}>
      {children}
    </AuthFlagContext.Provider>
  );
};

export const useAuthFlag = (): AuthFlagContextType => {
  const ctx = useContext(AuthFlagContext);
  if (!ctx) {
    throw new Error("useAuthFlag must be used within an AuthFlagProvider");
  }
  return ctx;
};

export { AuthFlagContext };