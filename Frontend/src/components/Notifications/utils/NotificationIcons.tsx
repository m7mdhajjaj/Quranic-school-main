// ============================================================================
// Notification Icons - Modern Lucide Icons
// ============================================================================
// أيقونات عصرية وجميلة للإشعارات باستخدام Lucide React

import React from 'react';
import {
  Bell,
  MessageCircle,
  Megaphone,
  Calendar,
  Clock,
  BookOpen,
  GraduationCap,
  Users,
  UserPlus,
  UserMinus,
  UserCog,
  Settings,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Edit3,
  Trash2,
  Plus,
  RefreshCw,
  Star,
  Trophy,
  Target,
  Medal,
  Zap,
  AlertCircle,
  Info,
  Send,
  AtSign,
  FileText,
  ClipboardCheck,
  ClipboardList,
  Shield,
  UserCheck,
  ArrowRightLeft,
  Sparkles,
} from 'lucide-react';
import type { DailyMarkAction, NotificationType, DailyMarkNotificationData } from '../types';

// ============================================================================
// Icon Component Type
// ============================================================================

type IconComponent = React.ReactNode;
type NotificationDataType = DailyMarkNotificationData | { action?: string } & Record<string, unknown>;

// ============================================================================
// Daily Mark Icons
// ============================================================================

export const getDailyMarkIconComponent = (action: DailyMarkAction): IconComponent => {
  const iconClass = "w-4 h-4 text-white";
  
  const actionIcons: Record<DailyMarkAction, IconComponent> = {
    section_added: <Plus className={iconClass} />,
    section_updated: <Edit3 className={iconClass} />,
    section_deleted: <Trash2 className={iconClass} />,
    mark_added: <Star className={iconClass} />,
    mark_updated: <Edit3 className={iconClass} />,
    mark_deleted: <XCircle className={iconClass} />,
  };
  
  return actionIcons[action] || <ClipboardList className={iconClass} />;
};

// ============================================================================
// Main Notification Icons
// ============================================================================

export const getNotificationIconComponent = (type: NotificationType | string, data?: NotificationDataType): IconComponent => {
  const iconClass = "w-4 h-4 text-white";
  
  // للعلامات اليومية، نستخدم أيقونة مخصصة حسب العملية
  if (type === 'daily_marks' && data?.action) {
    return getDailyMarkIconComponent(data.action as DailyMarkAction);
  }
  
  const icons: Record<string, IconComponent> = {
    // ========== General ==========
    general: <Bell className={iconClass} />,
    system: <Settings className={iconClass} />,
    success: <CheckCircle2 className={iconClass} />,
    alert: <AlertCircle className={iconClass} />,
    warning: <AlertTriangle className={iconClass} />,
    message: <MessageCircle className={iconClass} />,
    mention: <AtSign className={iconClass} />,
    news: <Megaphone className={iconClass} />,
    chat: <MessageCircle className={iconClass} />,
    reminder: <Clock className={iconClass} />,
    
    // ========== Academic ==========
    grade: <Star className={iconClass} />,
    daily_marks: <ClipboardCheck className={iconClass} />,
    exam: <FileText className={iconClass} />,
    attendance: <ClipboardList className={iconClass} />,
    quran_progress: <BookOpen className={iconClass} />,
    memorization: <BookOpen className={iconClass} />,
    review: <RefreshCw className={iconClass} />,
    test_result: <ClipboardCheck className={iconClass} />,
    student_update: <GraduationCap className={iconClass} />,
    timetable: <Calendar className={iconClass} />,
    
    // ========== Admin - Teacher ==========
    teacher_added: <UserPlus className={iconClass} />,
    teacher_updated: <UserCog className={iconClass} />,
    teacher_deleted: <UserMinus className={iconClass} />,
    
    // ========== Admin - Student ==========
    student_added: <UserPlus className={iconClass} />,
    student_updated: <UserCog className={iconClass} />,
    student_deleted: <UserMinus className={iconClass} />,
    
    // ========== Admin - Group ==========
    group_assigned: <Users className={iconClass} />,
    group_updated: <Edit3 className={iconClass} />,
    group_deleted: <Trash2 className={iconClass} />,
    group_transferred: <ArrowRightLeft className={iconClass} />,
    
    // ========== Admin - Secretary ==========
    secretary_added: <UserPlus className={iconClass} />,
    secretary_updated: <UserCog className={iconClass} />,
    secretary_deleted: <UserMinus className={iconClass} />,
    
    // ========== Admin - Actions ==========
    admin_action: <Shield className={iconClass} />,
    user_approval: <UserCheck className={iconClass} />,
    role_change: <UserCog className={iconClass} />,
    system_update: <RefreshCw className={iconClass} />,
    
    // ========== Other ==========
    prayer_time: <Sparkles className={iconClass} />,
    goal: <Target className={iconClass} />,
    achievement: <Trophy className={iconClass} />,
    points: <Star className={iconClass} />,
    ranking: <Medal className={iconClass} />,
    other: <Bell className={iconClass} />,
  };
  
  return icons[type] || <Bell className={iconClass} />;
};

