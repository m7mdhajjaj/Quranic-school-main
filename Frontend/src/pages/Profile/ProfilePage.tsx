// ProfilePage.tsx - Enhanced with Framer Motion
import { motion } from "framer-motion";
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
  AnimatedBackground,
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

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

const heroVariants = {
  hidden: { opacity: 0, y: -30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

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

  // Profile handlers hook
  const {
    isChangePasswordModalOpen,
    setIsChangePasswordModalOpen,
    fullName,
    age,
    roleConfig,
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

  // Merge field errors
  const fieldErrors = { ...editFieldErrors, ...validationFieldErrors };

  if (fetchState.status === "loading") {
    return <ProfileSkeleton />;
  }

  if (fetchState.status === "error") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 p-6 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="max-w-md w-full"
        >
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
        </motion.div>
      </motion.div>
    );
  }

  if (!user) return null;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100"
      dir="rtl"
    >
      {/* Hero Section with Animated Background */}
      <motion.div
        variants={heroVariants}
        className="relative overflow-hidden pb-24"
      >
        {/* Animated Background */}
        <AnimatedBackground variant="teal" />

        {/* Content */}
        <div className="relative container mx-auto px-4 py-16 z-10">
          {/* Avatar with Animation */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
              delay: 0.2,
            }}
          >
            <AvatarSection
              user={user}
              avatarUrl={avatarUrl}
              avatarFile={avatarFile}
              isEditing={isEditing}
              onAvatarChange={setAvatarFile}
              onDeleteAvatar={handleDeleteAvatar}
            />
          </motion.div>

          {/* Profile Header with Animation */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
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
          </motion.div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
            preserveAspectRatio="none"
          >
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="#f9fafb"
            />
          </svg>
        </div>
      </motion.div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-8 -mt-8" dir="rtl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {/* الاسم الكامل */}
          {shouldShow(Boolean(fullName)) && (
            <motion.div variants={itemVariants}>
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
            </motion.div>
          )}

          {/* رقم الهوية - لا يمكن تعديله */}
          {shouldShow(Boolean(user.idNumber)) && !isEditing && (
            <motion.div variants={itemVariants}>
              <InfoField
                icon={<IdCard className="w-5 h-5" />}
                label="رقم الهوية"
                value={nv(user.idNumber)}
              />
            </motion.div>
          )}

          {/* تاريخ الميلاد */}
          {shouldShow(Boolean(user.birthDate) || isEditing) && (
            <motion.div variants={itemVariants}>
              <InfoField
                icon={<Calendar className="w-5 h-5" />}
                label="تاريخ الميلاد"
                value={
                  isEditing ? (
                    <div className="space-y-3 mt-3">
                      <DatePicker
                        value={
                          edited?.birthDate && !isNaN(new Date(edited.birthDate).getTime())
                            ? edited.birthDate.slice(0, 10)
                            : ""
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
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-2 text-xs bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 px-4 py-2.5 rounded-xl border border-amber-300 shadow-sm"
                          dir="rtl"
                        >
                          <span className="font-semibold">عدد التعديلات المتبقية:</span>
                          <span className="font-bold bg-amber-100 px-2 py-1 rounded-lg">{remainingBirth} / 2</span>
                        </motion.div>
                      )}
                    </div>
                  ) : (
                    formatDate(user.birthDate)
                  )
                }
              />
            </motion.div>
          )}

          {/* الجنس */}
          {shouldShow(Boolean(user.gender) || isEditing) && (
            <motion.div variants={itemVariants}>
              <InfoField
                icon={<UserIcon className="w-5 h-5" />}
                label="الجنس"
                value={<GenderBadge gender={user.gender} />}
              />
            </motion.div>
          )}

          {/* مكان السكن */}
          {shouldShow(Boolean(user.residence)) && (
            <motion.div variants={itemVariants}>
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
            </motion.div>
          )}

          {/* البريد الإلكتروني */}
          {shouldShow(Boolean(user.email)) && (
            <motion.div variants={itemVariants}>
              <InfoField
                icon={<Mail className="w-5 h-5" />}
                label="البريد الإلكتروني"
                value={nv(user.email)}
              />
            </motion.div>
          )}

          {/* رقم الهاتف */}
          {shouldShow(Boolean(user.phoneNumber)) && (
            <motion.div variants={itemVariants}>
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
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-xs text-teal-600 font-medium text-right flex items-center gap-1"
                          dir="rtl"
                        >
                          <span className="animate-spin inline-block w-3 h-3 border-2 border-teal-600 border-t-transparent rounded-full"></span>
                          جاري التحقق من التكرار...
                        </motion.p>
                      )}
                    </div>
                  ) : (
                    nv(user.phoneNumber)
                  )
                }
              />
            </motion.div>
          )}

          {/* اسم الأم */}
          {shouldShow(Boolean(user.motherName)) && (
            <motion.div variants={itemVariants}>
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
            </motion.div>
          )}

          {/* اسم المجموعة */}
          {user.role === "student" && !isEditing && user.group && (
            <motion.div variants={itemVariants}>
              <InfoField
                icon={<Users className="w-5 h-5" />}
                label="اسم المجموعة"
                value={nv(user.group)}
              />
            </motion.div>
          )}

          {/* اسم المعلم */}
          {user.role === "student" && !isEditing && user.teacher && (
            <motion.div variants={itemVariants}>
              <InfoField
                icon={<UserIcon className="w-5 h-5" />}
                label="اسم المعلم"
                value={nv(user.teacher)}
              />
            </motion.div>
          )}

          {/* تاريخ إنشاء الحساب */}
          {shouldShow(Boolean(user.createdAt)) && (
            <motion.div variants={itemVariants}>
              <InfoField
                icon={<Clock className="w-5 h-5" />}
                label="تاريخ إنشاء الحساب"
                value={formatDate(user.createdAt)}
              />
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
    </motion.div>
  );
};

export default ProfilePage;
