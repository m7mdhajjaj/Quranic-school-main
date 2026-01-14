// ============================================================================
// Audio Manager - إدارة ملفات الصوت مع caching متقدم
// ============================================================================

import { SOUNDS } from './soundUrls';

class AudioManager {
  private static instance: AudioManager;
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  private lastPlayTime: Map<string, number> = new Map();
  private readonly DEBOUNCE_TIME = 2000; // 2 seconds

  private constructor() {}

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  /**
   * تحميل ملف صوتي مسبقاً (preload)
   */
  preload(soundKey: keyof typeof SOUNDS): void {
    if (!this.audioCache.has(soundKey)) {
      const audio = new Audio(SOUNDS[soundKey]);
      audio.preload = 'auto';
      audio.volume = 0.5;
      this.audioCache.set(soundKey, audio);
    }
  }

  /**
   * تشغيل ملف صوتي مع debouncing
   */
  play(soundKey: keyof typeof SOUNDS, volume: number = 0.5): void {
    try {
      const now = Date.now();
      const lastPlay = this.lastPlayTime.get(soundKey) || 0;

      // منع تشغيل نفس الصوت أكثر من مرة خلال DEBOUNCE_TIME
      if (now - lastPlay < this.DEBOUNCE_TIME) {
        return;
      }

      this.lastPlayTime.set(soundKey, now);

      // الحصول على الصوت من cache أو إنشاء جديد
      let audio = this.audioCache.get(soundKey);
      if (!audio) {
        audio = new Audio(SOUNDS[soundKey]);
        audio.volume = volume;
        audio.preload = 'auto';
        this.audioCache.set(soundKey, audio);
      } else {
        audio.volume = volume;
      }

      // إعادة التشغيل من البداية
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } catch {
      // تجاهل الأخطاء
    }
  }

  /**
   * تنظيف الذاكرة
   */
  clearCache(): void {
    this.audioCache.forEach((audio) => {
      audio.pause();
      audio.src = '';
    });
    this.audioCache.clear();
    this.lastPlayTime.clear();
  }
}

// تصدير instance واحد فقط
export const audioManager = AudioManager.getInstance();

// تحميل الأصوات الشائعة مسبقاً
audioManager.preload('SUCCESSFUL');
audioManager.preload('ADHAN');
audioManager.preload('ERROR');
audioManager.preload('NOTIFICATION');

// ============================================================================
// Helper Functions
// ============================================================================

export const playSuccessSound = (volume: number = 0.5) => {
  audioManager.play('SUCCESSFUL', volume);
};

export const playErrorSound = (volume: number = 0.5) => {
  audioManager.play('ERROR', volume);
};

export const playNotificationSound = (volume: number = 0.5) => {
  audioManager.play('NOTIFICATION', volume);
};

export const playAdhanSound = (volume: number = 0.5) => {
  audioManager.play('ADHAN', volume);
};
