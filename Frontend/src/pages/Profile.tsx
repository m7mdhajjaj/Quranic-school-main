import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Edit,
  Phone,
  Calendar,
  MapPin,
  Users,

  Lock,
  Save,
  X,
  User as UserIcon,
  Loader2,
  RefreshCw,
  IdCard,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import Avatar from "../components/Avatar";
import { useAuth } from "../hooks/useAuth";

// Local helper functions
const getUserGender = (user: any) => {
  return user?.gender || "male";
};

const fetchAvatarBlobUrl = async (endpoint: string, userId: string) => {
  try {
    const response = await api.get(`/${endpoint}/${userId}/avatar`, {
      responseType: "blob",
    });
    return URL.createObjectURL(response.data);
  } catch (error) {
    console.error("Error fetching avatar:", error);
    return null;
  }
};
import "react-toastify/dist/ReactToastify.css";

// ============================
// الإعداد
// ============================
import { API_URL } from "../config";

// Axios مع التوكن
const api = axios.create({ baseURL: API_URL });

// إضافة التوكن للـ requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============================
// Types
// ============================
interface UserBase {
  _id: string;
  idNumber?: string;
  firstName?: string;
  fatherName?: string;
  grandFatherName?: string;
  motherName?: string;
  lastName?: string;
  birthDate?: string; // ISO
  gender?: string; // 'male' | 'female' | 'ذكر' | 'انثى'
  residence?: string;
  email?: string;
  phoneNumber?: string;
  groups?: string[];
  role?: "student" | "teacher" | "admin";
  createdAt?: string;
  updatedAt?: string;
  age?: number;
  teacherId?: number;
  studentId?: number;
  group?: string;
  teacher?: string;
}

type Endpoint = "students" | "teachers" | "admins";

type FetchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ok" }
  | { status: "error"; message: string };

// ============================
// Helpers
// ============================
const toArabicGender = (g?: string) => {
  if (!g || g.trim() === "") return "غير محدد";

  const normalized = g.trim();
  if (normalized === "ذكر" || normalized === "male") return "ذكر";
  if (normalized === "أنثى" || normalized === "انثى" || normalized === "female")
    return "أنثى";

  return "غير محدد";
};

const calcAge = (iso?: string) => {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(+d)) return undefined;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
};

const formatDate = (iso?: string) => {
  if (!iso) return "غير محدد";
  const d = new Date(iso);
  return Number.isNaN(+d)
    ? "غير محدد"
    : d.toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
};

const nv = (v?: string | number) =>
  v === undefined || v === null || v === "" ? "غير متوفر" : String(v);

const fetchJson = async (url: string) => {
  const res = await api.get(url);
  return res.data?.data ?? res.data;
};

// ------ تحكم التعديلات (مرتان خلال شهر متحرك) ------
const addOneMonth = (dt: Date) => {
  const d = new Date(dt);
  d.setMonth(d.getMonth() + 1);
  return d;
};
const pruneRolling = (timestamps: string[]) => {
  const now = new Date();
  return timestamps.filter((iso) => now < addOneMonth(new Date(iso)));
};
const keyFor = (field: "birthDate" | "gender", userId: string) =>
  `editHistory_${field}_${userId}`;

/** يرجع: {allowed, remaining, list} */
const canEditFieldLocal = (field: "birthDate" | "gender", userId: string) => {
  const raw = localStorage.getItem(keyFor(field, userId));
  const list = pruneRolling(raw ? JSON.parse(raw) : []);
  const allowed = list.length < 2;
  const remaining = Math.max(0, 2 - list.length);
  return { allowed, remaining, list };
};
const recordEditLocal = (field: "birthDate" | "gender", userId: string) => {
  const { list } = canEditFieldLocal(field, userId);
  const updated = [...list, new Date().toISOString()];
  localStorage.setItem(keyFor(field, userId), JSON.stringify(updated));
};

// fetchAvatarBlobUrl is now defined locally above

