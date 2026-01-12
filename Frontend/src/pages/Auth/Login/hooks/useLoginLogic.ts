import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from "@/hooks/useAuth";
import { loginStudent, loginTeacher, loginAdmin } from "@/Api/authApi";
import { useLogo } from "@/components/Hooks/useLogo";
import type { User } from "@/Context/AuthContext";
import type { LoginFormData } from '../../types';

export const useLoginLogic = () => {
  const navigate = useNavigate();
  const { login: authLogin, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState<LoginFormData>({
    userId: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const { logoUrl, logoLoading } = useLogo();
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Prevent concurrent login attempts
  const isSubmittingRef = useRef(false);

  // Navigation and saved credentials
  useEffect(() => {
    const initializeAuth = async () => {
      // ✅ لا تقم بالـ navigate هنا - دع AppContent يتعامل مع ذلك
      // هذا يمنع إعادة التوجيه التلقائي للـ Home بعد refresh
      
      const savedCredentials = localStorage.getItem('savedCredentials');
      if (savedCredentials) {
        try {
          const credentials = JSON.parse(savedCredentials);
          setFormData({
            userId: credentials.userId || '',
            password: credentials.password || '',
          });
          setRememberMe(true);
        } catch {
          localStorage.removeItem('savedCredentials');
        }
      }

      // Mark initialization as complete after a short delay
      setTimeout(() => {
        setIsInitialized(true);
      }, 100);
    };

    initializeAuth();

    // ✅ لا تقم بالـ navigate إذا كان المستخدم مسجل - دع AppContent يتعامل معه
    // if (isAuthenticated) {
    //   const userRole = JSON.parse(localStorage.getItem('user') || '{}').role;
    //   const targetPage = userRole === 'admin' ? '/admin/dashboard' : '/';
    //   navigate(targetPage, { replace: true });
    //   return;
    // }

    const preventBack = () => {
      window.history.pushState(null, '', window.location.href);
    };

    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', preventBack);

    return () => {
      window.removeEventListener('popstate', preventBack);
    };
  }, [navigate, isAuthenticated]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError('');
  };

  const handleRememberMeChange = (checked: boolean) => {
    setRememberMe(checked);

    if (!checked) {
      localStorage.removeItem('savedCredentials');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent submission if not initialized yet
    if (!isInitialized) {
      console.log('⏳ Waiting for initialization...');
      return;
    }
    
    // Prevent multiple submissions using ref
    if (isSubmittingRef.current) {
      console.log('⚠️ Login already in progress, ignoring duplicate submission');
      return;
    }
    
    // Prevent multiple submissions using state
    if (isLoading) {
      console.log('⚠️ Login state already true, ignoring duplicate submission');
      return;
    }
    
    // Mark as submitting
    isSubmittingRef.current = true;
    setError('');
    setIsLoading(true);

    try {
      let response;
      const loginErrors: string[] = [];
      
      if (import.meta.env.DEV) {
        console.log('🔐 Attempting multi-role login for userId:', formData.userId);
      }

      // Try student login first
      try {
        response = await loginStudent({
          studentId: formData.userId,
          idNumber: formData.password,
          rememberMe: rememberMe,
        });
        if (import.meta.env.DEV) {
          console.log('✅ Student login successful');
        }
      } catch (studentError) {
        const studentMsg = axios.isAxiosError(studentError)
          ? studentError.response?.data?.message
          : 'خطأ في تسجيل دخول الطالب';
        loginErrors.push(`طالب: ${studentMsg}`);

        // Try teacher login
        try {
          response = await loginTeacher({
            teacherId: formData.userId,
            password: formData.password,
            userType: 'teacher',
            rememberMe: rememberMe,
          });
          if (import.meta.env.DEV) {
            console.log('✅ Teacher login successful');
          }
        } catch (teacherError) {
          const teacherMsg = axios.isAxiosError(teacherError)
            ? teacherError.response?.data?.message
            : 'خطأ في تسجيل دخول المعلم';
          loginErrors.push(`معلم: ${teacherMsg}`);

          // Try admin login
          try {
            response = await loginAdmin({
              adminId: formData.userId,
              password: formData.password,
              userType: 'admin',
              rememberMe: rememberMe,
            });
            if (import.meta.env.DEV) {
              console.log('✅ Admin login successful');
            }
          } catch (adminError) {
            const adminMsg = axios.isAxiosError(adminError)
              ? adminError.response?.data?.message
              : 'خطأ في تسجيل دخول الإداري';
            loginErrors.push(`إداري: ${adminMsg}`);

            throw new Error(
              `فشل تسجيل الدخول. البيانات غير صحيحة أو المستخدم غير موجود.\n\n` +
                `محاولات تسجيل الدخول:\n${loginErrors.join('\n')}`
            );
          }
        }
      }

      if (response && response.user && response.token) {
        authLogin(response.user as unknown as User, response.token);
        setFailedAttempts(0);

        if (rememberMe) {
          localStorage.setItem(
            'savedCredentials',
            JSON.stringify({
              userId: formData.userId,
              password: formData.password,
            })
          );
        } else {
          localStorage.removeItem('savedCredentials');
        }

        const userRole = response.user.role;
        
        // ✅ التحقق من وجود صفحة محفوظة للعودة إليها
        const lastVisitedPage = sessionStorage.getItem('lastVisitedPage');
        
        // تحديد الصفحة المستهدفة
        let targetPage = '/';
        
        if (lastVisitedPage && lastVisitedPage !== '/login') {
          // العودة للصفحة السابقة إذا كانت موجودة
          targetPage = lastVisitedPage;
          sessionStorage.removeItem('lastVisitedPage'); // تنظيف
        } else if (userRole === 'admin') {
          // Admin dashboard كافتراضي للـ Admin
          targetPage = '/admin/dashboard';
        }
        
        setTimeout(() => {
          navigate(targetPage, { replace: true });
        }, 100);
      } else {
        setError('رد غير صحيح من الخادم. رجاءً تأكد من بيانات الدخول.');
      }
    } catch (error: unknown) {
      const newFailedAttempts = failedAttempts + 1;
      setFailedAttempts(newFailedAttempts);

      if (newFailedAttempts >= 3) {
        setShowForgotPasswordModal(true);
      }

      if (error instanceof Error) {
        const errorMsg = error.message;
        if (errorMsg.includes('محاولات تسجيل الدخول')) {
          setError('البيانات المدخلة غير صحيحة. تأكد من رقم المستخدم وكلمة المرور.');
        } else {
          setError(errorMsg);
        }
      } else if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        setError(message || 'فشل تسجيل الدخول. رجاءً تأكد من بيانات الدخول.');
      } else {
        setError('فشل تسجيل الدخول. رجاءً تأكد من بيانات الدخول.');
      }
    } finally {
      // Reset submitting flag
      isSubmittingRef.current = false;
      setIsLoading(false);
    }
  };

  return {
    formData,
    error,
    isLoading,
    rememberMe,
    showForgotPasswordModal,
    logoUrl,
    logoLoading,
    isInitialized,
    handleChange,
    handleRememberMeChange,
    handleSubmit,
    setShowForgotPasswordModal,
  };
};
