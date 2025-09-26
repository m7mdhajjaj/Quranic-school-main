
import React, { useEffect, useState } from 'react';
import { Edit, Phone, Mail, Calendar, MapPin, Users, BookOpen, Camera, Lock, Save, X } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ========================
// Types aligned to backend
// ========================
interface User {
  _id: string;
  studentId?: number;
  teacherId?: number;
  idNumber?: string;
  firstName: string;
  fatherName?: string;
  grandFatherName?: string;
  motherName?: string;
  lastName: string;
  birthDate?: string; // ISO string
  gender?: string;
  residence?: string;
  teacher?: string;
  group?: string;
  email?: string;
  phoneNumber?: string;
  groups?: string[];
  role?: string; // 'student' | 'teacher' | 'admin'
  avatar?: string; // filename or URL
  createdAt?: string;
  updatedAt?: string;
}

type Endpoint = 'students' | 'teachers';
type EffectiveRole = 'student' | 'teacher' | 'admin';

const API_URL = 'http://localhost:5005/api';

// ========================
// Helpers
// ========================
function formatDate(dateString?: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
}

function calculateAge(birthDate?: string) {
  if (!birthDate) return '' as any;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

async function fetchJson(url: string, token: string) {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const err: any = new Error(`${res.status} ${res.statusText} :: ${text}`);
    err.status = res.status;
    throw err;
  }
  const json = await res.json().catch(() => ({}));
  return json?.data ?? json;
}

function resolveRole(stored: any, fetched: any, endpointUsed?: Endpoint): EffectiveRole {
  // Strongest hint: explicit loginAs saved at login time
  const loginAs: EffectiveRole | undefined = stored?.loginAs;
  if (loginAs === 'student' || loginAs === 'teacher' || loginAs === 'admin') return loginAs;

  // Next: role in localStorage
  if (stored?.role === 'admin' || stored?.role === 'teacher' || stored?.role === 'student') return stored.role;

  // Next: role returned from backend
  if (fetched?.role === 'admin' || fetched?.role === 'teacher' || fetched?.role === 'student') return fetched.role;

  // Otherwise infer from endpoint used
  if (endpointUsed === 'teachers') return 'teacher';
  return 'student';
}

function roleBadge(role: EffectiveRole) {
  return {
    text: role === 'admin' ? 'مدير' : role === 'teacher' ? 'معلم' : 'طالب',
    className:
      role === 'admin' ? 'bg-red-500' : role === 'teacher' ? 'bg-blue-500' : 'bg-green-500',
  };
}