// ============================================================================
// Notification Colors (Gradient Classes)
// ============================================================================

export const getNotificationColorClass = (type: NotificationType | string): string => {
  const colors: Record<string, string> = {
    // ========== General ==========
    general: 'from-slate-500 to-slate-600',
    system: 'from-gray-500 to-gray-600',
    success: 'from-emerald-600 via-teal-700 to-slate-700',
    alert: 'from-rose-500 to-rose-600',
    warning: 'from-amber-500 to-amber-600',
    message: 'from-sky-500 to-sky-600',
    mention: 'from-violet-500 to-violet-600',
    news: 'from-cyan-500 to-cyan-600',
    chat: 'from-blue-500 to-blue-600',
    reminder: 'from-orange-500 to-orange-600',
    
    // ========== Academic ==========
    grade: 'from-emerald-600 via-teal-700 to-slate-700',
    daily_marks: 'from-teal-600 via-slate-600 to-emerald-700',
    exam: 'from-indigo-500 to-indigo-600',
    attendance: 'from-amber-500 to-orange-600',
    quran_progress: 'from-emerald-600 via-teal-700 to-slate-700',
    memorization: 'from-green-500 to-green-600',
    review: 'from-teal-600 via-slate-600 to-emerald-700',
    test_result: 'from-blue-500 to-indigo-600',
    student_update: 'from-cyan-500 to-sky-600',
    timetable: 'from-indigo-500 to-purple-600',
    
    // ========== Admin - Teacher ==========
    teacher_added: 'from-emerald-600 via-teal-700 to-slate-700',
    teacher_updated: 'from-blue-500 to-sky-600',
    teacher_deleted: 'from-rose-500 to-red-600',
    
    // ========== Admin - Student ==========
    student_added: 'from-emerald-600 via-teal-700 to-slate-700',
    student_updated: 'from-blue-500 to-sky-600',
    student_deleted: 'from-rose-500 to-red-600',
    
    // ========== Admin - Group ==========
    group_assigned: 'from-emerald-600 via-teal-700 to-slate-700',
    group_updated: 'from-blue-500 to-indigo-600',
    group_deleted: 'from-rose-500 to-red-600',
    group_transferred: 'from-amber-500 to-yellow-600',
    
    // ========== Admin - Secretary ==========
    secretary_added: 'from-emerald-600 via-teal-700 to-slate-700',
    secretary_updated: 'from-blue-500 to-sky-600',
    secretary_deleted: 'from-rose-500 to-red-600',
    
    // ========== Admin - Actions ==========
    admin_action: 'from-slate-500 to-gray-600',
    user_approval: 'from-emerald-600 via-teal-700 to-slate-700',
    role_change: 'from-purple-500 to-violet-600',
    system_update: 'from-blue-500 to-cyan-600',
    
    // ========== Other ==========
    prayer_time: 'from-purple-500 to-violet-600',
    goal: 'from-amber-500 to-yellow-600',
    achievement: 'from-yellow-500 to-amber-600',
    points: 'from-orange-500 to-amber-600',
    ranking: 'from-rose-500 to-pink-600',
    other: 'from-gray-500 to-slate-600',
  };
  
  return colors[type] || 'from-gray-500 to-slate-600';
};

// ============================================================================
// Category Icons for Filter Buttons
// ============================================================================

export const CategoryIcons = {
  all: <Sparkles className="w-4 h-4" />,
  general: <Bell className="w-4 h-4" />,
  academic: <GraduationCap className="w-4 h-4" />,
  admin: <Shield className="w-4 h-4" />,
  other: <Star className="w-4 h-4" />,
};

// ============================================================================
// Time Icon
// ============================================================================

export const TimeIcon = <Send className="w-3 h-3 text-gray-400" />;

// ============================================================================
// Priority Icons
// ============================================================================

export const PriorityIcons = {
  urgent: <Zap className="w-3 h-3" />,
  high: <AlertCircle className="w-3 h-3" />,
  medium: <Info className="w-3 h-3" />,
  low: <Bell className="w-3 h-3" />,
};
