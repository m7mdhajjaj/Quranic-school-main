import { memo } from "react";
import type { TeacherViewProps } from "../types/types";
import { SectionsTable } from "./SectionsTable";
import { EmptyState, Card } from "@/components/UI";

/**
 * Teacher view component - Shows marks table for selected student
 */
const TeacherViewComponent = ({
  students,
  selectedStudentId,
  sections,
  marks,
  loadingMarks,
  onAddMark,
  onUpdateMark,
  onEditSection,
  onDeleteSection,
}: TeacherViewProps) => {
  const getSelectedStudent = () => {
    return students.find((s) => s._id === selectedStudentId);
  };

  const selectedStudent = getSelectedStudent();

  return (
    <div className="animate-fade-in">
      {selectedStudentId && selectedStudent ? (
        <Card className="overflow-hidden p-0 shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <SectionsTable
            sections={sections}
            marks={marks}
            loadingMarks={loadingMarks}
            isTeacher={true}
            onAddMark={onAddMark}
            onUpdateMark={onUpdateMark}
            onEditSection={onEditSection}
            onDeleteSection={onDeleteSection}
          />
        </Card>
      ) : (
        <EmptyState
          title="الرجاء اختيار طالب"
          description="اختر طالباً من القائمة لعرض علاماته"
        />
      )}
    </div>
  );
};

export const TeacherView = memo(TeacherViewComponent);
