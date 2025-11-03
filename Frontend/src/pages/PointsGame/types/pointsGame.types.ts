// types/pointsGame.types.ts
export type PrayerStatus = "mosque" | "home" | "late" | "missed";

export interface Prayer {
  status: PrayerStatus;
}

export interface Prayers {
  fajr: Prayer;
  dhuhr: Prayer;
  asr: Prayer;
  maghrib: Prayer;
  isha: Prayer;
}

export interface Nawafel {
  duha: boolean;
  qiyamAlayl: boolean;
  rawatib: boolean;
  witr: boolean;
}

export interface Adhkar {
  morning: boolean;
  evening: boolean;
  sleep: boolean;
  afterPrayer: boolean;
}

export interface Halaqah {
  memorizedMinutes: number;
  reviewedMinutes: number;
}

export interface DailyPointsData {
  date: string;
  prayers: {
    fajr: PrayerStatus;
    dhuhr: PrayerStatus;
    asr: PrayerStatus;
    maghrib: PrayerStatus;
    isha: PrayerStatus;
  };
  nawafel: Nawafel;
  parentRespect: number;
  schoolAttendance: boolean;
  dailyStudy: number;
  adhkar: Adhkar;
  halaqah: {
    memorizedMinutes: number;
    reviewedMinutes: number;
  };
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  requirement: string;
  count: number;
}

export interface BadgeProgress {
  mosquePrayerStreak: number;
  adhkarStreak: number;
  parentRespectPerfect: number;
  schoolAttendanceStreak: number;
  overallStreak: number;
  sunanStreak: number;
  mosqueTwoPrayersWeek: number;
}

export interface StudentStats {
  weeklyPoints: number;
  monthlyPoints: number;
  currentRank: number;
}

export interface RankingStudent {
  _id: string;
  studentId: string;
  name: string;
  emoji: string;
  rank: number;
  points: number;
  badgesCount?: number;
  totalBadgeRepeats?: number;
  activeDays?: number;
}
