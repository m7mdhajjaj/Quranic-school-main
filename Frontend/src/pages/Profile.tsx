// // src/pages/Profile.tsx
// import React, { useEffect, useMemo, useState } from 'react';
// import axios from 'axios';
// import {
//   Edit,
//   Phone,
//   Mail,
//   Calendar,
//   MapPin,
//   Users,
//   BookOpen,
//   Camera,
//   Lock,
//   Save,
//   X,
//   User as UserIcon,
//   Loader2,
//   RefreshCw,
//   IdCard,
// } from 'lucide-react';
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// // ============================
// // الإعداد
// // ============================
// const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5005/api';

// // Axios مع التوكن
// const api = axios.create({ baseURL: API_URL });
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// // ============================
// // Types
// // ============================
// interface UserBase {
//   _id: string;
//   idNumber?: string;
//   firstName?: string;
//   fatherName?: string;
//   grandFatherName?: string;
//   motherName?: string;
//   lastName?: string;
//   birthDate?: string; // ISO
//   gender?: string;
//   residence?: string;
//   email?: string;
//   phoneNumber?: string;
//   groups?: string[];
//   role?: 'student' | 'teacher' | 'admin';
//   createdAt?: string;
//   updatedAt?: string;
//   age?: number;
//   teacherId?: number;
//   studentId?: number;
// }

// type Endpoint = 'students' | 'teachers';

// type FetchState =
//   | { status: 'idle' }
//   | { status: 'loading' }
//   | { status: 'ok' }
//   | { status: 'error'; message: string };

// // ============================
// // Helpers
// // ============================
// const toArabicGender = (g?: string) =>
//   g === 'male' || g === 'ذكر'
//     ? 'ذكر'
//     : g === 'female' || g === 'أنثى'
//       ? 'أنثى'
//       : 'غير محدد';

// const calcAge = (iso?: string) => {
//   if (!iso) return undefined;
//   const d = new Date(iso);
//   if (Number.isNaN(+d)) return undefined;
//   const now = new Date();
//   let age = now.getFullYear() - d.getFullYear();
//   const m = now.getMonth() - d.getMonth();
//   if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
//   return age;
// };

// const formatDate = (iso?: string) => {
//   if (!iso) return 'غير محدد';
//   const d = new Date(iso);
//   return Number.isNaN(+d)
//     ? 'غير محدد'
//     : d.toLocaleDateString('ar-EG', {
//         year: 'numeric',
//         month: 'long',
//         day: 'numeric',
//       });
// };

// const nv = (v?: string | number) =>
//   v === undefined || v === null || v === '' ? 'غير متوفر' : String(v);

// const fetchJson = async (url: string) => {
//   const res = await api.get(url);
//   return res.data?.data ?? res.data;
// };

// // اجلب الأفاتار كـ Blob URL من الـ API
// async function fetchAvatarBlobUrl(ep: Endpoint, id: string): Promise<string> {
//   try {
//     const res = await fetch(`${API_URL}/${ep}/${id}/avatar`, {
//       headers: {
//         Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
//       },
//     });
//     if (!res.ok) return '';
//     const blob = await res.blob();
//     return URL.createObjectURL(blob);
//   } catch {
//     return '';
//   }
// }

// // ============================
// // Component
// // ============================
// const Profile: React.FC = () => {
//   const [user, setUser] = useState<UserBase | null>(null);
//   const [endpoint, setEndpoint] = useState<Endpoint>('students');
//   const [fetchState, setFetchState] = useState<FetchState>({ status: 'idle' });

//   const [isEditing, setIsEditing] = useState(false);
//   const [edited, setEdited] = useState<UserBase | null>(null);

//   // للصورة
//   const [avatarFile, setAvatarFile] = useState<File | null>(null);
//   const [avatarUrl, setAvatarUrl] = useState<string>('');

//   // توليد اسم كامل
//   const fullName = useMemo(
//     () =>
//       [user?.firstName, user?.fatherName, user?.grandFatherName, user?.lastName]
//         .filter(Boolean)
//         .join(' '),
//     [user]
//   );
//   const age = useMemo(() => user?.age ?? calcAge(user?.birthDate), [user]);

//   // معرف المستخدم
//   const getUserId = () => {
//     const idFromLocal = localStorage.getItem('userId');
//     if (idFromLocal) return idFromLocal;
//     try {
//       const raw = localStorage.getItem('user');
//       if (raw) {
//         const parsed = JSON.parse(raw);
//         return parsed?._id || parsed?.id;
//       }
//     } catch {}
//     return '';
//   };