// ============================
// Component
// ============================
const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  const [user, setUser] = useState<UserBase | null>(null);
  const [endpoint, setEndpoint] = useState<Endpoint>("students");
  const [fetchState, setFetchState] = useState<FetchState>({ status: "idle" });

  const [isEditing, setIsEditing] = useState(false);
  const [edited, setEdited] = useState<UserBase | null>(null);

  // للأفاتار
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>("");

  // ظهور أنيق على التحميل


  // عرض الاسم الكامل + العمر ديناميكي
  const fullName = useMemo(
    () =>
      [user?.firstName, user?.fatherName, user?.grandFatherName, user?.lastName]
        .filter(Boolean)
        .join(" "),
    [user]
  );
  const age = useMemo(() => calcAge(user?.birthDate), [user?.birthDate]);

  // معرف المستخدم وتحديد النوع
  const getUserInfo = () => {
    const userId = authUser?._id || "";
    const userRole = authUser?.role;

    // تتبع المشكلة
    console.log("Profile - getUserInfo:", { userId, userRole, authUser });

    return { userId, userRole };
  };

  // تحميل البيانات
  const loadUser = async () => {
    const { userId: id, userRole } = getUserInfo();
    console.log("Profile - loadUser called:", { id, userRole });
    if (!id) {
      console.log("Profile - No user ID found, setting error state");
      setFetchState({ status: "error", message: "لا يوجد مستخدم مسجّل." });
      return;
    }
    setFetchState({ status: "loading" });

    try {
      // إذا كان أدمن، جرّب الأدمن أولاً
      if (userRole === "admin") {
        try {
          const u: UserBase = await fetchJson(`/admins/${id}`);
          setUser({ ...u, role: u.role ?? "admin" });
          setEndpoint("admins");
          const url = await fetchAvatarBlobUrl("admins", u._id);
          setAvatarUrl((prev) => {
            if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
            return url;
          });
          setFetchState({ status: "ok" });
          return;
        } catch (e: any) {
          if (e?.response?.status !== 404) throw e;
        }
      }

      // إذا كان النوع معروف من localStorage، جرّبه أولاً
      if (userRole === "teacher" || userRole?.includes("teacher")) {
        try {
          const u: UserBase = await fetchJson(`/teachers/${id}`);
          setUser({ ...u, role: u.role ?? "teacher" });
          setEndpoint("teachers");
          const url = await fetchAvatarBlobUrl("teachers", u._id);
          setAvatarUrl((prev) => {
            if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
            return url;
          });
          setFetchState({ status: "ok" });
          return;
        } catch (e: any) {
          if (e?.response?.status !== 404) throw e;
        }
      }

      // جرّب الطالب
      try {
        const u: UserBase = await fetchJson(`/students/${id}`);
        setUser({ ...u, role: u.role ?? "student" });
        setEndpoint("students");
        const url = await fetchAvatarBlobUrl("students", u._id);
        setAvatarUrl((prev) => {
          if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
          return url;
        });
        setFetchState({ status: "ok" });
        return;
      } catch (e: any) {
        if (e?.response?.status !== 404) throw e;
      }

      // جرّب المعلّم (إذا لم يجرّب بعد)
      if (
        userRole !== "teacher" &&
        !userRole?.includes("admin") &&
        !userRole?.includes("teacher")
      ) {
        const u: UserBase = await fetchJson(`/teachers/${id}`);
        setUser({ ...u, role: u.role ?? "teacher" });
        setEndpoint("teachers");
        const url = await fetchAvatarBlobUrl("teachers", u._id);
        setAvatarUrl((prev) => {
          if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
          return url;
        });
        setFetchState({ status: "ok" });
      }
    } catch (e: any) {
      console.log("Profile - Error in loadUser:", e);

      // إذا كان خطأ 401 (Unauthorized), أعد توجيه للـ login
      if (e?.response?.status === 401) {
        console.log("Profile - 401 error, redirecting to login");
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      setFetchState({
        status: "error",
        message: e?.response?.data?.message || "فشل تحميل البيانات",
      });
    }
  };

  useEffect(() => {
    loadUser();
    useEffect(() => {
    // Component mounted - animations ready
  }, []);
    return () => {
      if (avatarUrl && avatarUrl.startsWith("blob:"))
        URL.revokeObjectURL(avatarUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // تحرير
  const beginEdit = () => {
    setEdited(user);
    setIsEditing(true);
  };
  const cancelEdit = () => {
    setIsEditing(false);
    setEdited(null);
    setAvatarFile(null);
  };

  // حفظ
  const saveProfile = async () => {
    if (!user || !edited) return;

    // لا تعدّل رقم الهوية أبداً: لا نُرسله ولا نسمح بتغييره
    const payload: Partial<UserBase> = {
      firstName: edited.firstName,
      lastName: edited.lastName,
      birthDate: edited.birthDate,
      gender: edited.gender,
      residence: edited.residence,
      idNumber: edited.idNumber,
      // تم حذف الإيميل من التعديلات
      phoneNumber: edited.phoneNumber,
      groups: edited.groups,
    };

    // تحقق محلي: نافذة شهر متحركة لكل من تاريخ الميلاد والجنس
    const changingBirth = edited.birthDate !== user.birthDate;
    const changingGender = (edited.gender ?? "") !== (user.gender ?? "");

    if (changingBirth) {
      const b = canEditFieldLocal("birthDate", user._id);
      if (!b.allowed) {
        toast.error(
          "لا يمكنك تعديل تاريخ الميلاد أكثر من مرتين خلال شهر كامل من آخر تعديلاتك"
        );
        return;
      }
    }
    if (changingGender) {
      const g = canEditFieldLocal("gender", user._id);
      if (!g.allowed) {
        toast.error(
          "لا يمكنك تعديل الجنس أكثر من مرتين خلال شهر كامل من آخر تعديلاتك"
        );
        return;
      }
    }

    try {
      // (1) البيانات النصية
      await api.put(`/${endpoint}/${user._id}`, payload);

      // سجّل التعديلات بعد نجاح الطلب
      if (changingBirth) recordEditLocal("birthDate", user._id);
      if (changingGender) recordEditLocal("gender", user._id);

      // (2) رفع الصورة
      if (avatarFile) {
        const fd = new FormData();
        fd.append("avatar", avatarFile);
        await api.post(`/${endpoint}/${user._id}/avatar`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const newUrl = await fetchAvatarBlobUrl(endpoint, user._id);
        setAvatarUrl((prev) => {
          if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
          return newUrl;
        });
        setAvatarFile(null);
      }

      setUser({ ...user, ...payload });
      setEdited(null);
      setIsEditing(false);
      toast.success("تم حفظ التعديلات بنجاح");
    } catch (e: any) {
      const msg = e?.response?.data?.message || "تعذّر حفظ التعديلات";
      toast.error(msg);
    }
  };

  // تغيير كلمة المرور - للاستخدام المستقبلي
  // const changePassword = async (oldPass: string, newPass: string) => {
  //   try {
  //     await api.put(`/${endpoint}/${user?._id}/password`, {
  //       oldPassword: oldPass,
  //       newPassword: newPass,
  //     });
  //     toast.success("تم تغيير كلمة المرور");
  //   } catch (e: any) {
  //     toast.error(e?.response?.data?.message || "تعذّر تغيير كلمة المرور");
  //   }
  // };

  // منطق إظهار/إخفاء بطاقة:
  // - إذا الدور Student & ليست في وضع التعديل & لا توجد بيانات: نخفي البطاقة
  // - خلاف ذلك نظهرها
  const shouldShow = (valuePresent: boolean) => {
    if (user?.role === "student" && !isEditing && !valuePresent) return false;
    return true;
  };

  // UI حالات
  if (fetchState.status === "loading") {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>جارِ تحميل الملف الشخصي…</span>
        </div>
      </div>
    );
  }

  if (fetchState.status === "error") {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-5xl">
          <div className="bg-red-50/90  border border-red-200 text-red-700 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div>{fetchState.message}</div>
            <button
              onClick={loadUser}
              className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition">
              <RefreshCw className="w-4 h-4" />
              إعادة المحاولة
            </button>
          </div>
        </div>
        <ToastContainer rtl position="top-center" />
      </div>
    );
  }

  if (!user) return null;

  const remainingBirth = canEditFieldLocal("birthDate", user._id).remaining;
  // const remainingGender = canEditFieldLocal("gender", user._id).remaining;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50" dir="rtl">
      {/* خلفية ديكوريتف */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* قسم الهيدر المحسن */}
      <div className="relative">
        <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-b-[3rem] shadow-2xl shadow-emerald-500/25">
          <div className="container mx-auto px-6 py-12">
            {/* الصورة الشخصية والمعلومات الأساسية */}
            <div className="flex items-center flex-col text-center">
              <div className="relative mb-6 group">
                <div className="absolute -inset-1 bg-gradient-to-r from-white/30 to-white/10 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
                <div className="relative">
                  <Avatar
                    src={avatarUrl}
                    previewSrc={avatarFile ? URL.createObjectURL(avatarFile) : null}
                    userName={user.firstName}
                    gender={getUserGender(user)}
                    size="3xl"
                    border="ring"
                    showStatus={true}
                    showEditButton={isEditing}
                    onEditClick={() => document.getElementById("avatar")?.click()}
                    fallbackIcon={
                      <UserIcon className="w-12 h-12 text-emerald-600" />
                    }
                  />
                </div>
                {isEditing && (
                  <input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    aria-label="تغيير صورة الملف الشخصي"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      setAvatarFile(f);
                    }}
                  />
                )}
              </div>
              
              {/* اسم المستخدم ومعلومات إضافية */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
                  {fullName || "مرحباً بك"}
                </h1>
                {user.role && (
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white font-medium">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    {user.role === "student" ? "طالب" : user.role === "teacher" ? "معلم" : "مدير"}
                  </div>
                )}
                {age && (
                  <div className="mt-2 text-white/80 text-sm">
                    العمر: {age} سنة
                  </div>
                )}
              </div>

              {/* أزرار محسنة */}
              <div className="flex flex-wrap gap-4 justify-center">
                {!isEditing ? (
                  <>
                    <button
                      onClick={beginEdit}
                      className="group inline-flex items-center gap-3 bg-white text-emerald-700 font-bold px-6 py-3 rounded-2xl hover:bg-emerald-50 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-xl">
                      <Edit className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                      تعديل المعلومات الشخصية
                    </button>
                    <button
                      onClick={() => navigate("/change-password")}
                      className="group inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold px-6 py-3 rounded-2xl hover:bg-white/20 hover:scale-105 active:scale-95 transition-all duration-300">
                      <Lock className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                      تغيير كلمة المرور
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={saveProfile}
                      className="group inline-flex items-center gap-3 bg-white text-emerald-700 font-bold px-6 py-3 rounded-2xl hover:bg-emerald-50 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-xl">
                      <Save className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                      حفظ التعديلات
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="group inline-flex items-center gap-3 bg-red-500/20 backdrop-blur-sm border border-red-300/30 text-white font-bold px-6 py-3 rounded-2xl hover:bg-red-500/30 hover:scale-105 active:scale-95 transition-all duration-300">
                      <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                      إلغاء
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* قسم البطاقات المحسن */}
      <div className="relative container mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">المعلومات الشخصية</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto rounded-full"></div>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* الاسم الكامل */}
          {shouldShow(Boolean(fullName)) && (
            <InfoCard
              icon={<Users className="w-6 h-6 text-emerald-600" />}
              title="الاسم الكامل"
              value={
                isEditing ? (
                  <div className="grid grid-cols-2 gap-2">
                    <TextInput
                      placeholder="الاسم الأول"
                      value={edited?.firstName ?? ""}
                      onChange={(v) =>
                        setEdited((p) => (p ? { ...p, firstName: v } : p))
                      }
                    />
                    <TextInput
                      placeholder="اسم العائلة"
                      value={edited?.lastName ?? ""}
                      onChange={(v) =>
                        setEdited((p) => (p ? { ...p, lastName: v } : p))
                      }
                    />
                  </div>
                ) : (
                  nv(fullName)
                )
              }
            />
          )}

          {/* رقم الهوية — غير قابل للتعديل */}
          {shouldShow(Boolean(user.idNumber)) && (
            <InfoCard
              icon={<IdCard className="w-6 h-6 text-purple-600" />}
              title="رقم الهوية"
              value={
                isEditing ? (
                  <TextInput
                    value={edited?.idNumber ?? ""}
                    onChange={(v) =>
                      setEdited((p) => (p ? { ...p, idNumber: v } : p))
                    }
                    placeholder="رقم الهوية"
                  />
                ) : (
                  nv(user.idNumber)
                )
              }
            />
          )}

          {/* تاريخ الميلاد / العمر / الجنس + عداد المحاولات */}
          {shouldShow(
            Boolean(user.birthDate) || Boolean(user.gender) || isEditing
          ) && (
            <InfoCard
              icon={<Calendar className="w-6 h-6 text-amber-600" />}
              title="تاريخ الميلاد / العمر / الجنس"
              value={
                isEditing ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
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
                      />
                      <div className="bg-slate-50 text-slate-700 rounded-xl px-3 py-2">
                        العمر: {calcAge(edited?.birthDate) ?? "—"}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span>الجنس:</span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${
                          user.gender === "ذكر"
                            ? "bg-blue-100 text-blue-800"
                            : user.gender === "أنثى"
                            ? "bg-pink-100 text-pink-800"
                            : "bg-gray-100 text-gray-600"
                        }`}>
                        {user.gender === "ذكر"
                          ? "👨"
                          : user.gender === "أنثى"
                          ? "👩"
                          : "❓"}
                        {toArabicGender(user.gender)}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      المتبقي لتعديل تاريخ الميلاد: <b>{remainingBirth}</b> / 2
                    </div>
                  </div>
                ) : (
                  <>
                    <div>تاريخ الميلاد: {formatDate(user.birthDate)}</div>
                    <div className="mt-1">العمر: {age ?? "—"} سنة</div>
                    <div className="mt-1 flex items-center gap-2">
                      <span>الجنس:</span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${
                          user.gender === "ذكر"
                            ? "bg-blue-100 text-blue-800"
                            : user.gender === "أنثى"
                            ? "bg-pink-100 text-pink-800"
                            : "bg-gray-100 text-gray-600"
                        }`}>
                        {user.gender === "ذكر"
                          ? "👨"
                          : user.gender === "أنثى"
                          ? "👩"
                          : "❓"}
                        {toArabicGender(user.gender)}
                      </span>
                    </div>
                  </>
                )
              }
            />
          )}

          {/* مكان السكن */}
          {shouldShow(Boolean(user.residence)) && (
            <InfoCard
              icon={<MapPin className="w-6 h-6 text-pink-600" />}
              title="مكان السكن"
              value={
                isEditing ? (
                  <TextInput
                    placeholder="المدينة / الحي"
                    value={edited?.residence ?? ""}
                    onChange={(v) =>
                      setEdited((p) => (p ? { ...p, residence: v } : p))
                    }
                  />
                ) : (
                  nv(user.residence)
                )
              }
            />
          )}

          {/* البريد */}

          {/* الهاتف */}
          {shouldShow(Boolean(user.phoneNumber)) && (
            <InfoCard
              icon={<Phone className="w-6 h-6 text-orange-600" />}
              title="رقم الهاتف"
              value={
                isEditing ? (
                  <TextInput
                    placeholder="05xxxxxxxx"
                    value={edited?.phoneNumber ?? ""}
                    onChange={(v) =>
                      setEdited((p) => (p ? { ...p, phoneNumber: v } : p))
                    }
                  />
                ) : (
                  nv(user.phoneNumber)
                )
              }
            />
          )}

          {/* اسم المجموعة */}
          {user.role === "student" && !isEditing && (
            <InfoCard
              icon={<Users className="w-6 h-6 text-sky-600" />}
              title="اسم المجموعة"
              value={nv(user.group)}
            />
          )}

          {/* اسم المعلم */}
          {user.role === "student" && !isEditing && (
            <InfoCard
              icon={<UserIcon className="w-6 h-6 text-emerald-600" />}
              title="اسم المعلم"
              value={nv(user.teacher)}
            />
          )}

          {/* رقم الطالب */}
          {user.role === "student" && user.studentId && !isEditing && (
            <InfoCard
              icon={<IdCard className="w-6 h-6 text-blue-600" />}
              title="رقم الطالب"
              value={nv(user.studentId)}
            />
          )}

          {/* تاريخ إنشاء الحساب */}
          {shouldShow(Boolean(user.createdAt)) && (
            <InfoCard
              icon={<Calendar className="w-6 h-6 text-slate-600" />}
              title="تاريخ إنشاء الحساب"
              value={user.createdAt ? formatDate(user.createdAt) : "غير متوفر"}
            />
          )}
        </div>
      </div>

      <ToastContainer rtl position="top-center" />
    </div>
  );
};

