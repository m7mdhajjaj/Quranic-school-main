
import Swal from 'sweetalert2';

interface LogoutOptions {
  userType?: 'admin' | 'user';
  userName?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  customMessage?: string;
}

// تنظيف بيانات الجلسة مع انيميشن
export const cleanupSession = () => {
  try {
    localStorage.clear();
    sessionStorage.clear();
    
    // تنظيف الكوكيز
    document.cookie.split(';').forEach(cookie => {
      const name = cookie.split('=')[0].trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
    
    console.log('✨ تم تنظيف بيانات الجلسة');
  } catch (error) {
    console.error('خطأ في التنظيف:', error);
  }
};

// تسجيل خروج آمن مع إعادة توجيه
export const secureLogout = (redirectPath = '/login') => {
  cleanupSession();
  setTimeout(() => window.location.href = redirectPath, 100);
};

// نافذة تأكيد تسجيل الخروج الحديثة مع انيميشن متقدم
export const showLogoutConfirmation = async (options: LogoutOptions = {}) => {
  const { userType = 'user', userName, onConfirm, onCancel, customMessage } = options;
  
  const isAdmin = userType === 'admin';
  const displayName = userName || (isAdmin ? 'المدير' : 'المستخدم');
  
  // إضافة CSS للانيميشن المتقدم
  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap');
    
    .modern-logout-popup {
      background: linear-gradient(135deg, ${isAdmin ? '#fef2f2, #fdf2f8' : '#eff6ff, #f0f9ff'}) !important;
      backdrop-filter: blur(20px) !important;
      border: 1px solid ${isAdmin ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)'} !important;
      box-shadow: 0 25px 50px -12px ${isAdmin ? 'rgba(239, 68, 68, 0.25)' : 'rgba(59, 130, 246, 0.25)'} !important;
    }
    
    .floating-icon {
      animation: floatIcon 3s ease-in-out infinite;
      background: linear-gradient(135deg, ${isAdmin ? '#ef4444, #dc2626' : '#3b82f6, #2563eb'});
      backdrop-filter: blur(10px);
      box-shadow: 0 20px 40px ${isAdmin ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)'};
    }
    
    @keyframes floatIcon {
      0%, 100% { transform: translateY(0) scale(1); }
      50% { transform: translateY(-8px) scale(1.05); }
    }
    
    .pulse-ring {
      animation: pulseRing 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite;
    }
    
    @keyframes pulseRing {
      0% { transform: scale(0.8); opacity: 1; }
      80%, 100% { transform: scale(1.8); opacity: 0; }
    }
    
    .gradient-text {
      background: linear-gradient(135deg, ${isAdmin ? '#dc2626, #ef4444' : '#2563eb, #3b82f6'});
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .modern-btn {
      position: relative;
      overflow: hidden;
      transform: perspective(1px) translateZ(0);
      transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    
    .modern-btn:before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: left 0.5s;
    }
    
    .modern-btn:hover:before {
      left: 100%;
    }
    
    .particle {
      position: absolute;
      width: 4px;
      height: 4px;
      background: ${isAdmin ? '#ef4444' : '#3b82f6'};
      border-radius: 50%;
      animation: particleFloat 4s ease-in-out infinite;
    }
    
    @keyframes particleFloat {
      0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0; }
      10% { opacity: 1; }
      90% { opacity: 1; }
      100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
    }
    
    .glassmorphism {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
  `;
  document.head.appendChild(style);

  // إضافة particles للتأثير البصري
  const createParticles = () => {
    const particles = [];
    for (let i = 0; i < 6; i++) {
      particles.push(`
        <div class="particle" style="
          left: ${Math.random() * 100}%; 
          animation-delay: ${Math.random() * 4}s;
          animation-duration: ${4 + Math.random() * 2}s;
        "></div>
      `);
    }
    return particles.join('');
  };

  const result = await Swal.fire({
    title: '',
    html: `
      <div class="relative text-center py-8" dir="rtl" style="font-family: 'Cairo', sans-serif;">
        ${createParticles()}
        
        <!-- Ring Pulse Effect -->
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="pulse-ring w-32 h-32 rounded-full border-2 border-${isAdmin ? 'red' : 'blue'}-300 opacity-30"></div>
        </div>
        
        <!-- Main Icon -->
        <div class="floating-icon relative mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-8 text-white shadow-2xl">
          <svg class="w-12 h-12 transform transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
        </div>
        
        <!-- Title with Gradient -->
        <h1 class="gradient-text text-3xl font-bold mb-2">مرحباً ${displayName}</h1>
        <div class="text-6xl mb-6">👋</div>
        
        <!-- Message -->
        <h3 class="text-2xl font-semibold text-gray-800 mb-4">هل تريد تسجيل الخروج؟</h3>
        <p class="text-gray-600 text-lg leading-relaxed max-w-md mx-auto">
          ${customMessage || 'سيتم إنهاء جلستك الحالية وستحتاج لإعادة تسجيل الدخول'}
        </p>
        
        <!-- Decorative Elements -->
        <div class="absolute top-4 right-4 w-3 h-3 bg-${isAdmin ? 'red' : 'blue'}-400 rounded-full animate-ping"></div>
        <div class="absolute top-8 left-8 w-2 h-2 bg-${isAdmin ? 'red' : 'blue'}-300 rounded-full animate-pulse"></div>
        <div class="absolute bottom-6 right-12 w-4 h-4 bg-gradient-to-r from-${isAdmin ? 'red' : 'blue'}-400 to-${isAdmin ? 'pink' : 'indigo'}-400 rounded-full animate-bounce"></div>
      </div>
    `,
    icon: undefined,
    showCancelButton: true,
    confirmButtonColor: isAdmin ? '#dc2626' : '#2563eb',
    cancelButtonColor: '#64748b',
    confirmButtonText: `
      <div class="flex items-center gap-3 px-2" dir="rtl">
        <div class="relative">
          <svg class="w-5 h-5 transform transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7"></path>
          </svg>
        </div>
        <span class="font-bold text-lg">تسجيل الخروج</span>
      </div>
    `,
    cancelButtonText: `
      <div class="flex items-center gap-3 px-2" dir="rtl">
        <svg class="w-5 h-5 transform transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
        <span class="font-bold text-lg">البقاء</span>
      </div>
    `,
    reverseButtons: true,
    allowOutsideClick: false,
    showClass: {
      popup: 'animate__animated animate__zoomIn animate__faster'
    },
    hideClass: {
      popup: 'animate__animated animate__zoomOut animate__faster'
    },
    customClass: {
      popup: `modern-logout-popup font-cairo text-right rounded-3xl shadow-2xl border-0 relative overflow-hidden`,
      confirmButton: `modern-btn group bg-gradient-to-r from-${isAdmin ? 'red' : 'blue'}-500 via-${isAdmin ? 'red' : 'blue'}-600 to-${isAdmin ? 'red' : 'blue'}-700 hover:from-${isAdmin ? 'red' : 'blue'}-600 hover:via-${isAdmin ? 'red' : 'blue'}-700 hover:to-${isAdmin ? 'red' : 'blue'}-800 text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 border-0`,
      cancelButton: `modern-btn group glassmorphism hover:bg-white/20 text-gray-700 font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 border border-gray-200 hover:border-gray-300`
    },
    buttonsStyling: false,
    width: '520px',
    heightAuto: false,
    backdrop: 'rgba(0,0,0,0.8)',
    allowEscapeKey: true,
    focusCancel: true
  });

  // تنظيف الـ style المضاف
  document.head.removeChild(style);

  if (result.isConfirmed) {
    // رسالة التحميل الحديثة
    Swal.fire({
      title: '',
      html: `
        <div class="text-center py-12" dir="rtl" style="font-family: 'Cairo', sans-serif;">
          <div class="relative mx-auto w-20 h-20 mb-8">
            <!-- Spinning Ring -->
            <div class="absolute inset-0 rounded-full border-4 border-${isAdmin ? 'red' : 'blue'}-200"></div>
            <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-${isAdmin ? 'red' : 'blue'}-600 animate-spin"></div>
            
            <!-- Inner Icon -->
            <div class="absolute inset-2 bg-gradient-to-br from-${isAdmin ? 'red' : 'blue'}-500 to-${isAdmin ? 'red' : 'blue'}-700 rounded-full flex items-center justify-center shadow-lg">
              <svg class="w-8 h-8 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
          </div>
          
          <h3 class="text-2xl font-bold text-gray-800 mb-3">جاري تسجيل الخروج</h3>
          <p class="text-gray-600 text-lg mb-4">تأمين الجلسة وتنظيف البيانات...</p>
          
          <!-- Progress Bar -->
          <div class="w-64 mx-auto bg-gray-200 rounded-full h-2 overflow-hidden">
            <div class="bg-gradient-to-r from-${isAdmin ? 'red' : 'blue'}-500 to-${isAdmin ? 'red' : 'blue'}-700 h-2 rounded-full animate-pulse" style="width: 100%; animation: progressBar 2s ease-in-out;"></div>
          </div>
        </div>
        
        <style>
          @keyframes progressBar {
            0% { width: 0%; }
            100% { width: 100%; }
          }
        </style>
      `,
      allowOutsideClick: false,
      showConfirmButton: false,
      customClass: {
        popup: 'font-cairo text-right rounded-3xl shadow-2xl glassmorphism border-0'
      },
      width: '450px',
      backdrop: 'rgba(0,0,0,0.9)'
    });

    // تنفيذ التنظيف والخروج
    cleanupSession();
    if (onConfirm) onConfirm();

    // رسالة النجاح المتطورة
    setTimeout(() => {
      Swal.fire({
        title: '',
        html: `
          <div class="text-center py-10" dir="rtl" style="font-family: 'Cairo', sans-serif;">
            <!-- Success Animation -->
            <div class="relative mx-auto w-24 h-24 mb-8">
              <div class="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full shadow-2xl animate-bounce"></div>
              <div class="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-30"></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <svg class="w-12 h-12 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            </div>
            
            <div class="text-6xl mb-4 animate-bounce">🎉</div>
            <h3 class="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
              تم بنجاح!
            </h3>
            <p class="text-gray-600 text-xl mb-6">إلى اللقاء ${displayName}</p>
            
            <!-- Floating Particles -->
            <div class="absolute top-4 left-4 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
            <div class="absolute top-8 right-8 w-3 h-3 bg-emerald-400 rounded-full animate-bounce"></div>
            <div class="absolute bottom-6 left-12 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        `,
        timer: 2500,
        timerProgressBar: true,
        showConfirmButton: false,
        showClass: {
          popup: 'animate__animated animate__jackInTheBox'
        },
        customClass: {
          popup: 'font-cairo text-right rounded-3xl shadow-2xl border-0 bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 relative overflow-hidden',
          timerProgressBar: 'bg-gradient-to-r from-green-500 to-emerald-600'
        },
        width: '450px',
        backdrop: 'rgba(0,0,0,0.8)'
      });
    }, 800);

    return true;
  } else {
    if (onCancel) onCancel();
    return false;
  }
};