//   // تحميل البيانات
//   const loadUser = async () => {
//     const id = getUserId();
//     if (!id) {
//       setFetchState({ status: 'error', message: 'لا يوجد مستخدم مسجّل.' });
//       return;
//     }
//     setFetchState({ status: 'loading' });
//     try {
//       // جرّب الطالب أولاً
//       try {
//         const u: UserBase = await fetchJson(`/students/${id}`);
//         setUser({ ...u, role: u.role ?? 'student' });
//         setEndpoint('students');
//         const url = await fetchAvatarBlobUrl('students', u._id);
//         setAvatarUrl((prev) => {
//           if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
//           return url;
//         });
//         setFetchState({ status: 'ok' });
//         return;
//       } catch (e: any) {
//         if (e?.response?.status !== 404) throw e;
//       }
//       // جرّب المعلّم
//       const u: UserBase = await fetchJson(`/teachers/${id}`);
//       setUser({ ...u, role: u.role ?? 'teacher' });
//       setEndpoint('teachers');
//       const url = await fetchAvatarBlobUrl('teachers', u._id);
//       setAvatarUrl((prev) => {
//         if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
//         return url;
//       });
//       setFetchState({ status: 'ok' });
//     } catch (e: any) {
//       setFetchState({
//         status: 'error',
//         message: e?.response?.data?.message || 'فشل تحميل البيانات',
//       });
//     }
//   };

//   useEffect(() => {
//     loadUser();
//     return () => {
//       if (avatarUrl && avatarUrl.startsWith('blob:'))
//         URL.revokeObjectURL(avatarUrl);
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // تحرير
//   const beginEdit = () => {
//     setEdited(user);
//     setIsEditing(true);
//   };
//   const cancelEdit = () => {
//     setIsEditing(false);
//     setEdited(null);
//     setAvatarFile(null);
//     // ارجع للـ avatarUrl الحالي (نفسه)
//   };

//   // حفظ
//   const saveProfile = async () => {
//     if (!user || !edited) return;
//     try {
//       // (1) البيانات النصية
//       const payload: Partial<UserBase> = {
//         firstName: edited.firstName,
//         lastName: edited.lastName,
//         idNumber: edited.idNumber,
//         birthDate: edited.birthDate,
//         gender: edited.gender,
//         residence: edited.residence,
//         email: edited.email,
//         phoneNumber: edited.phoneNumber,
//         groups: edited.groups,
//       };
//       await api.put(`/${endpoint}/${user._id}`, payload);

//       // (2) رفع الصورة داخل الداتابيس (in-memory)
//       if (avatarFile) {
//         const fd = new FormData();
//         fd.append('avatar', avatarFile);
//         await api.post(`/${endpoint}/${user._id}/avatar`, fd, {
//           headers: { 'Content-Type': 'multipart/form-data' },
//         });
//         // أعد تحميل صورة الأفاتار كبلاَب
//         const newUrl = await fetchAvatarBlobUrl(endpoint, user._id);
//         setAvatarUrl((prev) => {
//           if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
//           return newUrl;
//         });
//         setAvatarFile(null);
//       }

//       // حدّث العرض
//       setUser({ ...user, ...payload });
//       setEdited(null);
//       setIsEditing(false);
//       toast.success('تم حفظ التعديلات بنجاح');
//     } catch (e: any) {
//       toast.error(e?.response?.data?.message || 'تعذّر حفظ التعديلات');
//     }
//   };

//   const changePassword = async (oldPass: string, newPass: string) => {
//     try {
//       await api.put(`/${endpoint}/${user?._id}/password`, {
//         oldPassword: oldPass,
//         newPassword: newPass,
//       });
//       toast.success('تم تغيير كلمة المرور');
//     } catch (e: any) {
//       toast.error(e?.response?.data?.message || 'تعذّر تغيير كلمة المرور');
//     }
//   };

//   // UI حالات
//   if (fetchState.status === 'loading') {
//     return (
//       <div className="p-6 flex items-center justify-center min-h-[60vh]">
//         <div className="flex items-center gap-3 text-slate-600">
//           <Loader2 className="w-6 h-6 animate-spin" />
//           <span>جارِ تحميل الملف الشخصي…</span>
//         </div>
//       </div>
//     );
//   }

