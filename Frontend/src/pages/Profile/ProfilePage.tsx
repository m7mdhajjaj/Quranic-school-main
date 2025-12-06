// ProfilePage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { useAuth } from "@/hooks/useAuth";
import {
  showSuccessMessage,
  showErrorMessage,
} from "@/components/utils/sweetalertUtils";
import ChangePasswordModal from "../Auth/ChangePass/ChangePass";
import {
  getUserWithFallback,
  updateUserById,
  fetchAvatarBlobUrl,
  uploadUserAvatar,
  deleteUserAvatar,
} from "@/Api/profileApi";
import {
  validateProfileData,
  validateField,
  type FieldErrors,
} from "../../Validation/profileValidation";
import { Card } from "@/components/UI/Card";
import { EmptyState } from "@/components/UI/EmptyState";
import { LoadingSpinner } from "@/components/UI/LoadingSpinner";
import {
  ProfileHeader,
  AvatarSection,
  InfoField,
  TextInput,
  GenderBadge,
} from "./components";
// SocketIndicator disabled by user
// import { SocketIndicator } from "./components/SocketIndicator";
import { calcAge, formatDate, nv, getRoleConfig } from "./utils/profileHelpers";
import { canEditFieldLocal, recordEditLocal } from "./utils/editLimits";
import type { UserProfile, Endpoint, FetchState } from "./types/profile.types";

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user: authUser, updateUser: updateAuthUser } = useAuth();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [endpoint, setEndpoint] = useState<Endpoint>("students");
  const [fetchState, setFetchState] = useState<FetchState>({ status: "idle" });

  const [isEditing, setIsEditing] = useState(false);
  const [edited, setEdited] = useState<UserProfile | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>("");
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const fullName = useMemo(
    () =>
      [user?.firstName, user?.fatherName, user?.grandFatherName, user?.lastName]
        .filter(Boolean)
        .join(" "),
    [user]
  );
  const age = useMemo(() => calcAge(user?.birthDate), [user?.birthDate]);

  const getUserInfo = () => {
    const userId = authUser?._id || "";
    const userRole = authUser?.role;
    return { userId, userRole };
  };

  const loadUser = async () => {
    const { userId: id, userRole } = getUserInfo();
    if (!id) {
      setFetchState({ status: "error", message: "لا يوجد مستخدم مسجّل." });
      return;
    }
    setFetchState({ status: "loading" });

    try {
      const result = await getUserWithFallback(id, userRole);
      setUser(result.user);
      setEndpoint(result.endpoint);

      const url = await fetchAvatarBlobUrl(result.endpoint, result.user._id);
      setAvatarUrl((prev) => {
        if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
        return url;
      });

      setFetchState({ status: "ok" });
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { status?: number; data?: { message?: string } };
      };

      if (axiosError?.response?.status === 401) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      setFetchState({
        status: "error",
        message: axiosError?.response?.data?.message || "فشل تحميل البيانات",
      });
    }
  };

  useEffect(() => {
    loadUser();
    return () => {
      if (avatarUrl && avatarUrl.startsWith("blob:"))
        URL.revokeObjectURL(avatarUrl);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const beginEdit = () => {
    setEdited(user);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEdited(null);
    setAvatarFile(null);
    setFieldErrors({});
  };

  const handleDeleteAvatar = async () => {
    if (!user || !endpoint) return;

    const Swal = (await import("sweetalert2")).default;
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      html: `
        <div class="text-center py-4">
          <div class="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg class="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </div>
          <p class="text-lg font-semibold text-gray-800 mb-2">سيتم حذف الصورة الشخصية نهائياً</p>
          <p class="text-sm text-gray-600">لا يمكن التراجع عن هذا الإجراء</p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، احذف الصورة",
      cancelButtonText: "إلغاء",
      reverseButtons: true,
      customClass: {
        popup: "!rounded-2xl",
        confirmButton:
          "!bg-red-600 hover:!bg-red-700 !text-white !font-bold !px-6 !py-3 !rounded-xl !shadow-lg",
        cancelButton:
          "!bg-gray-300 hover:!bg-gray-400 !text-gray-800 !font-bold !px-6 !py-3 !rounded-xl !shadow-lg",
      },
    });

    if (!result.isConfirmed) return;

    try {
      await deleteUserAvatar(endpoint, user._id);

      if (avatarUrl && avatarUrl.startsWith("blob:")) {
        URL.revokeObjectURL(avatarUrl);
      }
      setAvatarUrl(null);
      setAvatarFile(null);

      if (user) {
        setUser({ ...user, avatar: undefined });
      }

      updateAuthUser({
        avatar: undefined,
      });

      await showSuccessMessage("تم الحذف!", "تم حذف الصورة الشخصية بنجاح");
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      const msg = axiosError?.response?.data?.message || "تعذّر حذف الصورة";
      await showErrorMessage("خطأ في الحذف!", msg);
    }
  };

  const handleFieldBlur = async (
    fieldName: string,
    value: string | undefined
  ) => {
    if (!user) return;

    const errorMessage = await validateField(
      fieldName,
      value,
      user.role as "student" | "teacher" | "admin"
    );
    if (errorMessage) {
      setFieldErrors((prev: FieldErrors) => ({
        ...prev,
        [fieldName]: errorMessage,
      }));
    } else {
      setFieldErrors((prev: FieldErrors) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName as keyof FieldErrors];
        return newErrors;
      });
    }
  };

  const saveProfile = async () => {
    if (!user || !edited) return;

    setFieldErrors({});

    const validation = await validateProfileData({
      firstName: edited.firstName,
      fatherName: edited.fatherName,
      grandFatherName: edited.grandFatherName,
      lastName: edited.lastName,
      motherName: edited.motherName,
      email: edited.email,
      phoneNumber: edited.phoneNumber,
      birthDate: edited.birthDate,
      gender: edited.gender,
      residence: edited.residence,
      idNumber: edited.idNumber,
      role: user.role || "student",
    });

    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      await showErrorMessage(
        "خطأ في البيانات",
        "يرجى تصحيح الأخطاء في النموذج"
      );
      return;
    }

    setIsSaving(true);

    const payload: Partial<UserProfile> = {
      firstName: edited.firstName,
      fatherName: edited.fatherName,
      grandFatherName: edited.grandFatherName,
      motherName: edited.motherName,
      lastName: edited.lastName,
      birthDate: edited.birthDate,
      gender: edited.gender,
      residence: edited.residence,
      idNumber: edited.idNumber,
      phoneNumber: edited.phoneNumber,
    };

    if (user.role === "teacher" && edited.groups !== undefined) {
      payload.groups = edited.groups;
    }

    const changingBirth = edited.birthDate !== user.birthDate;
    const changingGender = (edited.gender ?? "") !== (user.gender ?? "");

    if (changingBirth) {
      const b = canEditFieldLocal("birthDate", user._id);
      if (!b.allowed) {
        await showErrorMessage(
          "غير مسموح بالتعديل",
          "لا يمكنك تعديل تاريخ الميلاد أكثر من مرتين خلال شهر كامل من آخر تعديلاتك"
        );
        setIsSaving(false);
        return;
      }
    }
    if (changingGender) {
      const g = canEditFieldLocal("gender", user._id);
      if (!g.allowed) {
        await showErrorMessage(
          "غير مسموح بالتعديل",
          "لا يمكنك تعديل الجنس أكثر من مرتين خلال شهر كامل من آخر تعديلاتك"
        );
        setIsSaving(false);
        return;
      }
    }

    try {
      await updateUserById(endpoint, user._id, payload);

      if (changingBirth) recordEditLocal("birthDate", user._id);
      if (changingGender) recordEditLocal("gender", user._id);

      if (avatarFile) {
        const fd = new FormData();
        fd.append("avatar", avatarFile);
        const uploadResponse = await uploadUserAvatar(endpoint, user._id, fd);

        const newUrl = await fetchAvatarBlobUrl(endpoint, user._id);
        setAvatarUrl((prev) => {
          if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
          return newUrl;
        });
        setAvatarFile(null);

        if (uploadResponse?.avatarUrl) {
          updateAuthUser({
            avatar: {
              url: uploadResponse.avatarUrl,
            },
          });
        }
      }

      setUser({ ...user, ...payload });
      setEdited(null);
      setIsEditing(false);
      await showSuccessMessage("تم الحفظ!", "تم حفظ التعديلات بنجاح");
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      const msg = axiosError?.response?.data?.message || "تعذّر حفظ التعديلات";
      await showErrorMessage("خطأ في الحفظ!", msg);
    } finally {
      setIsSaving(false);
    }
  };

  const shouldShow = (valuePresent: boolean) => {
    if (user?.role === "student" && !isEditing && !valuePresent) return false;
    return true;
  };

  if (fetchState.status === "loading") {
    return <LoadingSpinner fullScreen size="xl" text="جاري التحميل..." />;
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

  const remainingBirth = canEditFieldLocal("birthDate", user._id).remaining;
  const roleConfig = getRoleConfig(user.role);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hero Section with Simple Design */}
      <div className="relative bg-gradient-to-r from-teal-500 to-emerald-600 overflow-hidden pb-16">
        <div className="relative container mx-auto px-4 py-12">
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
            onSave={saveProfile}
            onCancel={cancelEdit}
            onChangePassword={() => setIsChangePasswordModalOpen(true)}
          />
        </div>

        {/* Wave Separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" className="w-full h-auto">
            <path
              fill="#f9fafb"
              d="M0,50L48,45C96,40,192,30,288,33.3C384,37,480,53,576,56.7C672,60,768,50,864,45C960,40,1056,40,1152,45C1248,50,1344,60,1392,65L1440,70L1440,100L0,100Z"></path>
          </svg>
        </div>
      </div>

      {/* Content Section - Simple White Background */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-4">
          {/* الاسم الكامل */}
          {shouldShow(Boolean(fullName)) && (
            <InfoField
              icon={<Users className="w-5 h-5" />}
              label="الاسم الكامل"
              value={
                isEditing ? (
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <TextInput
                      placeholder="الاسم الأول"
                      value={edited?.firstName ?? ""}
                      onChange={(v) =>
                        setEdited((p) => (p ? { ...p, firstName: v } : p))
                      }
                      onBlur={() =>
                        handleFieldBlur("firstName", edited?.firstName)
                      }
                      error={fieldErrors?.["firstName"]}
                    />
                    <TextInput
                      placeholder="اسم الأب"
                      value={edited?.fatherName ?? ""}
                      onChange={(v) =>
                        setEdited((p) => (p ? { ...p, fatherName: v } : p))
                      }
                      onBlur={() =>
                        handleFieldBlur("fatherName", edited?.fatherName)
                      }
                      error={fieldErrors?.["fatherName"]}
                    />
                    <TextInput
                      placeholder="اسم الجد"
                      value={edited?.grandFatherName ?? ""}
                      onChange={(v) =>
                        setEdited((p) => (p ? { ...p, grandFatherName: v } : p))
                      }
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
                      onChange={(v) =>
                        setEdited((p) => (p ? { ...p, lastName: v } : p))
                      }
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

          {/* رقم الهوية */}
          {shouldShow(Boolean(user.idNumber)) && (
            <InfoField
              icon={<IdCard className="w-5 h-5" />}
              label="رقم الهوية"
              value={
                isEditing ? (
                  <TextInput
                    inputMode="numeric"
                    value={edited?.idNumber ?? ""}
                    onChange={(v) => {
                      const numbersOnly = v.replace(/\D/g, "");
                      setEdited((p) =>
                        p ? { ...p, idNumber: numbersOnly } : p
                      );
                    }}
                    onBlur={() => handleFieldBlur("idNumber", edited?.idNumber)}
                    error={fieldErrors?.["idNumber"]}
                    placeholder="رقم الهوية (9 أرقام)"
                    maxLength={9}
                  />
                ) : (
                  nv(user.idNumber)
                )
              }
            />
          )}

          {/* تاريخ الميلاد */}
          {shouldShow(Boolean(user.birthDate) || isEditing) && (
            <InfoField
              icon={<Calendar className="w-5 h-5" />}
              label="تاريخ الميلاد"
              value={
                isEditing ? (
                  <div className="space-y-2 mt-2">
                    <TextInput
                      type="date"
                      value={
                        edited?.birthDate ? edited.birthDate.slice(0, 10) : ""
                      }
                      onChange={(v) =>
                        setEdited((p) =>
                          p
                            ? {
                                ...p,
                                birthDate: v ? new Date(v).toISOString() : "",
                              }
                            : p
                        )
                      }
                      onBlur={() =>
                        handleFieldBlur("birthDate", edited?.birthDate)
                      }
                      error={fieldErrors?.["birthDate"]}
                    />
                    {remainingBirth < 2 && (
                      <div className="flex items-center gap-2 text-xs bg-amber-50 text-amber-700 px-3 py-2 rounded-lg border border-amber-200">
                        <span>عدد التعديلات المتبقية:</span>
                        <span className="font-bold">{remainingBirth} / 2</span>
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
                    onChange={(v) =>
                      setEdited((p) => (p ? { ...p, residence: v } : p))
                    }
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
                  <TextInput
                    type="tel"
                    inputMode="numeric"
                    placeholder="05xxxxxxxx (10 أرقام)"
                    value={edited?.phoneNumber ?? ""}
                    onChange={(v) => {
                      const numbersOnly = v.replace(/\D/g, "");
                      setEdited((p) =>
                        p ? { ...p, phoneNumber: numbersOnly } : p
                      );
                    }}
                    onBlur={() =>
                      handleFieldBlur("phoneNumber", edited?.phoneNumber)
                    }
                    error={fieldErrors?.["phoneNumber"]}
                    maxLength={10}
                  />
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
                    onChange={(v) =>
                      setEdited((p) => (p ? { ...p, motherName: v } : p))
                    }
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
