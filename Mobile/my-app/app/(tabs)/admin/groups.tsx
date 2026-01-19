// ============================================================================
// Groups Admin Screen - شاشة إدارة الحلقات (للأدمن)
// ============================================================================

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
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
      {/* Header */}
      <View className="bg-white-600 pt-12 pb-6 px-6">
        <Text className="text-black text-3xl font-bold mb-2">
          إدارة الحلقات
        </Text>
        <Text className="text-blue-400 text-sm">
          إدارة وتنظيم بيانات الحلقات
        </Text>
      </View>

      {/* Content */}
      <FlatList
        ListHeaderComponent={
          <>
            {/* Stats Cards */}
            <View className="px-6 py-4">
              <GroupsStatsCards stats={stats} loading={statsLoading} />
            </View>

            {/* Search & Add */}
            <View className="px-6 pb-4">
              <View className="flex-row gap-3">
                {/* Search */}
                <View className="flex-1 bg-white rounded-xl px-4 py-3 border border-gray-200 flex-row items-center">
                  <Text className="text-gray-400 mr-2">🔍</Text>
                  <TextInput
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                    placeholder="ابحث عن حلقة..."
                    className="flex-1 text-gray-800"
                  />
                </View>

                {/* Add Button */}
                <TouchableOpacity
                  onPress={() => {
                    actions.setSelectedGroup(null);
                    actions.setIsEditMode(false);
                    actions.setIsFormVisible(true);
                  }}
                  className="bg-blue-500 rounded-xl px-6 py-3 justify-center">
                  <Text className="text-white font-bold text-lg">+ إضافة</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Groups List Header */}
            <View className="px-6 pb-2">
              <Text className="text-gray-700 font-bold text-lg">
                قائمة الحلقات ({groups.length})
              </Text>
            </View>
          </>
        }
        data={groups}
        renderItem={({ item }) => null}
        keyExtractor={(item) => item._id}
        ListFooterComponent={
          <View className="px-6">
            <GroupsList
              groups={groups}
              selectedGroups={actions.selectedGroups}
              onToggleSelection={actions.toggleGroupSelection}
              onEdit={actions.handleEdit}
              onDelete={actions.handleDelete}
              teachers={teachers}
              loading={isLoading}
            />
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

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
