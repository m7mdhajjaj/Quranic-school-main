/**
 * Azkar Types
 * جميع الواجهات والأنواع الخاصة بصفحة الأذكار
 */

export interface Dhikr {
  id: number;
  text: string;
  count: number;
  originalCount: number;
}

export interface AzkarCategory {
  id: string;
  title: string;
  icon: string;
  adhkar: Dhikr[];
}

export interface DhikrCardProps {
  text: string;
  count: number;
  originalCount: number;
  isCompleted: boolean;
  onClick: () => void;
  index?: number;
}

export interface AzkarCategoryCardProps {
  icon: string;
  title: string;
  completedCount: number;
  totalCount: number;
  isFullyCompleted: boolean;
  onClick: () => void;
}

export interface AzkarHeaderProps {
  title: string;
  icon: React.ReactNode;
  completedCount: number;
  totalCount: number;
  onBack: () => void;
  onReset: () => void;
}