//   if (fetchState.status === 'error') {
//     return (
//       <div className="p-6">
//         <div className="mx-auto max-w-5xl">
//           <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 flex items-center justify-between">
//             <div>{fetchState.message}</div>
//             <button
//               onClick={loadUser}
//               className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
//             >
//               <RefreshCw className="w-4 h-4" />
//               إعادة المحاولة
//             </button>
//           </div>
//         </div>
//         <ToastContainer rtl position="top-center" />
//       </div>
//     );
//   }

//   if (!user) return null;

//   return (
//     <div className="p-4 md:p-6" dir="rtl">
//       <div className="mx-auto max-w-6xl">
//         {/* الهيدر */}
//         <div className="bg-emerald-600 text-white rounded-2xl p-5 md:p-6 relative shadow-md">
//           <div className="flex items-start justify-between gap-4">
//             <div>
//               <div className="text-2xl md:text-3xl font-bold">
//                 {fullName || 'الملف الشخصي'}
//               </div>
//               <div className="mt-2 inline-flex items-center gap-2 bg-emerald-700/60 px-3 py-1 rounded-full text-sm">
//                 <BookOpen className="w-4 h-4" />
//                 {user.role === 'teacher'
//                   ? 'معلّم'
//                   : user.role === 'student'
//                     ? 'طالب'
//                     : 'مستخدم'}
//               </div>
//             </div>

//             {/* الأفاتار */}
//             <div className="relative">
//               <div className="w-24 h-24 md:w-28 md:h-28 rounded-full ring-4 ring-white/30 bg-white overflow-hidden flex items-center justify-center shadow-lg">
//                 {avatarFile ? (
//                   <img
//                     src={URL.createObjectURL(avatarFile)}
//                     alt="avatar"
//                     className="w-full h-full object-cover"
//                   />
//                 ) : avatarUrl ? (
//                   <img
//                     src={avatarUrl}
//                     alt="avatar"
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <UserIcon className="w-12 h-12 text-emerald-600" />
//                 )}
//               </div>
//               {isEditing && (
//                 <>
//                   <label
//                     htmlFor="avatar"
//                     className="absolute -bottom-2 right-0 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-2 cursor-pointer shadow"
//                     title="تغيير الصورة"
//                   >
//                     <Camera className="w-4 h-4" />
//                   </label>
//                   <input
//                     id="avatar"
//                     type="file"
//                     accept="image/*"
//                     className="hidden"
//                     onChange={(e) => {
//                       const f = e.target.files?.[0] || null;
//                       setAvatarFile(f);
//                     }}
//                   />
//                 </>
//               )}
//             </div>
//           </div>

//           {/* أزرار */}
//           <div className="mt-4 flex flex-wrap gap-3">
//             {!isEditing ? (
//               <>
//                 <button
//                   onClick={beginEdit}
//                   className="inline-flex items-center gap-2 bg-white text-emerald-700 font-medium px-4 py-2 rounded-lg hover:bg-emerald-50"
//                 >
//                   <Edit className="w-4 h-4" />
//                   تعديل المعلومات الشخصية
//                 </button>
//                 <button
//                   onClick={() => {
//                     const oldPass = prompt('أدخل كلمة المرور الحالية:');
//                     if (!oldPass) return;
//                     const newPass = prompt('أدخل كلمة المرور الجديدة:');
//                     if (!newPass) return;
//                     changePassword(oldPass, newPass);
//                   }}
//                   className="inline-flex items-center gap-2 bg-white/20 text-white font-medium px-4 py-2 rounded-lg hover:bg-white/30"
//                 >
//                   <Lock className="w-4 h-4" />
//                   تغيير كلمة المرور
//                 </button>
//               </>
//             ) : (
//               <>
//                 <button
//                   onClick={saveProfile}
//                   className="inline-flex items-center gap-2 bg-white text-emerald-700 font-semibold px-4 py-2 rounded-lg hover:bg-emerald-50"
//                 >
//                   <Save className="w-4 h-4" />
//                   حفظ
//                 </button>
//                 <button
//                   onClick={cancelEdit}
//                   className="inline-flex items-center gap-2 bg-white/20 text-white font-medium px-4 py-2 rounded-lg hover:bg-white/30"
//                 >
//                   <X className="w-4 h-4" />
//                   إلغاء
//                 </button>
//               </>
//             )}
//           </div>
//         </div>