// ========================
// Component
// ========================
const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<User | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [saving, setSaving] = useState(false);

  // ------------------------
  // Load user on mount
  // ------------------------
  useEffect(() => {
    const run = async () => {
      try {
        const token = localStorage.getItem('token');
        const userJson = localStorage.getItem('user');
        if (!token || !userJson) {
          window.location.href = '/login';
          return;
        }
        const stored = JSON.parse(userJson);
        const userId: string = stored._id;

        // Respect loginAs if present, otherwise infer
        const loginAs = (stored?.loginAs as EffectiveRole | undefined);
        const hinted: Endpoint =
          loginAs === 'teacher' ? 'teachers' :
          loginAs === 'student' ? 'students' :
          stored.studentId ? 'students' :
          stored.teacherId ? 'teachers' :
          stored.role === 'teacher' ? 'teachers' : 'students';

        const tryOrder: Endpoint[] = hinted === 'students' ? ['students', 'teachers'] : ['teachers', 'students'];

        let fetched: User | null = null;
        let usedEndpoint: Endpoint | undefined;
        let lastErr: any = null;

        for (const ep of tryOrder) {
          try {
            const u = await fetchJson(`${API_URL}/${ep}/${userId}`, token);
            fetched = u;
            usedEndpoint = ep;
            break;
          } catch (e: any) {
            lastErr = e;
            if (e?.status !== 404) break; // only fall back on 404
          }
        }

        if (!fetched) {
          console.error('Failed to fetch user:', lastErr);
          toast.error('تعذّر تحميل البيانات');
          return;
        }

        const effectiveRole = resolveRole(stored, fetched, usedEndpoint);
        const finalUser = { ...fetched, role: effectiveRole } as User;

        setUser(finalUser);
        setEditedUser(finalUser);

        try {
          const mergedStored = { ...stored, role: effectiveRole };
          localStorage.setItem('user', JSON.stringify(mergedStored));
        } catch {}

        setAvatarPreview(
          finalUser.avatar
            ? finalUser.avatar.startsWith('http')
              ? finalUser.avatar
              : `${API_URL}/uploads/${finalUser.avatar}`
            : ''
        );
      } catch (e) {
        console.error('Error fetching user data:', e);
        toast.error('خطأ أثناء تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  // ------------------------
  // Input handlers
  // ------------------------
  const handleInputChange = (field: keyof User, value: string | number) => {
    setEditedUser((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(String(ev.target?.result || ''));
    reader.readAsDataURL(file);
  };

  // ------------------------
  // Birthdate lock: allow 2 edits per month (resets at month start)
  // ------------------------
  function canEditBirthDate(): boolean {
    const u = isEditing ? editedUser : user;
    if (!u?._id) return true;
    const now = new Date();
    const ym = `${now.getFullYear()}-${now.getMonth() + 1}`; // e.g., 2025-9
    const key = `birthDateEditAttempts_${u._id}_${ym}`;
    const attempts = Number(localStorage.getItem(key) || '0');
    return attempts < 2; // max 2 edits per month
  }

  function incrementBirthDateEditAttempts() {
    const u = isEditing ? editedUser : user;
    if (!u?._id) return;
    const now = new Date();
    const ym = `${now.getFullYear()}-${now.getMonth() + 1}`;
    const key = `birthDateEditAttempts_${u._id}_${ym}`;
    const attempts = Number(localStorage.getItem(key) || '0');
    localStorage.setItem(key, String(attempts + 1));
  }

  // ------------------------
  // Save profile
  // ------------------------
  const handleSave = async () => {
    if (!editedUser || !user) return;

    // If date changed, count an attempt
    if (editedUser.birthDate !== user.birthDate) {
      if (!canEditBirthDate()) {
        toast.error('لا يمكنك تعديل تاريخ الميلاد أكثر من مرتين في هذا الشهر');
        return;
      }
      incrementBirthDateEditAttempts();
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token');

      const role = ((user.role as EffectiveRole) || 'student');
      const endpoint: Endpoint = role === 'teacher' || role === 'admin' ? 'teachers' : 'students';

      // 1) avatar (if backend supports it)
      if (avatarFile) {
        const fd = new FormData();
        fd.append('avatar', avatarFile);
        const res = await fetch(`${API_URL}/${endpoint}/${user._id}/avatar`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        if (!res.ok) {
          const t = await res.text().catch(() => '');
          throw new Error(`Avatar upload failed: ${res.status} ${t}`);
        }
        const data = await res.json().catch(() => ({} as any));
        const newAvatar = (data?.data?.avatar ?? data?.avatar) as string | undefined;
        if (newAvatar) {
          setEditedUser((prev) => (prev ? { ...prev, avatar: newAvatar } : prev));
          setAvatarPreview(`${API_URL}/uploads/${newAvatar}`);
        }
      }

      // 2) profile fields (send only expected fields)
      const payload = {
        firstName: editedUser.firstName ?? '',
        fatherName: editedUser.fatherName ?? '',
        grandFatherName: editedUser.grandFatherName ?? '',
        motherName: editedUser.motherName ?? '',
        lastName: editedUser.lastName ?? '',
        birthDate: editedUser.birthDate ?? '',
        gender: editedUser.gender ?? '',
        residence: editedUser.residence ?? '',
        teacher: editedUser.teacher ?? '',
        group: editedUser.group ?? '',
        email: editedUser.email ?? '',
        phoneNumber: editedUser.phoneNumber ?? '',
        avatar: editedUser.avatar ?? undefined,
      } as Partial<User>;

      const resp = await fetch(`${API_URL}/${endpoint}/${user._id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const t = await resp.text().catch(() => '');
        throw new Error(`Update failed: ${resp.status} ${t}`);
      }

      const json = await resp.json().catch(() => ({} as any));
      const updated: User = json?.data ?? json;

      setUser(updated);
      setEditedUser(updated);
      setIsEditing(false);
      setAvatarFile(null);
      localStorage.setItem('user', JSON.stringify({ ...(JSON.parse(localStorage.getItem('user') || '{}')), ...updated }));
      toast.success('تم تحديث البيانات بنجاح');
    } catch (e) {
      console.error(e);
      toast.error('فشل في تحديث البيانات. حاول مجددًا.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
    setAvatarFile(null);
    setAvatarPreview(user?.avatar ? `${API_URL}/uploads/${user.avatar}` : '');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-600">جارِ تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">لم يتم العثور على بيانات المستخدم</p>
        </div>
      </div>
    );
  }

  const displayUser = (isEditing ? editedUser : user)!;
  const role = (displayUser.role as EffectiveRole) || 'student';
  const badge = roleBadge(role);
  const isStudent = role === 'student';
  const isTeacher = role === 'teacher';
  const isAdmin = role === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 py-8 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">الصفحة الشخصية</h1>
          <p className="text-slate-600">أعرض/عدّل بياناتك وصورتك الشخصية</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Banner */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-6 text-white relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                        <div className="text-2xl font-bold text-emerald-600">
                          {displayUser.firstName?.charAt(0) || '؟'}
                        </div>
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <label className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <Camera className="w-4 h-4 text-emerald-600" />
                      <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                    </label>
                  )}
                </div>

                {/* Name + Role */}
                <div>
                  <h2 className="text-2xl font-bold">
                    {displayUser.firstName} {displayUser.lastName}
                  </h2>
                  <p className="text-emerald-100 flex items-center gap-2 mt-1">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.className}`}>
                      {badge.text}
                    </span>
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-white text-emerald-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" /> {saving ? 'جارِ الحفظ...' : 'حفظ'}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-white/20 text-white px-4 py-2 rounded-lg font-medium hover:bg-white/30 transition-colors flex items-center gap-2"
                    >
                      <X className="w-4 h-4" /> إلغاء
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-white text-emerald-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" /> تعديل المعلومات الشخصية
                    </button>
                    <button
                      onClick={() => (window.location.href = '/change-password')}
                      className="bg-white/20 text-white px-4 py-2 rounded-lg font-medium hover:bg-white/30 transition-colors flex items-center gap-2"
                    >
                      <Lock className="w-4 h-4" /> تغيير كلمة المرور
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Basic info */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Full name */}
              <div className="bg-slate-50 rounded-xl p-4 flex flex-col items-center">
                <BookOpen className="w-8 h-8 text-emerald-600 mb-2" />
                <h3 className="font-semibold text-slate-800 mb-1">الاسم الكامل</h3>
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={displayUser.firstName || ''}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full mt-1 mb-1 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="الاسم الأول"
                    />
                    <input
                      type="text"
                      value={displayUser.fatherName || ''}
                      onChange={(e) => handleInputChange('fatherName', e.target.value)}
                      className="w-full mt-1 mb-1 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="اسم الأب"
                    />
                    <input
                      type="text"
                      value={displayUser.grandFatherName || ''}
                      onChange={(e) => handleInputChange('grandFatherName', e.target.value)}
                      className="w-full mt-1 mb-1 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="اسم الجد"
                    />
                    <input
                      type="text"
                      value={displayUser.lastName || ''}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full mt-1 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="اسم العائلة"
                    />
                  </>
                ) : (
                  <p className="text-sm text-slate-600 text-center">
                    {displayUser.firstName} {displayUser.fatherName} {displayUser.grandFatherName} {displayUser.lastName}
                  </p>
                )}
              </div>

              {/* ID */}
              <div className="bg-slate-50 rounded-xl p-4 flex flex-col items-center">
                <span className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                  <span className="text-purple-600 font-bold text-xs">ID</span>
                </span>
                <h3 className="font-semibold text-slate-800 mb-1">رقم الهوية</h3>
                <p className="text-sm text-slate-600 font-mono">
                  {displayUser.idNumber || displayUser._id?.slice(-8) || 'غير متوفر'}
                </p>
              </div>

              {/* Birthdate / Age / Gender */}
              <div className="bg-slate-50 rounded-xl p-4 flex flex-col items-center">
                <Calendar className="w-8 h-8 text-yellow-600 mb-2" />
                <h3 className="font-semibold text-slate-800 mb-1">تاريخ الميلاد / العمر / الجنس</h3>
                {isEditing ? (
                  <>
                    <input
                      type="date"
                      value={displayUser.birthDate ? displayUser.birthDate.slice(0, 10) : ''}
                      onChange={(e) => handleInputChange('birthDate', e.target.value)}
                      className="w-full mt-1 mb-2 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
                      placeholder="تاريخ الميلاد"
                      title="تاريخ الميلاد"
                      aria-label="تاريخ الميلاد"
                      disabled={!canEditBirthDate()}
                    />
                    {!canEditBirthDate() && (
                      <span className="text-xs text-red-500 mb-2">لا يمكنك تعديل تاريخ الميلاد إلا مرتين في الشهر، ستتجدد المحاولات في بداية الشهر القادم</span>
                    )}
                    <div className="w-full flex flex-row items-center justify-between gap-2 mb-2">
                      <span className="text-xs text-gray-500">العمر:</span>
                      <span className="text-sm font-bold text-emerald-700">{calculateAge(displayUser.birthDate)} سنة</span>
                    </div>
                    <select
                      value={displayUser.gender || ''}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="w-full mt-1 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      title="الجنس"
                    >
                      <option value="">اختر الجنس</option>
                      <option value="ذكر">ذكر</option>
                      <option value="انثى">أنثى</option>
                    </select>
                  </>
                ) : (
                  <div className="w-full flex flex-col items-center">
                    <span className="text-sm text-slate-600 mb-1">
                      تاريخ الميلاد: {displayUser.birthDate ? formatDate(displayUser.birthDate) : 'غير محدد'}
                    </span>
                    <span className="text-sm text-emerald-700 font-bold mb-1">العمر: {calculateAge(displayUser.birthDate)} سنة</span>
                    <span className="text-sm text-slate-600">{displayUser.gender ? `الجنس: ${displayUser.gender}` : ''}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact info */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Phone */}
              <div className="bg-slate-50 rounded-xl p-4 flex flex-col items-center">
                <Phone className="w-8 h-8 text-orange-600 mb-2" />
                <h3 className="font-semibold text-slate-800 mb-1">رقم الهاتف</h3>
                {isEditing ? (
                  <input
                    type="tel"
                    value={displayUser.phoneNumber || ''}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    className="w-full mt-1 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="رقم الهاتف"
                  />
                ) : (
                  <p className="text-sm text-slate-600">{displayUser.phoneNumber || 'غير متوفر'}</p>
                )}
              </div>

              {/* Email */}
              <div className="bg-slate-50 rounded-xl p-4 flex flex-col items-center">
                <Mail className="w-8 h-8 text-green-600 mb-2" />
                <h3 className="font-semibold text-slate-800 mb-1">البريد الإلكتروني</h3>
                {isEditing ? (
                  <input
                    type="email"
                    value={displayUser.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full mt-1 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="البريد الإلكتروني"
                  />
                ) : (
                  <p className="text-sm text-slate-600 break-all">{displayUser.email || 'غير متوفر'}</p>
                )}
              </div>

              {/* Residence */}
              <div className="bg-slate-50 rounded-xl p-4 flex flex-col items-center">
                <MapPin className="w-8 h-8 text-pink-600 mb-2" />
                <h3 className="font-semibold text-slate-800 mb-1">مكان السكن</h3>
                {isEditing ? (
                  <input
                    type="text"
                    value={displayUser.residence || ''}
                    onChange={(e) => handleInputChange('residence', e.target.value)}
                    className="w-full mt-1 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="مكان السكن"
                  />
                ) : (
                  <p className="text-sm text-slate-600">{displayUser.residence || 'غير متوفر'}</p>
                )}
              </div>
            </div>

            {/* Academic — student-specific sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Mother name — Students only */}
              {isStudent && (
                <div className="bg-slate-50 rounded-xl p-4 flex flex-col items-center">
                  <span className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center mb-2">
                    <span className="text-pink-600 font-bold text-xs">أم</span>
                  </span>
                  <h3 className="font-semibold text-slate-800 mb-1">اسم الأم</h3>
                  {isEditing ? (
                    <input
                      type="text"
                      value={displayUser.motherName || ''}
                      onChange={(e) => handleInputChange('motherName', e.target.value)}
                      className="w-full mt-1 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="اسم الأم"
                    />
                  ) : (
                    <p className="text-sm text-slate-600">{displayUser.motherName || 'غير متوفر'}</p>
                  )}
                </div>
              )}

              {/* Group — Students only */}
              {isStudent && (
                <div className="bg-slate-50 rounded-xl p-4 flex flex-col items-center">
                  <Users className="w-8 h-8 text-teal-600 mb-2" />
                  <h3 className="font-semibold text-slate-800 mb-1">الحلقة</h3>
                  {isEditing ? (
                    <input
                      type="text"
                      value={displayUser.group || ''}
                      onChange={(e) => handleInputChange('group', e.target.value)}
                      className="w-full mt-1 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="اسم الحلقة"
                    />
                  ) : (
                    <p className="text-sm text-slate-600">{displayUser.group || displayUser.groups?.join(', ') || 'غير محدد'}</p>
                  )}
                </div>
              )}

              {/* Teacher — Students only */}
              {isStudent && (
                <div className="bg-slate-50 rounded-xl p-4 flex flex-col items-center">
                  <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                    <span className="text-blue-600 font-bold text-xs">معلم</span>
                  </span>
                  <h3 className="font-semibold text-slate-800 mb-1">المعلم</h3>
                  {isEditing ? (
                    <input
                      type="text"
                      value={displayUser.teacher || ''}
                      onChange={(e) => handleInputChange('teacher', e.target.value)}
                      className="w-full mt-1 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="اسم المعلم"
                    />
                  ) : (
                    <p className="text-sm text-slate-600">{displayUser.teacher || 'غير محدد'}</p>
                  )}
                </div>
              )}

              {/* Created at */}
              <div className="bg-slate-50 rounded-xl p-4 flex flex-col items-center md:col-span-2 lg:col-span-1">
                <span className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                  <Calendar className="w-5 h-5 text-gray-500" />
                </span>
                <h3 className="font-semibold text-slate-800 mb-1">تاريخ إنشاء الحساب</h3>
                <p className="text-sm text-slate-600">
                  {displayUser.createdAt ? formatDate(displayUser.createdAt) : 'غير متوفر'}
                </p>
              </div>
            </div>

            {/* Notice */}
            <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-sm text-blue-700 text-center">
                إذا لم تتمكن من تحديث التفاصيل، حاول إعادة تحميل الصفحة أو التحقق من الاتصال بالإنترنت.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Toast notifications */}
      <ToastContainer position="top-center" autoClose={3000} rtl={true} />
    </div>
  );
};

export default Profile;