// ============================
// عناصر فرعية
// ============================
const InfoCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: React.ReactNode;
}> = ({ icon, title, value }) => (
  <div className="group relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-100/50 p-6 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-2 hover:bg-white/95 overflow-hidden">
    {/* تأثير ديكوري خلفي */}
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/5 to-transparent rounded-full blur-3xl group-hover:from-emerald-400/10 transition-all duration-500"></div>
    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-teal-400/5 to-transparent rounded-full blur-2xl group-hover:from-teal-400/10 transition-all duration-500"></div>
    
    <div className="relative">
      <div className="flex items-center gap-4 mb-4">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-3 rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm border border-emerald-100/30">
          <div className="text-emerald-600">
            {icon}
          </div>
        </div>
        <div className="font-bold text-gray-800 group-hover:text-emerald-700 transition-colors duration-300 text-lg">
          {title}
        </div>
      </div>
      <div className="text-gray-700 leading-relaxed font-medium text-base">
        {value}
      </div>
    </div>
  </div>
);

const TextInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}> = ({ value, onChange, placeholder, type = "text" }) => (
  <input
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full border-2 border-gray-200/60 rounded-2xl px-4 py-3 bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 hover:border-emerald-300 transition-all duration-300 text-gray-700 placeholder-gray-400 shadow-sm hover:shadow-md"
  />
);

export default Profile;
