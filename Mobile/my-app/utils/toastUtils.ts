/**
 * Toast Utilities for React Native
 * باستخدام react-native-toast-message
 */

import Toast from "react-native-toast-message";
import { audioManager } from "./AudioManager";

/**
 * إظهار رسالة نجاح مع صوت
 */
export const showSuccessToast = (
  message: string,
  title?: string,
  duration: number = 3000
) => {
  // تشغيل صوت النجاح
  audioManager.play("successful.mp3", 0.6);

  Toast.show({
    type: "success",
    text1: title || "نجاح",
    text2: message,
    position: "top",
    visibilityTime: duration,
    autoHide: true,
    topOffset: 50,
  });
};

/**
 * إظهار رسالة خطأ مع صوت
 */
export const showErrorToast = (
  message: string,
  title?: string,
  duration: number = 4000
) => {
  // تشغيل صوت الخطأ
  audioManager.play("error.wav", 0.6);

  Toast.show({
    type: "error",
    text1: title || "خطأ",
    text2: message,
    position: "top",
    visibilityTime: duration,
    autoHide: true,
    topOffset: 50,
  });
};

/**
 * إظهار رسالة معلومات (بدون صوت)
 */
export const showInfoToast = (
  message: string,
  title?: string,
  duration: number = 3000
) => {
  Toast.show({
    type: "info",
    text1: title || "معلومات",
    text2: message,
    position: "top",
    visibilityTime: duration,
    autoHide: true,
    topOffset: 50,
  });
};

/**
 * إظهار رسالة تحذير (بدون صوت)
 */
export const showWarningToast = (
  message: string,
  title?: string,
  duration: number = 3000
) => {
  Toast.show({
    type: "warning",
    text1: title || "تحذير",
    text2: message,
    position: "top",
    visibilityTime: duration,
    autoHide: true,
    topOffset: 50,
  });
};

/**
 * إخفاء جميع Toast
 */
export const hideToast = () => {
  Toast.hide();
};

/**
 * Toast مخصص
 */
export const showCustomToast = (
  text1: string,
  text2?: string,
  duration: number = 3000,
  position: "top" | "bottom" = "top"
) => {
  Toast.show({
    type: "info",
    text1,
    text2,
    position,
    visibilityTime: duration,
    autoHide: true,
    topOffset: position === "top" ? 50 : undefined,
    bottomOffset: position === "bottom" ? 50 : undefined,
  });
};
