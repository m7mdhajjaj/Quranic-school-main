import React from "react";

// Context
import { TeacherAssistantProvider } from "./context";

// Components
import { TeacherAssistantManagementContent } from "./TeacherAssistantManagementContent";

// ============================================================================
// Main Component with Context Provider
// ============================================================================

const TeacherAssistantManagement: React.FC = () => {
  return (
    <TeacherAssistantProvider>
      <TeacherAssistantManagementContent />
    </TeacherAssistantProvider>
  );
};

export default TeacherAssistantManagement;
