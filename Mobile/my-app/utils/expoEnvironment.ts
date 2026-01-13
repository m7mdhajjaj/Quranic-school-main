// ============================================================================
// Expo Environment Utilities
// ============================================================================
// Utilities to detect Expo Go vs Development Build
// ============================================================================

import Constants from "expo-constants";

/**
 * التحقق مما إذا كان التطبيق يعمل في Expo Go
 * Push Notifications لا تعمل في Expo Go منذ SDK 53
 */
export const isExpoGo = (): boolean => {
  return Constants.appOwnership === "expo";
};

/**
 * التحقق مما إذا كان التطبيق يعمل كـ Development Build
 */
export const isDevelopmentBuild = (): boolean => {
  // In development builds, appOwnership is null or undefined
  return Constants.appOwnership !== "expo";
};

/**
 * التحقق مما إذا كانت Push Notifications مدعومة
 */
export const isPushNotificationsSupported = (): boolean => {
  // Push Notifications غير مدعومة في Expo Go منذ SDK 53
  if (isExpoGo()) {
    return false;
  }
  return true;
};

/**
 * طباعة معلومات البيئة للتطوير
 */
export const logEnvironmentInfo = (): void => {
  if (__DEV__) {
    console.log("📱 App Environment Info:");
    console.log("  - App Ownership:", Constants.appOwnership);
    console.log("  - Is Expo Go:", isExpoGo());
    console.log(
      "  - Push Notifications Supported:",
      isPushNotificationsSupported()
    );
    console.log("  - Execution Environment:", Constants.executionEnvironment);
  }
};

export default {
  isExpoGo,
  isDevelopmentBuild,
  isPushNotificationsSupported,
  logEnvironmentInfo,
};
