import React, {
  createContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Socket } from "socket.io-client";
import { API_URL } from "../config/config";
import { verifyToken } from "../Api/authApi";
import { socketManager } from "../Socket";

// تعريف صلاحيات السكرتير
export type AccessLevel = "none" | "view" | "manage";

export interface SecretaryPermissions {
  groupsAccess?: AccessLevel;
  teachersAccess?: AccessLevel;
  studentsAccess?: AccessLevel;
}

// تعريف أنواع البيانات
export interface User {
  _id: string;
  firstName?: string;
  lastName?: string;
  fatherName?: string;
  name?: string;
  role: "student" | "teacher" | "admin" | "secretary" | "teacherAssistant";
  email?: string;
  studentId?: string;
  teacherId?: string;
  adminId?: string;
  secretaryId?: string;
  assistantId?: string;
  group?: string;
  imageUrl?: string;
  avatar?: {
    url?: string;
    publicId?: string;
  };
  isActive?: boolean;
  permissions?: SecretaryPermissions; // صلاحيات السكرتير
  assignedTeacher?: string; // للمساعد - المعلم المرتبط به
  allowedGroups?: string[]; // للمساعد - الحلقات المسموح له
  // يمكن إضافة المزيد من الخصائص حسب الحاجة
}

export interface AuthContextType {
  // حالة المستخدم
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  socket: Socket | null;

  // وظائف إدارة المصادقة
  login: (userData: User, authToken: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;

  // وظائف مساعدة
  isStudent: () => boolean;
  isTeacher: () => boolean;
  isAdmin: () => boolean;
  isSecretary: () => boolean;
  isTeacherAssistant: () => boolean;
  getSecretaryPermissions: () => SecretaryPermissions | null;
  getUserName: () => string;
  getUserId: () => string;
}

// إنشاء Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// مكون Provider
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // تحميل بيانات المستخدم من AsyncStorage عند بدء التطبيق
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedUser = await AsyncStorage.getItem("user");
        const savedToken = await AsyncStorage.getItem("token");

