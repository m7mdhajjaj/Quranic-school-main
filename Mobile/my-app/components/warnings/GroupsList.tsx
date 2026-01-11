import React from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { ChevronLeft } from "lucide-react-native";

interface Group {
  _id: string;
  name: string;
  currentStudents?: number;
}

interface GroupsListProps {
  groups: Group[];
  onGroupSelect: (groupId: string, groupName: string) => void;
}

export const GroupsList: React.FC<GroupsListProps> = ({
  groups,
  onGroupSelect,
}) => {
  const renderGroup = ({ item }: { item: Group }) => (
    <TouchableOpacity
      onPress={() => onGroupSelect(item._id, item.name)}
      activeOpacity={0.7}
      className="bg-white rounded-2xl p-5 mb-4 shadow-lg border-2 border-emerald-200">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-xl font-bold text-gray-800 mb-3">
            {item.name}
          </Text>
          <View className="flex-row items-center gap-2">
            <View className="bg-emerald-100 rounded-full px-3 py-1">
              <View className="flex-row items-center gap-2">
                <Text className="text-2xl">👥</Text>
                <Text className="text-gray-900 font-bold text-base">
                  {item.currentStudents || 0} طالب
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View className="bg-emerald-500 rounded-full p-3">
          <Text className="text-2xl">→</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (groups.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <Text className="text-6xl mb-4">📚</Text>
        <Text className="text-gray-500 text-lg">لا توجد حلقات</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={groups}
      renderItem={renderGroup}
      keyExtractor={(item) => item._id}
      contentContainerStyle={{ paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
    />
  );
};
