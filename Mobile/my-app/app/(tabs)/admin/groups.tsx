// ============================================================================
// Groups Admin Screen - شاشة إدارة الحلقات (للأدمن)
// ============================================================================

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from "react-native";
import { useAuth } from "@/Context/AuthContext";
import {
  useGroupsData,
  useGroupsActions,
  useGroupsStats,
} from "@/hooks/groups";
import {
  GroupsList,
  GroupsStatsCards,
  AddGroupModal,
} from "@/components/groups";
import { getAllTeachers, type Teacher } from "@/Api/teacherApi";

export default function GroupsAdminScreen() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  const hasPermission = user?.role === "admin" || user?.role === "teacher";

  // Hooks
  const { groups, setGroups, isLoading, error, fetchGroups, initialLoadDone } =
    useGroupsData();
  const {
    stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useGroupsStats();
  const actions = useGroupsActions(setGroups, fetchGroups);

  // Load teachers
  useEffect(() => {
    if (!hasPermission) return;

    const loadTeachers = async () => {
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

    loadTeachers();
  }, [hasPermission]);

  // Load groups
  useEffect(() => {
    if (!hasPermission) return;

    const params = searchTerm ? { search: searchTerm } : {};
    fetchGroups(params);
  }, [hasPermission, searchTerm]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    if (!hasPermission || initialLoadDone.current) return;

    initialLoadDone.current = true;

    const refreshInterval = setInterval(() => {
      Promise.all([fetchGroups(), refetchStats()]).catch(() => {});
    }, 60000);

    return () => clearInterval(refreshInterval);
  }, [hasPermission]);

  if (!hasPermission) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center p-4">
        <Text className="text-6xl mb-4">🚫</Text>
        <Text className="text-2xl font-bold text-gray-800 mb-2">غير مصرح</Text>
        <Text className="text-gray-600 text-center">
          ليس لديك صلاحية للوصول إلى هذه الصفحة
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Loading State */}
      {isLoading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#10b981" />
          <Text className="text-center text-gray-500 mt-4">
            جاري تحميل الحلقات...
          </Text>
        </View>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <View className="flex-1 items-center justify-center px-4">
          <View className="bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center shadow-sm">
            <Text className="text-6xl mb-4">⚠️</Text>
            <Text className="text-xl font-bold text-red-800 mb-2">
              حدث خطأ في تحميل البيانات
            </Text>
            <Text className="text-red-600 text-sm mb-4">{error}</Text>
            <TouchableOpacity
              onPress={() => {
                Promise.all([fetchGroups(), refetchStats()]).catch(() => {});
              }}
              className="bg-red-600 px-6 py-3 rounded-lg">
              <Text className="text-white font-semibold text-center">
                إعادة المحاولة
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Groups List with Header */}
      {!isLoading && !error && (
        <GroupsList
          groups={groups}
          selectedGroups={actions.selectedGroups}
          onToggleSelection={actions.toggleGroupSelection}
          onEdit={actions.handleEdit}
          onDelete={actions.handleDelete}
          teachers={teachers}
          ListHeaderComponent={
            <>
              {/* Header */}
              <View className="bg-white rounded-2xl p-6 mb-6 shadow-lg border border-gray-200 mt-6">
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-1">
                    <Text className="text-2xl font-bold text-gray-900">
                      إدارة الحلقات
                    </Text>
                    <Text className="text-gray-600 text-sm mt-1">
                      إضافة وتعديل وحذف الحلقات
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      actions.setSelectedGroup(null);
                      actions.setIsEditMode(false);
                      actions.setIsFormVisible(true);
                    }}
                    className="bg-emerald-500 rounded-xl px-6 py-3 shadow-md"
                    style={{ elevation: 4 }}>
                    <Text className="text-white font-bold text-base">
                      + إضافة حلقة
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Search */}
                <View className="relative">
                  <TextInput
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                    placeholder="🔍 ابحث عن حلقة..."
                    className="bg-gray-50 rounded-xl px-4 py-3 text-gray-800 border border-gray-200"
                  />
                </View>
              </View>

              {/* Statistics Cards */}
              {statsLoading ? (
                <View className="mb-6">
                  <ActivityIndicator size="large" color="#10b981" />
                </View>
              ) : (
                <GroupsStatsCards stats={stats} />
              )}

              {/* Empty State */}
              {groups.length === 0 && (
                <View className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12">
                  <Text className="text-6xl text-center mb-4">📚</Text>
                  <Text className="text-gray-900 font-bold text-xl text-center mb-2">
                    لا توجد حلقات
                  </Text>
                  <Text className="text-gray-600 text-center mb-6">
                    ابدأ بإضافة حلقة جديدة
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      actions.setSelectedGroup(null);
                      actions.setIsEditMode(false);
                      actions.setIsFormVisible(true);
                    }}
                    className="bg-emerald-500 px-6 py-3 rounded-xl">
                    <Text className="text-white font-bold text-center">
                      إضافة حلقة جديدة
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          }
        />
      )}

      {/* Add/Edit Modal */}
      {actions.isFormVisible && (
        <AddGroupModal
          visible={actions.isFormVisible}
          onClose={() => {
            actions.setIsFormVisible(false);
            actions.setIsEditMode(false);
            actions.setSelectedGroup(null);
          }}
          onSuccess={actions.handleAddSuccess}
          group={actions.selectedGroup || undefined}
          teachers={teachers}
        />
      )}
    </View>
  );
}
