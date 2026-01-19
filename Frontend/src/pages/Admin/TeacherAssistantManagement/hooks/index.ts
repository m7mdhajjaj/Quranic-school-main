// Core Hooks
export { useTeacherAssistantsData } from './useTeacherAssistantsData';
export { useTeacherAssistantsActions } from './useTeacherAssistantsActions';
export { useTeacherAssistantsStats } from './useTeacherAssistantsStats';
export { useTeacherAssistantForm } from './useTeacherAssistantForm';

// Feature Hooks (تم تقسيمها من Management)
export { useTeacherAssistantFilters } from './useTeacherAssistantFilters';
export { useTeacherAssistantSelection } from './useTeacherAssistantSelection';
export { useTeacherAssistantExport } from './useTeacherAssistantExport';

// Main Management Hook (يستخدم جميع الـ hooks أعلاه)
export { useTeacherAssistantManagement } from './useTeacherAssistantManagement';

