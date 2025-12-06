import React, { useState, useEffect } from "react";
import { FaUserGraduate } from "react-icons/fa";
import { useAuth } from "@/hooks/useAuth";
import { useStudentsSocket } from "../../../Socket";
import { socketManager } from "@/Socket/SocketManager";

import AddStudentFormWithYup from "../../../Forms/AddStudentForm";
import ResponsivePagination from "@/components/UI/ResponsivePagination";
import {
  StudentGridView,
  StudentTableView,
  StudentStatsCards,
  StudentToolbar,
} from "@/components/Students";

import StudentsHeader from "./components/StudentsHeader";
import StudentsFilters from "./components/StudentsFilters";
import StudentsBulkActions from "./components/StudentsBulkActions";
import { EmptyState } from "@/components/UI/EmptyState";
import { LoadingSpinner } from "@/components/UI/LoadingSpinner";

import {
  useStudentsData,
  useStudentsFilters,
  useStudentsActions,
  useStudentsStats,
} from "./hooks";
import type { ViewMode } from "./types";

const StudentsManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const {
    isConnected,
    lastUpdate: socketLastUpdate,
    socketId,
  } = useStudentsSocket();

  const userRole = currentUser?.role || "";
  const hasPermission = userRole === "teacher" || userRole === "admin";

  // View Mode State
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  // Data Management
  const {
    students,
    setStudents,
    isLoading,
    error,
    retryCount,
    apiStats,
    fetchStudents,
  } = useStudentsData(hasPermission);

  // Filters Management
  const {
    searchTerm,
    setSearchTerm,
    selectedGender,
    setSelectedGender,
    groupsFilter,
    setGroupsFilter,
    ageRange,
    setAgeRange,
    showFilters,
    setShowFilters,
    currentPage,
    setCurrentPage,
    studentsPerPage,
    setStudentsPerPage,
    activeFiltersCount,
    filteredAndSortedStudents,
    currentStudents,
    totalPages,
    resetFilters,
  } = useStudentsFilters(students, fetchStudents);

  // Actions Management
  const {
    isFormVisible,
    setIsFormVisible,
    isEditMode,
    setIsEditMode,
    selectedStudent,
    setSelectedStudent,
    selectedStudents,
    handleDelete,
    handleEdit,
    handleAddSuccess,
    handleExport,
    handleBulkDelete,
  } = useStudentsActions(students, setStudents, fetchStudents);

  // Statistics
  const stats = useStudentsStats(students, apiStats);

  // Socket updates
  useEffect(() => {
    if (!hasPermission) return;

    if (socketLastUpdate) {
      console.log("🔄 Socket update detected, refreshing students list...");
      fetchStudents();
    }
  }, [socketLastUpdate, hasPermission, fetchStudents]);

  // Real-time user status updates
  useEffect(() => {
    if (!hasPermission) return;

    const handleUserStatusChange = (data: {
      userId: string;
      isActive: boolean;
      lastSeen?: string;
    }) => {
      console.log("👤 User status changed:", data);
      
      // تحديث حالة الطالب في القائمة
      setStudents((prevStudents) =>
        prevStudents.map((student) =>
          student._id === data.userId
            ? {
                ...student,
                isActive: data.isActive,
                lastSeen: data.lastSeen ? new Date(data.lastSeen) : student.lastSeen,
              }
            : student
        )
      );
    };

    const socket = socketManager.getSocket();
    if (socket) {
      socket.on("userStatusChange", handleUserStatusChange);
    }

    return () => {
      const socket = socketManager.getSocket();
      if (socket) {
        socket.off("userStatusChange", handleUserStatusChange);
      }
    };
  }, [hasPermission, setStudents]);

  // Auto refresh when not connected
  useEffect(() => {
    if (!hasPermission || isConnected) return;

    const autoRefreshInterval = setInterval(() => {
      console.log("🔄 Auto refreshing students data...");
      fetchStudents();
    }, 60000);

    return () => clearInterval(autoRefreshInterval);
  }, [hasPermission, isConnected, fetchStudents]);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6 relative"
      dir="rtl">
      {/* Background Design */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none opacity-5 z-0">
        <div className="relative">
          <div className="absolute left-1/2 top-0 w-0.5 h-screen bg-gradient-to-b from-blue-400 via-indigo-500 to-purple-600 transform -translate-x-1/2"></div>
          <div className="absolute top-1/2 left-0 h-0.5 w-screen bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 transform -translate-y-1/2"></div>
          <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center shadow-2xl">
            <FaUserGraduate className="w-16 h-16 text-white opacity-70" />
          </div>
          <div className="absolute top-1/2 left-1/2 w-48 h-48 border-2 border-blue-300 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 border border-indigo-200 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-ping"></div>
        </div>
      </div>

      <div className="max-w-full mx-auto relative z-10 px-2">
        {/* Header Section */}
        <StudentsHeader
          isConnected={isConnected}
          socketLastUpdate={socketLastUpdate}
          socketId={socketId || null}
          onAddStudent={() => {
            setIsEditMode(false);
            setSelectedStudent(null);
            setIsFormVisible(true);
          }}
          onExport={() => handleExport(filteredAndSortedStudents)}
          hasStudents={filteredAndSortedStudents.length > 0}
        />

        {/* Toolbar */}
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
          onAddStudent={() => {
            setIsEditMode(false);
            setSelectedStudent(null);
            setIsFormVisible(true);
          }}
          onRefresh={() => fetchStudents()}
          isLoading={isLoading}
          selectedGender={selectedGender}
          onGenderChange={setSelectedGender}
          onResetFilters={resetFilters}
        />

        {/* Extended Filters */}
        {showFilters && (
          <StudentsFilters
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            searchTerm={searchTerm}
            selectedGender={selectedGender}
            setSelectedGender={setSelectedGender}
            groupsFilter={groupsFilter}
            setGroupsFilter={setGroupsFilter}
            ageRange={ageRange}
            setAgeRange={setAgeRange}
            studentsPerPage={studentsPerPage}
            setStudentsPerPage={(perPage) => {
              setStudentsPerPage(perPage);
              setCurrentPage(1);
            }}
            activeFiltersCount={activeFiltersCount}
          />
        )}

        {/* Statistics Cards */}
        {!isLoading && (
          <StudentStatsCards
            stats={{
              total: stats.total,
              male: stats.male,
              female: stats.female,
              avgAge: stats.avgAge,
            }}
          />
        )}

        {/* Bulk Actions */}
        <StudentsBulkActions
          selectedCount={selectedStudents.size}
          onBulkDelete={handleBulkDelete}
        />

        {/* Error Display */}
        {error && !isLoading && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6">
            <div className="flex items-start">
              <svg
                className="w-6 h-6 text-red-600 ml-3 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-2">
                  مشكلة في تحميل البيانات
                </h3>
                <p className="text-red-700 mb-4">{error}</p>
                <button
                  onClick={() => fetchStudents(retryCount)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors text-sm font-medium">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                      clipRule="evenodd"
                    />
                  </svg>
                  المحاولة مرة أخرى
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Grid View */}
        {viewMode === "grid" && !isLoading && currentStudents.length > 0 && (
          <StudentGridView
            students={currentStudents}
            onEdit={handleEdit}
            onDelete={(student) => handleDelete(student._id!)}
          />
        )}

        {/* Table View */}
        {viewMode === "table" && !isLoading && currentStudents.length > 0 && (
          <StudentTableView
            students={currentStudents}
            onEdit={handleEdit}
            onDelete={(student) => handleDelete(student._id!)}
          />
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && currentStudents.length === 0 && (
          <EmptyState
            icon={<FaUserGraduate className="w-12 h-12" />}
            title={
              activeFiltersCount > 0 || searchTerm
                ? "لا توجد نتائج"
                : "لا يوجد طلاب"
            }
            description={
              activeFiltersCount > 0 || searchTerm
                ? "لم يتم العثور على طلاب يطابقون معايير البحث والفلترة الحالية. جرب تعديل الفلاتر أو البحث عن كلمات مختلفة."
                : "ابدأ رحلتك بإضافة أول طالب إلى النظام. انقر على الزر أدناه للبدء."
            }
            action={
              !searchTerm && activeFiltersCount === 0
                ? {
                    label: "إضافة طالب جديد",
                    onClick: () => {
                      setIsEditMode(false);
                      setSelectedStudent(null);
                      setIsFormVisible(true);
                    },
                  }
                : {
                    label: "إعادة تعيين الفلاتر",
                    onClick: resetFilters,
                  }
            }
          />
        )}

        {/* Pagination */}
        {!isLoading && currentStudents.length > 0 && totalPages > 1 && (
          <ResponsivePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredAndSortedStudents.length}
            itemsPerPage={studentsPerPage}
            onPageChange={setCurrentPage}
            itemName="طالب"
            showQuickJump={true}
          />
        )}
      </div>

      {/* Student Form Modal */}
      {isFormVisible && (
        <AddStudentFormWithYup
          onClose={() => {
            setIsFormVisible(false);
            setIsEditMode(false);
            setSelectedStudent(null);
          }}
          onSuccess={handleAddSuccess}
          student={isEditMode && selectedStudent ? selectedStudent : undefined}
        />
      )}

      {/* Custom Styles */}
      <style>{`
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        input[type="range"]:focus::-webkit-slider-thumb {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default StudentsManagement;
