import React from "react";
import { StudentTableView } from "./StudentTableView";
import { StudentGridView } from "./StudentGridView";
import { Card, EmptyState } from "../UI";
import ResponsivePagination from "../UI/ResponsivePagination";
import type { Student } from "../../Api/studentApi";

type ViewMode = "table" | "grid";

interface StudentsListProps {
  students: Student[];
  viewMode: ViewMode;
  isLoading: boolean;
  error: string | null;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
  onRetry: () => void;
  onAddStudent: () => void;
  hasFilters: boolean;
  // Pagination
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export const StudentsList: React.FC<StudentsListProps> = ({
  students,
  viewMode,
  isLoading,
  error,
  onEdit,
  onDelete,
  onRetry,
  onAddStudent,
  hasFilters,
  currentPage,
  totalPages,
  itemsPerPage,
  onPageChange,
}) => {
  // Calculate pagination
  const indexOfLastStudent = currentPage * itemsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - itemsPerPage;
  const currentStudents = students.slice(
    indexOfFirstStudent,
    indexOfLastStudent
  );

  // Error State
  if (error && !isLoading) {
    return (
      <Card
        variant="outlined"
        padding="lg"
        className="mb-6 border-red-200 bg-red-50">
        <p className="text-red-800 text-center">{error}</p>
        <button
          onClick={onRetry}
          className="mt-4 mx-auto block px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all">
          إعادة المحاولة
        </button>
      </Card>
    );
  }

  // Empty State
  if (!isLoading && students.length === 0) {
    return (
      <Card variant="elevated" padding="xl">
        <EmptyState
          icon="👥"
          title="لا يوجد طلاب"
          description={
            hasFilters
              ? "لم يتم العثور على طلاب بهذه المعايير"
              : "لم يتم إضافة أي طلاب في هذه الحلقة بعد"
          }
          action={
            !hasFilters
              ? {
                  label: "إضافة أول طالب",
                  onClick: onAddStudent,
                  icon: <span>➕</span>,
                }
              : undefined
          }
        />
      </Card>
    );
  }

  // Students List
  if (students.length > 0) {
    return (
      <>
        {viewMode === "table" ? (
          <StudentTableView
            students={currentStudents}
            onEdit={onEdit}
            onDelete={onDelete}
            isLoading={isLoading}
          />
        ) : (
          <StudentGridView
            students={currentStudents}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6">
            <ResponsivePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={students.length}
              itemsPerPage={itemsPerPage}
              onPageChange={onPageChange}
              itemName="طالب"
            />
          </div>
        )}

        {/* Results Info */}
        <div className="mt-4 text-center text-sm text-gray-600">
          عرض {indexOfFirstStudent + 1} إلى{" "}
          {Math.min(indexOfLastStudent, students.length)} من أصل{" "}
          {students.length} طالب
        </div>
      </>
    );
  }

  return null;
};
