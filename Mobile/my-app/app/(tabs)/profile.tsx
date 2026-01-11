// app/(tabs)/profile.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  useProfileData,
  useProfileEdit,
  useProfileAvatar,
  useProfileHandlers,
} from "@/hooks/profile";
import {
  ProfileHeader,
  AvatarSection,
  InfoField,
  GenderBadge,
  ChangePasswordModal,
} from "@/components/profile";
import { formatDate, nv } from "@/utils/profileHelpers";

const ProfileScreen = () => {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);

  // Profile data hook
  const { user, endpoint, fetchState, loadUser, updateUser } = useProfileData();

  // Profile edit hook
  const {
    isEditing,
    edited,
    isSaving,
    fieldErrors,
    beginEdit,
    cancelEdit,
    saveProfile: saveProfileEdit,
    updateField,
  } = useProfileEdit(user, endpoint, (updatedUser) => {
    updateUser(updatedUser);
  });

  // Profile avatar hook
  const {
    avatarFile,
    isUploading,
    pickImage,
    uploadAvatarImage,
    handleDeleteAvatar,
    resetAvatar,
  } = useProfileAvatar(user, endpoint, loadUser);

  // Profile handlers hook
  const {
    fullName,
    age,
    roleConfig,
    backgroundColor,
    heroBgColor,
    shouldShow,
  } = useProfileHandlers(user, edited, isEditing);

  // Handle save profile
  const handleSaveProfile = async () => {
    await saveProfileEdit();

    // Upload avatar if changed
    if (avatarFile) {
      await uploadAvatarImage();
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    cancelEdit();
    resetAvatar();
  };

  // Handle birth date change
  const handleBirthDateChange = (event: any, selectedDate?: Date) => {
    setShowBirthDatePicker(Platform.OS === "ios");

    if (selectedDate && edited) {
      const dateString = selectedDate.toISOString().split("T")[0];
      updateField("birthDate", dateString);
    }
  };

  // Loading state
  if (fetchState.status === "loading") {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>جاري التحميل...</Text>
      </View>
    );
  }

  // Error state
  if (fetchState.status === "error") {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>حدث خطأ</Text>
        <Text style={styles.errorMessage}>{fetchState.message}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadUser}>
          <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!user) return null;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Hero Section */}
      <View style={[styles.hero, { backgroundColor: heroBgColor }]}>
        <AvatarSection
          user={user}
          avatarFile={avatarFile}
          isEditing={isEditing}
          onPickImage={pickImage}
          onDeleteAvatar={handleDeleteAvatar}
        />

        <ProfileHeader
          fullName={fullName}
          age={age ?? undefined}
          roleConfig={roleConfig}
          isEditing={isEditing}
          isSaving={isSaving || isUploading}
          onEdit={beginEdit}
          onSave={handleSaveProfile}
          onCancel={handleCancelEdit}
          onChangePassword={() => setShowChangePassword(true)}
        />
      </View>

      {/* Content Section */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}>
        {/* الاسم الكامل */}
        {shouldShow(Boolean(fullName)) && (
          <InfoField
            icon={<Text style={styles.iconText}>👥</Text>}
            label="الاسم الكامل"
            value={
              isEditing && edited ? (
                <View style={styles.inputsGrid}>
                  <TextInput
                    style={[
                      styles.input,
                      fieldErrors?.["firstName"] && styles.inputError,
                    ]}
                    placeholder="الاسم الأول"
                    value={edited.firstName || ""}
                    onChangeText={(text) => updateField("firstName", text)}
                    editable={!isSaving}
                  />
                  <TextInput
                    style={[
                      styles.input,
                      fieldErrors?.["fatherName"] && styles.inputError,
                    ]}
                    placeholder="اسم الأب"
                    value={edited.fatherName || ""}
                    onChangeText={(text) => updateField("fatherName", text)}
                    editable={!isSaving}
                  />
                  <TextInput
                    style={[
                      styles.input,
                      fieldErrors?.["grandFatherName"] && styles.inputError,
                    ]}
                    placeholder="اسم الجد"
                    value={edited.grandFatherName || ""}
                    onChangeText={(text) =>
                      updateField("grandFatherName", text)
                    }
                    editable={!isSaving}
                  />
                  <TextInput
                    style={[
                      styles.input,
                      fieldErrors?.["lastName"] && styles.inputError,
                    ]}
                    placeholder="اسم العائلة"
                    value={edited.lastName || ""}
                    onChangeText={(text) => updateField("lastName", text)}
                    editable={!isSaving}
                  />
                </View>
              ) : (
                nv(fullName)
              )
            }
          />
        )}

        {/* رقم الهوية - لا يمكن تعديله */}
        {shouldShow(Boolean(user.idNumber)) && !isEditing && (
          <InfoField
            icon={<Text style={styles.iconText}>🆔</Text>}
            label="رقم الهوية"
            value={nv(user.idNumber)}
          />
        )}

        {/* تاريخ الميلاد */}
        {shouldShow(Boolean(user.birthDate) || isEditing) && (
          <InfoField
            icon={<Text style={styles.iconText}>📅</Text>}
            label="تاريخ الميلاد"
            value={
              isEditing && edited ? (
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowBirthDatePicker(true)}>
                  <Text style={styles.dateButtonText}>
                    {edited.birthDate
                      ? formatDate(edited.birthDate)
                      : "اختر التاريخ"}
                  </Text>
                </TouchableOpacity>
              ) : (
                formatDate(user.birthDate)
              )
            }
          />
        )}

        {/* الجنس */}
        {shouldShow(Boolean(user.gender) || isEditing) && (
          <InfoField
            icon={<Text style={styles.iconText}>👤</Text>}
            label="الجنس"
            value={<GenderBadge gender={user.gender} />}
          />
        )}

        {/* مكان السكن */}
        {shouldShow(Boolean(user.residence)) && (
          <InfoField
            icon={<Text style={styles.iconText}>📍</Text>}
            label="مكان السكن"
            value={
              isEditing && edited ? (
                <TextInput
                  style={styles.input}
                  placeholder="المدينة / الحي"
                  value={edited.residence || ""}
                  onChangeText={(text) => updateField("residence", text)}
                  editable={!isSaving}
                />
              ) : (
                nv(user.residence)
              )
            }
          />
        )}

        {/* البريد الإلكتروني */}
        {shouldShow(Boolean(user.email)) && (
          <InfoField
            icon={<Text style={styles.iconText}>✉️</Text>}
            label="البريد الإلكتروني"
            value={nv(user.email)}
          />
        )}

        {/* رقم الهاتف */}
        {shouldShow(Boolean(user.phoneNumber)) && (
          <InfoField
            icon={<Text style={styles.iconText}>📞</Text>}
            label="رقم الهاتف"
            value={
              isEditing && edited ? (
                <TextInput
                  style={styles.input}
                  placeholder="05xxxxxxxx (10 أرقام)"
                  value={edited.phoneNumber || ""}
                  onChangeText={(text) => updateField("phoneNumber", text)}
                  keyboardType="phone-pad"
                  maxLength={10}
                  editable={!isSaving}
                />
              ) : (
                nv(user.phoneNumber)
              )
            }
          />
        )}

        {/* تاريخ إنشاء الحساب */}
        {shouldShow(Boolean(user.createdAt)) && (
          <InfoField
            icon={<Text style={styles.iconText}>🕒</Text>}
            label="تاريخ إنشاء الحساب"
            value={formatDate(user.createdAt)}
          />
        )}
      </ScrollView>

      {/* Birth Date Picker */}
      {showBirthDatePicker && edited?.birthDate && (
        <DateTimePicker
          value={new Date(edited.birthDate)}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleBirthDateChange}
          maximumDate={new Date()}
        />
      )}

      {/* Change Password Modal */}
      <ChangePasswordModal
        isVisible={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 16,
  },
  content: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -16,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6b7280",
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ef4444",
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#10b981",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  iconText: {
    fontSize: 20,
    color: "#ffffff",
  },
  inputsGrid: {
    gap: 8,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
    textAlign: "right",
  },
  inputError: {
    borderColor: "#ef4444",
  },
  dateButton: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dateButtonText: {
    fontSize: 14,
    color: "#111827",
    textAlign: "right",
  },
});

export default ProfileScreen;
