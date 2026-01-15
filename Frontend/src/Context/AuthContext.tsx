import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import { Socket } from 'socket.io-client';
import { API_URL } from '../config/config';
import { verifyToken } from '../Api/authApi';
import { socketManager } from '../Socket/SocketManager';

// تعريف أنواع البيانات
export interface User {
  _id: string;
  firstName?: string;
  lastName?: string;
  fatherName?: string;
  name?: string;
  role: 'student' | 'teacher' | 'admin' | 'secretary';
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

  // Handle tab close/page unload
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (user && socketManager.isConnected()) {
        socketManager.emit('logout', {
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
          
          // ✅ استخدم البيانات المحفوظة فوراً وأنهي التحميل
          setUser(parsedUser);
          setToken(savedToken);
          setIsLoading(false); // ✅ أنهي التحميل فوراً
          
          // تحقق من صحة التوكن في الخلفية (دون انتظار)
          verifyToken().then((response) => { // Removed await to prevent blocking logic if it was async inside
              if (response && response.success) {
                // Connect socket and emit login
                if (!socketManager.isConnected()) {
                  socketManager.connect(parsedUser._id, parsedUser.role);
                }
                
                // ✅ استخدام onConnectionChange بدلاً من setTimeout  
                const unsub = socketManager.onConnectionChange((connected) => {
                  if (connected) {
                    // console.log('📡 [AuthContext] Socket connected on init, emitting login event'); 
                    socketManager.emit('login', {
                      userId: parsedUser._id,
                      role: parsedUser.role,
                      firstName: parsedUser.firstName || parsedUser.name
                    });
                    unsub();
                  }
                });
                
                // Fallback: إذا متصل بالفعل
                if (socketManager.isConnected()) {
                  // console.log('📡 [AuthContext] Socket already connected on init');
                  socketManager.emit('login', {
                    userId: parsedUser._id,
                    role: parsedUser.role,
                    firstName: parsedUser.firstName || parsedUser.name
                  });
                  unsub();
                }
              } else {
                // Token غير صالح - تسجيل خروج
                console.warn('⚠️ التوكن غير صالح - تسجيل خروج');
                setUser(null);
                setToken(null);
                localStorage.clear();
              }
            })
            .catch((verifyError) => {
              console.warn('⚠️ فشل في التحقق من التوكن:', verifyError);
              // إذا كان خطأ في الشبكة، احتفظ بالبيانات
              // إذا كان التوكن غير صالح، ستظهر الأخطاء في API calls
            });
        } else {
          // لا توجد بيانات محفوظة
          setIsLoading(false);
        }
      } catch (error) {
        console.error('❌ خطأ في تحميل بيانات المستخدم:', error);
        // تنظيف البيانات التالفة
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
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
      // حفظ البيانات في الحالة المحلية
      // ⚠️ Note: isActive is now managed by UserStatusContext (Presence System)
      setUser(userData);
      setToken(authToken);

      // Token will be handled automatically by api interceptor

      // حفظ البيانات في localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', authToken);
      localStorage.setItem('userId', userData._id);
      localStorage.setItem('loginTime', Date.now().toString());

      // Connect socket and emit login
      if (!socketManager.isConnected()) {
        socketManager.connect(userData._id, userData.role);
      }
      
      // ✅ استخدام onConnectionChange بدلاً من setTimeout
      const unsubscribe = socketManager.onConnectionChange((connected) => {
        if (connected) {
          console.log('📡 [AuthContext] Socket connected, emitting login event');
          socketManager.emit('login', {
            userId: userData._id,
            role: userData.role,
            firstName: userData.firstName || userData.name
          });
          unsubscribe(); // إلغاء الاشتراك بعد الإرسال
        }
      });
      
      // Fallback: إذا Socket متصل بالفعل، أرسل فوراً
      if (socketManager.isConnected()) {
        console.log('📡 [AuthContext] Socket already connected, emitting login immediately');
        socketManager.emit('login', {
          userId: userData._id,
          role: userData.role,
          firstName: userData.firstName || userData.name
        });
        unsubscribe();
      }

      // console.log('✅ تم تسجيل الدخول بنجاح:', userData.firstName || userData.name);
    } catch (error) {
      console.error('❌ خطأ في تسجيل الدخول:', error);
    }
  };

  // وظيفة تسجيل الخروج
  const logout = async () => {
    try {
      // 🔒 منع إعادة عرض الشاشة أثناء الخروج - إضافة overlay
      const overlay = document.createElement('div');
      overlay.id = 'logout-overlay';
      overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: opacity 0.3s ease;
      `;
      overlay.innerHTML = `
        <div style="text-align: center; direction: rtl;">
          <div style="
            width: 60px;
            height: 60px;
            margin: 0 auto 16px;
            border: 4px solid #e5e7eb;
            border-top-color: #22c55e;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          "></div>
          <p style="color: #166534; font-size: 18px; font-weight: 600;">جاري تسجيل الخروج...</p>
          <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
        </div>
      `;
      document.body.appendChild(overlay);

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
      if (socketManager.isConnected()) {
        socketManager.disconnect();
      }

      // تنظيف شامل لكل البيانات
      localStorage.clear();
      sessionStorage.clear();
      
      // تنظيف الكوكيز
      document.cookie.split(';').forEach(cookie => {
        const name = cookie.split('=')[0].trim();
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      });

      // انتظار قصير ثم إعادة التوجيه
      await new Promise(resolve => setTimeout(resolve, 500));

      // إعادة توجه إلى صفحة تسجيل الدخول
      window.location.href = '/login';
    } catch (error) {
      console.error('❌ خطأ في تسجيل الخروج:', error);
      // حتى في حالة الخطأ، نعيد التوجيه
      window.location.href = '/login';
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
    socket: socketManager.getSocket(),
    
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