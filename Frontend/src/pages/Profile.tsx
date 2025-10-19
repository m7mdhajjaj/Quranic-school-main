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
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import Avatar from '../components/Avatar';
import { useAuth } from '../hooks/useAuth';
import { showSuccessMessage, showErrorMessage } from '../utils/sweetalertUtils';
import { ProfileSkeleton } from '../components/Loading/LoadingSkeleton';
import ChangePasswordModal from './Auth/ChangePass';
import {
  getUserWithFallback,
  updateUserById,
  fetchAvatarBlobUrl,
  uploadUserAvatar,
  deleteUserAvatar,
  type UserProfile,
} from '../Api/profileApi';
import { validateProfileData, validateField, type FieldErrors } from '../Validation/profileValidation';
import { useProfileSocket } from '../Socket';

type Endpoint = 'students' | 'teachers' | 'admins';

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
  const { user: authUser, updateUser: updateAuthUser } = useAuth();

  // 🔌 Socket Connection
  const { isConnected: socketConnected, lastUpdate: socketLastUpdate, socketId } = useProfileSocket();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [endpoint, setEndpoint] = useState<Endpoint>('students');
  const [fetchState, setFetchState] = useState<FetchState>({ status: 'idle' });

  const [isEditing, setIsEditing] = useState(false);
  const [edited, setEdited] = useState<UserProfile | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>('');
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

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

  // 🔄 Auto-refresh when socket receives updates
  useEffect(() => {
    if (socketLastUpdate) {
      console.log('🔄 Profile Socket update received, refreshing profile...');
      loadUser();
    }
  }, [socketLastUpdate]); // eslint-disable-line react-hooks/exhaustive-deps

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

    // استخدام SweetAlert للتأكيد قبل الحذف
    const Swal = (await import('sweetalert2')).default;
    const result = await Swal.fire({
      title: 'هل أنت متأكد؟',
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
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'نعم، احذف الصورة',
      cancelButtonText: 'إلغاء',
      reverseButtons: true,
      customClass: {
        popup: '!rounded-2xl',
        confirmButton: '!bg-red-600 hover:!bg-red-700 !text-white !font-bold !px-6 !py-3 !rounded-xl !shadow-lg',
        cancelButton: '!bg-gray-300 hover:!bg-gray-400 !text-gray-800 !font-bold !px-6 !py-3 !rounded-xl !shadow-lg',
      },
    });

    if (!result.isConfirmed) return;

    try {
      await deleteUserAvatar(endpoint, user._id);
      
      // Clear avatar from state
      if (avatarUrl && avatarUrl.startsWith('blob:')) {
        URL.revokeObjectURL(avatarUrl);
      }
      setAvatarUrl(null);
      setAvatarFile(null);
      
      // Update user object to reflect no avatar
      if (user) {
        setUser({ ...user, avatar: undefined });
      }
      
      // Remove avatar from AuthContext - Avatar component will show initials
      updateAuthUser({
        avatar: undefined
      });
      
      await showSuccessMessage('تم الحذف!', 'تم حذف الصورة الشخصية بنجاح');
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      const msg = axiosError?.response?.data?.message || 'تعذّر حذف الصورة';
      await showErrorMessage('خطأ في الحذف!', msg);
    }
  };

  const handleFieldBlur = async (fieldName: string, value: string | undefined) => {
    if (!user) return;
    
    const errorMessage = await validateField(fieldName, value, user.role as 'student' | 'teacher' | 'admin');
    if (errorMessage) {
      setFieldErrors((prev: FieldErrors) => ({ ...prev, [fieldName]: errorMessage }));
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
    
    // Clear previous errors
    setFieldErrors({});
    
    // Validate profile data
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
      role: user.role || 'student',
    });

    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      await showErrorMessage('خطأ في البيانات', 'يرجى تصحيح الأخطاء في النموذج');
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

    // إضافة groups فقط إذا كان المستخدم معلم وgroups موجودة
    if (user.role === 'teacher' && edited.groups !== undefined) {
      payload.groups = edited.groups;
    }

    const changingBirth = edited.birthDate !== user.birthDate;
    const changingGender = (edited.gender ?? '') !== (user.gender ?? '');

    if (changingBirth) {
      const b = canEditFieldLocal('birthDate', user._id);
      if (!b.allowed) {
        await showErrorMessage(
          'غير مسموح بالتعديل',
          'لا يمكنك تعديل تاريخ الميلاد أكثر من مرتين خلال شهر كامل من آخر تعديلاتك'
        );
        setIsSaving(false);
        return;
      }
    }
    if (changingGender) {
      const g = canEditFieldLocal('gender', user._id);
      if (!g.allowed) {
        await showErrorMessage(
          'غير مسموح بالتعديل',
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
        const uploadResponse = await uploadUserAvatar(endpoint, user._id, fd);
        
        // Update avatar URL in state
        const newUrl = await fetchAvatarBlobUrl(endpoint, user._id);
        setAvatarUrl((prev) => {
          if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
          return newUrl;
        });
        setAvatarFile(null);
        
        // Update avatar in AuthContext to reflect in header
        if (uploadResponse?.avatarUrl) {
          updateAuthUser({
            avatar: {
              url: uploadResponse.avatarUrl
            }
          });
        }
      }

      setUser({ ...user, ...payload });
      setEdited(null);
      setIsEditing(false);
      await showSuccessMessage('تم الحفظ!', 'تم حفظ التعديلات بنجاح');
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      const msg = axiosError?.response?.data?.message || 'تعذّر حفظ التعديلات';
      await showErrorMessage('خطأ في الحفظ!', msg);
    } finally {
      setIsSaving(false);
    }
  };

  const shouldShow = (valuePresent: boolean) => {
    if (user?.role === 'student' && !isEditing && !valuePresent) return false;
    return true;
  };

  if (fetchState.status === 'loading') {
    return <ProfileSkeleton />;
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
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold px-8 py-5 rounded-2xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            >
              <RefreshCw className="w-6 h-6" />
              <span>إعادة المحاولة</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const remainingBirth = canEditFieldLocal('birthDate', user._id).remaining;

  const getRoleConfig = () => {
    const configs = {
      student: {
        label: 'طالب',
        gradient: 'from-emerald-600 to-teal-600',
        lightGradient: 'from-emerald-500 to-teal-500',
        icon: '🎓',
        pattern: 'from-emerald-100 to-teal-100',
      },
      teacher: {
        label: 'معلم',
        gradient: 'from-teal-600 to-cyan-600',
        lightGradient: 'from-teal-500 to-cyan-500',
        icon: '👨‍🏫',
        pattern: 'from-teal-100 to-cyan-100',
      },
      admin: {
        label: 'مدير',
        gradient: 'from-emerald-700 to-emerald-900',
        lightGradient: 'from-emerald-600 to-emerald-800',
        icon: '⚡',
        pattern: 'from-emerald-100 to-emerald-200',
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
      {/* 🔌 Socket Connection Indicator */}
      <div className="fixed top-20 left-4 z-50">
        <div className="relative group">
          <div
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              socketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-yellow-500'
            }`}
          />
          <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-lg">
            <div className="font-semibold mb-1">
              {socketConnected ? '✓ متصل بالسوكت' : '⚠ غير متصل'}
            </div>
            {socketId && (
              <div className="text-gray-300 text-[10px] mb-1">
                ID: {socketId.slice(0, 8)}...
              </div>
            )}
            {socketLastUpdate && (
              <div className="text-gray-400 text-[10px]">
                آخر تحديث: {new Date(socketLastUpdate).toLocaleTimeString('ar-EG')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-emerald-600 to-teal-600 overflow-hidden">
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
                  size="4xl"
                  border="ring"
                  showStatus={true}
                  fallbackIcon={<UserIcon className="w-24 h-24 text-white" />}
                />

                {/* Avatar Action Buttons */}
                {isEditing && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-3">
                    {avatarUrl || avatarFile ? (
                      // Edit and Delete Buttons (when avatar exists)
                      <>
                        <button
                          type="button"
                          onClick={() => document.getElementById('avatar')?.click()}
                          title="تعديل الصورة الشخصية"
                          className="group relative bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-4 rounded-full shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 border-4 border-white"
                        >
                          <Camera className="w-6 h-6" />
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            تعديل الصورة
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={handleDeleteAvatar}
                          title="حذف الصورة الشخصية"
                          className="group relative bg-gradient-to-br from-red-500 to-rose-600 text-white p-4 rounded-full shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 border-4 border-white"
                        >
                          <Trash2 className="w-6 h-6" />
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            حذف الصورة
                          </div>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => document.getElementById('avatar')?.click()}
                        title="رفع صورة شخصية"
                        className="group relative bg-gradient-to-br from-white to-gray-50 text-emerald-600 p-4 rounded-full shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 border-4 border-white ring-2 ring-emerald-500"
                      >
                        <Camera className="w-6 h-6" />
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          رفع صورة شخصية
                        </div>
                      </button>
                    )}
                  </div>
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
                    className="flex items-center gap-3 bg-white text-emerald-700 font-black px-12 py-6 rounded-2xl shadow-2xl hover:shadow-white/20 hover:scale-105 active:scale-95 transition-all duration-300"
                  >
                    <Edit className="w-7 h-7" />
                    <span className="text-xl">تعديل المعلومات</span>
                  </button>
                  <button
                    onClick={() => setIsChangePasswordModalOpen(true)}
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
        <div className="grid md:grid-cols-1 gap-6 mb-12">
          {/* Student ID */}
          {user.role === 'student' && user.studentId && (
            <div className="group bg-white rounded-3xl shadow-lg border-2 border-slate-100 p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 max-w-md mx-auto">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
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
        </div>

        {/* Personal Information Section */}
        <div className="bg-white rounded-3xl shadow-xl border-2 border-slate-100 p-8 md:p-12">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-lg">
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
                        onBlur={() => handleFieldBlur('firstName', edited?.firstName)}
                        error={fieldErrors?.['firstName']}
                        fieldName="firstName"
                      />
                      <TextInput
                        placeholder="اسم الأب"
                        value={edited?.fatherName ?? ''}
                        onChange={(v) =>
                          setEdited((p) => (p ? { ...p, fatherName: v } : p))
                        }
                        onBlur={() => handleFieldBlur('fatherName', edited?.fatherName)}
                        error={fieldErrors?.['fatherName']}
                        fieldName="fatherName"
                      />
                      <TextInput
                        placeholder="اسم الجد"
                        value={edited?.grandFatherName ?? ''}
                        onChange={(v) =>
                          setEdited((p) =>
                            p ? { ...p, grandFatherName: v } : p
                          )
                        }
                        onBlur={() => handleFieldBlur('grandFatherName', edited?.grandFatherName)}
                        error={fieldErrors?.['grandFatherName']}
                        fieldName="grandFatherName"
                      />
                      <TextInput
                        placeholder="اسم العائلة"
                        value={edited?.lastName ?? ''}
                        onChange={(v) =>
                          setEdited((p) => (p ? { ...p, lastName: v } : p))
                        }
                        onBlur={() => handleFieldBlur('lastName', edited?.lastName)}
                        error={fieldErrors?.['lastName']}
                        fieldName="lastName"
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
                      value={edited?.idNumber ?? ''}
                      onChange={(v) => {
                        // Accept only numbers
                        const numbersOnly = v.replace(/\D/g, '');
                        setEdited((p) => (p ? { ...p, idNumber: numbersOnly } : p));
                      }}
                      onBlur={() => handleFieldBlur('idNumber', edited?.idNumber)}
                      error={fieldErrors?.['idNumber']}
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
                        onBlur={() => handleFieldBlur('birthDate', edited?.birthDate)}
                        error={fieldErrors?.['birthDate']}
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
                      onBlur={() => handleFieldBlur('residence', edited?.residence)}
                      error={fieldErrors?.['residence']}
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
                      value={edited?.phoneNumber ?? ''}
                      onChange={(v) => {
                        // Accept only numbers
                        const numbersOnly = v.replace(/\D/g, '');
                        setEdited((p) => (p ? { ...p, phoneNumber: numbersOnly } : p));
                      }}
                      onBlur={() => handleFieldBlur('phoneNumber', edited?.phoneNumber)}
                      error={fieldErrors?.['phoneNumber']}
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
                      value={edited?.motherName ?? ''}
                      onChange={(v) =>
                        setEdited((p) => (p ? { ...p, motherName: v } : p))
                      }
                      onBlur={() => handleFieldBlur('motherName', edited?.motherName)}
                      error={fieldErrors?.['motherName']}
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

      {/* Change Password Modal */}
      <ChangePasswordModal 
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />

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
  <div className="group p-6 bg-gradient-to-br from-slate-50 to-white rounded-2xl border-2 border-slate-100 hover:border-emerald-200 hover:shadow-lg transition-all duration-300">
    <div className="flex items-center gap-3 mb-3">
      <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
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
  error?: string;
  fieldName?: string;
  onBlur?: () => void;
  maxLength?: number;
  inputMode?: 'text' | 'numeric' | 'tel' | 'email' | 'url';
}> = ({ value, onChange, placeholder, type = 'text', error, onBlur, maxLength, inputMode }) => (
  <div className="w-full">
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder={placeholder}
      maxLength={maxLength}
      inputMode={inputMode}
      className={`w-full border-2 ${
        error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/30' : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/30'
      } rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-4 hover:border-emerald-300 transition-all duration-300 text-slate-900 placeholder-slate-400 font-medium`}
    />
    {error && (
      <p className="text-red-600 text-sm mt-1 mr-2 flex items-center gap-1">
        <AlertCircle className="w-4 h-4" />
        {error}
      </p>
    )}
  </div>
);

const GenderBadge: React.FC<{ gender?: string }> = ({ gender }) => {
  const arabicGender = toArabicGender(gender);

  const getGenderStyle = () => {
    if (arabicGender === 'ذكر') {
      return {
        bg: 'bg-gradient-to-r from-teal-500 to-cyan-500',
        icon: '👨',
      };
    } else if (arabicGender === 'أنثى') {
      return {
        bg: 'bg-gradient-to-r from-emerald-500 to-teal-500',
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
