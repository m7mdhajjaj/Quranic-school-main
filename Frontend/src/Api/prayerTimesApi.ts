import api from "./api";

// ============================================================================
// Prayer Times API
// ============================================================================

export interface PrayerTimesData {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset: string;
  Maghrib: string;
  Isha: string;
}

export interface PrayerTime {
  name: string;
  time: string;
  arabicName: string;
  icon: string;
}

export interface DateInfo {
  readable: string;
  hijri: {
    date: string;
    month: {
      ar: string;
    };
    year: string;
  };
}

export interface PrayerTimesResponse {
  success: boolean;
  data: {
    timings: PrayerTimesData;
    date: DateInfo;
  };
  message?: string;
}

export interface QiblaResponse {
  success: boolean;
  data: {
    direction: number;
    location: string;
  };
  message?: string;
}

export interface PrayerSettings {
  city: string;
  latitude: number;
  longitude: number;
  method: number;
  qiblaDirection: number;
}

// Get current prayer times
export const getPrayerTimes = async (
  latitude?: number,
  longitude?: number
): Promise<PrayerTimesResponse> => {
  // استخدام External API مباشرة (لا حاجة لـ Backend لأنها بيانات للعرض فقط)
  return await fetchPrayerTimesFromExternal(latitude, longitude);
};

// Fallback function to fetch from external API
const fetchPrayerTimesFromExternal = async (
  latitude: number = 32.2211,
  longitude: number = 35.2544
): Promise<PrayerTimesResponse> => {
  try {
    const response = await fetch(
      `https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=4&tune=0,0,0,0,0,0,0,0,0`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch prayer times from external API");
    }

    const data = await response.json();

    return {
      success: true,
      data: {
        timings: data.data.timings,
        date: data.data.date,
      },
    };
  } catch (error) {
    throw new Error("فشل في جلب مواقيت الصلاة");
  }
};

// Get Qibla direction for a location
export const getQiblaDirection = async (
  latitude?: number,
  longitude?: number
): Promise<QiblaResponse> => {
  // استخدام External API مباشرة
  return await fetchQiblaFromExternal(latitude, longitude);
};

// Fallback function for Qibla direction
const fetchQiblaFromExternal = async (
  latitude: number = 32.2211,
  longitude: number = 35.2544
): Promise<QiblaResponse> => {
  try {
    const response = await fetch(
      `https://api.aladhan.com/v1/qibla/${latitude}/${longitude}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch Qibla direction");
    }

    const data = await response.json();

    return {
      success: true,
      data: {
        direction: data.data.direction,
        location: `${latitude}, ${longitude}`,
      },
    };
  } catch (error) {
    // Default Qibla direction for Nablus
    return {
      success: true,
      data: {
        direction: 157,
        location: "Nablus, Palestine (Default)",
      },
    };
  }
};

// Save prayer settings (admin only)
export const savePrayerSettings = async (
  settings: PrayerSettings
): Promise<{ success: boolean; message?: string }> => {
  const response = await api.post("/prayer-settings", settings);
  return response.data;
};

// Get prayer settings
export const getPrayerSettings = async (): Promise<{
  success: boolean;
  data?: PrayerSettings;
  message?: string;
}> => {
  try {
    const response = await api.get("/prayer-settings");
    return response.data;
  } catch (error) {
    // Return default settings for Nablus
    return {
      success: true,
      data: {
        city: "نابلس، فلسطين",
        latitude: 32.2211,
        longitude: 35.2544,
        method: 4,
        qiblaDirection: 157,
      },
    };
  }
};

// Utility function to format time
export const formatTime = (time: string): string => {
  if (!time) return "";

  try {
    // Parse time in 24-hour format
    const [hours, minutes] = time.split(":");
    const hour24 = parseInt(hours);
    const minute = parseInt(minutes);

    // Convert to 12-hour format
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const period = hour24 >= 12 ? "م" : "ص";

    return `${hour12.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")} ${period}`;
  } catch (error) {
    return time; // Return original if formatting fails
  }
};

// Get next prayer based on current time
export const getNextPrayer = (prayerTimes: PrayerTime[]): PrayerTime | null => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Convert prayer times to minutes for comparison
  const prayerMinutes = prayerTimes.map((prayer) => {
    const timeStr = prayer.time.replace(/[صم]/g, "").trim();
    const [time, period] = timeStr.split(" ");
    const [hours, minutes] = time.split(":").map(Number);

    let hour24 = hours;
    if (period === "م" && hours !== 12) hour24 += 12;
    if (period === "ص" && hours === 12) hour24 = 0;

    return {
      ...prayer,
      minutes: hour24 * 60 + minutes,
    };
  });

  // Find next prayer
  for (const prayer of prayerMinutes) {
    if (prayer.minutes > currentMinutes) {
      return prayer;
    }
  }

  // If no prayer found today, return Fajr of next day
  return prayerMinutes[0] || null;
};
