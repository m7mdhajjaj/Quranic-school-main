import React, { useEffect, useState } from "react";
import { FaUsers, FaTh } from "react-icons/fa";
import { useAuth } from "@/hooks/useAuth";
import { useDisableBodyScroll } from "@/hooks/useDisableBodyScroll";
import { useGroupsSocket } from "@/Socket";
import AddGroupForm from "@/Forms/AddGroupForm";
import ResponsivePagination from "@/components/UI/ResponsivePagination";
import {
  GroupsHeader,
  GroupsToolbar,
  GroupsFilters,
  GroupsStatsCards,
  GroupsTableView,
} from "./components";
import {
  useGroupsData,
  useGroupsFilters,
  useGroupsActions,
  useGroupsStats,
  useTeachers,
} from "./hooks";
import type { ViewMode } from "./types";

const GroupManagement: React.FC = () => {
  const { user: currentUser } = useAuth();

  // استخدام نظام Socket الجديد مع Heartbeat تلقائي كل 30 ثانية
  const {
    isConnected,
    lastUpdate: socketLastUpdate,
    socketId,
  } = useGroupsSocket();

  const userRole = currentUser?.role || "";
  const hasPermission = userRole === "teacher" || userRole === "admin";

  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [showFilters, setShowFilters] = useState(false);

  // Custom Hooks
  const { groups, setGroups, isLoading, error, fetchGroups, initialLoadDone } =
    useGroupsData();
  const { allTeachers, fetchTeachers, fallbackToGroupTeachers } =
    useTeachers(groups);
  const filters = useGroupsFilters(groups);
  const stats = useGroupsStats(groups);
  const actions = useGroupsActions(setGroups, fetchGroups);

  // تعطيل scroll الصفحة عند فتح الـ Modal
  useDisableBodyScroll(actions.isFormVisible);

  // Socket event handlers - التحديثات الفورية تتم عبر useGroupsSocket Hook
  useEffect(() => {
    if (!hasPermission) return;

    // عند تحديث Socket، نعيد جلب قائمة الحلقات
    if (socketLastUpdate) {
      console.log("🔄 Socket update detected, refreshing groups list...");
      fetchGroups();
    }
  }, [socketLastUpdate, hasPermission, fetchGroups]);

  // Initial load
  useEffect(() => {
    if (!hasPermission) return;

    fetchGroups();
    fetchTeachers();
    initialLoadDone.current = true;

    // Auto refresh every 30 seconds as fallback when socket not connected
    const refreshInterval = setInterval(() => {
      if (!isConnected) {
        console.log("🔄 تحديث تلقائي للحلقات (وضع احتياطي)");
        fetchGroups();
      }
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, [hasPermission, fetchGroups, fetchTeachers, isConnected]);

  // Fallback: Use teachers from groups if API returns empty (only once)
  useEffect(() => {
    fallbackToGroupTeachers();
  }, [fallbackToGroupTeachers]);

  if (!hasPermission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <FaUsers className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">غير مصرح</h2>
          <p className="text-gray-600">ليس لديك صلاحية للوصول إلى هذه الصفحة</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6"
        dir="rtl">
        <div className="max-w-full mx-auto px-2">
          {/* Header Section */}
          <GroupsHeader
            isConnected={isConnected}
            socketId={socketId || null}
            socketLastUpdate={socketLastUpdate}
            onAddClick={() => {
              actions.setSelectedGroup(null);
              actions.setIsEditMode(false);
              actions.setIsFormVisible(true);
            }}
            onExport={() =>
              actions.handleExport(filters.filteredAndSortedGroups)
            }
            hasGroups={filters.filteredAndSortedGroups.length > 0}
          />

          {/* Search and Filters */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
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
              activeFiltersCount={filters.activeFiltersCount}
              onResetFilters={filters.resetFilters}
              selectedCount={actions.selectedGroups.size}
              onBulkDelete={actions.handleBulkDelete}
            />

            {showFilters && (
              <GroupsFilters
                selectedTeacher={filters.selectedTeacher}
                onTeacherChange={(value) => {
                  filters.setSelectedTeacher(value);
                  filters.setCurrentPage(1);
                }}
                allTeachers={allTeachers}
                groups={groups}
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
                occupancyFilter={filters.occupancyFilter}
                onOccupancyChange={(value) => {
                  filters.setOccupancyFilter(value);
                  filters.setCurrentPage(1);
                }}
                dayFilter={filters.dayFilter}
                onDayChange={(value) => {
                  filters.setDayFilter(value);
                  filters.setCurrentPage(1);
                }}
                timeFilter={filters.timeFilter}
                onTimeChange={(value) => {
                  filters.setTimeFilter(value);
                  filters.setCurrentPage(1);
                }}
                groupsPerPage={filters.groupsPerPage}
                onGroupsPerPageChange={(value) => {
                  filters.setGroupsPerPage(value);
                  filters.setCurrentPage(1);
                }}
                activeFiltersCount={filters.activeFiltersCount}
                onReset={filters.resetFilters}
                onClose={() => setShowFilters(false)}
              />
            )}
          </div>

          {/* Statistics Cards */}
          {!isLoading && <GroupsStatsCards stats={stats} />}

          {/* Loading State - Table Skeleton */}
          {isLoading && (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      {Array.from({ length: 8 }).map((_, i) => (
                        <th key={i} className="px-6 py-4 text-right">
                          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Array.from({ length: filters.groupsPerPage }).map(
                      (_, index) => (
                        <tr
                          key={index}
                          className={
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }>
                          {Array.from({ length: 8 }).map((_, i) => (
                            <td key={i} className="px-6 py-4">
                              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                            </td>
                          ))}
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaUsers className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-red-800 mb-2">حدث خطأ</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => fetchGroups()}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all">
                إعادة المحاولة
              </button>
            </div>
          )}

          {/* Table View */}
          {!isLoading && !error && viewMode === "table" && (
            <GroupsTableView
              groups={filters.currentGroups}
              selectedGroups={actions.selectedGroups}
              sortField={filters.sortField}
              sortOrder={filters.sortOrder}
              isLoading={isLoading}
              onSelectAll={() => actions.selectAllGroups(filters.currentGroups)}
              onToggleSelection={actions.toggleGroupSelection}
              onSort={filters.handleSort}
              onEdit={actions.handleEdit}
              onDelete={actions.handleDelete}
            />
          )}

          {/* Grid View - يمكنك إنشاء مكون منفصل لاحقاً */}
          {!isLoading && !error && viewMode === "grid" && (
            <div className="text-center p-12 bg-white rounded-2xl shadow-xl">
              <FaTh className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">عرض الشبكة قيد التطوير</p>
            </div>
          )}

          {/* Enhanced Responsive Pagination */}
          {!isLoading &&
            !error &&
            filters.filteredAndSortedGroups.length > 0 &&
            filters.totalPages > 1 && (
              <ResponsivePagination
                currentPage={filters.currentPage}
                totalPages={filters.totalPages}
                totalItems={filters.filteredAndSortedGroups.length}
                itemsPerPage={filters.groupsPerPage}
                onPageChange={filters.setCurrentPage}
                itemName="حلقة"
                showQuickJump={true}
              />
            )}
        </div>

        {/* Add/Edit Form Modal */}
        {actions.isFormVisible && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {actions.isEditMode ? "تعديل الحلقة" : "إضافة حلقة جديدة"}
                </h2>
                <button
                  onClick={() => {
                    actions.setIsFormVisible(false);
                    actions.setIsEditMode(false);
                    actions.setSelectedGroup(null);
                  }}
                  aria-label="إغلاق النموذج"
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <span className="text-2xl text-gray-500">×</span>
                </button>
              </div>
              <div className="p-6">
                <AddGroupForm
                  group={actions.isEditMode ? actions.selectedGroup : undefined}
                  onSuccess={actions.handleAddSuccess}
                  onClose={() => {
                    actions.setIsFormVisible(false);
                    actions.setIsEditMode(false);
                    actions.setSelectedGroup(null);
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default GroupManagement;