        if (savedUser && savedToken) {
          const parsedUser = JSON.parse(savedUser);

          // استخدم البيانات المحفوظة فوراً وأنهي التحميل
          setUser(parsedUser);
          setToken(savedToken);
          setIsLoading(false);

          // تحقق من صحة التوكن في الخلفية (دون انتظار)
          verifyToken()
            .then((response) => {
              if (response && response.success) {
                // Connect socket and emit login with delay
                if (!socketManager.isConnected()) {
                  socketManager.connect(parsedUser._id, parsedUser.role);
                }

                // تأخير قصير لضمان استقرار الاتصال
                setTimeout(() => {
                  if (socketManager.isConnected()) {
                    socketManager.emit("login", {
                      userId: parsedUser._id,
                      role: parsedUser.role,
                      firstName: parsedUser.firstName || parsedUser.name,
                    });
                  }
                }, 500);
              } else {
                // Token غير صالح - تسجيل خروج صامت
                console.log("⚠️ التوكن غير صالح - تسجيل خروج");
                setUser(null);
                setToken(null);
                AsyncStorage.clear();
              }
            })
            .catch((verifyError) => {
              // Token expired or invalid - silent logout
              console.log("⚠️ فشل في التحقق من التوكن - تسجيل خروج");
              setUser(null);
              setToken(null);
              AsyncStorage.clear();
            });
        } else {
          // لا توجد بيانات محفوظة
          setIsLoading(false);
        }
      } catch (error) {
        console.error("❌ خطأ في تحميل بيانات المستخدم:", error);
        // تنظيف البيانات التالفة
        await AsyncStorage.multiRemove(["user", "token", "userId"]);
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // مراقبة انتهاء صلاحية الجلسة
  useEffect(() => {
    const checkTokenExpiry = async () => {
      if (!token || !user) return;

      try {
        const response = await verifyToken();
        if (!response || !response.success) {
          console.log("⏰ انتهت صلاحية الجلسة - تسجيل خروج تلقائي");
          await logout();
        }
      } catch {
        console.log("⏰ انتهت صلاحية الجلسة - تسجيل خروج تلقائي");
        await logout();
      }
    };

    // التحقق كل 5 دقائق
    const intervalId = setInterval(checkTokenExpiry, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [token, user]);

  // وظيفة تسجيل الدخول
  const login = async (userData: User, authToken: string) => {
    try {
      // حفظ البيانات في الحالة المحلية مع تعيين isActive=true
      const userWithActiveStatus = { ...userData, isActive: true };
      setUser(userWithActiveStatus);
      setToken(authToken);

      // حفظ البيانات في AsyncStorage
      await AsyncStorage.setItem("user", JSON.stringify(userWithActiveStatus));
      await AsyncStorage.setItem("token", authToken);
      await AsyncStorage.setItem("userId", userData._id);
      await AsyncStorage.setItem("loginTime", Date.now().toString());

      // Connect socket and emit login
      if (!socketManager.isConnected()) {
        socketManager.connect(userData._id, userData.role);
      }

      // تأخير قصير لضمان الاتصال
      setTimeout(() => {
        if (socketManager.isConnected()) {
          socketManager.emit("login", {
            userId: userData._id,
            role: userData.role,
            firstName: userData.firstName || userData.name,
          });
        }
      }, 300);
    } catch (error) {
      console.error("❌ خطأ في تسجيل الدخول:", error);
    }
  };

  // وظيفة تسجيل الخروج
  const logout = async () => {
    try {
      // إرسال طلب logout للـ Backend لتحديث lastSeen
      if (token && user) {
        try {
          await fetch(`${API_URL}/auth/logout`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
        } catch {
          // تجاهل أخطاء API
        }
      }

      // قطع اتصال Socket
      if (socketManager.isConnected()) {
        if (user) {
          socketManager.emit("logout", {
            userId: user._id,
            role: user.role,
          });
        }
        socketManager.disconnect();
      }

      // مسح البيانات من الحالة المحلية
      setUser(null);
      setToken(null);

      // تنظيف AsyncStorage
      await AsyncStorage.clear();

      console.log("✨ تم تنظيف جميع بيانات الجلسة");
    } catch (error) {
      console.error("❌ خطأ في تسجيل الخروج:", error);
    }
  };

  // وظيفة تحديث بيانات المستخدم
  const updateUser = async (userData: Partial<User>) => {
    if (!user) return;

    try {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (error) {
      console.error("❌ خطأ في تحديث بيانات المستخدم:", error);
    }
  };

  // وظائف التحقق من النوع
  const isStudent = (): boolean => user?.role === "student";
  const isTeacher = (): boolean => user?.role === "teacher";
  const isAdmin = (): boolean => user?.role === "admin";
  const isSecretary = (): boolean => user?.role === "secretary";
  const isTeacherAssistant = (): boolean => user?.role === "teacherAssistant";

  // الحصول على صلاحيات السكرتير
  const getSecretaryPermissions = (): SecretaryPermissions | null => {
    if (user?.role !== "secretary") return null;
    return (
      user.permissions || {
        groupsAccess: "none",
        teachersAccess: "none",
        studentsAccess: "none",
      }
    );
  };

  // وظيفة الحصول على اسم المستخدم
  const getUserName = (): string => {
    if (!user) return "";
    return user.firstName || user.name || "مستخدم غير معروف";
  };

  // وظيفة الحصول على معرف المستخدم
  const getUserId = (): string => {
    return user?._id || "";
  };

  // حساب حالة المصادقة
  const isAuthenticated = !!(user && token);

  // قيم السياق
  const contextValue: AuthContextType = {
    // الحالة
    user,
    token,
    isAuthenticated,
    isLoading,
    socket: socketManager.getSocket(),

    // الوظائف
    login,
    logout,
    updateUser,

    // المساعدات
    isStudent,
    isTeacher,
    isAdmin,
    isSecretary,
    isTeacherAssistant,
    getSecretaryPermissions,
    getUserName,
    getUserId,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Hook لاستخدام AuthContext
export const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
