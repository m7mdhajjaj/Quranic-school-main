// ============================================================================
// Secretary Teachers Screen - شاشة عرض المعلمين للسكرتير (للقراءة فقط)
// ============================================================================

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  FlatList,
} from "react-native";
import { useAuth } from "@/Context/AuthContext";
import { useTeachersData, useTeachersStats } from "@/hooks/teachers";
import { TeachersStatsCards } from "@/components/teachers";
import { Users, Search, Eye } from "lucide-react-native";

export default function SecretaryTeachersScreen() {
  const { user, getSecretaryPermissions } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const permissions = getSecretaryPermissions();

  const hasPermission =
    user?.role === "secretary" &&
    permissions?.teachersAccess &&
    permissions.teachersAccess !== "none";

  // Hooks
  const { teachers, isLoading, error, fetchTeachers, initialLoadDone } =
    useTeachersData();
  const {
    stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useTeachersStats();

  // Load teachers
  useEffect(() => {
    if (!hasPermission) return;

    const params = searchTerm ? { search: searchTerm } : {};
    fetchTeachers(params);
  }, [hasPermission, searchTerm]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    if (!hasPermission || initialLoadDone.current) return;

    initialLoadDone.current = true;

    const refreshInterval = setInterval(() => {
      Promise.all([fetchTeachers(), refetchStats()]).catch(() => {});
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

  // Teacher Card Component
  const TeacherCard = ({ teacher }: { teacher: any }) => (
    <View className="bg-white rounded-xl p-4 mb-3 border border-gray-200 shadow-sm">
      <View className="flex-row items-center">
        {/* Avatar */}
        <View className="w-12 h-12 rounded-full bg-emerald-100 items-center justify-center mr-3">
          <Text className="text-emerald-600 font-bold text-lg">
            {teacher.firstName?.charAt(0) || "م"}
          </Text>
        </View>

        {/* Info */}
        <View className="flex-1">
          <Text className="text-gray-900 font-bold text-base">
            {teacher.firstName} {teacher.lastName}
          </Text>
          {teacher.email && (
            <Text className="text-gray-500 text-sm mt-0.5">
              {teacher.email}
            </Text>
          )}
          {teacher.phoneNumber && (
            <Text className="text-gray-500 text-sm">{teacher.phoneNumber}</Text>
          )}
        </View>

        {/* View Icon */}
        <View className="bg-blue-50 p-2 rounded-lg">
          <Eye size={20} color="#3b82f6" />
        </View>
      </View>

      {/* Groups */}
      {teacher.groups && teacher.groups.length > 0 && (
        <View className="mt-3 pt-3 border-t border-gray-100">
          <Text className="text-gray-500 text-xs mb-2">الحلقات:</Text>
          <View className="flex-row flex-wrap gap-1">
            {teacher.groups
              .slice(0, 3)
              .map(
                (
                  group: { id?: string; name: string; number?: number },
                  idx: number
                ) => (
                  <View
                    key={group.id || idx}
                    className="bg-emerald-50 px-2 py-1 rounded">
                    <Text className="text-emerald-600 text-xs">
                      {group.name}
                    </Text>
                  </View>
                )
              )}
            {teacher.groups.length > 3 && (
              <View className="bg-gray-100 px-2 py-1 rounded">
                <Text className="text-gray-500 text-xs">
                  +{teacher.groups.length - 3}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Loading State */}
      {isLoading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#10b981" />
          <Text className="text-center text-gray-500 mt-4">
            جاري تحميل المعلمين...
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
                Promise.all([fetchTeachers(), refetchStats()]).catch(() => {});
              }}
              className="bg-red-600 px-6 py-3 rounded-lg">
              <Text className="text-white font-semibold text-center">
                إعادة المحاولة
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Teachers List with Header */}
      {!isLoading && !error && (
        <FlatList
          data={teachers}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <TeacherCard teacher={item} />}
          contentContainerStyle={{ padding: 16 }}
          ListHeaderComponent={
            <>
              {/* Header */}
              <View className="bg-white rounded-2xl p-6 mb-6 shadow-lg border border-gray-200">
                <View className="flex-row items-center mb-4">
                  <View className="bg-blue-100 p-3 rounded-xl mr-3">
                    <Users size={24} color="#3b82f6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-2xl font-bold text-gray-900">
                      عرض المعلمين
                    </Text>
                    <Text className="text-gray-500 text-sm mt-1">
                      عرض بيانات المعلمين (للقراءة فقط)
                    </Text>
                  </View>
                </View>

                {/* Read-only Notice */}
                <View className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                  <Text className="text-amber-700 text-sm text-center">
                    ⚠️ لديك صلاحية العرض فقط - لا يمكنك التعديل أو الحذف
                  </Text>
                </View>

                {/* Search */}
                <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                  <Search size={20} color="#9ca3af" />
                  <TextInput
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                    placeholder="ابحث عن معلم..."
                    className="flex-1 text-gray-800 mr-2"
                  />
                </View>
              </View>

              {/* Statistics Cards */}
              {statsLoading ? (
                <View className="mb-6">
                  <ActivityIndicator size="large" color="#10b981" />
                </View>
              ) : (
                <View className="mb-4">
                  <TeachersStatsCards stats={stats} />
                </View>
              )}

              {/* List Header */}
              <View className="mb-3">
                <Text className="text-gray-700 font-bold text-lg">
                  قائمة المعلمين ({teachers.length})
                </Text>
              </View>
            </>
          }
          ListEmptyComponent={
            <View className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12">
              <Text className="text-6xl text-center mb-4">👨‍🏫</Text>
              <Text className="text-gray-900 font-bold text-xl text-center mb-2">
                لا يوجد معلمين
              </Text>
              <Text className="text-gray-600 text-center">
                لا توجد بيانات معلمين متاحة حالياً
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
