import Swal from 'sweetalert2';
import { showCenteredSwal } from './sweetalertUtils';

interface LogoutConfirmationOptions {
  userType?: 'admin' | 'user';
  userName?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showQuickLogout?: boolean; // خيار سريع بدون تأكيد
  customMessage?: string;
}

// دالة تنظيف شاملة عند تسجيل الخروج
export const performLogoutCleanup = () => {
  try {
    // تنظيف localStorage
    localStorage.clear();
    
    // تنظيف sessionStorage
    sessionStorage.clear();
    
    // تنظيف cookies
    document.cookie.split(';').forEach(cookie => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
    
    // تنظيف ذاكرة التخزين المؤقت
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
    
    // تنظيف IndexedDB (إذا كان مستخدم)
    if ('indexedDB' in window) {
      try {
        const databases = ['auth', 'app', 'user-data'];
        databases.forEach(dbName => {
          const deleteReq = indexedDB.deleteDatabase(dbName);
          deleteReq.onerror = () => console.log(`تم حذف ${dbName}`);
        });
      } catch {
        console.log('تنظيف IndexedDB');
      }
    }
    
    console.log('✨ تم تنظيف جميع بيانات الجلسة بنجاح');
  } catch (error) {
    console.error('خطأ في تنظيف بيانات الجلسة:', error);
  }
};

// دالة تنظيف آمنة مع إعادة توجيه
export const performSecureLogout = (redirectPath: string = '/login') => {
  performLogoutCleanup();
  
  // إعادة توجيه فورية
  setTimeout(() => {
    window.location.href = redirectPath;
  }, 100);
  
  // إعادة تحميل الصفحة كخيار احتياطي
  setTimeout(() => {
    window.location.reload();
  }, 2000);
};

// دالة تسجيل خروج سريعة وجميلة باستخدام SweetAlert2 + Tailwind CSS
export const showAdvancedLogoutConfirmation = async (options: LogoutConfirmationOptions = {}) => {
  const { userType = 'user', userName, onConfirm, onCancel, customMessage } = options;
  
  const isAdmin = userType === 'admin';
  const displayName = userName || (isAdmin ? 'المدير' : 'المستخدم');
  
  const result = await showCenteredSwal({
    title: `وداعاً ${displayName} 👋`,
    html: `
      <div class="text-center py-4" dir="rtl">
        <div class="mx-auto w-16 h-16 ${isAdmin 
          ? 'bg-red-100 text-red-600' 
          : 'bg-blue-100 text-blue-600'
        } rounded-full flex items-center justify-center mb-4 shadow-lg">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-800 mb-3">هل تريد تسجيل الخروج؟</h3>
        <p class="text-gray-600 mb-4 text-sm leading-relaxed">${customMessage || 'ستحتاج إلى إعادة تسجيل الدخول للوصول للوحة التحكم مرة أخرى'}</p>
      </div>
    `,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: isAdmin ? '#dc2626' : '#2563eb',
    cancelButtonColor: '#6b7280',
    confirmButtonText: `
      <div class="flex items-center gap-3" dir="rtl">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7"></path>
        </svg>
        <span class="font-bold text-base">نعم، خروج</span>
      </div>
    `,
    cancelButtonText: `
      <div class="flex items-center gap-3" dir="rtl">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
        <span class="font-bold text-base">لا، البقاء</span>
      </div>
    `,
    reverseButtons: true,
    focusCancel: true,
    allowOutsideClick: false,
    customClass: {
      popup: 'font-cairo text-right rounded-2xl shadow-2xl border-t-8 w-96 h-96 flex flex-col justify-center ' + (isAdmin ? 'border-red-500 bg-gradient-to-br from-red-50 to-pink-50' : 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50'),
      title: 'text-right text-xl font-bold mb-4',
      htmlContainer: 'text-right px-2',
      confirmButton: `${isAdmin 
        ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:ring-red-500 border-red-600' 
        : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:ring-blue-500 border-blue-600'
      } text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-60 border-2`,
      cancelButton: 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-gray-400 focus:ring-opacity-60 border-3 border-gray-400 hover:border-gray-500 hover:bg-gray-300',
    },
    buttonsStyling: false,
    width: '400px',
    heightAuto: false,
    padding: '1.5rem',
    backdrop: 'rgba(0,0,0,0.7)'
  });

  if (result.isConfirmed) {
    // عرض رسالة التحميل
    Swal.fire({
      title: 'جاري تسجيل الخروج...',
      html: `
        <div class="text-center py-4" dir="rtl">
          <div class="mx-auto w-12 h-12 ${isAdmin 
            ? 'bg-red-100' 
            : 'bg-blue-100'
          } rounded-full flex items-center justify-center mb-3 shadow-md">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 ${isAdmin ? 'border-red-600' : 'border-blue-600'}"></div>
          </div>
          <p class="text-gray-600 text-sm">جاري تأمين الجلسة...</p>
        </div>
      `,
      allowOutsideClick: false,
      showConfirmButton: false,
      customClass: {
        popup: 'font-cairo text-right rounded-2xl shadow-2xl',
        title: 'text-right text-xl font-bold text-gray-800'
      },
      backdrop: 'rgba(0,0,0,0.7)',
      width: '420px'
    });

    // تنفيذ عملية التنظيف أولاً
    performLogoutCleanup();
    
    // ثم تنفيذ تسجيل الخروج
    if (onConfirm) {
      onConfirm();
    }

    // رسالة النجاح
    setTimeout(() => {
      Swal.fire({
        title: 'تم تسجيل الخروج بنجاح! 🎉',
        html: `
          <div class="text-center py-4" dir="rtl">
            <div class="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 class="text-lg font-bold text-gray-800 mb-2">تم تسجيل الخروج بنجاح!</h3>
            <p class="text-gray-600 text-sm mb-3">إلى اللقاء ${displayName}</p>
          </div>
        `,
        icon: 'success',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        allowOutsideClick: false,
        customClass: {
          popup: 'font-cairo text-right rounded-2xl shadow-2xl border-t-8 border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 w-96 h-80 flex flex-col justify-center',
          title: 'text-right text-green-700 font-bold text-lg'
        },
        backdrop: 'rgba(0,0,0,0.7)',
        width: '400px'
      });
    }, 600);

    return true;
  } else {
    if (onCancel) {
      onCancel();
    }
    return false;
  }
};

// النسخة الأصلية - محسّنة

export const showLogoutConfirmation = async (options: LogoutConfirmationOptions = {}) => {
  // استخدام النسخة المحسّنة كافتراضي
  return showAdvancedLogoutConfirmation(options);
};

// النسخة التقليدية للتوافق مع الإصدارات القديمة
export const showBasicLogoutConfirmation = async (options: LogoutConfirmationOptions = {}) => {
  const { userType = 'user', onConfirm, onCancel } = options;
  
  return new Promise<boolean>((resolve) => {
    // Create modal HTML
    const modal = createLogoutModal(userType);
    document.body.appendChild(modal);
    
    // Add event listeners
    const confirmBtn = modal.querySelector('.confirm-logout') as HTMLButtonElement;
    const cancelBtn = modal.querySelector('.cancel-logout') as HTMLButtonElement;
    const overlay = modal.querySelector('.modal-overlay') as HTMLDivElement;
    
    const handleConfirm = async () => {
      // Show loading
      showLoadingState(modal);
      
      // Execute logout
      if (onConfirm) {
        onConfirm();
      }
      
      // Show success and cleanup
      await showSuccessState(modal, userType);
      cleanup();
      resolve(true);
    };
    
    const handleCancel = () => {
      if (onCancel) {
        onCancel();
      }
      cleanup();
      resolve(false);
    };
    
    const cleanup = () => {
      modal.remove();
    };
    
    // Bind events
    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', handleCancel);
    overlay.addEventListener('click', handleCancel);
    
    // Handle escape key
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel();
        document.removeEventListener('keydown', handleKeydown);
      }
    };
    
    document.addEventListener('keydown', handleKeydown);
    
    // Animate in
    requestAnimationFrame(() => {
      modal.classList.add('show');
    });
  });
};

