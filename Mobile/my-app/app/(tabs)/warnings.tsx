import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { AlertTriangle, ChevronLeft } from "lucide-react-native";
import { useAuth } from "@/Context/AuthContext";
import {
  useWarningsData,
  useWarningsActions,
  useGroupSelection,
} from "@/hooks/warnings";
import {
  StudentView,
  GroupsList,
  StudentsList,
  AddWarningModal,
} from "@/components/warnings";
import { StudentWithWarnings, WarningType } from "@/types/warning.types";

export default function WarningsScreen() {
  const { user } = useAuth();
  const {
    groups,
    warnings,
    statistics,
    loading,
    isTeacher,
    isStudent,
    refetchData,
    fetchTeacherStats,
  } = useWarningsData();

  const {
    selectedGroup,
    loadingStudents,
    handleGroupSelect,
    refreshCurrentGroup,
    handleBack,
  } = useGroupSelection();

  const { isSubmitting, handleCreateWarning, handleDeleteWarningByType } =
    useWarningsActions(() => {
      refreshCurrentGroup();
      refetchData();
      fetchTeacherStats();
    });

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudent, setSelectedStudent] =
    useState<StudentWithWarnings | null>(null);

  const handleAddWarning = (student: StudentWithWarnings) => {
    setSelectedStudent(student);
    setShowAddModal(true);
  };

  const handleDeleteWarning = (
    student: StudentWithWarnings,
    type: WarningType
  ) => {
    handleDeleteWarningByType(student._id, type);
  };

  // عرض واجهة الطالب
  if (isStudent) {
    return (
      <ScrollView className="flex-1 bg-gray-50">
        <View className="px-4 pt-6 pb-12">
          {/* العنوان */}
          <View className="bg-gradient-to-r from-red-500 to-orange-600 rounded-2xl p-6 mb-6 shadow-lg">
            <View className="flex-row items-center gap-4 mb-2">
              <View className="bg-white/20 rounded-full p-3">
                <Text className="text-4xl">⚠️</Text>
              </View>
              <View className="flex-1">
                <Text className="text-2xl font-bold text-لقثغ">الإنذارات</Text>
              </View>
            </View>
            <Text className="text-gray-500/90 text-sm mt-2">
              تابع إنذاراتك والتزم بالقوانين
            </Text>
          </View>

          {loading ? (
            <View className="flex-1 items-center justify-center py-20">
              <ActivityIndicator size="large" color="#ef4444" />
              <Text className="text-gray-500 mt-4">جاري التحميل...</Text>
            </View>
          ) : (
            <StudentView warnings={warnings} />
          )}
        </View>
      </ScrollView>
    );
  }

  // عرض واجهة المعلم
  if (isTeacher) {
    return (
      <View className="flex-1 bg-gray-50">
        <View className="flex-1 px-4 pt-6 pb-12">
          {/* العنوان */}
          <View className="bg-white rounded-2xl p-6 mb-6 shadow-lg border-2 border-red-200">
            <View className="flex-row items-center gap-4 mb-2">
              <View className="bg-red-100 rounded-full p-3">
                <Text className="text-4xl">⚠️</Text>
              </View>
              <View className="flex-1">
                <Text className="text-2xl font-bold text-gray-900">
                  إدارة الإنذارات
                </Text>
              </View>
            </View>
            {statistics && !selectedGroup && (
              <View className="flex-row gap-3 mt-4">
                <View className="flex-1 bg-gray-100 rounded-xl p-3 border border-gray-300">
                  <Text className="text-gray-600 text-xs mb-1">إجمالي</Text>
                  <Text className="text-gray-900 font-bold text-xl">
                    {statistics.totalWarnings}
                  </Text>
                </View>
                <View className="flex-1 bg-gray-100 rounded-xl p-3 border border-gray-300">
                  <Text className="text-gray-600 text-xs mb-1">طلاب</Text>
                  <Text className="text-gray-900 font-bold text-xl">
                    {statistics.studentsWithWarnings}
                  </Text>
                </View>
                <View className="flex-1 bg-gray-100 rounded-xl p-3 border border-gray-300">
                  <Text className="text-gray-600 text-xs mb-1">مفصولين</Text>
                  <Text className="text-gray-900 font-bold text-xl">
                    {statistics.expelledStudents}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* زر الرجوع */}
          {selectedGroup && (
            <TouchableOpacity
              onPress={handleBack}
              className="flex-row items-center gap-2 mb-4 bg-white rounded-xl p-4 shadow-sm">
              <Text className="text-2xl">←</Text>
              <Text className="text-gray-700 font-semibold">
                العودة للحلقات
              </Text>
            </TouchableOpacity>
          )}

          {/* المحتوى */}
          {loading ? (
            <View className="flex-1 items-center justify-center py-20">
              <ActivityIndicator size="large" color="#ef4444" />
              <Text className="text-gray-500 mt-4">جاري التحميل...</Text>
            </View>
          ) : selectedGroup ? (
            loadingStudents ? (
              <View className="flex-1 items-center justify-center py-20">
                <ActivityIndicator size="large" color="#ef4444" />
                <Text className="text-gray-500 mt-4">جاري تحميل الطلاب...</Text>
              </View>
            ) : (
              <>
                {/* إحصائيات الحلقة */}
                {selectedGroup.statistics && (
                  <View className="bg-white rounded-2xl p-4 mb-4 shadow-md">
                    <Text className="text-gray-700 font-bold text-lg mb-3">
                      📊 إحصائيات {selectedGroup.name}
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                      <View className="flex-1 min-w-[45%] bg-yellow-100 rounded-xl p-3">
                        <Text className="text-yellow-700 text-xs mb-1">
                          تنبيه
                        </Text>
                        <Text className="text-yellow-900 font-bold text-xl">
                          {selectedGroup.statistics.warning}
                        </Text>
                      </View>
                      <View className="flex-1 min-w-[45%] bg-orange-100 rounded-xl p-3">
                        <Text className="text-orange-700 text-xs mb-1">
                          إنذار أول
                        </Text>
                        <Text className="text-orange-900 font-bold text-xl">
                          {selectedGroup.statistics.first}
                        </Text>
                      </View>
                      <View className="flex-1 min-w-[45%] bg-red-100 rounded-xl p-3">
                        <Text className="text-red-700 text-xs mb-1">
                          إنذار ثاني
                        </Text>
                        <Text className="text-red-900 font-bold text-xl">
                          {selectedGroup.statistics.second}
                        </Text>
                      </View>
                      <View className="flex-1 min-w-[45%] bg-red-200 rounded-xl p-3">
                        <Text className="text-red-800 text-xs mb-1">
                          إنذار ثالث
                        </Text>
                        <Text className="text-red-950 font-bold text-xl">
                          {selectedGroup.statistics.third}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                <StudentsList
                  students={selectedGroup.students}
                  onAddWarning={handleAddWarning}
                  onDeleteWarning={handleDeleteWarning}
                />

                {/* الطلاب المفصولين */}
                {selectedGroup.expelledStudents.length > 0 && (
                  <View className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mt-4">
                    <Text className="text-red-800 font-bold text-lg mb-3">
                      🚫 طلاب مفصولين ({selectedGroup.expelledStudents.length})
                    </Text>
                    {selectedGroup.expelledStudents.map((student) => (
                      <View
                        key={student._id}
                        className="bg-white rounded-xl p-3 mb-2">
                        <Text className="text-gray-800 font-semibold">
                          {`${student.firstName} ${student.middleName || ""} ${
                            student.lastName
                          }`.trim()}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </>
            )
          ) : (
            <GroupsList groups={groups} onGroupSelect={handleGroupSelect} />
          )}
        </View>

        {/* Modal إضافة إنذار */}
        <AddWarningModal
          visible={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setSelectedStudent(null);
          }}
          onSubmit={handleCreateWarning}
          student={selectedStudent}
          teacherId={user?._id || ""}
          groupName={selectedGroup?.name || ""}
          isSubmitting={isSubmitting}
        />
      </View>
    );
  }

  // غير مصرح
  return (
    <View className="flex-1 items-center justify-center bg-gray-50">
      <Text className="text-6xl mb-4">🚫</Text>
      <Text className="text-gray-600 text-lg">
        غير مصرح لك بالوصول لهذه الصفحة
      </Text>
    </View>
  );
}
