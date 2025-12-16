/**
 * Alert Utilities for React Native
 * بديل عن SweetAlert2 باستخدام React Native Alert API
 */

import { Alert, Platform } from "react-native";
import { audioManager } from "./AudioManager";

/**
 * إظهار رسالة نجاح
 */
export const showSuccessMessage = (
  title: string,
  message: string,
  onConfirm?: () => void
) => {
  // تشغيل صوت النجاح
  audioManager.play("successful.mp3");

  Alert.alert(
    title,
    message,
    [
      {
        text: "تم ✓",
        onPress: onConfirm,
        style: "default",
      },
    ],
    { cancelable: false }
  );
};

/**
 * إظهار رسالة خطأ
 */
export const showErrorMessage = (
  title: string,
  message: string,
  onConfirm?: () => void
) => {
  // تشغيل صوت الخطأ
  audioManager.play("error.wav");

  Alert.alert(
    title,
    message,
    [
      {
        text: "حسناً",
        onPress: onConfirm,
        style: "default",
      },
    ],
    { cancelable: false }
  );
};

/**
 * إظهار رسالة تحذير
 */
export const showWarningMessage = (
  title: string,
  message: string,
  onConfirm?: () => void
) => {
  Alert.alert(
    title,
    message,
    [
      {
        text: "حسناً",
        onPress: onConfirm,
        style: "default",
      },
    ],
    { cancelable: true }
  );
};

/**
 * إظهار رسالة تأكيد مع خيارات
 */
export const showConfirmMessage = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void,
  confirmText: string = "نعم، تأكيد",
  cancelText: string = "إلغاء"
) => {
  Alert.alert(
    title,
    message,
    [
      {
        text: cancelText,
        onPress: onCancel,
        style: "cancel",
      },
      {
        text: confirmText,
        onPress: onConfirm,
        style: "default",
      },
    ],
    { cancelable: true }
  );
};

/**
 * إظهار رسالة تأكيد الحذف
 */
export const showConfirmDialog = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void,
  confirmText: string = "نعم، احذف",
  cancelText: string = "إلغاء"
) => {
  Alert.alert(
    title,
    message,
    [
      {
        text: cancelText,
        onPress: onCancel,
        style: "cancel",
      },
      {
        text: confirmText,
        onPress: onConfirm,
        style: Platform.OS === "ios" ? "destructive" : "default",
      },
    ],
    { cancelable: true }
  );
};

/**
 * إظهار رسالة معلومات
 */
export const showInfoMessage = (
  title: string,
  message: string,
  onConfirm?: () => void
) => {
  Alert.alert(
    title,
    message,
    [
      {
        text: "حسناً",
        onPress: onConfirm,
        style: "default",
      },
    ],
    { cancelable: true }
  );
};
