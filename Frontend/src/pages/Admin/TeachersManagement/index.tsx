import React, { useState } from "react";
import { FaUserTie } from "react-icons/fa";
import { useAuth } from "@/hooks/useAuth";

import TeacherForm from "./Model/TeacherForm";
import { EmptyState } from "@/components/UI/EmptyState";
import { LoadingSpinner } from "@/components/UI/LoadingSpinner";
import { StatCardSkeleton } from "@/components/skeletons";

import {
  TeachersHeader,
  TeacherStatsCards,
  TeachersToolbar,
} from "./components";

import {
  useTeachersData,
  useTeachersFilters,
  useTeachersActions,
  useTeachersStats,
} from "./hooks";

import type { ViewMode } from "./types";

// استخدام Components المحلية
import { TeacherGridView } from "./Views/TeacherGridView";
import { TeacherTableView } from "./Views/TeacherTableView";

const TeachersManagement: React.FC = () => {
  const { user: currentUser } = useAuth();

  const userRole = currentUser?.role || "";
  const secretaryPermissions = currentUser?.permissions;
  
  console.log('📋 [TeachersManagement] Current User:', {
    role: userRole,
    permissions: secretaryPermissions,
    teachersAccess: secretaryPermissions?.teachersAccess
  });

  // التحقق من صلاحية السكرتير
  const teachersAccess = React.useMemo(() => {
    if (userRole === 'admin') return 'manage';
    if (userRole === 'secretary') {
      const access = secretaryPermissions?.teachersAccess || 'none';
      console.log('🔑 [TeachersManagement] Secretary Access Level:', access);
      return access;
    }
    return 'none';
  }, [userRole, secretaryPermissions]);

  const hasPermission = React.useMemo(() => {
    const hasAccess = teachersAccess !== 'none';
    console.log('✅ [TeachersManagement] Has Permission:', hasAccess);
    return hasAccess;
  }, [teachersAccess]);

  const isReadOnly = React.useMemo(() => {
    const readOnly = teachersAccess === 'view';
    console.log('👁️ [TeachersManagement] Is ReadOnly:', readOnly);
    return readOnly;
  }, [teachersAccess]);

  // View Mode State
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  // Data Management
  const {
    teachers,
    setTeachers,
    isLoading,
    error,
    retryCount,
    apiStats,
    fetchTeachers,
  } = useTeachersData(hasPermission);

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
    sortField,
    sortOrder,
    handleSort,
    activeFiltersCount,
    resetFilters,
    buildFiltersObject,
  } = useTeachersFilters(fetchTeachers);

  // Actions Management
  const {
    isFormVisible,
    setIsFormVisible,
    isEditMode,
    setIsEditMode,
    selectedTeacher,
    setSelectedTeacher,
    selectedTeachers,
    setSelectedTeachers,
    handleDelete,
    handleEdit,
    handleAddSuccess,
    handleExport,
    handleBulkDelete,
  } = useTeachersActions(teachers, setTeachers, fetchTeachers);

  // Toggle select teacher
  const handleToggleSelect = (teacherId: string) => {
    setSelectedTeachers((prev: Set<string>) => {
      const newSet = new Set(prev);
      if (newSet.has(teacherId)) {
        newSet.delete(teacherId);
      } else {
        newSet.add(teacherId);
      }
      return newSet;
    });
  };

  // Toggle select all
  const handleToggleSelectAll = () => {
    const currentTeachers = teachers.filter((t) => t._id);
    if (selectedTeachers.size === currentTeachers.length) {
      setSelectedTeachers(new Set());
    } else {
      setSelectedTeachers(new Set(currentTeachers.map((t) => t._id || '')));
    }
  };

  // Statistics
  const stats = useTeachersStats(teachers, apiStats);

  // إذا لم يكن لديه أي صلاحية (none)، نظهر رسالة
  if (!hasPermission) {
    console.log('🚫 [TeachersManagement] Access Denied - No Permission');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <FaUserTie className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">غير مصرح</h2>
          <p className="text-gray-600">ليس لديك صلاحية للوصول إلى صفحة المعلمين</p>
          <p className="text-sm text-gray-500 mt-2">يرجى التواصل مع المدير لمنحك الصلاحية</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6" dir="rtl">
      <div className="max-w-full mx-auto">
        {/* Header Section */}
        <TeachersHeader
          onAddTeacher={() => {
            setIsEditMode(false);
            setSelectedTeacher(null);
            setIsFormVisible(true);
          }}
          onExport={() => handleExport(buildFiltersObject())}
          hasTeachers={teachers.length > 0}
          isReadOnly={isReadOnly}
        />

        {/* Read Only Notice for Secretary */}
        {isReadOnly && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaUserTie className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-blue-800">وضع العرض فقط</p>
                <p className="text-sm text-blue-600">
                  يمكنك عرض بيانات المعلمين فقط. للتعديل أو الإضافة، يرجى التواصل مع المدير.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards with Skeleton */}
        {isLoading && teachers.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <TeacherStatsCards
            stats={stats}
          />
        )}

        {/* Toolbar */}
        <TeachersToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
          setShowFilters={setShowFilters}
          activeFiltersCount={activeFiltersCount}
          viewMode={viewMode}
          onViewModeChange={() =>
            setViewMode(viewMode === "table" ? "grid" : "table")
          }
          selectedGender={selectedGender}
          setSelectedGender={setSelectedGender}
          groupsFilter={groupsFilter}
          setGroupsFilter={setGroupsFilter}
          ageRange={ageRange}
          setAgeRange={setAgeRange}
          onResetFilters={resetFilters}
        />

        {/* Bulk Actions - Removed as per Students pattern */}
        {/* <TeachersBulkActions
          selectedCount={selectedTeachers.size}
          onBulkDelete={handleBulkDelete}
        /> */}

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
                  onClick={() => fetchTeachers(retryCount)}
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
        {viewMode === "grid" && teachers.length > 0 && (
          <TeacherGridView
            teachers={teachers}
            onEdit={handleEdit}
            onDelete={(teacher) => handleDelete(teacher._id!)}
            isReadOnly={isReadOnly}
            userRole={userRole}
          />
        )}

        {/* Table View */}
        {viewMode === "table" && teachers.length > 0 && (
          <>
            {/* Bulk Delete Button */}
            {!isReadOnly && selectedTeachers.size > 0 && (
              <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-700">
                  <span className="font-semibold">
                    تم تحديد {selectedTeachers.size} معلم
                  </span>
                </div>
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  حذف المحدد
                </button>
              </div>
            )}
            
            <TeacherTableView
              teachers={teachers}
              onEdit={handleEdit}
              onDelete={(teacher) => handleDelete(teacher._id!)}
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={(field) => handleSort(field as any)}
              selectedTeachers={isReadOnly ? undefined : selectedTeachers}
              onToggleTeacher={isReadOnly ? undefined : handleToggleSelect}
              onToggleAll={isReadOnly ? undefined : handleToggleSelectAll}
              isReadOnly={isReadOnly}
              userRole={userRole}
            />
          </>
        )}

        {/* Loading for Grid */}
        {isLoading && viewMode === "grid" && (
          <LoadingSpinner
            size="lg"
            color="emerald"
            text="جاري تحميل بيانات المعلمين..."
          />
        )}

        {/* Loading for Table */}
        {isLoading && viewMode === "table" && (
          <LoadingSpinner
            size="lg"
            color="emerald"
            text="جاري تحميل بيانات المعلمين..."
          />
        )}

        {/* Empty State */}
        {!isLoading && teachers.length === 0 && (
          <EmptyState
            icon={<FaUserTie className="w-12 h-12" />}
            title={
              activeFiltersCount > 0 || searchTerm
                ? "لا توجد نتائج"
                : "لا يوجد معلمين"
            }
            description={
              activeFiltersCount > 0 || searchTerm
                ? "لم يتم العثور على معلمين يطابقون معايير البحث والفلترة الحالية. جرب تعديل الفلاتر أو البحث عن كلمات مختلفة."
                : "ابدأ رحلتك بإضافة أول معلم إلى النظام. انقر على الزر أدناه للبدء."
            }
            action={
              !searchTerm && activeFiltersCount === 0
                ? {
                    label: "إضافة معلم جديد",
                    onClick: () => {
                      setIsEditMode(false);
                      setSelectedTeacher(null);
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
      </div>

      {/* Teacher Form Modal */}
      {isFormVisible && (
        <TeacherForm
          onClose={() => {
            setIsFormVisible(false);
            setIsEditMode(false);
            setSelectedTeacher(null);
          }}
          onSuccess={handleAddSuccess}
          teacher={isEditMode && selectedTeacher ? selectedTeacher : undefined}
        />
      )}
    </div>
  );
};

export default TeachersManagement;
