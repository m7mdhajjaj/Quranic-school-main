import Swal from "sweetalert2";
import type { SweetAlertOptions } from "sweetalert2";

// دالة لتشغيل الصوت
const playSound = (soundFile: string) => {
  try {
    const audio = new Audio(`/src/assets/sounds/${soundFile}`);
    audio.volume = 0.5; // ضبط مستوى الصوت (50%)
    audio.play().catch((error) => {
      console.warn('Could not play sound:', error);
    });
  } catch (error) {
    console.warn('Error playing sound:', error);
  }
};

// دالة لإعداد SweetAlert بموضع ثابت في الوسط وخلفية خفيفة - باستخدام Tailwind فقط
export const showCenteredSwal = (options: SweetAlertOptions) => {
  return Swal.fire({
    ...options,
    position: "center",
    backdrop: "rgba(0, 0, 0, 0.2)",
    showClass: {
      popup: "", // بدون animation
      backdrop: "",
    },
    hideClass: {
      popup: "",
      backdrop: "",
    },
    customClass: {
      popup: `!fixed !top-1/2 !left-1/2 !m-0 !rounded-xl !shadow-2xl ${
        options.customClass?.popup || ""
      }`,
      container: "!fixed !inset-0 !z-[10000] !flex !items-center !justify-center",
      ...options.customClass,
    },
    didOpen: () => {
      const popup = Swal.getPopup();
      if (popup) {
        // فرض المركزية بقوة باستخدام important
        popup.style.setProperty("position", "fixed", "important");
        popup.style.setProperty("top", "50%", "important");
        popup.style.setProperty("left", "50%", "important");
        popup.style.setProperty("transform", "translate(-50%, -50%)", "important");
        popup.style.setProperty("margin", "0", "important");
        popup.style.setProperty("z-index", "10001", "important");
      }

      const container = document.querySelector(".swal2-container") as HTMLElement;
      if (container) {
        container.style.setProperty("position", "fixed", "important");
        container.style.setProperty("inset", "0", "important");
        container.style.setProperty("display", "flex", "important");
        container.style.setProperty("align-items", "center", "important");
        container.style.setProperty("justify-content", "center", "important");
        container.style.setProperty("z-index", "10000", "important");
      }

      const backdrop = document.querySelector(".swal2-backdrop") as HTMLElement;
      if (backdrop) {
        backdrop.style.backdropFilter = "blur(2px)";
      }

      if (options.didOpen) {
        options.didOpen(Swal.getPopup()!);
      }
    },
  });
};

// دالة لرسالة النجاح المخصصة - Tailwind only
export const showSuccessMessage = (
  title: string,
  message: string,
  studentName?: string,
  position: SweetAlertOptions["position"] = "center",
  isToast: boolean = false
) => {
  // تشغيل صوت النجاح
  playSound('successful.mp3');
  
  if (isToast) {
    // نمط Toast للإشعارات السريعة
    return Swal.fire({
      title: title,
      text: message,
      icon: "success",
      toast: true,
      position: position || "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      customClass: {
        popup: "!rounded-xl !shadow-2xl",
        title: "!text-base !font-bold",
        timerProgressBar: "!bg-green-500",
      },
    });
  }

  return showCenteredSwal({
    title: title,
    html: `
      <div class="text-center py-4">
        <div class="mx-auto w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-200 rounded-full flex items-center justify-center mb-6 shadow-lg">
          <svg class="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-800 mb-3">${message}</h3>
        ${
          studentName
            ? `
          <div class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-semibold text-lg shadow-md">
            <span class="mr-2">✨</span>
            <span>${studentName}</span>
            <span class="mr-2">✨</span>
          </div>
        `
            : ""
        }
        <p class="text-gray-600 mt-4 font-medium">تم تحديث قاعدة البيانات بنجاح</p>
      </div>
    `,
    icon: "success",
    timer: 4000,
    timerProgressBar: true,
    showConfirmButton: false,
    allowOutsideClick: false,
    customClass: {
      popup: "rtl:text-right",
      title: "text-center",
      htmlContainer: "text-center",
      timerProgressBar: "!bg-green-500",
    },
  });
};

// دالة لرسالة الخطأ المخصصة - Tailwind only
export const showErrorMessage = (title: string, message: string) => {
  // تشغيل صوت الفشل
  playSound('error.wav');
  
  return showCenteredSwal({
    title: title,
    html: `
      <div class="text-center py-4">
        <div class="mx-auto w-24 h-24 bg-gradient-to-br from-red-100 to-rose-200 rounded-full flex items-center justify-center mb-6 shadow-lg animate-pulse">
          <svg class="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-800 mb-3">${message}</h3>
        <div class="bg-red-50 border-r-4 border-red-500 rounded-lg p-4 mt-4">
          <div class="flex items-center justify-center gap-3">
            <svg class="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            <p class="text-sm text-red-700 font-medium">يرجى المحاولة مرة أخرى أو التواصل مع الدعم الفني</p>
          </div>
        </div>
      </div>
    `,
    icon: "error",
    timer: 5000,
    timerProgressBar: true,
    showConfirmButton: true,
    confirmButtonText: "✓ حسناً",
    customClass: {
      popup: "rtl:text-right !rounded-2xl",
      title: "text-center !text-2xl !font-bold !text-gray-800",
      htmlContainer: "text-center",
      confirmButton:
        "!bg-gradient-to-r !from-red-600 !to-rose-700 hover:!from-red-700 hover:!to-rose-800 !text-white !font-bold !px-8 !py-3 !rounded-xl !shadow-lg hover:!shadow-xl !transition-all !duration-200",
      timerProgressBar: "!bg-red-500",
    },
  });
};

// دالة لرسالة التحذير المخصصة - Tailwind only
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
    icon: "warning",
    timer: 4000,
    timerProgressBar: true,
    showConfirmButton: true,
    confirmButtonText: "حسناً",
    customClass: {
      popup: "rtl:text-right",
      title: "text-center",
      confirmButton:
        "!bg-orange-600 hover:!bg-orange-700 !text-white !font-semibold !px-6 !py-2 !rounded-lg !transition-colors",
      timerProgressBar: "!bg-orange-500",
    },
  });
};

// دالة لرسالة التأكيد
export const showConfirmMessage = (
  title: string,
  text: string,
  confirmButtonText: string = "نعم، تأكيد",
  cancelButtonText: string = "إلغاء"
) => {
  return showCenteredSwal({
    title: title,
    text: text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3b82f6",
    cancelButtonColor: "#ef4444",
    confirmButtonText: confirmButtonText,
    cancelButtonText: cancelButtonText,
    reverseButtons: true,
    customClass: {
      popup: "rtl:text-right !rounded-2xl",
      title: "!text-xl !font-bold !text-gray-800",
      confirmButton:
        "!bg-gradient-to-r !from-blue-600 !to-blue-700 hover:!from-blue-700 hover:!to-blue-800 !text-white !font-bold !px-6 !py-3 !rounded-xl !shadow-lg hover:!shadow-xl !transition-all",
      cancelButton:
        "!bg-gradient-to-r !from-red-600 !to-red-700 hover:!from-red-700 hover:!to-red-800 !text-white !font-bold !px-6 !py-3 !rounded-xl !shadow-lg hover:!shadow-xl !transition-all",
    },
  });
};