// تسجيل خروج سريع مع انيميشن حديث
export const quickLogout = (onConfirm?: () => void, userType: 'admin' | 'user' = 'user') => {
  cleanupSession();
  if (onConfirm) onConfirm();
  
  const isAdmin = userType === 'admin';
  
  Swal.fire({
    toast: true,
    position: 'top-end',
    html: `
      <div class="flex items-center gap-4 p-2" dir="rtl">
        <div class="relative">
          <div class="w-10 h-10 bg-gradient-to-br from-${isAdmin ? 'red' : 'blue'}-500 to-${isAdmin ? 'red' : 'blue'}-700 rounded-full flex items-center justify-center shadow-lg">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <div class="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
        </div>
        <div>
          <h4 class="font-bold text-gray-800">تم تسجيل الخروج</h4>
          <p class="text-sm text-gray-600">تم بنجاح!</p>
        </div>
      </div>
    `,
    showConfirmButton: false,
    timer: 3500,
    timerProgressBar: true,
    customClass: {
      popup: `font-cairo text-right rounded-xl shadow-2xl border-r-4 border-${isAdmin ? 'red' : 'blue'}-500 bg-gradient-to-r from-white to-${isAdmin ? 'red' : 'blue'}-50 backdrop-blur-sm`,
      timerProgressBar: `bg-gradient-to-r from-${isAdmin ? 'red' : 'blue'}-500 to-${isAdmin ? 'red' : 'blue'}-700`
    },
    showClass: {
      popup: 'animate__animated animate__slideInRight animate__faster'
    },
    hideClass: {
      popup: 'animate__animated animate__slideOutRight animate__faster'
    }
  });
};

