import React, { createContext, useState, useEffect, type ReactNode } from 'react';

// تعريف أنواع البيانات
export interface User {
  _id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  role: 'student' | 'teacher' | 'admin';
  email?: string;
  studentId?: string;
  teacherId?: string;
  adminId?: string;
  imageUrl?: string;
  // يمكن إضافة المزيد من الخصائص حسب الحاجة
}

export interface AuthContextType {
  // حالة المستخدم
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // وظائف إدارة المصادقة
  login: (userData: User, authToken: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  
  // وظائف مساعدة
  isStudent: () => boolean;
  isTeacher: () => boolean;
  isAdmin: () => boolean;
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

  // تحميل بيانات المستخدم من localStorage عند بدء التطبيق
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const savedUser = localStorage.getItem('user');
        const savedToken = localStorage.getItem('token');

        if (savedUser && savedToken) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          setToken(savedToken);
          console.log('🔄 تم استرداد بيانات المستخدم من التخزين المحلي:', parsedUser.firstName || parsedUser.name);
        }
      } catch (error) {
        console.error('❌ خطأ في تحميل بيانات المستخدم:', error);
        // تنظيف البيانات التالفة
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // وظيفة تسجيل الدخول
  const login = (userData: User, authToken: string) => {
    try {
      // حفظ البيانات في الحالة المحلية
      setUser(userData);
      setToken(authToken);

      // حفظ البيانات في localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', authToken);
      localStorage.setItem('userId', userData._id);

      console.log('✅ تم تسجيل الدخول بنجاح:', userData.firstName || userData.name);
    } catch (error) {
      console.error('❌ خطأ في تسجيل الدخول:', error);
    }
  };

  // وظيفة تسجيل الخروج
  const logout = () => {
    try {
      // مسح البيانات من الحالة المحلية
      setUser(null);
      setToken(null);

      // مسح البيانات من localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('savedCredentials');

      console.log('🚪 تم تسجيل الخروج بنجاح');

      // إعادة توجه إلى صفحة تسجيل الدخول
      window.location.href = '/login';
    } catch (error) {
      console.error('❌ خطأ في تسجيل الخروج:', error);
    }
  };

  // وظيفة تحديث بيانات المستخدم
  const updateUser = (userData: Partial<User>) => {
    if (!user) return;

    try {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      console.log('🔄 تم تحديث بيانات المستخدم');
    } catch (error) {
      console.error('❌ خطأ في تحديث بيانات المستخدم:', error);
    }
  };

  // وظائف التحقق من النوع
  const isStudent = (): boolean => user?.role === 'student';
  const isTeacher = (): boolean => user?.role === 'teacher';
  const isAdmin = (): boolean => user?.role === 'admin';

  // وظيفة الحصول على اسم المستخدم
  const getUserName = (): string => {
    if (!user) return '';
    return user.firstName || user.name || 'مستخدم غير معروف';
  };

  // وظيفة الحصول على معرف المستخدم
  const getUserId = (): string => {
    return user?._id || '';
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
    
    // الوظائف
    login,
    logout,
    updateUser,
    
    // المساعدات
    isStudent,
    isTeacher,
    isAdmin,
    getUserName,
    getUserId,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;