//         {/* البطاقات */}
//         <div className="grid md:grid-cols-3 gap-4 mt-6">
//           {/* الاسم الكامل */}
//           <InfoCard
//             icon={<Users className="w-6 h-6 text-emerald-600" />}
//             title="الاسم الكامل"
//             value={
//               isEditing ? (
//                 <div className="grid grid-cols-2 gap-2">
//                   <TextInput
//                     placeholder="الاسم الأول"
//                     value={edited?.firstName ?? ''}
//                     onChange={(v) =>
//                       setEdited((p) => (p ? { ...p, firstName: v } : p))
//                     }
//                   />
//                   <TextInput
//                     placeholder="اسم العائلة"
//                     value={edited?.lastName ?? ''}
//                     onChange={(v) =>
//                       setEdited((p) => (p ? { ...p, lastName: v } : p))
//                     }
//                   />
//                 </div>
//               ) : (
//                 nv(fullName)
//               )
//             }
//           />

//           {/* رقم الهوية */}
//           <InfoCard
//             icon={<IdCard className="w-6 h-6 text-purple-600" />}
//             title="رقم الهوية"
//             value={
//               isEditing ? (
//                 <TextInput
//                   placeholder="رقم الهوية"
//                   value={edited?.idNumber ?? ''}
//                   onChange={(v) =>
//                     setEdited((p) => (p ? { ...p, idNumber: v } : p))
//                   }
//                 />
//               ) : (
//                 nv(user.idNumber)
//               )
//             }
//           />

//           {/* تاريخ الميلاد / العمر / الجنس */}
//           <InfoCard
//             icon={<Calendar className="w-6 h-6 text-amber-600" />}
//             title="تاريخ الميلاد / العمر / الجنس"
//             value={
//               isEditing ? (
//                 <div className="grid grid-cols-3 gap-2">
//                   <TextInput
//                     type="date"
//                     value={
//                       edited?.birthDate ? edited.birthDate.slice(0, 10) : ''
//                     }
//                     onChange={(v) =>
//                       setEdited((p) =>
//                         p
//                           ? {
//                               ...p,
//                               birthDate: v ? new Date(v).toISOString() : '',
//                             }
//                           : p
//                       )
//                     }
//                   />
//                   <select
//                     className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring"
//                     value={edited?.gender ?? ''}
//                     onChange={(e) =>
//                       setEdited((p) =>
//                         p ? { ...p, gender: e.target.value } : p
//                       )
//                     }
//                   >
//                     <option value="">غير محدد</option>
//                     <option value="male">ذكر</option>
//                     <option value="female">أنثى</option>
//                   </select>
//                   <div className="bg-slate-50 text-slate-700 rounded-lg px-3 py-2">
//                     العمر: {calcAge(edited?.birthDate) ?? '—'}
//                   </div>
//                 </div>
//               ) : (
//                 <>
//                   <div>تاريخ الميلاد: {formatDate(user.birthDate)}</div>
//                   <div className="mt-1">العمر: {age ?? '—'} سنة</div>
//                   <div className="mt-1">
//                     الجنس: {toArabicGender(user.gender)}
//                   </div>
//                 </>
//               )
//             }
//           />

//           {/* مكان السكن */}
//           <InfoCard
//             icon={<MapPin className="w-6 h-6 text-pink-600" />}
//             title="مكان السكن"
//             value={
//               isEditing ? (
//                 <TextInput
//                   placeholder="المدينة / الحي"
//                   value={edited?.residence ?? ''}
//                   onChange={(v) =>
//                     setEdited((p) => (p ? { ...p, residence: v } : p))
//                   }
//                 />
//               ) : (
//                 nv(user.residence)
//               )
//             }
//           />

//           {/* البريد */}
//           <InfoCard
//             icon={<Mail className="w-6 h-6 text-emerald-600" />}
//             title="البريد الإلكتروني"
//             value={
//               isEditing ? (
//                 <TextInput
//                   type="email"
//                   placeholder="email@example.com"
//                   value={edited?.email ?? ''}
//                   onChange={(v) =>
//                     setEdited((p) => (p ? { ...p, email: v } : p))
//                   }
//                 />
//               ) : (
//                 nv(user.email)
//               )
//             }
//           />

