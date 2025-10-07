import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Edit,
  Phone,
  Calendar,
  MapPin,
  Users,
  Lock,
  X,
  User as UserIcon,
  Loader2,
  RefreshCw,
  IdCard,
  Mail,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Camera,
  Award,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import Avatar from '../components/Avatar';
import { useAuth } from '../hooks/useAuth';
import {
  getUserWithFallback,
  updateUserById,
  fetchAvatarBlobUrl,
  uploadUserAvatar,
  type UserProfile,
} from '../Api/profileApi';

type Endpoint = 'students' | 'teachers' | 'admins';
import 'react-toastify/dist/ReactToastify.css';

// Local helper functions
const getUserGender = (user: UserProfile): 'male' | 'ذكر' | 'أنثى' | 'female' | undefined => {
  const gender = user?.gender;
  if (gender === 'ذكر' || gender === 'male') return 'male';
  if (gender === 'أنثى' || gender === 'انثى' || gender === 'female') return 'female';
  return 'male'; // default
};

type FetchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ok' }
  | { status: 'error'; message: string };

// ============================
// Helpers
// ============================
const toArabicGender = (g?: string) => {
  if (!g || g.trim() === '') return 'غير محدد';
  const normalized = g.trim();
  if (normalized === 'ذكر' || normalized === 'male') return 'ذكر';
  if (normalized === 'أنثى' || normalized === 'انثى' || normalized === 'female')
    return 'أنثى';
  return 'غير محدد';
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
  if (!iso) return 'غير محدد';
  const d = new Date(iso);
  return Number.isNaN(+d)
    ? 'غير محدد'
    : d.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
};

const nv = (v?: string | number) =>
  v === undefined || v === null || v === '' ? 'غير متوفر' : String(v);

// Helper functions moved to profileApi.ts

// ------ تحكم التعديلات ------
const addOneMonth = (dt: Date) => {
  const d = new Date(dt);
  d.setMonth(d.getMonth() + 1);
  return d;
};

const pruneRolling = (timestamps: string[]) => {
  const now = new Date();
  return timestamps.filter((iso) => now < addOneMonth(new Date(iso)));
};

const keyFor = (field: 'birthDate' | 'gender', userId: string) =>
  `editHistory_${field}_${userId}`;

const canEditFieldLocal = (field: 'birthDate' | 'gender', userId: string) => {
  const raw = localStorage.getItem(keyFor(field, userId));
  const list = pruneRolling(raw ? JSON.parse(raw) : []);
  const allowed = list.length < 2;
  const remaining = Math.max(0, 2 - list.length);
  return { allowed, remaining, list };
};

const recordEditLocal = (field: 'birthDate' | 'gender', userId: string) => {
  const { list } = canEditFieldLocal(field, userId);
  const updated = [...list, new Date().toISOString()];
  localStorage.setItem(keyFor(field, userId), JSON.stringify(updated));
};