const createLogoutModal = (userType: 'admin' | 'user') => {
  const isAdmin = userType === 'admin';
  
  const modal = document.createElement('div');
  modal.className = 'logout-modal';
  modal.innerHTML = `
    <div class="modal-overlay"></div>
    <div class="modal-content ${isAdmin ? 'admin-modal' : 'user-modal'}">
      <div class="modal-header">
        <div class="modal-icon question-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9,9a3,3,0,1,1,4,2.829,1.5,1.5,0,0,0-1,1.426V14.5"></path>
            <path d="M12,17.5v.5"></path>
          </svg>
        </div>
        <h2 class="modal-title">تسجيل الخروج</h2>
      </div>
      
      <div class="modal-body">
        <p class="modal-text">هل أنت متأكد من رغبتك في تسجيل الخروج؟</p>
      </div>
      
      <div class="modal-footer">
        <button class="btn cancel-logout ${isAdmin ? 'admin-cancel' : 'user-cancel'}">
          إلغاء
        </button>
        <button class="btn confirm-logout ${isAdmin ? 'admin-confirm' : 'user-confirm'}">
          نعم، سجل الخروج
        </button>
      </div>
    </div>
  `;
  
  return modal;
};

const showLoadingState = (modal: HTMLElement) => {
  const content = modal.querySelector('.modal-content') as HTMLElement;
  content.innerHTML = `
    <div class="modal-header">
      <div class="modal-icon loading-icon">
        <div class="loading-spinner"></div>
      </div>
      <h2 class="modal-title">جاري تسجيل الخروج...</h2>
    </div>
    <div class="modal-body">
      <p class="modal-text">الرجاء الانتظار</p>
    </div>
  `;
};

