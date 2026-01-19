// ============================================================================
// Teacher Assistants Admin Screen - شاشة إدارة مساعدي المدرسين (للأدمن)
// ============================================================================

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
} from "react-native";
import { useAuth } from "@/Context/AuthContext";
import { useLocalSearchParams } from "expo-router";
import {
  getAllTeacherAssistants,
  deleteTeacherAssistant,
  getTeacherAssistantStats,
  type TeacherAssistant,
  type TeacherAssistantStats,
} from "@/Api/teacherAssistantApi";
import { AssistantsStatsCards } from "@/components/assistants/AssistantsStatsCards";
import { AssistantsList } from "@/components/assistants/AssistantsList";
import { AddAssistantModal } from "@/components/assistants/AddAssistantModal";

export default function TeacherAssistantsAdminScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const [assistants, setAssistants] = useState<TeacherAssistant[]>([]);
  const [stats, setStats] = useState<TeacherAssistantStats>({
    total: 0,
    male: 0,
    female: 0,
    avgAge: 0,
    malePercentage: 0,
    femalePercentage: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingAssistants, setLoadingAssistants] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState<
    TeacherAssistant | undefined
  >();

  const hasPermission = user?.role === "admin";

  // Open modal if add=true in URL
  useEffect(() => {
    if (params.add === 'true') {
      setShowAddModal(true);
    }
  }, [params.add]);

  // Load assistants
  const fetchAssistants = useCallback(async () => {
    setLoadingAssistants(true);

    try {
      const params = searchQuery ? { search: searchQuery } : {};
      const response = await getAllTeacherAssistants(params);

      if (response.success && response.data) {
        setAssistants(response.data);
      }
    } catch (err) {
      console.error("Error fetching assistants:", err);
    } finally {
      setLoadingAssistants(false);
    }
  }, [searchQuery]);

  // Load stats
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const response = await getTeacherAssistantStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    if (!hasPermission) return;
    fetchAssistants();
  }, [hasPermission, searchQuery, fetchAssistants]);

  useEffect(() => {
    if (!hasPermission) return;
    fetchStats();
  }, [hasPermission, fetchStats]);

  // Handlers
  const handleAddAssistant = () => {
    setSelectedAssistant(undefined);
    setShowAddModal(true);
  };

  const handleEditAssistant = (assistant: TeacherAssistant) => {
    setSelectedAssistant(assistant);
    setShowAddModal(true);
  };

  const handleDeleteAssistant = (assistant: TeacherAssistant) => {
    Alert.alert(
      "تأكيد الحذف",
      `هل أنت متأكد من حذف ${assistant.firstName} ${assistant.lastName}؟`,
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "حذف",
          style: "destructive",
          onPress: async () => {
            const response = await deleteTeacherAssistant(assistant._id);
            if (response.success) {
              Alert.alert("نجح", "تم حذف المساعد بنجاح");
              fetchAssistants();
              fetchStats();
            } else {
              Alert.alert("خطأ", response.message || "فشل في حذف المساعد");
            }
          },
        },
      ]
    );
  };

  const handleModalSuccess = () => {
    setShowAddModal(false);
    setSelectedAssistant(undefined);
    fetchAssistants();
    fetchStats();
  };

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
          إدارة مساعدي المدرسين
        </Text>
        <Text className="text-blue-400 text-sm">
          إدارة وتنظيم بيانات المساعدين
        </Text>
      </View>

      {/* Content */}
      <FlatList
        ListHeaderComponent={
          <>
            {/* Stats Cards */}
            <View className="px-6 py-4">
              <AssistantsStatsCards stats={stats} loading={loadingStats} />
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
                    placeholder="ابحث عن مساعد..."
                    className="flex-1 text-gray-800"
                  />
                </View>

                {/* Add Button */}
                <TouchableOpacity
                  onPress={handleAddAssistant}
                  className="bg-blue-500 rounded-xl px-6 py-3 justify-center">
                  <Text className="text-white font-bold text-lg">+ إضافة</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Assistants List Header */}
            <View className="px-6 pb-2">
              <Text className="text-gray-700 font-bold text-lg">
                قائمة المساعدين ({assistants.length})
              </Text>
            </View>
          </>
        }
        data={assistants}
        renderItem={({ item }) => null}
        keyExtractor={(item) => item._id}
        ListFooterComponent={
          <View className="px-6">
            <AssistantsList
              assistants={assistants}
              loading={loadingAssistants}
              onEdit={handleEditAssistant}
              onDelete={handleDeleteAssistant}
            />
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Add/Edit Modal */}
      <AddAssistantModal
        visible={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setSelectedAssistant(undefined);
        }}
        onSuccess={handleModalSuccess}
        assistant={selectedAssistant}
      />
    </View>
  );
}
