// ============================================================================
// Secretary Management Screen - شاشة إدارة السكرتارية (للأدمن)
// ============================================================================

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  RefreshControl,
} from "react-native";
import {
  useSecretaryData,
  useSecretaryStats,
  useSecretaryActions,
} from "@/hooks/secretary";
import {
  SecretaryList,
  SecretaryStatsCards,
  AddSecretaryModal,
} from "@/components/secretary";
import type { Secretary } from "@/types/secretary.types";

export default function SecretaryManagementScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSecretary, setSelectedSecretary] = useState<
    Secretary | undefined
  >();
  const [refreshing, setRefreshing] = useState(false);

  // Hooks
  const {
    secretaries,
    loading: loadingSecretaries,
    refetch: refetchSecretaries,
  } = useSecretaryData({ search: searchQuery });

  const {
    stats,
    loading: loadingStats,
    refetch: refetchStats,
  } = useSecretaryStats();

  const { deleteExistingSecretary } = useSecretaryActions();

  // Filter secretaries based on search
  const filteredSecretaries = secretaries.filter((secretary) => {
    if (!searchQuery.trim()) return true;
    const fullName =
      `${secretary.firstName} ${secretary.lastName}`.toLowerCase();
    const search = searchQuery.toLowerCase();
    return (
      fullName.includes(search) ||
      secretary.email?.toLowerCase().includes(search) ||
      secretary.phoneNumber?.includes(search) ||
      secretary.secretaryId?.toString().includes(search)
    );
  });

  // Handlers
  const handleAddSecretary = () => {
    setSelectedSecretary(undefined);
    setShowAddModal(true);
  };

  const handleEditSecretary = (secretary: Secretary) => {
    setSelectedSecretary(secretary);
    setShowAddModal(true);
  };

  const handleDeleteSecretary = (secretary: Secretary) => {
    Alert.alert(
      "تأكيد الحذف",
      `هل أنت متأكد من حذف السكرتير ${secretary.firstName} ${secretary.lastName}؟`,
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "حذف",
          style: "destructive",
          onPress: async () => {
            const result = await deleteExistingSecretary(secretary._id);
            if (result.success) {
              Alert.alert("نجح", "تم حذف السكرتير بنجاح");
              refetchSecretaries();
              refetchStats();
            } else {
              Alert.alert("خطأ", result.message || "فشل حذف السكرتير");
            }
          },
        },
      ]
    );
  };

  const handleModalSuccess = () => {
    setShowAddModal(false);
    setSelectedSecretary(undefined);
    refetchSecretaries();
    refetchStats();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchSecretaries(), refetchStats()]);
    setRefreshing(false);
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white-600 pt-12 pb-6 px-6">
        <Text className="text-black text-3xl font-bold mb-2">
          إدارة السكرتارية
        </Text>
        <Text className="text-blue-400 text-sm">
          إدارة وتنظيم بيانات السكرتارية
        </Text>
      </View>

      {/* Content */}
      <FlatList
        data={[1]} // Dummy data to render content
        keyExtractor={() => "content"}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={() => null}
        ListHeaderComponent={
          <>
            {/* Stats Cards */}
            <View className="px-6 py-4">
              <SecretaryStatsCards stats={stats} loading={loadingStats} />
            </View>

            {/* Search & Add */}
            <View className="px-6 pb-4">
              <View className="flex-row gap-3">
                {/* Search */}
                <View className="flex-1 bg-white rounded-xl px-4 py-3 border border-gray-200 flex-row items-center">
                  <Text className="text-gray-400 mr-2">🔍</Text>
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="ابحث عن سكرتير..."
                    className="flex-1 text-gray-800"
                  />
                </View>

                {/* Add Button */}
                <TouchableOpacity
                  onPress={handleAddSecretary}
                  className="bg-blue-500 rounded-xl px-6 py-3 justify-center">
                  <Text className="text-white font-bold text-lg">+ إضافة</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Secretary List Header */}
            <View className="px-6 pb-2">
              <Text className="text-gray-700 font-bold text-lg">
                قائمة السكرتيرين ({filteredSecretaries.length})
              </Text>
            </View>
          </>
        }
        ListFooterComponent={
          <View className="px-6 pb-6">
            <SecretaryList
              secretaries={filteredSecretaries}
              loading={loadingSecretaries}
              onEdit={handleEditSecretary}
              onDelete={handleDeleteSecretary}
            />
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Add/Edit Modal */}
      <AddSecretaryModal
        visible={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setSelectedSecretary(undefined);
        }}
        onSuccess={handleModalSuccess}
        secretary={selectedSecretary}
      />
    </View>
  );
}