const showSuccessState = (modal: HTMLElement, userType: 'admin' | 'user') => {
  return new Promise<void>((resolve) => {
    const content = modal.querySelector('.modal-content') as HTMLElement;
    const isAdmin = userType === 'admin';
    
    content.innerHTML = `
      <div class="modal-header">
        <div class="modal-icon success-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22,4 12,14.01 9,11.01"></polyline>
          </svg>
        </div>
        <h2 class="modal-title ${isAdmin ? 'text-green-700' : 'text-blue-700'}">تم تسجيل الخروج</h2>
      </div>
      <div class="modal-body">
        <p class="modal-text">تم تسجيل خروجك بنجاح! نراك قريباً.</p>
      </div>
    `;
    
    // Auto close after 1.5 seconds
    setTimeout(() => {
      resolve();
    }, 1500);
  });
};

// دوال مساعدة إضافية
export const quickLogout = (onConfirm?: () => void, userType: 'admin' | 'user' = 'user') => {
  // تنظيف بيانات الجلسة أولاً
  performLogoutCleanup();
  
  if (onConfirm) {
    onConfirm();
  }
  
  const isAdmin = userType === 'admin';
  
  // إظهار رسالة سريعة فقط
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'success',
    title: 'تم تسجيل الخروج بنجاح',
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
    customClass: {
      popup: `font-cairo text-right rounded-xl shadow-2xl border-r-4 ${isAdmin ? 'border-red-500 bg-red-50' : 'border-blue-500 bg-blue-50'}`,
      title: `font-bold ${isAdmin ? 'text-red-700' : 'text-blue-700'}`,
      timerProgressBar: isAdmin ? 'bg-red-500' : 'bg-blue-500'
    },
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });
};

export const showLogoutError = (errorMessage?: string) => {
  
  Swal.fire({
    title: 'خطأ في تسجيل الخروج ⚠️',
    html: `
      <div class="text-center py-4" dir="rtl">
        <div class="mx-auto w-16 h-16 bg-red-100 border-4 border-red-200 rounded-full flex items-center justify-center mb-4 shadow-lg">
          <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
        <p class="text-gray-700 leading-relaxed">${errorMessage || 'حدث خطأ أثناء تسجيل الخروج. يرجى المحاولة مرة أخرى.'}</p>
      </div>
    `,
    icon: 'error',
    confirmButtonText: 'حسناً، سأحاول مرة أخرى',
    customClass: {
      popup: 'font-cairo text-right rounded-2xl shadow-2xl border-t-4 border-red-500',
      title: 'text-right text-red-700 font-bold',
      confirmButton: 'bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-red-300 focus:ring-opacity-50'
    },
    buttonsStyling: false,
    backdrop: 'rgba(0,0,0,0.6)',
    width: '450px'
  });
};

