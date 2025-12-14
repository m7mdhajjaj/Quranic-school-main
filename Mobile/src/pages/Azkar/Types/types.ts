/**
 * Azkar Types (Mobile)
 * مطابق لملفات Frontend مع تكييف بسيط لـ React Native
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
  onPress: () => void;
}

export interface AzkarCategoryCardProps {
  icon: string;
  title: string;
  completedCount: number;
  totalCount: number;
  isFullyCompleted: boolean;
  onPress: () => void;
}

export interface AzkarHeaderProps {
  title: string;
  icon: string;
  completedCount: number;
  totalCount: number;
  onBack: () => void;
  onReset: () => void;
}
