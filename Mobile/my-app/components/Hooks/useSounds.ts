import { useCallback } from "react";
import { Audio } from "expo-av";

/**
 * Sound Player للموبايل - باستخدام expo-av
 */

// مسارات الأصوات
const sounds = {
  successful: require("../../assets/sounds/successful.mp3"),
  error: require("../../assets/sounds/error.wav"),
  notification: require("../../assets/sounds/notification.mp3"),
  login: require("../../assets/sounds/Login.mp3"),
};

/**
 * تشغيل صوت مباشرة
 */
const playSound = async (
  soundPath: any,
  volume: number = 0.6
): Promise<void> => {
  try {
    const { sound } = await Audio.Sound.createAsync(soundPath, {
      volume: Math.max(0, Math.min(1, volume)),
      shouldPlay: true,
    });

    // تنظيف الصوت بعد الانتهاء
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (error) {
    console.log("Sound error:", error);
  }
};

/**
 * تشغيل صوت مع Promise
 */
const playSoundWithDuration = async (
  soundPath: any,
  volume: number = 0.6
): Promise<number> => {
  try {
    const { sound, status } = await Audio.Sound.createAsync(soundPath, {
      volume: Math.max(0, Math.min(1, volume)),
      shouldPlay: true,
    });

    // الحصول على مدة الصوت
    const duration = status.isLoaded ? status.durationMillis || 800 : 800;

    // تنظيف الصوت بعد الانتهاء
    sound.setOnPlaybackStatusUpdate((playbackStatus) => {
      if (playbackStatus.isLoaded && playbackStatus.didJustFinish) {
        sound.unloadAsync();
      }
    });

    return duration;
  } catch (error) {
    console.log("Sound error:", error);
    return 800;
  }
};

/**
 * Sound Player - دوال الأصوات الجاهزة
 */
export const soundPlayer = {
  // عمليات CRUD
  playAdd: () => playSound(sounds.successful, 0.6),
  playUpdate: () => playSound(sounds.successful, 0.6),
  playDelete: () => playSound(sounds.successful, 0.5),

  // حالات النجاح والخطأ
  playError: () => playSound(sounds.error, 0.6),
  playSuccess: () => playSoundWithDuration(sounds.successful, 0.7),

  // إشعارات
  playNotification: () => playSound(sounds.notification, 0.7),

  // تسجيل الدخول/الخروج
  playLogin: () => playSound(sounds.login, 0.6),
  playLogout: () => playSoundWithDuration(sounds.login, 0.5),
};

/**
 * Hook لإدارة الأصوات
 */
interface UseSoundOptions {
  soundPath?: any;
  volume?: number;
}

export const useSound = ({
  soundPath = sounds.notification,
  volume = 0.6,
}: UseSoundOptions = {}) => {
  const play = useCallback(async () => {
    await playSound(soundPath, volume);
  }, [soundPath, volume]);

  const stop = useCallback(() => {
    // في React Native مع expo-av، الصوت يتوقف تلقائياً بعد الانتهاء
    console.log("Sound will auto-stop after playback");
  }, []);

  return {
    playSound: play,
    stopSound: stop,
  };
};
