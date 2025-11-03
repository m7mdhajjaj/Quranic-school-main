import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../hooks/useAuth";
import { useMyStudentsSocket } from "../Socket";
import {
  StudentStatsCards,
  StudentToolbar,
  StudentFormModal,
  MyStudentsPageHeader,
  StudentsList,
  useStudentsManagement,
} from "../components/Students";

interface Group {
  id: string;
  name: string;
  number: number;
}

interface TeacherUser {
  _id: string;
  firstName: string;
  lastName?: string;
  role: string;
  groups?: Group[];
}

const MyStudents: React.FC = () => {
  const { user: currentUser } = useAuth();

  // استخدام نظام Socket الجديد
  const {
    isConnected,
    lastUpdate: socketLastUpdate,
    socketId,
  } = useMyStudentsSocket();

  // Cast user to TeacherUser type
  const teacher = currentUser as TeacherUser;
  const teacherGroups = useMemo(() => teacher?.groups || [], [teacher?.groups]);

  // Local states
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;

  // Set default selected group on mount
  useEffect(() => {
    if (teacherGroups.length > 0 && !selectedGroup) {
      setSelectedGroup(teacherGroups[0].name);
    }
  }, [teacherGroups, selectedGroup]);

  // Use students management hook
  const {
    processedStudents,
    isLoading,
    error,
    stats,
    searchTerm,
    setSearchTerm,
    selectedGender,
    setSelectedGender,
    showFilters,
    setShowFilters,
    activeFiltersCount,
    isFormVisible,
    isEditMode,
    selectedStudent,
    fetchStudents,
    handleAddStudent,
    handleEditStudent,
    handleDeleteStudent,
    handleFormClose,
    handleFormSubmit,
    resetFilters,
  } = useStudentsManagement({
    teacherGroups,
    selectedGroup,
    socketLastUpdate,
  });

  // Calculate total pages
  const totalPages = Math.ceil(processedStudents.length / studentsPerPage);

  // Handle group change and reset page
  const handleGroupChange = (group: string) => {
    setSelectedGroup(group);
    setCurrentPage(1);
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8"
      dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <MyStudentsPageHeader
          teacherGroups={teacherGroups}
          selectedGroup={selectedGroup}
          onGroupChange={handleGroupChange}
          totalStudents={stats.total}
          isConnected={isConnected}
          socketId={socketId || undefined}
          lastUpdate={socketLastUpdate}
        />

        {/* Statistics Cards */}
        {selectedGroup && <StudentStatsCards stats={stats} />}

        {/* Toolbar */}
        {selectedGroup && (
          <StudentToolbar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            activeFiltersCount={activeFiltersCount}
            viewMode={viewMode}
            onViewModeChange={() =>
              setViewMode(viewMode === "table" ? "grid" : "table")
            }
            onAddStudent={handleAddStudent}
            onRefresh={fetchStudents}
            isLoading={isLoading}
            selectedGender={selectedGender}
            onGenderChange={setSelectedGender}
            onResetFilters={resetFilters}
          />
        )}

        {/* Students List */}
        {selectedGroup && (
          <StudentsList
            students={processedStudents}
            viewMode={viewMode}
            isLoading={isLoading}
            error={error}
            onEdit={handleEditStudent}
            onDelete={handleDeleteStudent}
            onRetry={fetchStudents}
            onAddStudent={handleAddStudent}
            hasFilters={searchTerm !== "" || selectedGender !== "all"}
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={studentsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Add/Edit Student Form Modal */}
      <StudentFormModal
        isVisible={isFormVisible}
        isEditMode={isEditMode}
        student={selectedStudent}
        onSuccess={handleFormSubmit}
        onClose={handleFormClose}
        defaultGroup={selectedGroup}
        restrictToGroup={selectedGroup}
      />
    </div>
  );
};

export default MyStudents;