// رسالة خطأ حديثة
export const showLogoutError = (errorMessage?: string) => {
  Swal.fire({
    title: '',
    html: `
      <div class="text-center py-8" dir="rtl">
        <div class="relative mx-auto w-20 h-20 mb-6">
          <div class="absolute inset-0 bg-gradient-to-br from-red-500 to-red-700 rounded-full shadow-2xl animate-pulse"></div>
          <div class="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-30"></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
        </div>
        <h3 class="text-2xl font-bold text-red-700 mb-4">خطأ في تسجيل الخروج</h3>
        <p class="text-gray-700 text-lg leading-relaxed max-w-sm mx-auto">
          ${errorMessage || 'حدث خطأ أثناء تسجيل الخروج. يرجى المحاولة مرة أخرى.'}
        </p>
      </div>
    `,
    icon: undefined,
    confirmButtonText: `
      <div class="flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
        <span class="font-bold">حاول مرة أخرى</span>
      </div>
    `,
    customClass: {
      popup: 'font-cairo text-right rounded-3xl shadow-2xl border-0 bg-gradient-to-br from-red-50 to-pink-50',
      confirmButton: 'modern-btn bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:scale-105'
    },
    buttonsStyling: false,
    width: '450px',
    showClass: {
      popup: 'animate__animated animate__shakeX'
    }
  });
};