export const createLogoutButton = (
  options: LogoutConfirmationOptions & { 
    buttonText?: string; 
    className?: string;
    size?: 'small' | 'medium' | 'large';
    variant?: 'solid' | 'outline' | 'ghost';
  } = {}
) => {
  const { 
    userType = 'user', 
    buttonText = 'تسجيل الخروج',
    className = '',
    size = 'medium',
    variant = 'solid',
    onConfirm,
    onCancel
  } = options;

  const isAdmin = userType === 'admin';
  
  // أحجام الأزرار
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm gap-1.5',
    medium: 'px-4 py-2.5 text-base gap-2', 
    large: 'px-6 py-3.5 text-lg gap-2.5'
  };

  // أنواع الأزرار
  const variantClasses = {
    solid: isAdmin 
      ? 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-lg hover:shadow-xl border border-red-600 focus:ring-red-500' 
      : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-lg hover:shadow-xl border border-blue-600 focus:ring-blue-500',
    outline: isAdmin
      ? 'border-2 border-red-600 text-red-600 hover:bg-red-50 active:bg-red-100 focus:ring-red-500'
      : 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 active:bg-blue-100 focus:ring-blue-500',
    ghost: isAdmin
      ? 'text-red-600 hover:bg-red-50 active:bg-red-100 focus:ring-red-500'
      : 'text-blue-600 hover:bg-blue-50 active:bg-blue-100 focus:ring-blue-500'
  };

  const button = document.createElement('button');
  button.className = `
    inline-flex items-center justify-center
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    font-semibold rounded-lg
    transition-all duration-200 ease-in-out
    transform hover:-translate-y-0.5 active:translate-y-0
    focus:outline-none focus:ring-4 focus:ring-opacity-50
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    select-none
    ${className}
  `.replace(/\s+/g, ' ').trim();

  // أيقونة تسجيل الخروج
  const iconSize = size === 'small' ? 'w-3.5 h-3.5' : size === 'large' ? 'w-5 h-5' : 'w-4 h-4';
  
  button.innerHTML = `
    <svg class="${iconSize} transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
    </svg>
    <span class="font-medium">${buttonText}</span>
  `;

  // إضافة تأثيرات التفاعل
  button.addEventListener('mouseenter', () => {
    button.style.transform = 'translateY(-2px)';
  });
  
  button.addEventListener('mouseleave', () => {
    button.style.transform = 'translateY(0)';
  });

  button.addEventListener('click', async (e) => {
    e.preventDefault();
    
    // تعطيل الزر مؤقتاً لمنع النقر المتكرر
    button.disabled = true;
    
    try {
      const confirmed = await showLogoutConfirmation({
        userType,
        onConfirm,
        onCancel
      });
      
      if (confirmed) {
        console.log('✅ تم تأكيد تسجيل الخروج');
      } else {
        console.log('❌ تم إلغاء تسجيل الخروج');
      }
    } catch (error) {
      console.error('خطأ في عملية تسجيل الخروج:', error);
      showLogoutError('حدث خطأ غير متوقع أثناء تسجيل الخروج');
    } finally {
      button.disabled = false;
    }
  });

  return button;
};

// دالة مساعدة لإنشاء قائمة منسدلة لتسجيل الخروج
export const createLogoutDropdownItem = (
  options: LogoutConfirmationOptions & { 
    userName?: string;
  } = {}
) => {
  const { userType = 'user', userName, onConfirm, onCancel } = options;
  const isAdmin = userType === 'admin';
  const displayName = userName || (isAdmin ? 'المدير' : 'المستخدم');
  
  const item = document.createElement('button');
  item.className = `
    w-full text-right px-4 py-3 text-sm font-medium
    ${isAdmin ? 'text-red-600 hover:bg-red-50' : 'text-blue-600 hover:bg-blue-50'}
    transition-colors duration-200 rounded-lg
    flex items-center gap-3
    focus:outline-none focus:ring-2 ${isAdmin ? 'focus:ring-red-500' : 'focus:ring-blue-500'} focus:ring-opacity-50
  `.replace(/\s+/g, ' ').trim();
  
  item.innerHTML = `
    <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
    </svg>
    <span class="flex-1">تسجيل الخروج</span>
  `;
  
  item.addEventListener('click', async () => {
    await showLogoutConfirmation({
      userType,
      userName: displayName,
      onConfirm,
      onCancel
    });
  });
  
  return item;
};