// ProfilePage.tsx
import {
  Phone,
  Calendar,
  MapPin,
  Users,
  User as UserIcon,
  RefreshCw,
  IdCard,
  Mail,
  Clock,
  AlertCircle,
} from "lucide-react";
import ChangePasswordModal from "../Auth/ChangePass/ChangePass";
import { Card } from "@/components/UI/Card";
import { EmptyState } from "@/components/UI/EmptyState";
import { ProfileSkeleton } from "@/components/skeletons";
import {
  ProfileHeader,
  AvatarSection,
  InfoField,
  TextInput,
  GenderBadge,
} from "./components";
import { DatePicker } from "@/components/UI";
import { formatDate, nv } from "./utils/profileHelpers";
import {
  useProfileData,
  useProfileEdit,
  useProfileAvatar,
  useProfileValidation,
  useDuplicateCheck,
  useProfileHandlers,
} from "./hooks";

const ProfilePage = () => {
  // Profile data hook
  const {
    user,
    endpoint,
    fetchState,
    avatarUrl,
    loadUser,
    updateUser,
    updateAvatarUrl,
  } = useProfileData();

  // Profile avatar hook
  const {
    avatarFile,
    setAvatarFile,
    handleDeleteAvatar,
    uploadAvatar,
    resetAvatar,
  } = useProfileAvatar(user, endpoint, avatarUrl, updateAvatarUrl);

  // Profile edit hook
  const {
    isEditing,
    edited,
    isSaving,
    fieldErrors: editFieldErrors,
    remainingBirth,
    beginEdit,
    cancelEdit,
    saveProfile: saveProfileEdit,
    updateField,
    setFieldErrors: setEditFieldErrors,
  } = useProfileEdit(user, endpoint, updateUser);

  // Profile validation hook
  const {
    fieldErrors: validationFieldErrors,
    validateFieldValue,
  } = useProfileValidation(user);

  // Duplicate check hook
  const { checkingDuplicate, checkPhoneNumber } = useDuplicateCheck();

  // Profile handlers hook - combines all handlers and computed values
  const {
    isChangePasswordModalOpen,
    setIsChangePasswordModalOpen,
    fullName,
    age,
    roleConfig,
    backgroundColor,
    heroBgColor,
    handlePhoneNumberChange,
    handleFieldBlur,
    handleCancelEdit,
    handleSaveProfile,
    shouldShow,
  } = useProfileHandlers(
    user,
    edited,
    isEditing,
    updateField,
    validateFieldValue,
    checkPhoneNumber,
    setEditFieldErrors,
    cancelEdit,
    resetAvatar,
    saveProfileEdit,
    uploadAvatar,
    avatarFile
  );

  // Merge field errors from edit and validation
  const fieldErrors = { ...editFieldErrors, ...validationFieldErrors };

  if (fetchState.status === "loading") {
    return <ProfileSkeleton />;
  }

  if (fetchState.status === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 p-6 flex items-center justify-center">
        <div className="max-w-md w-full">
          <Card variant="elevated" className="p-10">
            <EmptyState
              icon={<AlertCircle className="w-12 h-12 text-red-600" />}
              title="حدث خطأ"
              description={fetchState.message}
              action={{
                label: "إعادة المحاولة",
                onClick: loadUser,
                icon: <RefreshCw className="w-6 h-6" />,
              }}
            />
          </Card>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className={`min-h-screen ${backgroundColor}`} dir="rtl">
      {/* Hero Section with Seamless Gradient Transition */}
      <div className={`relative ${heroBgColor} overflow-hidden pb-20`}>
        <div className="relative container mx-auto px-4 py-12">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          </div>
          <div className="relative z-10">
          <AvatarSection
            user={user}
            avatarUrl={avatarUrl}
            avatarFile={avatarFile}
            isEditing={isEditing}
            onAvatarChange={setAvatarFile}
            onDeleteAvatar={handleDeleteAvatar}
          />

          <ProfileHeader
            fullName={fullName}
            age={age}
            roleConfig={roleConfig}
            isEditing={isEditing}
            isSaving={isSaving}
            onEdit={beginEdit}
            onSave={handleSaveProfile}
            onCancel={handleCancelEdit}
            onChangePassword={() => setIsChangePasswordModalOpen(true)}
          />
        </div>
        </div>
      </div>

      {/* Content Section - Simple White Background */}
      <div className="container mx-auto px-4 py-8 -mt-8" dir="rtl">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* الاسم الكامل */}
          {shouldShow(Boolean(fullName)) && (
            <InfoField
              icon={<Users className="w-5 h-5" />}
              label="الاسم الكامل"
              value={
                isEditing ? (
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <TextInput
                      placeholder="الاسم الأول"
                      value={edited?.firstName ?? ""}
                      onChange={(v) => updateField("firstName", v)}
                      onBlur={() =>
                        handleFieldBlur("firstName", edited?.firstName)
                      }
                      error={fieldErrors?.["firstName"]}
                    />
                    <TextInput
                      placeholder="اسم الأب"
                      value={edited?.fatherName ?? ""}
                      onChange={(v) => updateField("fatherName", v)}
                      onBlur={() =>
                        handleFieldBlur("fatherName", edited?.fatherName)
                      }
                      error={fieldErrors?.["fatherName"]}
                    />
                    <TextInput
                      placeholder="اسم الجد"
                      value={edited?.grandFatherName ?? ""}
                      onChange={(v) => updateField("grandFatherName", v)}
                      onBlur={() =>
                        handleFieldBlur(
                          "grandFatherName",
                          edited?.grandFatherName
                        )
                      }
                      error={fieldErrors?.["grandFatherName"]}
                    />
                    <TextInput
                      placeholder="اسم العائلة"
                      value={edited?.lastName ?? ""}
                      onChange={(v) => updateField("lastName", v)}
                      onBlur={() =>
                        handleFieldBlur("lastName", edited?.lastName)
                      }
                      error={fieldErrors?.["lastName"]}
                    />
                  </div>
                ) : (
                  nv(fullName)
                )
              }
            />
          )}

          {/* رقم الهوية - لا يمكن تعديله */}
          {shouldShow(Boolean(user.idNumber)) && !isEditing && (
            <InfoField
              icon={<IdCard className="w-5 h-5" />}
              label="رقم الهوية"
              value={nv(user.idNumber)}
            />
          )}

          {/* تاريخ الميلاد */}
          {shouldShow(Boolean(user.birthDate) || isEditing) && (
            <InfoField
              icon={<Calendar className="w-5 h-5" />}
              label="تاريخ الميلاد"
              value={
                isEditing ? (
                  <div className="space-y-3 mt-3">
                    <DatePicker
                      value={
                        edited?.birthDate ? edited.birthDate.slice(0, 10) : ""
                      }
                      onChange={(dateString) => {
                        updateField(
                          "birthDate",
                          dateString ? new Date(dateString).toISOString() : ""
                        );
                      }}
                      error={fieldErrors?.["birthDate"]}
                      minYear={1950}
                      maxYear={new Date().getFullYear()}
                    />
                    {remainingBirth < 2 && (
                      <div className="flex items-center gap-2 text-xs bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 px-4 py-2.5 rounded-xl border border-amber-300 shadow-sm" dir="rtl">
                        <span className="font-semibold">عدد التعديلات المتبقية:</span>
                        <span className="font-bold bg-amber-100 px-2 py-1 rounded-lg">{remainingBirth} / 2</span>
                      </div>
                    )}
                  </div>
                ) : (
                  formatDate(user.birthDate)
                )
              }
            />
          )}

          {/* الجنس */}
          {shouldShow(Boolean(user.gender) || isEditing) && (
            <InfoField
              icon={<UserIcon className="w-5 h-5" />}
              label="الجنس"
              value={<GenderBadge gender={user.gender} />}
            />
          )}

          {/* مكان السكن */}
          {shouldShow(Boolean(user.residence)) && (
            <InfoField
              icon={<MapPin className="w-5 h-5" />}
              label="مكان السكن"
              value={
                isEditing ? (
                  <TextInput
                    placeholder="المدينة / الحي"
                    value={edited?.residence ?? ""}
                    onChange={(v) => updateField("residence", v)}
                    onBlur={() =>
                      handleFieldBlur("residence", edited?.residence)
                    }
                    error={fieldErrors?.["residence"]}
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
              icon={<Mail className="w-5 h-5" />}
              label="البريد الإلكتروني"
              value={nv(user.email)}
            />
          )}

          {/* رقم الهاتف */}
          {shouldShow(Boolean(user.phoneNumber)) && (
            <InfoField
              icon={<Phone className="w-5 h-5" />}
              label="رقم الهاتف"
              value={
                isEditing ? (
                  <div className="space-y-2 mt-3">
                    <TextInput
                      type="tel"
                      inputMode="numeric"
                      placeholder="05xxxxxxxx (10 أرقام)"
                      value={edited?.phoneNumber ?? ""}
                      onChange={handlePhoneNumberChange}
                      onBlur={() =>
                        handleFieldBlur("phoneNumber", edited?.phoneNumber)
                      }
                      error={fieldErrors?.["phoneNumber"]}
                      maxLength={10}
                    />
                    {checkingDuplicate === "phoneNumber" && (
                      <p className="text-xs text-teal-600 font-medium text-right flex items-center gap-1" dir="rtl">
                        <span className="animate-spin inline-block w-3 h-3 border-2 border-teal-600 border-t-transparent rounded-full"></span>
                        جاري التحقق من التكرار...
                      </p>
                    )}
                  </div>
                ) : (
                  nv(user.phoneNumber)
                )
              }
            />
          )}

          {/* اسم الأم */}
          {shouldShow(Boolean(user.motherName)) && (
            <InfoField
              icon={<UserIcon className="w-5 h-5" />}
              label="اسم الأم"
              value={
                isEditing ? (
                  <TextInput
                    placeholder="اسم الأم"
                    value={edited?.motherName ?? ""}
                    onChange={(v) => updateField("motherName", v)}
                    onBlur={() =>
                      handleFieldBlur("motherName", edited?.motherName)
                    }
                    error={fieldErrors?.["motherName"]}
                  />
                ) : (
                  nv(user.motherName)
                )
              }
            />
          )}

          {/* اسم المجموعة */}
          {user.role === "student" && !isEditing && user.group && (
            <InfoField
              icon={<Users className="w-5 h-5" />}
              label="اسم المجموعة"
              value={nv(user.group)}
            />
          )}

          {/* اسم المعلم */}
          {user.role === "student" && !isEditing && user.teacher && (
            <InfoField
              icon={<UserIcon className="w-5 h-5" />}
              label="اسم المعلم"
              value={nv(user.teacher)}
            />
          )}

          {/* تاريخ إنشاء الحساب */}
          {shouldShow(Boolean(user.createdAt)) && (
            <InfoField
              icon={<Clock className="w-5 h-5" />}
              label="تاريخ إنشاء الحساب"
              value={formatDate(user.createdAt)}
            />
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
    </div>
  );
};

export default ProfilePage;
