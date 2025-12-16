import { View, Text, ScrollView } from "react-native";

export default function HomeScreen() {
  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6">
        {/* Header */}
        <View className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 mb-6 shadow-lg">
          <Text className="text-4xl font-bold text-white mb-2">مرحباً! 👋</Text>
          <Text className="text-lg text-white opacity-90">
            تطبيق المدرسة القرآنية
          </Text>
        </View>

        {/* Cards */}
        <View className="space-y-4">
          <View className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <Text className="text-2xl font-bold text-gray-800 mb-2">
              📚 الدروس
            </Text>
            <Text className="text-base text-gray-600">
              تصفح الدروس والحصص المتاحة
            </Text>
          </View>

          <View className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <Text className="text-2xl font-bold text-gray-800 mb-2">
              ✅ الحضور
            </Text>
            <Text className="text-base text-gray-600">سجل حضورك اليومي</Text>
          </View>

          <View className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <Text className="text-2xl font-bold text-gray-800 mb-2">
              ⭐ النقاط
            </Text>
            <Text className="text-base text-gray-600">شاهد نقاطك وترتيبك</Text>
          </View>
        </View>

        {/* Stats */}
        <View className="flex-row gap-4 mt-6">
          <View className="flex-1 bg-green-500 rounded-xl p-4 items-center">
            <Text className="text-3xl font-bold text-white">25</Text>
            <Text className="text-sm text-white mt-1">درس</Text>
          </View>
          <View className="flex-1 bg-blue-500 rounded-xl p-4 items-center">
            <Text className="text-3xl font-bold text-white">100</Text>
            <Text className="text-sm text-white mt-1">نقطة</Text>
          </View>
          <View className="flex-1 bg-purple-500 rounded-xl p-4 items-center">
            <Text className="text-3xl font-bold text-white">5</Text>
            <Text className="text-sm text-white mt-1">مركز</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
