import Swal from 'sweetalert2';
import type { SweetAlertOptions } from 'sweetalert2';

// دالة لإعداد SweetAlert بموضع ثابت في الوسط وخلفية خفيفة
export const showCenteredSwal = (options: SweetAlertOptions) => {
  return Swal.fire({
    ...options,
    position: 'center', // تثبيت الرسالة في الوسط
    backdrop: 'rgba(0, 0, 0, 0.2)', // تقليل شدة الخلفية المضببة
    showClass: {
      popup: 'swal2-noanimation', // إلغاء الحركة
      backdrop: 'swal2-noanimation'
    },
    hideClass: {
      popup: '', // إلغاء حركة الإخفاء
      backdrop: ''
    },
    customClass: {
      popup: `swal2-center-fixed ${options.customClass?.popup || ''}`,
      ...options.customClass
    },
    didOpen: () => {
      const popup = Swal.getPopup();
      if (popup) {
        popup.style.position = 'fixed';
        popup.style.top = '50%';
        popup.style.left = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
        popup.style.zIndex = '10000';
        popup.style.margin = '0';
      }
      
      // تخصيص الخلفية
      const backdrop = document.querySelector('.swal2-backdrop') as HTMLElement;
      if (backdrop) {
        backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
        backdrop.style.setProperty('-webkit-backdrop-filter', 'blur(2px)');
        backdrop.style.backdropFilter = 'blur(2px)';
      }
      
      // استدعاء didOpen الأصلية إن وجدت
      if (options.didOpen) {
        options.didOpen(Swal.getPopup()!);
      }
    },
  });
};

// دالة لرسالة النجاح المخصصة
export const showSuccessMessage = (title: string, message: string, studentName?: string) => {
  return showCenteredSwal({
    title: title,
    html: `
      <div class="text-center py-4 success-animation">
        <div class="mx-auto w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-200 rounded-full flex items-center justify-center mb-6 shadow-lg">
          <svg class="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-800 mb-3">${message}</h3>
        ${studentName ? `
          <div class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-semibold text-lg shadow-md">
            <span class="mr-2">✨</span>
            <span>${studentName}</span>
            <span class="mr-2">✨</span>
          </div>
        ` : ''}
        <p class="text-gray-600 mt-4 font-medium">تم تحديث قاعدة البيانات بنجاح</p>
      </div>
    `,
    icon: 'success',
    timer: 4000,
    timerProgressBar: true,
    showConfirmButton: false,
    allowOutsideClick: false,
    customClass: {
      popup: 'swal2-success-modal rtl-popup',
      title: 'rtl-title',
      htmlContainer: 'rtl-content',
    },
  });
};

// دالة لرسالة الخطأ المخصصة
export const showErrorMessage = (title: string, message: string) => {
  return showCenteredSwal({
    title: title,
    html: `
      <div class="text-center py-4">
        <div class="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg class="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
        <p class="text-lg font-semibold text-gray-800 mb-2">${title}</p>
        <p class="text-sm text-red-600">${message}</p>
      </div>
    `,
    icon: 'error',
    timer: 4000,
    timerProgressBar: true,
    showConfirmButton: true,
    confirmButtonText: 'حسناً',
    customClass: {
      popup: 'rtl-popup',
      title: 'rtl-title',
      confirmButton: 'rtl-button',
    },
  });
};

// دالة لرسالة التحذير المخصصة
export const showWarningMessage = (title: string, message: string) => {
  return showCenteredSwal({
    title: title,
    html: `
      <div class="text-center py-4">
        <div class="mx-auto w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-4">
          <svg class="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
        <p class="text-lg font-semibold text-gray-800 mb-2">${title}</p>
        <p class="text-sm text-orange-600">${message}</p>
      </div>
    `,
    icon: 'warning',
    timer: 4000,
    timerProgressBar: true,
    showConfirmButton: true,
    confirmButtonText: 'حسناً',
    customClass: {
      popup: 'rtl-popup',
      title: 'rtl-title',
      confirmButton: 'rtl-button',
    },
  });
};