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

// News
export * from './newsApi';

// Rankings
// export * from './rankingApi';

// Exams
export * from './examApi';

// Sessions/Timetable
export * from './ي/sessionApi';

// Settings
export * from './ي/settingsApi';

// Attendance
export * from './attendanceApi';

// Daily Marks
export * from './markApi';

// Sections (Daily Assignments)
export * from './ي/sectionApi';


// Activities
export * from './activityApi';

// Chat
export * from './ي/chatApi3';

// Profile
export * from './profileApi';

// Notifications
export * from './ي/notificationApi';

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
