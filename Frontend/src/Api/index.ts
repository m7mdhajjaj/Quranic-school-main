// ============================================================================
// API Index - Central Export for All API Modules
// ============================================================================
// This file exports all API functions from their respective modules
// Import from this file to access any API function across the application
// ============================================================================

// Base API instance
export { default as api } from './api';

// Authentication
export * from './authApi';

// Profile
export * from './profileApi';

// News
export * from './newsApi';

// Rankings
export * from './rankingApi';

// Exams
export * from './examApi';

// Tests (Quran Tests)
export * from './testApi';

// Sessions/Timetable
export * from './sessionApi';

// Goals
export * from './goalsApi';

// Attendance
export * from './attendanceApi';

// Daily Marks
export * from './markApi';

// Activities
export * from './activityApi';

// Chat
export * from './chatApi';

// Reports
export * from './reportApi';

// Students
export * from './studentApi';

// Teachers  
export * from './teacherApi';

// Groups
export * from './groupApi';

// Prayer Times
export * from './prayerTimesApi';

// Quran Audio
export * from './quranAudioApi';

// Admin Dashboard
export * from './adminApi';

// Contact/Settings
export * from './contactApi';

// Notifications
export * from './ي/notificationApi';

// Sections (Daily Assignments)
export * from './ي/sectionApi';

// Reports
export { getStudentMarks as getStudentMarksReport } from './reportApi';

// Admin APIs (existing)
export * from './adminApi';

// Student APIs (existing)
export * from './studentApi';

// Teacher APIs (existing)
export * from './teacherApi';

// Group APIs (existing)
export * from './groupApi';

// Dashboard APIs (existing)
export * from './dashboardApi';

// Quran Audio
export * from './quranAudioApi';

// export * from './goalsApi3'
