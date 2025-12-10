// ============================================================================
// useSessionDuration - Hook لحساب مدة الحصة
// ============================================================================

import { useMemo } from "react";

interface UseSessionDurationProps {
  startHour: string;
  endHour: string;
  hours: string[];
}

interface SessionDuration {
  totalMinutes: number;
  hours: number;
  minutes: number;
  displayText: string;
}

export const useSessionDuration = ({ startHour, endHour, hours }: UseSessionDurationProps): SessionDuration | null => {
  return useMemo(() => {
    if (!startHour || !endHour) {
      return null;
    }

    const startIdx = hours.indexOf(startHour);
    const endIdx = hours.indexOf(endHour);

    if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
      return null;
    }

    const slots = endIdx - startIdx;
    const totalMinutes = slots * 30;
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    let displayText = '';
    if (hrs > 0) {
      displayText = `${hrs} ساعة`;
      if (mins > 0) {
        displayText += ` و ${mins} دقيقة`;
      }
    } else {
      displayText = `${mins} دقيقة`;
    }

    return {
      totalMinutes,
      hours: hrs,
      minutes: mins,
      displayText,
    };
  }, [startHour, endHour, hours]);
};