//           {/* الهاتف */}
//           <InfoCard
//             icon={<Phone className="w-6 h-6 text-orange-600" />}
//             title="رقم الهاتف"
//             value={
//               isEditing ? (
//                 <TextInput
//                   placeholder="05xxxxxxxx"
//                   value={edited?.phoneNumber ?? ''}
//                   onChange={(v) =>
//                     setEdited((p) => (p ? { ...p, phoneNumber: v } : p))
//                   }
//                 />
//               ) : (
//                 nv(user.phoneNumber)
//               )
//             }
//           />

//           {/* المجموعات */}
//           <InfoCard
//             icon={<Users className="w-6 h-6 text-sky-600" />}
//             title="المجموعات"
//             value={
//               isEditing ? (
//                 <TextInput
//                   placeholder="افصل بين الأسماء بفاصلة"
//                   value={(edited?.groups ?? []).join(', ')}
//                   onChange={(v) =>
//                     setEdited((p) =>
//                       p
//                         ? {
//                             ...p,
//                             groups: v
//                               .split(',')
//                               .map((s) => s.trim())
//                               .filter(Boolean),
//                           }
//                         : p
//                     )
//                   }
//                 />
//               ) : user.groups && user.groups.length ? (
//                 user.groups.join('، ')
//               ) : (
//                 'غير متوفر'
//               )
//             }
//           />

//           {/* تاريخ إنشاء الحساب */}
//           <InfoCard
//             icon={<Calendar className="w-6 h-6 text-slate-600" />}
//             title="تاريخ إنشاء الحساب"
//             value={user.createdAt ? formatDate(user.createdAt) : 'غير متوفر'}
//           />
//         </div>
//       </div>

//       <ToastContainer rtl position="top-center" />
//     </div>
//   );
// };

// // ============================
// // عناصر فرعية
// // ============================
// const InfoCard: React.FC<{
//   icon: React.ReactNode;
//   title: string;
//   value: React.ReactNode;
// }> = ({ icon, title, value }) => (
//   <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
//     <div className="flex items-center gap-3 mb-2">
//       <div className="bg-slate-50 p-2 rounded-xl">{icon}</div>
//       <div className="font-semibold text-slate-800">{title}</div>
//     </div>
//     <div className="text-slate-700 leading-relaxed">{value}</div>
//   </div>
// );

// const TextInput: React.FC<{
//   value: string;
//   onChange: (v: string) => void;
//   placeholder?: string;
//   type?: string;
// }> = ({ value, onChange, placeholder, type = 'text' }) => (
//   <input
//     type={type}
//     value={value}
//     onChange={(e) => onChange(e.target.value)}
//     placeholder={placeholder}
//     className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-emerald-200"
//   />
// );

// export default Profile;


// src/pages/Profile.tsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Edit, Phone, Mail, Calendar, MapPin, Users, BookOpen,
  Camera, Lock, Save, X, User as UserIcon, Loader2, RefreshCw, IdCard,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ============================
// الإعداد
// ============================
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5005/api";

// Axios مع التوكن
const api = axios.create({ baseURL: API_URL });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
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
  gender?: string;    // 'male' | 'female' | 'ذكر' | 'انثى'
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
}

type Endpoint = "students" | "teachers";

type FetchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ok" }
  | { status: "error"; message: string };

// ============================
// Helpers
// ============================
const toArabicGender = (g?: string) =>
  g === "male" || g === "ذكر" ? "ذكر" : g === "female" || g === "أنثى" || g === "انثى" ? "أنثى" : "غير محدد";

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
    : d.toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" });
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
const keyFor = (field: "birthDate" | "gender", userId: string) => `editHistory_${field}_${userId}`;

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

// جلب الأفاتار كـ Blob URL من الـ API
async function fetchAvatarBlobUrl(ep: Endpoint, id: string): Promise<string> {
  try {
    const res = await fetch(`${API_URL}/${ep}/${id}/avatar`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
    });
    if (!res.ok) return "";
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch {
    return "";
  }
}

