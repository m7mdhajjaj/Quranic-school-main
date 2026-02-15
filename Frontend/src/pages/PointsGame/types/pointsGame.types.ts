// types/pointsGame.types.ts

// ============================================
// Prayer Types
// ============================================
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

// ============================================
// Nawafel Types
// ============================================
export interface Nawafel {
  duha: boolean;
  qiyamAlayl: boolean;
  rawatib: boolean;
  witr: boolean;
}

// ============================================
// Adhkar Types
// ============================================
export interface Adhkar {
  morning: boolean;
  evening: boolean;
  sleep: boolean;
  afterPrayer: boolean;
}

// ============================================
// Halaqah Types
// ============================================
export interface Halaqah {
  memorizedMinutes: number;
  reviewedMinutes: number;
}

// ============================================
// Ramadan Types
// ============================================
export interface Ramadan {
  taraweehRakaat: number;
  quranPages: number;
  fpiasting: boolean;
}

// ============================================
// Daily Points Data
// ============================================
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
  ramadan: Ramadan;
}

// ============================================
// Badge Types
// ============================================
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
  monthlySchoolAttendance?: {
    month: string;
    daysPresent: number;
    lastAttendanceDate?: string | null;
  };
  lastParticipationDate?: string | null;
  lastUpdate?: {
    mosquePrayer?: string | null;
    adhkar?: string | null;
    parentRespect?: string | null;
    sunan?: string | null;
    mosqueTwoPrayers?: string | null;
  };
}

// ============================================
// Student Stats & Rankings
// ============================================
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

// ============================================
// Component Props Interfaces
// ============================================

// MotivationalMessage Component
export interface MotivationalMessageProps {
  totalPoints: number;
}

// NawafelSection Component
export interface NawafelSectionProps {
  nawafel: Nawafel;
  onToggle: (key: keyof Nawafel) => void;
}

// PrayersSection Component
export interface PrayersSectionProps {
  prayers: Prayers;
  onUpdatePrayer: (prayerName: keyof Prayers, status: PrayerStatus) => void;
}

// AdhkarSection Component
export interface AdhkarSectionProps {
  adhkar: Adhkar;
  onToggle: (key: keyof Adhkar) => void;
}

// HalaqahSection Component
export interface HalaqahSectionProps {
  halaqah: Halaqah;
  onUpdate: (key: keyof Halaqah, value: number) => void;
}

// DailyActivitiesSection Component
export interface DailyActivitiesSectionProps {
  parentRespect: number;
  schoolAttendance: boolean;
  dailyStudy: number;
  onParentRespectChange: (value: number) => void;
  onSchoolAttendanceToggle: () => void;
  onDailyStudyChange: (value: number) => void;
}

// RamadanSection Component
export interface RamadanSectionProps {
  ramadan: Ramadan;
  onUpdate: (key: keyof Ramadan, value: number | boolean) => void;
}

// PointsSummaryCard Component
export interface PointsSummaryCardProps {
  totalPoints: number;
  stats: StudentStats | null;
  onShowRankings: () => void;
  onShowBadges: () => void;
  onSavePoints: () => void;
  loading: boolean;
  saving: boolean;
  earnedBadgesCount: number;
}

// BadgesModal Component
export interface BadgesModalProps {
  show: boolean;
  earnedBadges: Badge[];
  badgeProgress: BadgeProgress;
  onClose: () => void;
}

// RankingsModal Component
export interface RankingsModalProps {
  show: boolean;
  loading: boolean;
  rankingType: "points" | "badges";
  realRankings: RankingStudent[];
  realBadgeRankings: RankingStudent[];
  currentUserId: string | undefined;
  currentUserName: string;
  onClose: () => void;
  onChangeType: (type: "points" | "badges") => void;
}

// StudentView Component
export interface StudentViewProps {
  // Stats & Points
  totalPoints: number;
  stats: StudentStats | null;
  earnedBadgesCount: number;
  loading: boolean;
  saving: boolean;

  // Prayers
  prayers: Prayers;
  onUpdatePrayer: (prayerName: keyof Prayers, status: PrayerStatus) => void;

  // Nawafel
  nawafel: Nawafel;
  onToggleNawafel: (key: keyof Nawafel) => void;

  // Daily Activities
  parentRespect: number;
  schoolAttendance: boolean;
  dailyStudy: number;
  onParentRespectChange: (value: number) => void;
  onSchoolAttendanceToggle: () => void;
  onDailyStudyChange: (value: number) => void;

  // Adhkar
  adhkar: Adhkar;
  onToggleAdhkar: (key: keyof Adhkar) => void;

  // Halaqah
  halaqah: Halaqah;
  onUpdateHalaqah: (key: keyof Halaqah, value: number) => void;

  // Ramadan
  ramadan: Ramadan;
  onUpdateRamadan: (key: keyof Ramadan, value: number | boolean) => void;

  // Actions
  onShowRankings: () => void;
  onShowBadges: () => void;
  onSavePoints: () => void;
}

// TeacherRankingsView Component
export interface TeacherRankingsViewProps {
  loading: boolean;
  rankingType: "points" | "badges";
  realRankings: RankingStudent[];
  realBadgeRankings: RankingStudent[];
  onChangeType: (type: "points" | "badges") => void;
  groups?: Array<{
    _id: string;
    name: string;
    totalStudents: number;
  }>;
  selectedGroupId?: string;
  onGroupChange?: (groupId: string) => void;
}

// ============================================
// Teacher Daily Points Types
// ============================================
export interface StudentDailyInfo {
  studentId: string;
  name: string;
  totalPoints: number;
  hasData: boolean;
  date: string;
}

export interface TeacherDailyViewProps {
  groups: Array<{
    _id: string;
    name: string;
    totalStudents: number;
  }>;
  selectedGroupId: string;
  onGroupChange: (groupId: string) => void;
}
