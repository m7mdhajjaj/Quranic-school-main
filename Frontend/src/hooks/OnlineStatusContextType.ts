import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";

interface OnlineStatusContextType {
  isOnline: boolean;
  setOnlineStatus: (status: boolean) => void;
  markUserOnline: () => void;
  markUserOffline: () => void;
}

const OnlineStatusContext = createContext<OnlineStatusContextType | undefined>(
  undefined
);

interface OnlineStatusProviderProps {
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

export const OnlineStatusProvider: React.FC<OnlineStatusProviderProps> = ({
  children,
}) => {
  // Start with false to avoid SSR hydration mismatch; we correct after mount.
  const [isOnline, setIsOnline] = useState<boolean>(false);

  const setOnlineStatus = useCallback((status: boolean) => {
    // Console logs kept as requested
    console.log(`🟢 Online Status Changed: ${status ? "ONLINE" : "OFFLINE"}`);
    console.log(`📊 User is now: ${status ? "✅ Online" : "❌ Offline"}`);
    setIsOnline(status);
  }, []);

  const markUserOnline = useCallback(() => {
    console.log("🔵 User Login Successful - Setting Online Status to TRUE");
    setOnlineStatus(true);
  }, [setOnlineStatus]);

  const markUserOffline = useCallback(() => {
    console.log("🔴 User Logout Successful - Setting Online Status to FALSE");
    setOnlineStatus(false);
  }, [setOnlineStatus]);

  // Initialize from localStorage + network on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const initialFromAuth = getAuthPresence();
    // If you want to also factor in real network state:
    const networkOk = typeof navigator !== "undefined" ? navigator.onLine : true;

    if (initialFromAuth) {
      console.log(
        "🟡 Initial Check: User data found in localStorage - Setting Online Status to TRUE"
      );
      setOnlineStatus(true && networkOk);
    } else {
      console.log(
        "🟡 Initial Check: No user data found - Setting Online Status to FALSE"
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
            "🟠 Storage Change Detected: User data removed - Setting Online Status to FALSE"
          );
          setOnlineStatus(false);
        } else {
          console.log(
            "🟠 Storage Change Detected: User data present - Setting Online Status to TRUE"
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
      if (getAuthPresence()) setOnlineStatus(true);
    };
    const goOffline = () => setOnlineStatus(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, [setOnlineStatus]);

  const contextValue: OnlineStatusContextType = {
    isOnline,
    setOnlineStatus,
    markUserOnline,
    markUserOffline,
  };

  return (
    <OnlineStatusContext.Provider value={contextValue}>
      {children}
    </OnlineStatusContext.Provider>
  );
};

export const useOnlineStatus = (): OnlineStatusContextType => {
  const ctx = useContext(OnlineStatusContext);
  if (!ctx) {
    throw new Error("useOnlineStatus must be used within an OnlineStatusProvider");
  }
  return ctx;
};

export { OnlineStatusContext };
