import React, { useState } from "react";
import { FaUserGraduate } from "react-icons/fa";
import { useAuth } from "@/hooks/useAuth";
import { useDisableBodyScroll } from "@/hooks/useDisableBodyScroll";

import { AddStudentFormWithYup } from './Model';
import {
  StudentGridView,
  StudentTableView,
  StudentStatsCards,
  StudentToolbar,
} from '@/components/Students';

import { EmptyState } from '@/components/UI/EmptyState';
import { LoadingSpinner } from '@/components/UI/LoadingSpinner';
import StudentsHeader from './components/PageHeader';

import {
  useStudentsData,
  useStudentsFilters,
  useStudentsActions,
  useStudentsStats,
} from './hooks';
import type { ViewMode } from './types';

const StudentsManagement: React.FC = () => {
  const { user: currentUser } = useAuth();

  const userRole = currentUser?.role || '';
  const hasPermission = userRole === 'teacher' || userRole === 'admin';

  // View Mode State
  const [viewMode, setViewMode] = useState<ViewMode>('table');

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
    activeFiltersCount,
    filteredAndSortedStudents,
    currentStudents,
    resetFilters,
    buildFiltersObject,
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
    setSelectedStudents,
    handleDelete,
    handleEdit,
    handleAddSuccess,
    handleExport,
    handleBulkDelete,
  } = useStudentsActions(students, setStudents, fetchStudents);

  // Bulk selection handlers
  const toggleStudent = (studentId: string) => {
    setSelectedStudents((prev: Set<string>) => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const toggleAllStudents = () => {
    if (selectedStudents.size === currentStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(currentStudents.map((s) => s._id || '')));
    }
  };

  // Statistics
  const stats = useStudentsStats(students, apiStats);

  // تعطيل scroll الصفحة عند فتح الـ Modal
  useDisableBodyScroll(isFormVisible);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6" dir="rtl">
      <div className="max-w-full mx-auto">
        {/* Header Section */}
        <StudentsHeader
          onAddStudent={() => {
            setIsEditMode(false);
            setSelectedStudent(null);
            setIsFormVisible(true);
          }}
          onExport={() => handleExport(buildFiltersObject())}
          hasStudents={filteredAndSortedStudents.length > 0}
        />
        {/* Stats Cards with Skeleton */}
        {isLoading && students.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                      <div className="h-8 bg-gray-300 rounded w-16"></div>
                      <div className="h-3 bg-gray-100 rounded w-24"></div>
                    </div>
                    <div className="w-12 h-12 bg-gray-100 rounded-lg"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <StudentStatsCards
            stats={{
              total: stats.total,
              male: stats.male,
              female: stats.female,
              avgAge: stats.avgAge,
            }}
          />
        )}

        {/* Toolbar & Filters */}
        <StudentToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
          setShowFilters={setShowFilters}
          activeFiltersCount={activeFiltersCount}
          viewMode={viewMode}
          onViewModeChange={() =>
            setViewMode(viewMode === 'table' ? 'grid' : 'table')
          }
          selectedGender={selectedGender}
          setSelectedGender={setSelectedGender}
          groupsFilter={groupsFilter}
          setGroupsFilter={setGroupsFilter}
          ageRange={ageRange}
          setAgeRange={setAgeRange}
          onResetFilters={resetFilters}
        />

        {/* Statistics Cards */}

        {/* Bulk Actions */}
        {/* <StudentsBulkActions
          selectedCount={selectedStudents.size}
          onBulkDelete={handleBulkDelete}
        /> */}

        {/* Error Display */}
        {error && !isLoading && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6">
            <div className="flex items-start">
              <svg
                className="w-6 h-6 text-red-600 ml-3 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
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
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors text-sm font-medium"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
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
        {viewMode === 'grid' && currentStudents.length > 0 && (
          <StudentGridView
            students={currentStudents}
            onEdit={handleEdit}
            onDelete={(student) => handleDelete(student._id!)}
          />
        )}

        {/* Table View */}
        {viewMode === 'table' && currentStudents.length > 0 && (
          <>
            {/* Bulk Delete Button */}
            {selectedStudents.size > 0 && (
              <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-emerald-700 font-medium">
                    تم تحديد {selectedStudents.size} طالب
                  </span>
                  <button
                    onClick={handleBulkDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    حذف المحدد
                  </button>
                </div>
              </div>
            )}
            <StudentTableView
              students={currentStudents}
              onEdit={handleEdit}
              onDelete={(student) => handleDelete(student._id!)}
              selectedStudents={selectedStudents}
              onToggleStudent={toggleStudent}
              onToggleAll={toggleAllStudents}
            />
          </>
        )}

        {/* Loading Skeleton */}
        {isLoading && viewMode === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden will-change-opacity">
                <div className="animate-pulse">
                  {/* Header */}
                  <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-4 border-b border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="h-6 bg-blue-100 rounded w-16"></div>
                      <div className="flex gap-1.5">
                        <div className="h-5 w-12 bg-gray-100 rounded"></div>
                        <div className="h-5 w-12 bg-gray-100 rounded"></div>
                      </div>
                    </div>
                  </div>
                  {/* Body */}
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-full"></div>
                    <div className="h-3 bg-gray-100 rounded w-5/6"></div>
                    <div className="h-3 bg-gray-100 rounded w-4/6"></div>
                    <div className="flex gap-1.5 pt-2">
                      <div className="h-6 bg-emerald-100 rounded-md w-20"></div>
                      <div className="h-6 bg-gray-100 rounded-md w-24"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loading Spinner for Table View */}
        {isLoading && viewMode === "table" && (
          <LoadingSpinner
            size="lg"
            color="emerald"
            text="جاري تحميل بيانات الطلاب..."
          />
        )}

        {/* Empty State - Only show when NOT loading */}
        {!isLoading && currentStudents.length === 0 && (
          <EmptyState
            icon={<FaUserGraduate className="w-12 h-12" />}
            title={
              activeFiltersCount > 0 || searchTerm
                ? 'لا توجد نتائج'
                : 'لا يوجد طلاب'
            }
            description={
              activeFiltersCount > 0 || searchTerm
                ? 'لم يتم العثور على طلاب يطابقون معايير البحث والفلترة الحالية. جرب تعديل الفلاتر أو البحث عن كلمات مختلفة.'
                : 'ابدأ رحلتك بإضافة أول طالب إلى النظام. انقر على الزر أدناه للبدء.'
            }
            action={
              !searchTerm && activeFiltersCount === 0
                ? {
                    label: 'إضافة طالب جديد',
                    onClick: () => {
                      setIsEditMode(false);
                      setSelectedStudent(null);
                      setIsFormVisible(true);
                    },
                  }
                : {
                    label: 'إعادة تعيين الفلاتر',
                    onClick: resetFilters,
                  }
            }
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
    </div>
  );
};

export default StudentsManagement;
