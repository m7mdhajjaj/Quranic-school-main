import { toast, Bounce } from 'react-toastify';
import type { ToastOptions } from 'react-toastify';
import { audioManager } from "@/utils/AudioManager";

// ✅ استخدام AudioManager الموحد بدلاً من دالة محلية
const playSound = (soundFile: string) => {
  audioManager.play(soundFile, 0.6); // مستوى الصوت 60%
};

// الإعدادات الافتراضية للـ Toast
const defaultOptions: ToastOptions = {
  position: "top-left", // على اليمين في RTL
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  transition: Bounce,
  rtl: true, // دعم اللغة العربية
  theme: "light", // خلفية بيضاء
};

/**
 * إظهار رسالة نجاح مع صوت
 * @param message - النص المراد إظهاره
 * @param options - خيارات إضافية للـ Toast
 */
export const showSuccessToast = (
  message: string, 
  options?: Partial<ToastOptions>
) => {
  // تشغيل صوت النجاح
  playSound('successful.mp3');
  
  // إظهار Toast - تصميم عصري مع خلفية بيضاء ونص أخضر
  return toast.success(message, {
    ...defaultOptions,
    ...options,
    style: {
      background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
      color: '#047857', // أخضر غامق (emerald-700)
      border: '2px solid #10b981',
      borderRadius: '14px',
      boxShadow: '0 10px 30px rgba(16, 185, 129, 0.2), 0 0 0 1px rgba(16, 185, 129, 0.05)',
      backdropFilter: 'blur(10px)',
      fontWeight: '600',
      fontSize: '15px',
      padding: '18px 20px',
    },
    progressClassName: '!bg-gradient-to-r !from-emerald-400 !to-emerald-600 !h-1',
  });
};

/**
 * إظهار رسالة خطأ مع صوت
 * @param message - النص المراد إظهاره
 * @param options - خيارات إضافية للـ Toast
 */
export const showErrorToast = (
  message: string, 
  options?: Partial<ToastOptions>
) => {
  // تشغيل صوت الخطأ
  playSound('error.wav');
  
  // إظهار Toast - تصميم عصري مع خلفية بيضاء ونص أحمر
  return toast.error(message, {
    ...defaultOptions,
    autoClose: 4000, // وقت أطول للأخطاء
    ...options,
    style: {
      background: 'linear-gradient(135deg, #ffffff 0%, #fef2f2 100%)',
      color: '#b91c1c', // أحمر غامق (red-700)
      border: '2px solid #ef4444',
      borderRadius: '14px',
      boxShadow: '0 10px 30px rgba(239, 68, 68, 0.2), 0 0 0 1px rgba(239, 68, 68, 0.05)',
      backdropFilter: 'blur(10px)',
      fontWeight: '600',
      fontSize: '15px',
      padding: '18px 20px',
    },
    progressClassName: '!bg-gradient-to-r !from-red-400 !to-red-600 !h-1',
  });
};

/**
 * إظهار رسالة معلومات (بدون صوت)
 * @param message - النص المراد إظهاره
 * @param options - خيارات إضافية للـ Toast
 */
export const showInfoToast = (
  message: string, 
  options?: Partial<ToastOptions>
) => {
  // بدون صوت للمعلومات
  
  return toast.info(message, {
    ...defaultOptions,
    ...options,
    style: {
      background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
      color: '#0369a1', // أزرق غامق (sky-700)
      border: '2px solid #0ea5e9',
      borderRadius: '14px',
      boxShadow: '0 10px 30px rgba(14, 165, 233, 0.2), 0 0 0 1px rgba(14, 165, 233, 0.05)',
      backdropFilter: 'blur(10px)',
      fontWeight: '600',
      fontSize: '15px',
      padding: '18px 20px',
    },
    progressClassName: '!bg-gradient-to-r !from-sky-400 !to-sky-600 !h-1',
  });
};

/**
 * إظهار رسالة تحذير (بدون صوت)
 * @param message - النص المراد إظهاره
 * @param options - خيارات إضافية للـ Toast
 */
export const showWarningToast = (
  message: string, 
  options?: Partial<ToastOptions>
) => {
  // بدون صوت للتحذيرات
  
  return toast.warning(message, {
    ...defaultOptions,
    ...options,
    style: {
      background: 'linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)',
      color: '#b45309', // برتقالي غامق (amber-700)
      border: '2px solid #f59e0b',
      borderRadius: '14px',
      boxShadow: '0 10px 30px rgba(245, 158, 11, 0.2), 0 0 0 1px rgba(245, 158, 11, 0.05)',
      backdropFilter: 'blur(10px)',
      fontWeight: '600',
      fontSize: '15px',
      padding: '18px 20px',
    },
    progressClassName: '!bg-gradient-to-r !from-amber-400 !to-amber-600 !h-1',
  });
};

/**
 * إظهار Toast مخصص بدون أيقونة
 * @param message - النص المراد إظهاره
 * @param options - خيارات إضافية للـ Toast
 */
export const showCustomToast = (
  message: string, 
  options?: Partial<ToastOptions>
) => {
  return toast(message, {
    ...defaultOptions,
    ...options,
  });
};

/**
 * إظهار Toast لتحميل/انتظار
 * @param message - النص المراد إظهاره
 * @returns توكن لتحديث أو إغلاق Toast لاحقاً
 */
export const showLoadingToast = (message: string = 'جاري التحميل...') => {
  return toast.loading(message, {
    ...defaultOptions,
    autoClose: false,
    closeButton: false,
  });
};

/**
 * تحديث Toast موجود
 * @param toastId - معرّف Toast
 * @param message - النص الجديد
 * @param type - نوع Toast الجديد
 */
export const updateToast = (
  toastId: string | number,
  message: string,
  type: 'success' | 'error' | 'info' | 'warning' = 'success'
) => {
  if (type === 'success') {
    playSound('successful.mp3');
  } else if (type === 'error') {
    playSound('error.wav');
  }

  toast.update(toastId, {
    render: message,
    type: type,
    isLoading: false,
    autoClose: 3000,
  });
};

/**
 * إغلاق Toast محدد
 * @param toastId - معرّف Toast
 */
export const dismissToast = (toastId?: string | number) => {
  if (toastId) {
    toast.dismiss(toastId);
  } else {
    toast.dismiss(); // إغلاق جميع Toast
  }
};

/**
 * Toast مع وعد (Promise) - مفيد للعمليات غير المتزامنة
 * @param promise - الوعد المراد متابعته
 * @param messages - رسائل مخصصة لكل حالة
 */
export const showPromiseToast = <T,>(
  promise: Promise<T>,
  messages: {
    pending?: string;
    success?: string;
    error?: string;
  } = {}
) => {
  return toast.promise(
    promise,
    {
      pending: {
        render: messages.pending || 'جاري المعالجة...',
        ...defaultOptions,
      },
      success: {
        render: messages.success || 'تم بنجاح ✓',
        ...defaultOptions,
        onOpen: () => playSound('successful.mp3'),
      },
      error: {
        render: messages.error || 'حدث خطأ ✗',
        ...defaultOptions,
        autoClose: 4000,
        onOpen: () => playSound('error.wav'),
      },
    }
  );
};
