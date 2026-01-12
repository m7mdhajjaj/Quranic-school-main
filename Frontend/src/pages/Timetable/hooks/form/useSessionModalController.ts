import { useSearchParams } from "react-router-dom";
import { useSessionForm } from "./useSessionForm";
import { useTeachers } from "../selection/useTeachers";
import { useTeacherGroups } from "../selection/useTeacherGroups";
import { useSessionModalLogic } from "./useSessionModalLogic";
import { useTeacherSelection } from "../selection/useTeacherSelection";
import { useSessionDuration } from "./useSessionDuration";
import { getDayNameFromDate } from "../../utils";
import type { Session, SessionFormData, UserRole } from "../../types/timetable.types";

interface UseSessionModalControllerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: SessionFormData, sessionId?: string) => Promise<boolean>;
  editingSession: Session | null;
  role: UserRole;
  teacherGroups?: string[];
}

export const useSessionModalController = ({
  isOpen,
  onClose,
  onSubmit,
  editingSession,
  role,
  teacherGroups = [],
}: UseSessionModalControllerProps) => {
  const [searchParams] = useSearchParams();
  const initialSectionId = searchParams.get('sectionId') || undefined;
  const initialGroupName = searchParams.get('groupName') || undefined;

  // 1. Form State Management
  const { 
    formData, 
    setFormData, 
    hours, 
    bookedHours, 
    handleStartHourChange, 
    handleDateChange, 
    resetForm 
  } = useSessionForm({
    editingSession,
    role,
    teacherGroups,
    initialSectionId,
    initialGroupName,
  });

  // 2. Teachers Data Fetching
  const { teachers, loadingTeachers } = useTeachers({
    isOpen,
    enabled: role === "admin",
    onlyWithGroups: true,
  });

  // 3. Teacher Groups Data Fetching
  const { teacherGroups: teacherGroupsList, loadingGroups } = useTeacherGroups({
    teacherId: formData.teacherId,
    isOpen,
    enabled: role === "admin",
  });
  
  // 4. Submission Logic
  const { loading, handleSubmit, handleClose } = useSessionModalLogic({
    onSubmit,
    editingSession,
    onClose,
    resetForm,
    bookedHours,
    formData,
  });

  // 5. Selected Teacher Helper
  const { selectedTeacher } = useTeacherSelection({
    teachers,
    teacherId: formData.teacherId,
  });

  // 6. Duration Calculation
  const duration = useSessionDuration({
    startHour: formData.startHour,
    endHour: formData.endHour,
    hours,
  });

  // 7. Helper Values
  const selectedDayName = formData.sessionDate ? getDayNameFromDate(formData.sessionDate) : '';

  return {
    formData,
    setFormData,
    hours,
    bookedHours,
    handleStartHourChange,
    handleDateChange,
    selectedDayName,
    duration,
    teachers,
    loadingTeachers,
    teacherGroupsList,
    loadingGroups,
    selectedTeacher,
    loading,
    handleSubmit,
    handleClose,
  };
};
