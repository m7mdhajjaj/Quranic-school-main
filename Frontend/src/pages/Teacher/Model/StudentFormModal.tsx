import React from "react";
import { AddStudentFormWithYup } from "@/pages/Admin/StudentsManagement/Model";
import type { Student } from "@/Api/studentApi";

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  student?: Student;
  defaultGroup?: string;
  restrictToGroup?: string;
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  student,
  defaultGroup,
  restrictToGroup,
}) => {
  if (!isOpen) return null;

  return (
    <AddStudentFormWithYup
      onClose={onClose}
      onSuccess={() => {
        onSuccess();
        onClose();
      }}
      student={student}
      defaultGroup={defaultGroup}
      restrictToGroup={restrictToGroup}
    />
  );
};