// إنشاء زر تسجيل خروج حديث
export const createLogoutButton = (options: LogoutOptions & { 
  buttonText?: string; 
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'glass' | 'outline';
} = {}) => {
  const { 
    userType = 'user', 
    buttonText = 'تسجيل الخروج',
    className = '',
    size = 'md',
    variant = 'solid',
    onConfirm,
    onCancel
  } = options;

  const isAdmin = userType === 'admin';
  
  const sizeClasses = {
    sm: 'px-4 py-2.5 text-sm gap-2',
    md: 'px-6 py-3 text-base gap-3', 
    lg: 'px-8 py-4 text-lg gap-3'
  };

  const variantClasses = {
    solid: `bg-gradient-to-r from-${isAdmin ? 'red' : 'blue'}-500 via-${isAdmin ? 'red' : 'blue'}-600 to-${isAdmin ? 'red' : 'blue'}-700 hover:from-${isAdmin ? 'red' : 'blue'}-600 hover:via-${isAdmin ? 'red' : 'blue'}-700 hover:to-${isAdmin ? 'red' : 'blue'}-800 text-white shadow-lg hover:shadow-2xl`,
    glass: `bg-white/10 backdrop-blur-md border border-white/20 text-${isAdmin ? 'red' : 'blue'}-700 hover:bg-white/20 shadow-lg hover:shadow-xl`,
    outline: `border-2 border-${isAdmin ? 'red' : 'blue'}-500 text-${isAdmin ? 'red' : 'blue'}-600 hover:bg-${isAdmin ? 'red' : 'blue'}-500 hover:text-white shadow-md hover:shadow-lg`
  };

  const button = document.createElement('button');
  button.className = `
    group relative inline-flex items-center justify-center overflow-hidden
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    font-semibold rounded-2xl
    transition-all duration-300 ease-out transform hover:-translate-y-2 hover:scale-105
    focus:outline-none focus:ring-4 focus:ring-${isAdmin ? 'red' : 'blue'}-300 focus:ring-opacity-50
    active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    ${className}
  `.replace(/\s+/g, ' ').trim();

  button.innerHTML = `
    <!-- Shimmer Effect -->
    <div class="absolute inset-0 -top-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 group-hover:animate-pulse"></div>
    
    <!-- Icon -->
    <svg class="w-5 h-5 transform transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7"></path>
    </svg>
    
    <!-- Text -->
    <span class="relative z-10 font-medium">${buttonText}</span>
    
    <!-- Ripple Effect -->
    <div class="absolute inset-0 rounded-2xl opacity-0 group-active:opacity-20 group-active:animate-ping bg-white"></div>
  `;

  button.addEventListener('click', async (e) => {
    e.preventDefault();
    button.disabled = true;
    
    // Add click animation
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
      button.style.transform = '';
    }, 150);
    
    try {
      await showLogoutConfirmation({ userType, onConfirm, onCancel });
    } catch (error) {
      showLogoutError('حدث خطأ غير متوقع');
    } finally {
      button.disabled = false;
    }
  });

  return button;
};

