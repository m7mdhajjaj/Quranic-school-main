// ============================================================================
// usePrayerAlerts Hook
// ============================================================================
// Custom hook معطّل بالكامل لإيقاف تنبيهات الصلاة

import type { PrayerData } from "../types";
import type { UsePrayerAlertsReturn } from "../types";

export const usePrayerAlerts = (): UsePrayerAlertsReturn => {
  const noop = (_data: PrayerData) => {};

  return {
    showPrayerReminder: noop,
    showPreAdhanReminder: noop,
    showPrayerAdhan: noop,
  };
};
