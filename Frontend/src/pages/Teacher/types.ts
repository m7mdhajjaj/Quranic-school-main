import type { Group, GroupWithStudents } from "@/Api/groupApi";
import type { Student } from "@/Api/studentApi";

// Re-export types
export type { Group, GroupWithStudents, Student };

export interface TeacherGroup extends Omit<GroupWithStudents, 'activeStatus'> {
  _id: string;
  name: string;
  teacher: string;
  capacity?: number;
  currentStudents?: number;
  totalStudents?: number;
  activeStatus?: boolean;
  hasStudents?: boolean;
  isEmpty?: boolean;
}

export interface GroupCardProps {
  group: TeacherGroup;
  onClick: () => void;
}

export interface StudentsListProps {
  groupId: string;
  groupName: string;
  onBack: () => void;
}

export interface StudentFormProps {
  onClose: () => void;
  onSuccess: () => void;
  student?: Student;
  defaultGroup?: string;
  restrictToGroup?: string;
}