// عنصر قائمة منسدلة حديث
export const createLogoutDropdownItem = (options: LogoutOptions = {}) => {
  const { userType = 'user', onConfirm, onCancel } = options;
  const isAdmin = userType === 'admin';
  
  const item = document.createElement('button');
  item.className = `
    group w-full text-right px-4 py-3 text-sm font-medium
    text-${isAdmin ? 'red' : 'blue'}-600 hover:bg-gradient-to-r hover:from-${isAdmin ? 'red' : 'blue'}-50 hover:to-${isAdmin ? 'red' : 'blue'}-100
    transition-all duration-300 rounded-xl
    flex items-center gap-3 relative overflow-hidden
    focus:outline-none focus:ring-2 focus:ring-${isAdmin ? 'red' : 'blue'}-500 focus:ring-opacity-50
    transform hover:scale-105 hover:shadow-md active:scale-95
  `.replace(/\s+/g, ' ').trim();
  
  item.innerHTML = `
    <!-- Background Animation -->
    <div class="absolute inset-0 bg-gradient-to-r from-${isAdmin ? 'red' : 'blue'}-500 to-${isAdmin ? 'red' : 'blue'}-700 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
    
    <!-- Icon -->
    <svg class="w-4 h-4 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7"></path>
    </svg>
    
    <!-- Text -->
    <span class="relative z-10 font-medium transition-all duration-300 group-hover:text-${isAdmin ? 'red' : 'blue'}-700">تسجيل الخروج</span>
    
    <!-- Hover Effect -->
    <div class="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-0 bg-gradient-to-b from-${isAdmin ? 'red' : 'blue'}-500 to-${isAdmin ? 'red' : 'blue'}-700 group-hover:h-full transition-all duration-300 rounded-full"></div>
  `;
  
  item.addEventListener('click', async (e) => {
    e.preventDefault();
    
    // Add ripple effect
    const ripple = document.createElement('div');
    ripple.className = `absolute rounded-full bg-${isAdmin ? 'red' : 'blue'}-400 animate-ping opacity-30`;
    ripple.style.width = '20px';
    ripple.style.height = '20px';
    ripple.style.left = '50%';
    ripple.style.top = '50%';
    ripple.style.transform = 'translate(-50%, -50%)';
    
    item.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
    
    await showLogoutConfirmation({ userType, onConfirm, onCancel });
  });
  
  return item;
};

// دالة إنشاء شريط تقدم متحرك
export const createProgressBar = (isAdmin = false) => {
  return `
    <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
      <div class="bg-gradient-to-r from-${isAdmin ? 'red' : 'blue'}-400 via-${isAdmin ? 'red' : 'blue'}-500 to-${isAdmin ? 'red' : 'blue'}-600 h-3 rounded-full relative overflow-hidden progress-bar">
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 animate-shimmer"></div>
      </div>
    </div>
    
    <style>
      .progress-bar {
        animation: progressFill 2s ease-in-out forwards;
      }
      
      @keyframes progressFill {
        from { width: 0%; }
        to { width: 100%; }
      }
      
      @keyframes shimmer {
        0% { transform: translateX(-100%) skewX(-12deg); }
        100% { transform: translateX(200%) skewX(-12deg); }
      }
      
      .animate-shimmer {
        animation: shimmer 1.5s infinite;
      }
    </style>
  `;
};

// دالة إنشاء particles متحركة
export const createFloatingParticles = (count = 8, isAdmin = false) => {
  const particles = [];
  const colors = isAdmin ? ['red', 'pink', 'rose'] : ['blue', 'indigo', 'cyan'];
  
  for (let i = 0; i < count; i++) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.random() * 4 + 2;
    const duration = Math.random() * 3 + 2;
    const delay = Math.random() * 2;
    
    particles.push(`
      <div class="absolute w-${Math.floor(size)} h-${Math.floor(size)} bg-${color}-400 rounded-full opacity-60 animate-float-${i}"
           style="
             left: ${Math.random() * 100}%;
             top: ${Math.random() * 100}%;
             animation: floatParticle${i} ${duration}s ease-in-out infinite ${delay}s;
           "></div>
    `);
  }
  
  return particles.join('') + `
    <style>
      ${Array.from({length: count}, (_, i) => `
        @keyframes floatParticle${i} {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          25% { transform: translateY(-${Math.random() * 20 + 10}px) rotate(90deg) scale(1.1); }
          50% { transform: translateY(-${Math.random() * 30 + 20}px) rotate(180deg) scale(0.9); }
          75% { transform: translateY(-${Math.random() * 15 + 5}px) rotate(270deg) scale(1.05); }
        }
      `).join('')}
    </style>
  `;
};