// ============================
// Component
// ============================
const Profile: React.FC = () => {
  const [user, setUser] = useState<UserBase | null>(null);
  const [endpoint, setEndpoint] = useState<Endpoint>("students");
  const [fetchState, setFetchState] = useState<FetchState>({ status: "idle" });

  const [isEditing, setIsEditing] = useState(false);
  const [edited, setEdited] = useState<UserBase | null>(null);

  // للأفاتار
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  // عرض الاسم الكامل + العمر ديناميكي
  const fullName = useMemo(
    () => [user?.firstName, user?.fatherName, user?.grandFatherName, user?.lastName].filter(Boolean).join(" "),
    [user]
  );
  const age = useMemo(() => calcAge(user?.birthDate), [user?.birthDate]);

  // معرف المستخدم
  const getUserId = () => {
    const idFromLocal = localStorage.getItem("userId");
    if (idFromLocal) return idFromLocal;
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed?._id || parsed?.id;
      }
    } catch {}
    return "";
  };

  // تحميل البيانات
  const loadUser = async () => {
    const id = getUserId();
    if (!id) {
      setFetchState({ status: "error", message: "لا يوجد مستخدم مسجّل." });
      return;
    }
    setFetchState({ status: "loading" });
    try {
      // جرّب الطالب أولاً
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
      // جرّب المعلّم
      const u: UserBase = await fetchJson(`/teachers/${id}`);
      setUser({ ...u, role: u.role ?? "teacher" });
      setEndpoint("teachers");
      const url = await fetchAvatarBlobUrl("teachers", u._id);
      setAvatarUrl((prev) => {
        if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
        return url;
      });
      setFetchState({ status: "ok" });
    } catch (e: any) {
      setFetchState({ status: "error", message: e?.response?.data?.message || "فشل تحميل البيانات" });
    }
  };

  useEffect(() => {
    loadUser();
    return () => {
      if (avatarUrl && avatarUrl.startsWith("blob:")) URL.revokeObjectURL(avatarUrl);
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
      email: edited.email,
      phoneNumber: edited.phoneNumber,
      groups: edited.groups,
      // idNumber: (محظور)
    };

    // تحقق محلي: نافذة شهر متحركة لكل من تاريخ الميلاد والجنس
    const changingBirth = edited.birthDate !== user.birthDate;
    const changingGender = (edited.gender ?? "") !== (user.gender ?? "");

    // birthDate
    if (changingBirth) {
      const b = canEditFieldLocal("birthDate", user._id);
      if (!b.allowed) {
        toast.error("لا يمكنك تعديل تاريخ الميلاد أكثر من مرتين خلال شهر كامل من آخر تعديلاتك");
        return;
      }
    }
    // gender
    if (changingGender) {
      const g = canEditFieldLocal("gender", user._id);
      if (!g.allowed) {
        toast.error("لا يمكنك تعديل الجنس أكثر من مرتين خلال شهر كامل من آخر تعديلاتك");
        return;
      }
    }

    try {
      // (1) البيانات النصية
      await api.put(`/${endpoint}/${user._id}`, payload);

      // سجّل التعديلات المسموحة محليًا بعد نجاح الطلب
      if (changingBirth) recordEditLocal("birthDate", user._id);
      if (changingGender) recordEditLocal("gender", user._id);

      // (2) رفع الصورة داخل الداتابيس (in-memory)
      if (avatarFile) {
        const fd = new FormData();
        fd.append("avatar", avatarFile);
        await api.post(`/${endpoint}/${user._id}/avatar`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        // أعد تحميل صورة الأفاتار كبلاَب
        const newUrl = await fetchAvatarBlobUrl(endpoint, user._id);
        setAvatarUrl((prev) => {
          if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
          return newUrl;
        });
        setAvatarFile(null);
      }

      // حدّث العرض (العمر يُحسب ديناميكيًا من birthDate)
      setUser({ ...user, ...payload });
      setEdited(null);
      setIsEditing(false);
      toast.success("تم حفظ التعديلات بنجاح");
    } catch (e: any) {
      // في حال الخادم يطبّق نفس القيد ويرجع 429 أو يمنع الهوية
      const msg = e?.response?.data?.message || "تعذّر حفظ التعديلات";
      toast.error(msg);
    }
  };

  const changePassword = async (oldPass: string, newPass: string) => {
    try {
      await api.put(`/${endpoint}/${user?._id}/password`, {
        oldPassword: oldPass,
        newPassword: newPass,
      });
      toast.success("تم تغيير كلمة المرور");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "تعذّر تغيير كلمة المرور");
    }
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
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 flex items-center justify-between">
            <div>{fetchState.message}</div>
            <button
              onClick={loadUser}
              className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
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
  const remainingGender = canEditFieldLocal("gender", user._id).remaining;

  return (
    <div className="p-4 md:p-6" dir="rtl">
      <div className="mx-auto max-w-6xl">
        {/* الهيدر */}
        <div className="bg-emerald-600 text-white rounded-2xl p-5 md:p-6 relative shadow-md">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-2xl md:text-3xl font-bold">{fullName || "الملف الشخصي"}</div>
              <div className="mt-2 inline-flex items-center gap-2 bg-emerald-700/60 px-3 py-1 rounded-full text-sm">
                <BookOpen className="w-4 h-4" />
                {user.role === "teacher" ? "معلّم" : user.role === "student" ? "طالب" : "مستخدم"}
              </div>
            </div>

            {/* الأفاتار */}
            <div className="relative">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full ring-4 ring-white/30 bg-white overflow-hidden flex items-center justify-center shadow-lg">
                {avatarFile ? (
                  <img src={URL.createObjectURL(avatarFile)} alt="avatar" className="w-full h-full object-cover" />
                ) : avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-12 h-12 text-emerald-600" />
                )}
              </div>
              {isEditing && (
                <>
                  <label
                    htmlFor="avatar"
                    className="absolute -bottom-2 right-0 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-2 cursor-pointer shadow"
                    title="تغيير الصورة"
                  >
                    <Camera className="w-4 h-4" />
                  </label>
                  <input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      setAvatarFile(f);
                    }}
                  />
                </>
              )}
            </div>
          </div>

          {/* أزرار */}
          <div className="mt-4 flex flex-wrap gap-3">
            {!isEditing ? (
              <>
                <button
                  onClick={beginEdit}
                  className="inline-flex items-center gap-2 bg-white text-emerald-700 font-medium px-4 py-2 rounded-lg hover:bg-emerald-50"
                >
                  <Edit className="w-4 h-4" />
                  تعديل المعلومات الشخصية
                </button>
                <button
                  onClick={() => {
                    const oldPass = prompt("أدخل كلمة المرور الحالية:");
                    if (!oldPass) return;
                    const newPass = prompt("أدخل كلمة المرور الجديدة:");
                    if (!newPass) return;
                    changePassword(oldPass, newPass);
                  }}
                  className="inline-flex items-center gap-2 bg-white/20 text-white font-medium px-4 py-2 rounded-lg hover:bg-white/30"
                >
                  <Lock className="w-4 h-4" />
                  تغيير كلمة المرور
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={saveProfile}
                  className="inline-flex items-center gap-2 bg-white text-emerald-700 font-semibold px-4 py-2 rounded-lg hover:bg-emerald-50"
                >
                  <Save className="w-4 h-4" />
                  حفظ
                </button>
                <button
                  onClick={cancelEdit}
                  className="inline-flex items-center gap-2 bg-white/20 text-white font-medium px-4 py-2 rounded-lg hover:bg-white/30"
                >
                  <X className="w-4 h-4" />
                  إلغاء
                </button>
              </>
            )}
          </div>
        </div>

        {/* البطاقات */}
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          {/* الاسم الكامل */}
          <InfoCard
            icon={<Users className="w-6 h-6 text-emerald-600" />}
            title="الاسم الكامل"
            value={
              isEditing ? (
                <div className="grid grid-cols-2 gap-2">
                  <TextInput
                    placeholder="الاسم الأول"
                    value={edited?.firstName ?? ""}
                    onChange={(v) => setEdited((p) => (p ? { ...p, firstName: v } : p))}
                  />
                  <TextInput
                    placeholder="اسم العائلة"
                    value={edited?.lastName ?? ""}
                    onChange={(v) => setEdited((p) => (p ? { ...p, lastName: v } : p))}
                  />
                </div>
              ) : (
                nv(fullName)
              )
            }
          />

          {/* رقم الهوية — غير قابل للتعديل */}
          <InfoCard
            icon={<IdCard className="w-6 h-6 text-purple-600" />}
            title="رقم الهوية"
            value={
              isEditing ? (
                <input
                  value={user.idNumber ?? ""}
                  readOnly
                  disabled
                  className="w-full border rounded-lg px-3 py-2 bg-slate-100 text-slate-500 cursor-not-allowed"
                />
              ) : (
                nv(user.idNumber)
              )
            }
          />

          {/* تاريخ الميلاد / العمر / الجنس + عداد المحاولات */}
          <InfoCard
            icon={<Calendar className="w-6 h-6 text-amber-600" />}
            title="تاريخ الميلاد / العمر / الجنس"
            value={
              isEditing ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <TextInput
                      type="date"
                      value={edited?.birthDate ? edited.birthDate.slice(0, 10) : ""}
                      onChange={(v) =>
                        setEdited((p) => (p ? { ...p, birthDate: v ? new Date(v).toISOString() : "" } : p))
                      }
                    />
                    <select
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring"
                      value={edited?.gender ?? ""}
                      onChange={(e) => setEdited((p) => (p ? { ...p, gender: e.target.value } : p))}
                    >
                      <option value="">غير محدد</option>
                      <option value="male">ذكر</option>
                      <option value="female">أنثى</option>
                    </select>
                    <div className="bg-slate-50 text-slate-700 rounded-lg px-3 py-2">
                      العمر: {calcAge(edited?.birthDate) ?? "—"}
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">
                    المتبقي لتعديل تاريخ الميلاد: <b>{remainingBirth}</b> / 2 — المتبقي لتعديل الجنس: <b>{remainingGender}</b> / 2
                  </div>
                </div>
              ) : (
                <>
                  <div>تاريخ الميلاد: {formatDate(user.birthDate)}</div>
                  <div className="mt-1">العمر: {age ?? "—"} سنة</div>
                  <div className="mt-1">الجنس: {toArabicGender(user.gender)}</div>
                </>
              )
            }
          />

          {/* مكان السكن */}
          <InfoCard
            icon={<MapPin className="w-6 h-6 text-pink-600" />}
            title="مكان السكن"
            value={
              isEditing ? (
                <TextInput
                  placeholder="المدينة / الحي"
                  value={edited?.residence ?? ""}
                  onChange={(v) => setEdited((p) => (p ? { ...p, residence: v } : p))}
                />
              ) : (
                nv(user.residence)
              )
            }
          />

          {/* البريد */}
          <InfoCard
            icon={<Mail className="w-6 h-6 text-emerald-600" />}
            title="البريد الإلكتروني"
            value={
              isEditing ? (
                <TextInput
                  type="email"
                  placeholder="email@example.com"
                  value={edited?.email ?? ""}
                  onChange={(v) => setEdited((p) => (p ? { ...p, email: v } : p))}
                />
              ) : (
                nv(user.email)
              )
            }
          />

          {/* الهاتف */}
          <InfoCard
            icon={<Phone className="w-6 h-6 text-orange-600" />}
            title="رقم الهاتف"
            value={
              isEditing ? (
                <TextInput
                  placeholder="05xxxxxxxx"
                  value={edited?.phoneNumber ?? ""}
                  onChange={(v) => setEdited((p) => (p ? { ...p, phoneNumber: v } : p))}
                />
              ) : (
                nv(user.phoneNumber)
              )
            }
          />

          {/* المجموعات */}
          <InfoCard
            icon={<Users className="w-6 h-6 text-sky-600" />}
            title="المجموعات"
            value={
              isEditing ? (
                <TextInput
                  placeholder="افصل بين الأسماء بفاصلة"
                  value={(edited?.groups ?? []).join(", ")}
                  onChange={(v) =>
                    setEdited((p) =>
                      p ? { ...p, groups: v.split(",").map((s) => s.trim()).filter(Boolean) } : p
                    )
                  }
                />
              ) : user.groups && user.groups.length ? (
                user.groups.join("، ")
              ) : (
                "غير متوفر"
              )
            }
          />

          {/* تاريخ إنشاء الحساب */}
          <InfoCard
            icon={<Calendar className="w-6 h-6 text-slate-600" />}
            title="تاريخ إنشاء الحساب"
            value={user.createdAt ? formatDate(user.createdAt) : "غير متوفر"}
          />
        </div>
      </div>

      <ToastContainer rtl position="top-center" />
    </div>
  );
};

// ============================
// عناصر فرعية
// ============================
const InfoCard: React.FC<{ icon: React.ReactNode; title: string; value: React.ReactNode }> = ({
  icon,
  title,
  value,
}) => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
    <div className="flex items-center gap-3 mb-2">
      <div className="bg-slate-50 p-2 rounded-xl">{icon}</div>
      <div className="font-semibold text-slate-800">{title}</div>
    </div>
    <div className="text-slate-700 leading-relaxed">{value}</div>
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
    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-emerald-200"
  />
);

export default Profile;
