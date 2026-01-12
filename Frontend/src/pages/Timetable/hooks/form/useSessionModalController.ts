import { useSearchParams } from "react-router-dom";
import { useSessionForm } from "./useSessionForm";
import { useTeachers } from "../selection/useTeachers";
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
}

export const useSessionModalController = ({
  isOpen,
  onClose,
  onSubmit,
  editingSession,
  role
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
    initialSectionId,
    initialGroupName,
  });

  // 2. Teachers Data Fetching
  const { teachers, loadingTeachers } = useTeachers({
    isOpen,
    enabled: role === "admin",
    onlyWithGroups: true,
  });
  
  // 3. Submission Logic
  const { loading, handleSubmit, handleClose } = useSessionModalLogic({
    onSubmit,
    editingSession,
    onClose,
    resetForm,
    bookedHours,
    formData,
  });

  // 4. Selected Teacher Helper
  const { selectedTeacher } = useTeacherSelection({
    teachers,
    teacherId: formData.teacherId,
  });

  // 5. Duration Calculation
  const duration = useSessionDuration({
    startHour: formData.startHour,
    endHour: formData.endHour,
    hours,
  });

  // 6. Helper Values
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
    selectedTeacher,
    loading,
    handleSubmit,
    handleClose,
  };
};
