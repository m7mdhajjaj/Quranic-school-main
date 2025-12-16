// ============================================================================
// Audio Manager - إدارة ملفات الصوت مع caching متقدم (React Native)
// ============================================================================

import { Audio } from "expo-av";

class AudioManager {
  private static instance: AudioManager;
  private audioCache: Map<string, Audio.Sound> = new Map();
  private lastPlayTime: Map<string, number> = new Map();
  private readonly DEBOUNCE_TIME = 2000; // 2 seconds

  private constructor() {
    // تهيئة إعدادات الصوت في React Native
    this.initializeAudio();
  }

  private async initializeAudio() {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
    } catch (error) {
      if (__DEV__) {
        console.error("Failed to initialize audio:", error);
      }
    }
  }

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  /**
   * تحميل ملف صوتي مسبقاً (preload)
   */
  async preload(soundFile: string): Promise<void> {
    if (this.audioCache.has(soundFile)) {
      return;
    }

    try {
      // مسارات الأصوات في React Native
      const soundMap: Record<string, any> = {
        "successful.mp3": require("../assets/sounds/successful.mp3"),
        "Adhan.mp3": require("../assets/sounds/Adhan.mp3"),
        "error.wav": require("../assets/sounds/error.wav"),
        "notification.mp3": require("../assets/sounds/notification.mp3"),
      };

      const soundSource = soundMap[soundFile];
      if (!soundSource) {
        if (__DEV__) {
          console.warn(`Sound file not found: ${soundFile}`);
        }
        return;
      }

      const { sound } = await Audio.Sound.createAsync(soundSource, {
        volume: 0.5,
        shouldPlay: false,
      });

      this.audioCache.set(soundFile, sound);
    } catch (error) {
      if (__DEV__) {
        console.error(`Failed to preload sound: ${soundFile}`, error);
      }
    }
  }

  /**
   * تشغيل ملف صوتي مع debouncing
   */
  async play(soundFile: string, volume: number = 0.5): Promise<void> {
    try {
      const now = Date.now();
      const lastPlay = this.lastPlayTime.get(soundFile) || 0;

      // منع تشغيل نفس الصوت أكثر من مرة خلال DEBOUNCE_TIME
      if (now - lastPlay < this.DEBOUNCE_TIME) {
        if (__DEV__) {
          console.log(
            `🔇 Sound blocked: ${soundFile} - played ${now - lastPlay}ms ago`
          );
        }
        return;
      }

      this.lastPlayTime.set(soundFile, now);

      // الحصول على الصوت من cache أو تحميل جديد
      let sound = this.audioCache.get(soundFile);

      if (!sound) {
        await this.preload(soundFile);
        sound = this.audioCache.get(soundFile);
      }

      if (!sound) {
        return;
      }

      // ضبط مستوى الصوت والتشغيل
      await sound.setVolumeAsync(volume);
      await sound.setPositionAsync(0); // إعادة التشغيل من البداية
      await sound.playAsync();
    } catch (error) {
      if (__DEV__) {
        console.error(`Error in AudioManager.play:`, error);
      }
    }
  }

  /**
   * تنظيف الذاكرة - إزالة الصوتيات غير المستخدمة
   */
  async clearCache(): Promise<void> {
    try {
      for (const [key, sound] of this.audioCache) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }
      this.audioCache.clear();
      this.lastPlayTime.clear();
    } catch (error) {
      if (__DEV__) {
        console.error("Error clearing audio cache:", error);
      }
    }
  }

  /**
   * إزالة صوت محدد من cache
   */
  async remove(soundFile: string): Promise<void> {
    try {
      const sound = this.audioCache.get(soundFile);
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        this.audioCache.delete(soundFile);
        this.lastPlayTime.delete(soundFile);
      }
    } catch (error) {
      if (__DEV__) {
        console.error(`Error removing sound: ${soundFile}`, error);
      }
    }
  }
}

// تصدير instance واحد فقط
export const audioManager = AudioManager.getInstance();

// تحميل الأصوات الشائعة مسبقاً
audioManager.preload("successful.mp3");
audioManager.preload("Adhan.mp3");
audioManager.preload("error.wav");
audioManager.preload("notification.mp3");
