import React, { useEffect, useState } from 'react';
import { FaUsers } from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';
import { useDisableBodyScroll } from '@/hooks/useDisableBodyScroll';
import ResponsivePagination from '@/components/UI/ResponsivePagination';
import StatCardSkeleton from '@/components/skeletons/StatCardSkeleton';
import { LoadingSpinner } from '@/components/UI/LoadingSpinner';
import { EmptyState } from '@/components/UI/EmptyState';
import { GroupsHeader, GroupsToolbar, GroupsStatsCards } from './components';
import { GroupsTableView, GroupsCardView } from './Views';
import {
  useGroupsData,
  useGroupsFilters,
  useGroupsActions,
  useGroupsStats,
} from './hooks';
import { AddGroupForm } from './Model';
import type { ViewMode } from './types';
import { getAllTeachers, type Teacher } from '@/Api/teacherApi';

const GroupManagement: React.FC = () => {
  const { user: currentUser } = useAuth();

  const userRole = currentUser?.role || '';
  const secretaryPermissions = currentUser?.permissions;
  
  console.log('📋 [GroupManagement] Current User:', {
    role: userRole,
    permissions: secretaryPermissions,
    groupsAccess: secretaryPermissions?.groupsAccess
  });

  // التحقق من صلاحية السكرتير
  const groupsAccess = React.useMemo(() => {
    if (userRole === 'admin' || userRole === 'teacher') return 'manage';
    if (userRole === 'secretary') {
      const access = secretaryPermissions?.groupsAccess || 'none';
      console.log('🔑 [GroupManagement] Secretary Access Level:', access);
      return access;
    }
    return 'none';
  }, [userRole, secretaryPermissions]);

  const hasPermission = React.useMemo(() => {
    const hasAccess = groupsAccess !== 'none';
    console.log('✅ [GroupManagement] Has Permission:', hasAccess);
    return hasAccess;
  }, [groupsAccess]);

  const isReadOnly = React.useMemo(() => {
    const readOnly = groupsAccess === 'view';
    console.log('👁️ [GroupManagement] Is ReadOnly:', readOnly);
    return readOnly;
  }, [groupsAccess]);

  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [showFilters, setShowFilters] = useState(false);
  
  // تحميل المعلمين مرة واحدة عند تحميل الصفحة
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  // Custom Hooks
  const {
    groups,
    setGroups,
    pagination,
    isLoading,
    error,
    fetchGroups,
    initialLoadDone,
  } = useGroupsData();
  const filters = useGroupsFilters();
  const {
    stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useGroupsStats();
  const actions = useGroupsActions(setGroups, fetchGroups);

  // تعطيل scroll عند فتح Modal
  useDisableBodyScroll(actions.isFormVisible);

  // تحميل المعلمين مرة واحدة عند تحميل الصفحة
  useEffect(() => {
    if (!hasPermission) return;

    const fetchTeachers = async () => {
      setLoadingTeachers(true);
      try {
        const response = await getAllTeachers();
        if (response.success && response.data) {
          setTeachers(response.data);
        }
      } catch (error) {
        console.error("خطأ في تحميل المعلمين:", error);
      } finally {
        setLoadingTeachers(false);
      }
    };

    if (teachers.length === 0 && !loadingTeachers) {
      fetchTeachers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPermission]);

  // جلب البيانات عند تغيير الفلاتر
  useEffect(() => {
    if (!hasPermission) return;

    const params = filters.getFiltersParams();
    fetchGroups(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPermission, filters.getFiltersParams]);

  // Auto-refresh كل 60 ثانية
  useEffect(() => {
    if (!hasPermission) return;
    if (initialLoadDone.current) return;

    initialLoadDone.current = true;

    const refreshInterval = setInterval(() => {
      const params = filters.getFiltersParams();
      Promise.all([fetchGroups(params), refetchStats()]).catch(() => {});
    }, 60000);

    return () => clearInterval(refreshInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPermission]);

  if (!hasPermission) {
    console.log('🚫 [GroupManagement] Access Denied - No Permission');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <FaUsers className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">غير مصرح</h2>
          <p className="text-gray-600">ليس لديك صلاحية للوصول إلى صفحة الحلقات</p>
          <p className="text-sm text-gray-500 mt-2">يرجى التواصل مع المدير لمنحك الصلاحية</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="min-h-screen p-4 md:p-6"
        dir="rtl"
      >
        <div className="max-w-full mx-auto px-2">
          {/* Header Section */}
          <GroupsHeader
            onAddClick={() => {
              actions.setSelectedGroup(null);
              actions.setIsEditMode(false);
              actions.setIsFormVisible(true);
            }}
            onExport={() => actions.handleExport(filters.getFiltersParams())}
            hasGroups={groups.length > 0}
            isConnected={false}
            isReadOnly={isReadOnly}
          />

          {/* Statistics Cards */}
          {statsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <StatCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <GroupsStatsCards stats={stats} />
          )}

          {/* Search and Filters */}
          <GroupsToolbar
            searchTerm={filters.searchTerm}
            onSearchChange={(value) => {
              filters.setSearchTerm(value);
              filters.setCurrentPage(1);
            }}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            setShowFilters={setShowFilters}
            activeFiltersCount={filters.activeFiltersCount}
            onResetFilters={filters.resetFilters}
            selectedCount={actions.selectedGroups.size}
            onBulkDelete={actions.handleBulkDelete}
            capacityFilter={filters.capacityFilter}
            onCapacityChange={(value) => {
              filters.setCapacityFilter(value);
              filters.setCurrentPage(1);
            }}
            statusFilter={filters.statusFilter}
            onStatusChange={(value) => {
              filters.setStatusFilter(value);
              filters.setCurrentPage(1);
            }}
          />

          {/* Loading State */}
          {isLoading && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 py-16">
              <LoadingSpinner
                size="lg"
                color="emerald"
                text="جاري تحميل الحلقات..."
              />
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center shadow-sm">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaUsers className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-red-800 mb-2">
                حدث خطأ في تحميل البيانات
              </h3>
              <p className="text-red-600 text-sm mb-4">{error}</p>
              <button
                onClick={() => {
                  const params = filters.getFiltersParams();
                  Promise.all([fetchGroups(params), refetchStats()]).catch(
                    () => {}
                  );
                }}
                className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm"
              >
                إعادة المحاولة
              </button>
            </div>
          )}

          {/* Table View */}
          {!isLoading && !error && viewMode === 'table' && (
            <GroupsTableView
              groups={groups}
              selectedGroups={actions.selectedGroups}
              sortField={filters.sortField}
              sortOrder={filters.sortOrder}
              isLoading={isLoading}
              onSelectAll={() => actions.selectAllGroups(groups)}
              onToggleSelection={actions.toggleGroupSelection}
              onSort={filters.handleSort}
              onEdit={actions.handleEdit}
              onDelete={actions.handleDelete}
              isReadOnly={isReadOnly}
            />
          )}

          {/* Card/Grid View */}
          {/* TODO: Implement GroupsCardView component */}
          {!isLoading && !error && viewMode === 'grid' && (
            <GroupsCardView
              groups={groups}
              selectedGroups={actions.selectedGroups}
              isLoading={isLoading}
              onSelectAll={() => actions.selectAllGroups(groups)}
              onToggleSelection={actions.toggleGroupSelection}
              onEdit={actions.handleEdit}
              onDelete={actions.handleDelete}
              isReadOnly={isReadOnly}
            />
          )}

          {/* Empty State */}
          {!isLoading && !error && groups.length === 0 && (
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-300">
              <EmptyState
                icon={<FaUsers className="w-16 h-16 text-gray-400" />}
                title="لا توجد حلقات"
                description="ابدأ بإضافة حلقة جديدة"
                action={{
                  label: 'إضافة حلقة جديدة',
                  onClick: () => {
                    actions.setSelectedGroup(null);
                    actions.setIsEditMode(false);
                    actions.setIsFormVisible(true);
                  },
                }}
              />
            </div>
          )}

          {/* Pagination */}
          {!isLoading && !error && pagination && pagination.pages > 1 && (
            <ResponsivePagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              totalItems={pagination.total}
              itemsPerPage={pagination.limit}
              onPageChange={filters.setCurrentPage}
              itemName="حلقة"
              showQuickJump={true}
            />
          )}
        </div>
      </div>

      {/* نموذج إضافة/تعديل الحلقة */}
      {actions.isFormVisible && (
        <AddGroupForm
          group={actions.selectedGroup || undefined}
          teachers={teachers}
          loadingTeachers={loadingTeachers}
          onClose={() => {
            actions.setIsFormVisible(false);
            actions.setIsEditMode(false);
            actions.setSelectedGroup(null);
          }}
          onSuccess={actions.handleAddSuccess}
        />
      )}
    </>
  );
};

export default GroupManagement;
