import Swal from 'sweetalert2';
import {
  showCenteredSwal,
  showErrorMessage,
} from '../../../utils/sweetalertUtils';
import { soundPlayer } from '../../../components/Hooks/useSounds';

interface LogoutOptions {
  userType?: 'admin' | 'teacher' | 'student' | 'user';
  userName?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  customMessage?: string;
}

// تنظيف بيانات الجلسة
export const cleanupSession = () => {
  try {
    // تنظيف localStorage
    localStorage.clear();

    // تنظيف sessionStorage
    sessionStorage.clear();

    // تنظيف الكوكيز
    document.cookie.split(';').forEach((cookie) => {
      const name = cookie.split('=')[0].trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });

    // تنظيف الكاش (Cache Storage)
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name);
        });
      });
    }

    // تنظيف IndexedDB (اختياري)
    if ('indexedDB' in window) {
      try {
        indexedDB.databases?.().then((databases) => {
          databases.forEach((db) => {
            if (db.name) {
              indexedDB.deleteDatabase(db.name);
            }
          });
        });
      } catch (err) {
        console.warn('IndexedDB cleanup skipped:', err);
      }
    }

    console.log('✨ تم تنظيف بيانات الجلسة والكاش');
  } catch (error) {
    console.error('خطأ في التنظيف:', error);
  }
};

// تسجيل خروج آمن مع إعادة توجيه
export const secureLogout = (redirectPath = '/login') => {
  cleanupSession();
  setTimeout(() => (window.location.href = redirectPath), 100);
};

// نافذة تأكيد تسجيل الخروج المحسّنة باستخدام المكونات القابلة لإعادة الاستخدام
export const showLogoutConfirmation = async (options: LogoutOptions = {}) => {
  const { onConfirm, onCancel, customMessage } = options;

  // تشغيل صوت تحذيري

  const result = await showCenteredSwal({
    title: '',
    html: `
      <div class="relative text-center py-4" dir="rtl">
        <!-- Lock Icon -->
        <div class="relative mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 text-white shadow-xl bg-gradient-to-br from-red-500 to-red-700 animate-pulse">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
        </div>
        
        <!-- Message -->
        <h3 class="text-xl font-bold text-gray-800 mb-2">هل تريد تسجيل الخروج؟</h3>
        <p class="text-gray-600 text-sm">
          ${customMessage || 'سيتم إنهاء جلستك الحالية'}
        </p>
      </div>
    `,
    icon: undefined,
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#64748b',
    confirmButtonText: `
      <div class="flex items-center justify-center gap-2 px-3" dir="rtl">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7"></path>
        </svg>
        <span class="font-bold text-base">تسجيل الخروج</span>
      </div>
    `,
    cancelButtonText: `
      <div class="flex items-center justify-center gap-2 px-3" dir="rtl">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
        <span class="font-bold text-base">البقاء</span>
      </div>
    `,
    reverseButtons: true,
    allowOutsideClick: false,
    customClass: {
      popup: `!rounded-2xl !shadow-xl !border-0 !bg-gradient-to-br from-red-50 to-white !max-w-[420px] !w-full`,
      actions: `!flex !flex-row !gap-3 !w-full !justify-center !mt-4 !px-4`,
      confirmButton: `!bg-gradient-to-r !from-red-500 !to-red-600 hover:!from-red-600 hover:!to-red-700 !text-white !font-bold !py-3 !px-6 !rounded-xl !shadow-lg hover:!shadow-xl !transition-all !duration-300 !transform hover:!scale-105 !text-base !min-w-[140px]`,
      cancelButton: `!bg-gradient-to-r !from-gray-500 !to-gray-600 hover:!from-gray-600 hover:!to-gray-700 !text-white !font-bold !py-3 !px-6 !rounded-xl !shadow-lg hover:!shadow-xl !transition-all !duration-300 !transform hover:!scale-105 !text-base !min-w-[140px]`,
    },
    buttonsStyling: false,
    width: '420px',
  });

  if (result.isConfirmed) {
    // عرض رسالة التحميل
    Swal.fire({
      title: 'جاري تسجيل الخروج',
      html: `
        <div class="text-center py-6" dir="rtl">
          <div class="relative mx-auto w-16 h-16 mb-4">
            <div class="absolute inset-0 rounded-full border-4 border-red-200"></div>
            <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-red-600 animate-spin"></div>
            <div class="absolute inset-2 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center">
              <svg class="w-7 h-7 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
            </div>
          </div>
          <p class="text-gray-700 text-sm font-semibold">تأمين الجلسة وتنظيف البيانات...</p>
        </div>
      `,
      allowOutsideClick: false,
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
      customClass: {
        popup:
          '!rounded-2xl !shadow-xl !max-w-[350px] !bg-gradient-to-br !from-red-50 !to-white',
        timerProgressBar: '!bg-gradient-to-r !from-red-500 !to-red-600',
      },
    });

    if (onConfirm) {
       // إذا تم توفير دالة تنظيف مخصصة (مثل auth.logout)، نترك لها المهمة
       // هذا يمنع التعارض ويسمح بإرسال طلبات API قبل مسح التوكن
       onConfirm();
    } else {
       // التنظيف الافتراضي في حالة عدم وجود معالج مخصص
       cleanupSession();
       await new Promise((resolve) => setTimeout(resolve, 500));
    }

    return true;
  } else {
    if (onCancel) onCancel();
    return false;
  }
};

// تسجيل خروج سريع مع toast notification
export const quickLogout = async (onConfirm?: () => void) => {
  cleanupSession();
  if (onConfirm) onConfirm();

  // تشغيل صوت الخروج والحصول على مدته
  const soundDuration = await soundPlayer.playLogout();

  // عرض رسالة Toast مع المدة المتزامنة مع الصوت
  Swal.fire({
    title: 'تم تسجيل الخروج بنجاح',
    text: 'سيتم إعادة توجيهك إلى صفحة تسجيل الدخول',
    icon: 'success',
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: soundDuration, // استخدام مدة الصوت
    timerProgressBar: true,
    customClass: {
      popup: '!rounded-xl !shadow-2xl',
      title: '!text-base !font-bold',
      timerProgressBar: '!bg-green-500',
    },
  });
};

// رسالة خطأ في تسجيل الخروج
export const showLogoutError = (errorMessage?: string) => {
  soundPlayer.playError();
  showErrorMessage(
    'خطأ في تسجيل الخروج',
    errorMessage || 'حدث خطأ أثناء تسجيل الخروج. يرجى المحاولة مرة أخرى.'
  );
};

// دالة للحصول على ثيم الألوان حسب نوع المستخدم
export const getLogoutTheme = (userType: 'admin' | 'user' = 'user') => {
  const isAdmin = userType === 'admin';
  return {
    primary: isAdmin ? 'red' : 'blue',
    secondary: isAdmin ? 'pink' : 'indigo',
    gradient: `from-${isAdmin ? 'red' : 'blue'}-500 to-${isAdmin ? 'red' : 'blue'}-700`,
  };
};

// دالة مساعدة للتعامل مع عمليات تسجيل الخروج
export const handleLogout = async (options: LogoutOptions = {}) => {
  const confirmed = await showLogoutConfirmation(options);
  if (confirmed) {
    secureLogout();
  }
  return confirmed;
};
