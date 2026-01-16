// ============================================================================
// SecretaryList - قائمة السكرتيرين
// ============================================================================

import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Edit2, Trash2, Shield, Eye, Settings } from "lucide-react-native";
import type { Secretary, AccessLevel } from "@/types/secretary.types";

interface SecretaryListProps {
  secretaries: Secretary[];
  loading?: boolean;
  onEdit: (secretary: Secretary) => void;
  onDelete: (secretary: Secretary) => void;
  onManagePermissions?: (secretary: Secretary) => void;
}

// دالة لعرض مستوى الصلاحية بالعربي
const getAccessLevelText = (level?: AccessLevel): string => {
  switch (level) {
    case "manage":
      return "إدارة";
    case "view":
      return "عرض";
    case "none":
    default:
      return "لا يوجد";
  }
};

// دالة لتحديد لون الصلاحية
const getAccessLevelColor = (level?: AccessLevel): string => {
  switch (level) {
    case "manage":
      return "bg-green-100 text-green-700";
    case "view":
      return "bg-blue-100 text-blue-700";
    case "none":
    default:
      return "bg-gray-100 text-gray-500";
  }
};

// مكون بطاقة السكرتير
const SecretaryCard: React.FC<{
  secretary: Secretary;
  onEdit: () => void;
  onDelete: () => void;
  onManagePermissions?: () => void;
}> = ({ secretary, onEdit, onDelete, onManagePermissions }) => {
  const fullName = `${secretary.firstName} ${secretary.lastName}`;
  const permissions = secretary.permissions || {};

  return (
    <View className="bg-white rounded-xl p-4 mb-3 border border-gray-200 shadow-sm">
      {/* Header */}
      <View className="flex-row items-center mb-3">
        {/* Avatar */}
        <View className="w-12 h-12 rounded-full bg-purple-100 items-center justify-center mr-3">
          <Text className="text-purple-600 font-bold text-lg">
            {secretary.firstName?.charAt(0) || "س"}
          </Text>
        </View>

        {/* Info */}
        <View className="flex-1">
          <Text className="text-gray-900 font-bold text-base">{fullName}</Text>
          <Text className="text-gray-500 text-sm">
            #{secretary.secretaryId}
          </Text>
        </View>

        {/* Gender Badge */}
        <View
          className={`px-2 py-1 rounded-full ${
            secretary.gender === "ذكر" || secretary.gender === "male"
              ? "bg-blue-100"
              : "bg-pink-100"
          }`}>
          <Text
            className={`text-xs ${
              secretary.gender === "ذكر" || secretary.gender === "male"
                ? "text-blue-600"
                : "text-pink-600"
            }`}>
            {secretary.gender === "ذكر" || secretary.gender === "male"
              ? "ذكر"
              : "أنثى"}
          </Text>
        </View>
      </View>

      {/* Contact Info */}
      <View className="mb-3 space-y-1">
        {secretary.email && (
          <Text className="text-gray-500 text-sm">📧 {secretary.email}</Text>
        )}
        {secretary.phoneNumber && (
          <Text className="text-gray-500 text-sm">
            📱 {secretary.phoneNumber}
          </Text>
        )}
        {secretary.residence && (
          <Text className="text-gray-500 text-sm">
            📍 {secretary.residence}
          </Text>
        )}
      </View>

      {/* Permissions */}
      <View className="mb-3 pt-3 border-t border-gray-100">
        <View className="flex-row items-center mb-2">
          <Shield size={14} color="#6b7280" />
          <Text className="text-gray-600 text-xs mr-1">الصلاحيات:</Text>
        </View>
        <View className="flex-row flex-wrap gap-2">
          <View
            className={`px-2 py-1 rounded ${getAccessLevelColor(
              permissions.studentsAccess
            )}`}>
            <Text className="text-xs">
              طلاب: {getAccessLevelText(permissions.studentsAccess)}
            </Text>
          </View>
          <View
            className={`px-2 py-1 rounded ${getAccessLevelColor(
              permissions.teachersAccess
            )}`}>
            <Text className="text-xs">
              معلمين: {getAccessLevelText(permissions.teachersAccess)}
            </Text>
          </View>
          <View
            className={`px-2 py-1 rounded ${getAccessLevelColor(
              permissions.groupsAccess
            )}`}>
            <Text className="text-xs">
              حلقات: {getAccessLevelText(permissions.groupsAccess)}
            </Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View className="flex-row justify-end gap-2 pt-3 border-t border-gray-100">
        {onManagePermissions && (
          <TouchableOpacity
            onPress={onManagePermissions}
            className="bg-purple-50 p-2 rounded-lg">
            <Settings size={18} color="#9333ea" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={onEdit}
          className="bg-blue-50 p-2 rounded-lg">
          <Edit2 size={18} color="#3b82f6" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onDelete}
          className="bg-red-50 p-2 rounded-lg">
          <Trash2 size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const SecretaryList: React.FC<SecretaryListProps> = ({
  secretaries,
  loading = false,
  onEdit,
  onDelete,
  onManagePermissions,
}) => {
  if (loading) {
    return (
      <View className="py-8 items-center">
        <ActivityIndicator size="large" color="#9333ea" />
        <Text className="text-gray-500 mt-2">جاري التحميل...</Text>
      </View>
    );
  }

  if (secretaries.length === 0) {
    return (
      <View className="py-8 items-center">
        <Text className="text-6xl mb-4">👤</Text>
        <Text className="text-gray-500 text-center">
          لا يوجد سكرتيرين حالياً
        </Text>
      </View>
    );
  }

  return (
    <View>
      {secretaries.map((secretary) => (
        <SecretaryCard
          key={secretary._id}
          secretary={secretary}
          onEdit={() => onEdit(secretary)}
          onDelete={() => onDelete(secretary)}
          onManagePermissions={
            onManagePermissions
              ? () => onManagePermissions(secretary)
              : undefined
          }
        />
      ))}
    </View>
  );
};

export default SecretaryList;