// دالة إنشاء تأثير موجي
export const createWaveEffect = (isAdmin = false) => {
  return `
    <div class="absolute inset-0 overflow-hidden rounded-3xl">
      <div class="wave-container">
        <div class="wave wave1 bg-gradient-to-r from-${isAdmin ? 'red' : 'blue'}-200/20 to-${isAdmin ? 'pink' : 'indigo'}-200/20"></div>
        <div class="wave wave2 bg-gradient-to-r from-${isAdmin ? 'red' : 'blue'}-300/15 to-${isAdmin ? 'pink' : 'indigo'}-300/15"></div>
        <div class="wave wave3 bg-gradient-to-r from-${isAdmin ? 'red' : 'blue'}-400/10 to-${isAdmin ? 'pink' : 'indigo'}-400/10"></div>
      </div>
    </div>
    
    <style>
      .wave-container {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
      
      .wave {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 200%;
        height: 100px;
        background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
        animation: wave 3s ease-in-out infinite;
        transform-origin: bottom;
      }
      
      .wave1 { animation-delay: 0s; opacity: 0.3; }
      .wave2 { animation-delay: 0.5s; opacity: 0.2; height: 80px; }
      .wave3 { animation-delay: 1s; opacity: 0.1; height: 60px; }
      
      @keyframes wave {
        0%, 100% { transform: translateX(-50%) rotateZ(0deg) scaleY(1); }
        50% { transform: translateX(-50%) rotateZ(1deg) scaleY(1.1); }
      }
    </style>
  `;
};

// دالة تحديد نوع الأنيميشن بناءً على حالة المستخدم
export const getAnimationTheme = (userType: 'admin' | 'user') => {
  const isAdmin = userType === 'admin';
  
  return {
    colors: {
      primary: isAdmin ? 'red' : 'blue',
      secondary: isAdmin ? 'pink' : 'indigo',
      accent: isAdmin ? 'rose' : 'cyan'
    },
    gradients: {
      main: `from-${isAdmin ? 'red' : 'blue'}-500 to-${isAdmin ? 'red' : 'blue'}-700`,
      soft: `from-${isAdmin ? 'red' : 'blue'}-50 to-${isAdmin ? 'pink' : 'indigo'}-50`,
      intense: `from-${isAdmin ? 'red' : 'blue'}-600 via-${isAdmin ? 'red' : 'blue'}-700 to-${isAdmin ? 'red' : 'blue'}-800`
    },
    animations: {
      entrance: isAdmin ? 'animate__zoomInDown' : 'animate__zoomInUp',
      exit: isAdmin ? 'animate__zoomOutUp' : 'animate__zoomOutDown',
      success: 'animate__jackInTheBox',
      error: 'animate__shakeX'
    }
  };
};

// دالة مساعدة لإنشاء CSS ديناميكي
export const injectDynamicStyles = (userType: 'admin' | 'user') => {
  const theme = getAnimationTheme(userType);
  const styleId = 'dynamic-logout-styles';
  
  // إزالة الأنماط السابقة إن وجدت
  const existingStyle = document.getElementById(styleId);
  if (existingStyle) {
    existingStyle.remove();
  }
  
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    @import url('https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css');
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&display=swap');
    
    .modern-logout-container {
      font-family: 'Cairo', sans-serif;
      --primary-color: ${theme.colors.primary};
      --secondary-color: ${theme.colors.secondary};
      --accent-color: ${theme.colors.accent};
    }
    
    .glassmorphism-advanced {
      background: rgba(255, 255, 255, 0.25);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.3);
      box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
    }
    
    .neon-glow {
      box-shadow: 
        0 0 5px var(--primary-color),
        0 0 10px var(--primary-color),
        0 0 15px var(--primary-color),
        0 0 20px var(--primary-color);
    }
    
    .floating-animation {
      animation: float 6s ease-in-out infinite;
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      33% { transform: translateY(-10px) rotate(2deg); }
      66% { transform: translateY(-5px) rotate(-1deg); }
    }
    
    .pulse-glow {
      animation: pulseGlow 2s ease-in-out infinite alternate;
    }
    
    @keyframes pulseGlow {
      from { box-shadow: 0 0 20px rgba(var(--primary-color), 0.4); }
      to { box-shadow: 0 0 30px rgba(var(--primary-color), 0.8); }
    }
    
    .text-shadow-glow {
      text-shadow: 0 0 10px rgba(var(--primary-color), 0.5);
    }
  `;
  
  document.head.appendChild(style);
  
  // تنظيف الأنماط بعد 10 ثوان
  setTimeout(() => {
    const styleToRemove = document.getElementById(styleId);
    if (styleToRemove) {
      styleToRemove.remove();
    }
  }, 10000);
};