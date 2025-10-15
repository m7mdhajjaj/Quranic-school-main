import React, { createContext, useState, useEffect, useRef, type ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL, API_URL } from '../config';
import { verifyToken } from '../Api/authApi';

// تعريف أنواع البيانات
export interface User {
  _id: string;
  firstName?: string;
  lastName?: string;
  fatherName?: string;
  name?: string;
  role: 'student' | 'teacher' | 'admin';
  email?: string;
  studentId?: string;
  teacherId?: string;
  adminId?: string;
  group?: string;
  imageUrl?: string;
  avatar?: {
    url?: string;
    publicId?: string;
  };
  isActive?: boolean;
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
  const socketRef = useRef<Socket | null>(null);

  // Initialize socket connection
  useEffect(() => {
    socketRef.current = io(API_BASE_URL, {
      autoConnect: false,
      // Start with polling, allow upgrade to websocket
      transports: ['polling', 'websocket'],
      upgrade: true,
      path: '/socket.io',
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      forceNew: true, // Force new connection each time
    });

    return () => {
      if (socketRef.current) {
        // Remove all event listeners
        socketRef.current.off('connect');
        socketRef.current.off('connect_error');
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Handle tab close/page unload
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (user && socketRef.current) {
        socketRef.current.emit('logout', {
          userId: user._id,
          role: user.role
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user]);

  // تحميل بيانات المستخدم من localStorage عند بدء التطبيق
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedUser = localStorage.getItem('user');
        const savedToken = localStorage.getItem('token');

        if (savedUser && savedToken) {
          const parsedUser = JSON.parse(savedUser);
          
          // استخدم البيانات المحفوظة فوراً لتجنب إعادة التوجيه
          setUser(parsedUser);
          setToken(savedToken);
          
          // تحقق من صحة التوكن باستخدام authApi
          try {
            const response = await verifyToken();
            
            if (response && response.success) {
              // Connect socket and emit login with delay
              if (socketRef.current) {
                socketRef.current.connect();
                
                // تأخير قصير لضمان استقرار الاتصال
                setTimeout(() => {
                  if (socketRef.current?.connected) {
                    socketRef.current.emit('login', {
                      userId: parsedUser._id,
                      role: parsedUser.role,
                      firstName: parsedUser.firstName || parsedUser.name
                    });
                  }
                }, 500);
              }
              
              // console.log('✅ تم تأكيد صحة بيانات المستخدم:', parsedUser.firstName || parsedUser.name);
            } else {
              console.warn('⚠️ فشل في التحقق من التوكن');
            }
          } catch (verifyError) {
            console.warn('⚠️  فشل في التحقق من التوكن:', verifyError);
            
            // استخدم البيانات المحفوظة مؤقتاً حتى لو فشل التحقق
            // هذا يمنع إعادة التوجيه المستمر إذا كان الخادم غير متاح
            // console.log('🔄 سيتم استخدام البيانات المحفوظة مؤقتاً');
            setUser(parsedUser);
            setToken(savedToken);
            
            // إذا كان التوكن غير صالح فعلياً، ستظهر الأخطاء في الـ API calls وسيتم التعامل معها
          }
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

  // مراقبة انتهاء صلاحية الجلسة
  useEffect(() => {
    const checkTokenExpiry = async () => {
      if (!token || !user) return;

      try {
        // محاولة التحقق من صلاحية التوكن
        const response = await verifyToken();
        if (!response || !response.success) {
          console.log('⏰ انتهت صلاحية الجلسة - تسجيل خروج تلقائي');
          // تنظيف البيانات
          setUser(null);
          setToken(null);
          localStorage.clear();
          sessionStorage.clear();
          window.location.href = '/login';
        }
      } catch {
        // في حالة فشل التحقق (التوكن منتهي أو غير صالح)
        console.log('⏰ انتهت صلاحية الجلسة - تسجيل خروج تلقائي');
        // تنظيف البيانات
        setUser(null);
        setToken(null);
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login';
      }
    };

    // التحقق كل 5 دقائق
    const intervalId = setInterval(checkTokenExpiry, 5 * 60 * 1000);

    // تنظيف عند unmount
    return () => clearInterval(intervalId);
  }, [token, user]);

  // وظيفة تسجيل الدخول
  const login = (userData: User, authToken: string) => {
    try {
      // حفظ البيانات في الحالة المحلية مع تعيين isActive=true
      const userWithActiveStatus = { ...userData, isActive: true };
      setUser(userWithActiveStatus);
      setToken(authToken);

      // Token will be handled automatically by api interceptor

      // حفظ البيانات في localStorage
      localStorage.setItem('user', JSON.stringify(userWithActiveStatus));
      localStorage.setItem('token', authToken);
      localStorage.setItem('userId', userData._id);
      localStorage.setItem('loginTime', Date.now().toString());

      // Connect socket and emit login
      if (socketRef.current && !socketRef.current.connected) {
        socketRef.current.connect();
        
        // Wait for connection before emitting login
        socketRef.current.on('connect', () => {
          // console.log('🔌 Socket متصل');
          socketRef.current?.emit('login', {
            userId: userData._id,
            role: userData.role,
            firstName: userData.firstName || userData.name
          });
        });

        // Handle connection errors
        socketRef.current.on('connect_error', (error) => {
          console.warn('⚠️ خطأ في اتصال Socket:', error.message);
        });
      } else if (socketRef.current && socketRef.current.connected) {
        // Already connected, just emit login
        socketRef.current.emit('login', {
          userId: userData._id,
          role: userData.role,
          firstName: userData.firstName || userData.name
        });
      }

      // console.log('✅ تم تسجيل الدخول بنجاح:', userData.firstName || userData.name);
    } catch (error) {
      console.error('❌ خطأ في تسجيل الدخول:', error);
    }
  };

  // وظيفة تسجيل الخروج
  const logout = async () => {
    try {
      // إرسال طلب logout للـ Backend لتحديث lastSeen
      if (token && user) {
        try {
          const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          };
          
          await fetch(`${API_URL}/auth/logout`, { 
            method: 'POST',
            headers 
          });
        } catch {
          // تجاهل أخطاء API - المهم هو تنظيف البيانات المحلية
        }
      }

      // قطع اتصال Socket
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.disconnect();
        // console.log('🔌 تم قطع اتصال Socket');
      }

      // مسح البيانات من الحالة المحلية
      setUser(null);
      setToken(null);

      // تنظيف شامل لكل البيانات
      localStorage.clear(); // مسح كل localStorage
      sessionStorage.clear(); // مسح كل sessionStorage
      
      // تنظيف الكوكيز
      document.cookie.split(';').forEach(cookie => {
        const name = cookie.split('=')[0].trim();
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      });

      // console.log('✨ تم تنظيف جميع بيانات الجلسة');

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
      // console.log('🔄 تم تحديث بيانات المستخدم');
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
    socket: socketRef.current,
    
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