// ============================
// Component
// ============================
const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [endpoint, setEndpoint] = useState<Endpoint>('students');
  const [fetchState, setFetchState] = useState<FetchState>({ status: 'idle' });

  const [isEditing, setIsEditing] = useState(false);
  const [edited, setEdited] = useState<UserProfile | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>('');

  const fullName = useMemo(
    () =>
      [user?.firstName, user?.fatherName, user?.grandFatherName, user?.lastName]
        .filter(Boolean)
        .join(' '),
    [user]
  );
  const age = useMemo(() => calcAge(user?.birthDate), [user?.birthDate]);

  const getUserInfo = () => {
    const userId = authUser?._id || '';
    const userRole = authUser?.role;
    return { userId, userRole };
  };

  const loadUser = async () => {
    const { userId: id, userRole } = getUserInfo();
    if (!id) {
      setFetchState({ status: 'error', message: 'لا يوجد مستخدم مسجّل.' });
      return;
    }
    setFetchState({ status: 'loading' });

    try {
      // Use centralized API with fallback logic
      const result = await getUserWithFallback(id, userRole);
      setUser(result.user);
      setEndpoint(result.endpoint);
      
      // Fetch avatar using centralized API
      const url = await fetchAvatarBlobUrl(result.endpoint, result.user._id);
      setAvatarUrl((prev) => {
        if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
        return url;
      });
      
      setFetchState({ status: 'ok' });
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
      
      if (axiosError?.response?.status === 401) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      setFetchState({
        status: 'error',
        message: axiosError?.response?.data?.message || 'فشل تحميل البيانات',
      });
    }
  };

  useEffect(() => {
    loadUser();
    return () => {
      if (avatarUrl && avatarUrl.startsWith('blob:'))
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
  };

  const saveProfile = async () => {
    if (!user || !edited) return;
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
      groups: edited.groups,
    };

    const changingBirth = edited.birthDate !== user.birthDate;
    const changingGender = (edited.gender ?? '') !== (user.gender ?? '');

    if (changingBirth) {
      const b = canEditFieldLocal('birthDate', user._id);
      if (!b.allowed) {
        toast.error(
          'لا يمكنك تعديل تاريخ الميلاد أكثر من مرتين خلال شهر كامل من آخر تعديلاتك'
        );
        setIsSaving(false);
        return;
      }
    }
    if (changingGender) {
      const g = canEditFieldLocal('gender', user._id);
      if (!g.allowed) {
        toast.error(
          'لا يمكنك تعديل الجنس أكثر من مرتين خلال شهر كامل من آخر تعديلاتك'
        );
        setIsSaving(false);
        return;
      }
    }

    try {
      // Update user profile using centralized API
      await updateUserById(endpoint, user._id, payload);

      if (changingBirth) recordEditLocal('birthDate', user._id);
      if (changingGender) recordEditLocal('gender', user._id);

      if (avatarFile) {
        const fd = new FormData();
        fd.append('avatar', avatarFile);
        await uploadUserAvatar(endpoint, user._id, fd);
        
        const newUrl = await fetchAvatarBlobUrl(endpoint, user._id);
        setAvatarUrl((prev) => {
          if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
          return newUrl;
        });
        setAvatarFile(null);
      }

      setUser({ ...user, ...payload });
      setEdited(null);
      setIsEditing(false);
      toast.success('تم حفظ التعديلات بنجاح');
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      const msg = axiosError?.response?.data?.message || 'تعذّر حفظ التعديلات';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const shouldShow = (valuePresent: boolean) => {
    if (user?.role === 'student' && !isEditing && !valuePresent) return false;
    return true;
  };

  if (fetchState.status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-3xl opacity-30 animate-pulse"></div>
            <Loader2 className="relative w-24 h-24 text-indigo-600 animate-spin" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-3">
            جارِ تحميل ملفك الشخصي
          </h2>
          <p className="text-slate-600">انتظر قليلاً من فضلك</p>
        </div>
      </div>
    );
  }

  if (fetchState.status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 p-6 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl shadow-2xl p-10 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6">
              <AlertCircle className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-3">حدث خطأ</h2>
            <p className="text-red-600 text-lg mb-8">{fetchState.message}</p>
            <button
              onClick={loadUser}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold px-8 py-5 rounded-2xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            >
              <RefreshCw className="w-6 h-6" />
              <span>إعادة المحاولة</span>
            </button>
          </div>
        </div>
        <ToastContainer rtl position="top-center" />
      </div>
    );
  }

  if (!user) return null;

  const remainingBirth = canEditFieldLocal('birthDate', user._id).remaining;

  const getRoleConfig = () => {
    const configs = {
      student: {
        label: 'طالب',
        gradient: 'from-blue-600 via-indigo-600 to-purple-600',
        lightGradient: 'from-blue-500 to-indigo-500',
        icon: '🎓',
        pattern: 'from-blue-100 to-indigo-100',
      },
      teacher: {
        label: 'معلم',
        gradient: 'from-purple-600 via-pink-600 to-rose-600',
        lightGradient: 'from-purple-500 to-pink-500',
        icon: '👨‍🏫',
        pattern: 'from-purple-100 to-pink-100',
      },
      admin: {
        label: 'مدير',
        gradient: 'from-orange-600 via-red-600 to-pink-600',
        lightGradient: 'from-orange-500 to-red-500',
        icon: '⚡',
        pattern: 'from-orange-100 to-red-100',
      },
    };
    return configs[user.role || 'student'];
  };

  const roleConfig = getRoleConfig();

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100"
      dir="rtl"
    >
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
        </div>

        <div className="relative container mx-auto px-4 py-20">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-12">
            <div className="relative group mb-8">
              {/* Glow Effect */}
              <div className="absolute -inset-8 bg-gradient-to-r from-white/30 to-white/10 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-500"></div>

              {/* Avatar Container */}
              <div className="relative">
                <div className="absolute -inset-4 bg-white/40 rounded-full backdrop-blur-sm"></div>
                <Avatar
                  src={avatarUrl}
                  previewSrc={
                    avatarFile ? URL.createObjectURL(avatarFile) : null
                  }
                  userName={user.firstName}
                  gender={getUserGender(user)}
                  size="3xl"
                  border="ring"
                  showStatus={true}
                  fallbackIcon={<UserIcon className="w-20 h-20 text-white" />}
                />

                {/* Camera Button */}
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => document.getElementById('avatar')?.click()}
                    title="تغيير الصورة الشخصية"
                    className="absolute bottom-4 right-4 bg-white text-indigo-600 p-5 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300"
                  >
                    <Camera className="w-7 h-7" />
                  </button>
                )}
              </div>

              {isEditing && (
                <input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  title="اختيار صورة شخصية"
                  className="hidden"
                  onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                />
              )}
            </div>

            {/* Name */}
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 text-center drop-shadow-2xl">
              {fullName || 'مرحباً بك'}
            </h1>

            {/* Role and Age Badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
              <div
                className={`inline-flex items-center gap-3 bg-white/20 backdrop-blur-lg px-8 py-4 rounded-full border-2 border-white/40 shadow-xl`}
              >
                <span className="text-3xl">{roleConfig.icon}</span>
                <span className="text-white font-black text-xl">
                  {roleConfig.label}
                </span>
              </div>

              {age && (
                <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-lg px-8 py-4 rounded-full border-2 border-white/40 shadow-xl">
                  <Sparkles className="w-7 h-7 text-white" />
                  <span className="text-white font-black text-xl">
                    {age} سنة
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              {!isEditing ? (
                <>
                  <button
                    onClick={beginEdit}
                    className="flex items-center gap-3 bg-white text-indigo-700 font-black px-12 py-6 rounded-2xl shadow-2xl hover:shadow-white/20 hover:scale-105 active:scale-95 transition-all duration-300"
                  >
                    <Edit className="w-7 h-7" />
                    <span className="text-xl">تعديل المعلومات</span>
                  </button>
                  <button
                    onClick={() => navigate('/change-password')}
                    className="flex items-center gap-3 bg-white/10 backdrop-blur-md text-white font-black px-12 py-6 rounded-2xl border-2 border-white/30 shadow-2xl hover:bg-white/20 hover:scale-105 active:scale-95 transition-all duration-300"
                  >
                    <Lock className="w-7 h-7" />
                    <span className="text-xl">تغيير كلمة المرور</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={saveProfile}
                    disabled={isSaving}
                    className="flex items-center gap-3 bg-white text-green-700 font-black px-12 py-6 rounded-2xl shadow-2xl hover:shadow-white/20 hover:scale-105 active:scale-95 disabled:opacity-60 disabled:hover:scale-100 transition-all duration-300"
                  >
                    {isSaving ? (
                      <Loader2 className="w-7 h-7 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-7 h-7" />
                    )}
                    <span className="text-xl">
                      {isSaving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                    </span>
                  </button>
                  <button
                    onClick={cancelEdit}
                    disabled={isSaving}
                    className="flex items-center gap-3 bg-red-600 text-white font-black px-12 py-6 rounded-2xl shadow-2xl hover:bg-red-700 hover:scale-105 active:scale-95 disabled:opacity-60 disabled:hover:scale-100 transition-all duration-300"
                  >
                    <X className="w-7 h-7" />
                    <span className="text-xl">إلغاء</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Wave Separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" className="w-full h-auto">
            <path
              fill="#f8fafc"
              d="M0,50L48,45C96,40,192,30,288,33.3C384,37,480,53,576,56.7C672,60,768,50,864,45C960,40,1056,40,1152,45C1248,50,1344,60,1392,65L1440,70L1440,100L0,100Z"
            ></path>
          </svg>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 -mt-8 pb-20">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Account Type */}
          <div className="group bg-white rounded-3xl shadow-lg border-2 border-slate-100 p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
            <div
              className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${roleConfig.lightGradient} rounded-2xl mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}
            >
              <Award className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-sm font-bold text-slate-600 mb-2">
              نوع الحساب
            </h3>
            <p className="text-3xl font-black text-slate-900">
              {roleConfig.label}
            </p>
          </div>

          {/* Student ID */}
          {user.role === 'student' && user.studentId && (
            <div className="group bg-white rounded-3xl shadow-lg border-2 border-slate-100 p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <IdCard className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-sm font-bold text-slate-600 mb-2">
                رقم الطالب
              </h3>
              <p className="text-3xl font-black text-slate-900">
                {user.studentId}
              </p>
            </div>
          )}

          {/* Age */}
          {age && (
            <div className="group bg-white rounded-3xl shadow-lg border-2 border-slate-100 p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-sm font-bold text-slate-600 mb-2">العمر</h3>
              <p className="text-3xl font-black text-slate-900">{age} سنة</p>
            </div>
          )}
        </div>

        {/* Personal Information Section */}
        <div className="bg-white rounded-3xl shadow-xl border-2 border-slate-100 p-8 md:p-12">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl shadow-lg">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900">
                المعلومات الشخصية
              </h2>
              <p className="text-slate-600 mt-1">بياناتك الكاملة والدقيقة</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
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
                        value={edited?.firstName ?? ''}
                        onChange={(v) =>
                          setEdited((p) => (p ? { ...p, firstName: v } : p))
                        }
                      />
                      <TextInput
                        placeholder="اسم الأب"
                        value={edited?.fatherName ?? ''}
                        onChange={(v) =>
                          setEdited((p) => (p ? { ...p, fatherName: v } : p))
                        }
                      />
                      <TextInput
                        placeholder="اسم الجد"
                        value={edited?.grandFatherName ?? ''}
                        onChange={(v) =>
                          setEdited((p) =>
                            p ? { ...p, grandFatherName: v } : p
                          )
                        }
                      />
                      <TextInput
                        placeholder="اسم العائلة"
                        value={edited?.lastName ?? ''}
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

            {/* رقم الهوية */}
            {shouldShow(Boolean(user.idNumber)) && (
              <InfoField
                icon={<IdCard className="w-5 h-5" />}
                label="رقم الهوية"
                value={
                  isEditing ? (
                    <TextInput
                      value={edited?.idNumber ?? ''}
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
                          edited?.birthDate ? edited.birthDate.slice(0, 10) : ''
                        }
                        onChange={(v) =>
                          setEdited((p) =>
                            p
                              ? {
                                  ...p,
                                  birthDate: v ? new Date(v).toISOString() : '',
                                }
                              : p
                          )
                        }
                      />
                      {remainingBirth < 2 && (
                        <div className="flex items-center gap-2 text-xs bg-amber-50 text-amber-700 px-3 py-2 rounded-lg border border-amber-200">
                          <span>عدد التعديلات المتبقية:</span>
                          <span className="font-bold">
                            {remainingBirth} / 2
                          </span>
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
                      value={edited?.residence ?? ''}
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
                      placeholder="05xxxxxxxx"
                      value={edited?.phoneNumber ?? ''}
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

            {/* اسم الأم */}
            {shouldShow(Boolean(user.motherName)) && (
              <InfoField
                icon={<UserIcon className="w-5 h-5" />}
                label="اسم الأم"
                value={
                  isEditing ? (
                    <TextInput
                      placeholder="اسم الأم"
                      value={edited?.motherName ?? ''}
                      onChange={(v) =>
                        setEdited((p) => (p ? { ...p, motherName: v } : p))
                      }
                    />
                  ) : (
                    nv(user.motherName)
                  )
                }
              />
            )}

            {/* اسم المجموعة */}
            {user.role === 'student' && !isEditing && user.group && (
              <InfoField
                icon={<Users className="w-5 h-5" />}
                label="اسم المجموعة"
                value={nv(user.group)}
              />
            )}

            {/* اسم المعلم */}
            {user.role === 'student' && !isEditing && user.teacher && (
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
      </div>

      <ToastContainer rtl position="top-center" />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
};

// ============================
// Sub Components
// ============================
const InfoField: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}> = ({ icon, label, value }) => (
  <div className="group p-6 bg-gradient-to-br from-slate-50 to-white rounded-2xl border-2 border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all duration-300">
    <div className="flex items-center gap-3 mb-3">
      <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
        {icon}
      </div>
      <span className="font-bold text-slate-600 text-sm">{label}</span>
    </div>
    <div className="text-slate-900 font-semibold text-lg pr-2">{value}</div>
  </div>
);

const TextInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}> = ({ value, onChange, placeholder, type = 'text' }) => (
  <input
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 hover:border-indigo-300 transition-all duration-300 text-slate-900 placeholder-slate-400 font-medium"
  />
);

const GenderBadge: React.FC<{ gender?: string }> = ({ gender }) => {
  const arabicGender = toArabicGender(gender);

  const getGenderStyle = () => {
    if (arabicGender === 'ذكر') {
      return {
        bg: 'bg-gradient-to-r from-blue-500 to-cyan-500',
        icon: '👨',
      };
    } else if (arabicGender === 'أنثى') {
      return {
        bg: 'bg-gradient-to-r from-pink-500 to-rose-500',
        icon: '👩',
      };
    } else {
      return {
        bg: 'bg-gradient-to-r from-slate-400 to-slate-500',
        icon: '❓',
      };
    }
  };

  const style = getGenderStyle();

  return (
    <span
      className={`inline-flex items-center gap-2 ${style.bg} text-white px-5 py-2.5 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300`}
    >
      <span className="text-lg">{style.icon}</span>
      <span>{arabicGender}</span>
    </span>
  );
};

export default Profile;
