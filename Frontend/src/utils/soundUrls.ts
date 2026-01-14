// ============================================================================
// soundUrls.ts - روابط الأصوات من Cloudinary
// ============================================================================

// جميع الأصوات من Cloudinary مباشرة
export const SOUNDS = {
  ADHAN: 'https://res.cloudinary.com/dfi5r4ssx/video/upload/v1768428195/quranic-school/sounds/Adhan.mp3',
  CLICK: 'https://res.cloudinary.com/dfi5r4ssx/video/upload/v1768428196/quranic-school/sounds/click-409642.mp3',
  ERROR: 'https://res.cloudinary.com/dfi5r4ssx/video/upload/v1768428197/quranic-school/sounds/error.wav',
  LOGIN: 'https://res.cloudinary.com/dfi5r4ssx/video/upload/v1768428199/quranic-school/sounds/Login.mp3',
  NOTIFICATION: 'https://res.cloudinary.com/dfi5r4ssx/video/upload/v1768428200/quranic-school/sounds/notification.mp3',
  REMOVE: 'https://res.cloudinary.com/dfi5r4ssx/video/upload/v1768428201/quranic-school/sounds/remove.mp3',
  SUCCESS: 'https://res.cloudinary.com/dfi5r4ssx/video/upload/v1768428202/quranic-school/sounds/successful.mp3',
  SUCCESSFUL: 'https://res.cloudinary.com/dfi5r4ssx/video/upload/v1768428202/quranic-school/sounds/successful.mp3',
} as const;

export type SoundKey = keyof typeof SOUNDS;
