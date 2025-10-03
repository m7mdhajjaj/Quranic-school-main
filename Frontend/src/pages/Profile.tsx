// import React, { useEffect, useMemo, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import {
//   Edit,
//   Phone,
//   Calendar,
//   MapPin,
//   Users,
//   Lock,
//   Save,
//   X,
//   User as UserIcon,
//   Loader2,
//   RefreshCw,
//   IdCard,
//   Mail,
//   Clock,
//   Sparkles,
//   CheckCircle2,
//   AlertCircle,
// } from 'lucide-react';
// import { toast, ToastContainer } from 'react-toastify';
// import Avatar from '../components/Avatar';
// import { useAuth } from '../hooks/useAuth';
// import 'react-toastify/dist/ReactToastify.css';

// // ============================
// // الإعداد
// // ============================
// import { API_URL } from '../config';

// const api = axios.create({ baseURL: API_URL });

// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// // Local helper functions
// const getUserGender = (user: any) => {
//   return user?.gender || 'male';
// };

// const fetchAvatarBlobUrl = async (endpoint: string, userId: string) => {
//   try {
//     const response = await api.get(`/${endpoint}/${userId}/avatar`, {
//       responseType: 'blob',
//     });
//     return URL.createObjectURL(response.data);
//   } catch (error) {
//     console.error('Error fetching avatar:', error);
//     return null;
//   }
// };

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
//   birthDate?: string;
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
//   group?: string;
//   teacher?: string;
// }

// type Endpoint = 'students' | 'teachers' | 'admins';

// type FetchState =
//   | { status: 'idle' }
//   | { status: 'loading' }
//   | { status: 'ok' }
//   | { status: 'error'; message: string };

// // ============================
// // Helpers
// // ============================
// const toArabicGender = (g?: string) => {
//   if (!g || g.trim() === '') return 'غير محدد';
//   const normalized = g.trim();
//   if (normalized === 'ذكر' || normalized === 'male') return 'ذكر';
//   if (normalized === 'أنثى' || normalized === 'انثى' || normalized === 'female')
//     return 'أنثى';
//   return 'غير محدد';
// };

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

// // ------ تحكم التعديلات ------
// const addOneMonth = (dt: Date) => {
//   const d = new Date(dt);
//   d.setMonth(d.getMonth() + 1);
//   return d;
// };

// const pruneRolling = (timestamps: string[]) => {
//   const now = new Date();
//   return timestamps.filter((iso) => now < addOneMonth(new Date(iso)));
// };

// const keyFor = (field: 'birthDate' | 'gender', userId: string) =>
//   `editHistory_${field}_${userId}`;

// const canEditFieldLocal = (field: 'birthDate' | 'gender', userId: string) => {
//   const raw = localStorage.getItem(keyFor(field, userId));
//   const list = pruneRolling(raw ? JSON.parse(raw) : []);
//   const allowed = list.length < 2;
//   const remaining = Math.max(0, 2 - list.length);
//   return { allowed, remaining, list };
// };

// const recordEditLocal = (field: 'birthDate' | 'gender', userId: string) => {
//   const { list } = canEditFieldLocal(field, userId);
//   const updated = [...list, new Date().toISOString()];
//   localStorage.setItem(keyFor(field, userId), JSON.stringify(updated));
// };

// // ============================
// // Component
// // ============================
// const Profile: React.FC = () => {
//   const navigate = useNavigate();
//   const { user: authUser } = useAuth();

//   const [user, setUser] = useState<UserBase | null>(null);
//   const [endpoint, setEndpoint] = useState<Endpoint>('students');
//   const [fetchState, setFetchState] = useState<FetchState>({ status: 'idle' });

//   const [isEditing, setIsEditing] = useState(false);
//   const [edited, setEdited] = useState<UserBase | null>(null);
//   const [isSaving, setIsSaving] = useState(false);

//   const [avatarFile, setAvatarFile] = useState<File | null>(null);
//   const [avatarUrl, setAvatarUrl] = useState<string | null>('');

//   const fullName = useMemo(
//     () =>
//       [user?.firstName, user?.fatherName, user?.grandFatherName, user?.lastName]
//         .filter(Boolean)
//         .join(' '),
//     [user]
//   );
//   const age = useMemo(() => calcAge(user?.birthDate), [user?.birthDate]);

//   const getUserInfo = () => {
//     const userId = authUser?._id || '';
//     const userRole = authUser?.role;
//     return { userId, userRole };
//   };

//   const loadUser = async () => {
//     const { userId: id, userRole } = getUserInfo();
//     if (!id) {
//       setFetchState({ status: 'error', message: 'لا يوجد مستخدم مسجّل.' });
//       return;
//     }
//     setFetchState({ status: 'loading' });

//     try {
//       if (userRole === 'admin') {
//         try {
//           const u: UserBase = await fetchJson(`/admins/${id}`);
//           setUser({ ...u, role: u.role ?? 'admin' });
//           setEndpoint('admins');
//           const url = await fetchAvatarBlobUrl('admins', u._id);
//           setAvatarUrl((prev) => {
//             if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
//             return url;
//           });
//           setFetchState({ status: 'ok' });
//           return;
//         } catch (e: any) {
//           if (e?.response?.status !== 404) throw e;
//         }
//       }

//       if (userRole === 'teacher' || userRole?.includes('teacher')) {
//         try {
//           const u: UserBase = await fetchJson(`/teachers/${id}`);
//           setUser({ ...u, role: u.role ?? 'teacher' });
//           setEndpoint('teachers');
//           const url = await fetchAvatarBlobUrl('teachers', u._id);
//           setAvatarUrl((prev) => {
//             if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
//             return url;
//           });
//           setFetchState({ status: 'ok' });
//           return;
//         } catch (e: any) {
//           if (e?.response?.status !== 404) throw e;
//         }
//       }

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

//       if (
//         userRole !== 'teacher' &&
//         !userRole?.includes('admin') &&
//         !userRole?.includes('teacher')
//       ) {
//         const u: UserBase = await fetchJson(`/teachers/${id}`);
//         setUser({ ...u, role: u.role ?? 'teacher' });
//         setEndpoint('teachers');
//         const url = await fetchAvatarBlobUrl('teachers', u._id);
//         setAvatarUrl((prev) => {
//           if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
//           return url;
//         });
//         setFetchState({ status: 'ok' });
//       }
//     } catch (e: any) {
//       if (e?.response?.status === 401) {
//         localStorage.removeItem('user');
//         localStorage.removeItem('token');
//         navigate('/login');
//         return;
//       }

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
//   }, []);

//   const beginEdit = () => {
//     setEdited(user);
//     setIsEditing(true);
//   };

//   const cancelEdit = () => {
//     setIsEditing(false);
//     setEdited(null);
//     setAvatarFile(null);
//   };

//   const saveProfile = async () => {
//     if (!user || !edited) return;
//     setIsSaving(true);

//     const payload: Partial<UserBase> = {
//       firstName: edited.firstName,
//       lastName: edited.lastName,
//       birthDate: edited.birthDate,
//       gender: edited.gender,
//       residence: edited.residence,
//       idNumber: edited.idNumber,
//       phoneNumber: edited.phoneNumber,
//       groups: edited.groups,
//     };

//     const changingBirth = edited.birthDate !== user.birthDate;
//     const changingGender = (edited.gender ?? '') !== (user.gender ?? '');

//     if (changingBirth) {
//       const b = canEditFieldLocal('birthDate', user._id);
//       if (!b.allowed) {
//         toast.error(
//           'لا يمكنك تعديل تاريخ الميلاد أكثر من مرتين خلال شهر كامل من آخر تعديلاتك'
//         );
//         setIsSaving(false);
//         return;
//       }
//     }
//     if (changingGender) {
//       const g = canEditFieldLocal('gender', user._id);
//       if (!g.allowed) {
//         toast.error(
//           'لا يمكنك تعديل الجنس أكثر من مرتين خلال شهر كامل من آخر تعديلاتك'
//         );
//         setIsSaving(false);
//         return;
//       }
//     }

//     try {
//       await api.put(`/${endpoint}/${user._id}`, payload);

//       if (changingBirth) recordEditLocal('birthDate', user._id);
//       if (changingGender) recordEditLocal('gender', user._id);

//       if (avatarFile) {
//         const fd = new FormData();
//         fd.append('avatar', avatarFile);
//         await api.post(`/${endpoint}/${user._id}/avatar`, fd, {
//           headers: { 'Content-Type': 'multipart/form-data' },
//         });
//         const newUrl = await fetchAvatarBlobUrl(endpoint, user._id);
//         setAvatarUrl((prev) => {
//           if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
//           return newUrl;
//         });
//         setAvatarFile(null);
//       }

//       setUser({ ...user, ...payload });
//       setEdited(null);
//       setIsEditing(false);
//       toast.success('تم حفظ التعديلات بنجاح');
//     } catch (e: any) {
//       const msg = e?.response?.data?.message || 'تعذّر حفظ التعديلات';
//       toast.error(msg);
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const shouldShow = (valuePresent: boolean) => {
//     if (user?.role === 'student' && !isEditing && !valuePresent) return false;
//     return true;
//   };

//   if (fetchState.status === 'loading') {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="relative inline-block">
//             <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
//             <Loader2 className="relative w-16 h-16 text-emerald-600 animate-spin" />
//           </div>
//           <p className="mt-6 text-lg font-semibold text-slate-700">
//             جارِ تحميل ملفك الشخصي...
//           </p>
//           <p className="mt-2 text-sm text-slate-500">الرجاء الانتظار قليلاً</p>
//         </div>
//       </div>
//     );
//   }

//   if (fetchState.status === 'error') {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
//         <div className="mx-auto max-w-2xl mt-20">
//           <div className="bg-white rounded-3xl shadow-2xl border border-red-100 p-8 hover:shadow-red-200/50 transition-shadow duration-300">
//             <div className="text-center mb-6">
//               <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4 hover:bg-red-200 transition-colors duration-300">
//                 <AlertCircle className="w-10 h-10 text-red-600" />
//               </div>
//               <h2 className="text-2xl font-bold text-slate-800 mb-2">
//                 حدث خطأ
//               </h2>
//               <p className="text-red-600 text-lg">{fetchState.message}</p>
//             </div>
//             <button
//               onClick={loadUser}
//               className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold px-6 py-4 rounded-2xl hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
//             >
//               <RefreshCw className="w-5 h-5" />
//               إعادة المحاولة
//             </button>
//           </div>
//         </div>
//         <ToastContainer rtl position="top-center" />
//       </div>
//     );
//   }

//   if (!user) return null;

//   const remainingBirth = canEditFieldLocal('birthDate', user._id).remaining;

//   const getRoleBadge = () => {
//     const roleConfig = {
//       student: {
//         label: 'طالب',
//         gradient: 'from-blue-500 to-cyan-500',
//         hoverGradient: 'hover:from-blue-600 hover:to-cyan-600',
//         icon: '🎓',
//       },
//       teacher: {
//         label: 'معلم',
//         gradient: 'from-purple-500 to-pink-500',
//         hoverGradient: 'hover:from-purple-600 hover:to-pink-600',
//         icon: '👨‍🏫',
//       },
//       admin: {
//         label: 'مدير',
//         gradient: 'from-orange-500 to-red-500',
//         hoverGradient: 'hover:from-orange-600 hover:to-red-600',
//         icon: '⚡',
//       },
//     };

//     const config = roleConfig[user.role || 'student'];

//     return (
//       <button
//         type="button"
//         onClick={() => {
//           toast.info(`أنت مسجل ك${config.label}`);
//         }}
//         className={`group inline-flex items-center justify-center gap-3 bg-gradient-to-r ${config.gradient} ${config.hoverGradient} px-8 py-4 rounded-full text-white font-bold shadow-lg hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer min-w-[120px] min-h-[50px]`}
//       >
//         <span className="text-lg group-hover:scale-125 transition-transform duration-300">
//           {config.icon}
//         </span>
//         <span className="group-hover:tracking-wide transition-all duration-300">
//           {config.label}
//         </span>
//       </button>
//     );
//   };

//   return (
//     <div
//       className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden"
//       dir="rtl"
//     >
//       {/* خلفية متحركة */}
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-emerald-300/20 via-teal-300/20 to-cyan-300/20 rounded-full blur-3xl animate-blob"></div>
//         <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-300/20 via-indigo-300/20 to-purple-300/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
//         <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-gradient-to-br from-pink-300/20 via-rose-300/20 to-orange-300/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
//       </div>

//       {/* الهيدر المحسّن */}
//       <div className="relative">
//         <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 relative overflow-hidden">
//           {/* نمط زخرفي */}
//           <div className="absolute inset-0 opacity-10">
//             <div
//               className="absolute inset-0"
//               style={{
//                 backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
//                 backgroundSize: '40px 40px',
//               }}
//             ></div>
//           </div>

//           <div className="container mx-auto px-6 py-16 relative">
//             <div className="flex items-center flex-col text-center">
//               {/* الصورة الشخصية */}
//               <div className="relative mb-8 group">
//                 <div className="absolute -inset-4 bg-gradient-to-r from-white/40 via-white/30 to-white/40 rounded-full blur-2xl opacity-75 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"></div>
//                 <div className="relative">
//                   <div className="absolute -inset-2 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors duration-300"></div>
//                   <Avatar
//                     src={avatarUrl}
//                     previewSrc={
//                       avatarFile ? URL.createObjectURL(avatarFile) : null
//                     }
//                     userName={user.firstName}
//                     gender={getUserGender(user)}
//                     size="3xl"
//                     border="ring"
//                     showStatus={true}
//                     showEditButton={isEditing}
//                     onEditClick={() =>
//                       document.getElementById('avatar')?.click()
//                     }
//                     fallbackIcon={
//                       <UserIcon className="w-12 h-12 text-emerald-600" />
//                     }
//                   />
//                 </div>
//                 {isEditing && (
//                   <input
//                     id="avatar"
//                     type="file"
//                     accept="image/*"
//                     className="hidden"
//                     aria-label="تغيير صورة الملف الشخصي"
//                     onChange={(e) => {
//                       const f = e.target.files?.[0] || null;
//                       setAvatarFile(f);
//                     }}
//                   />
//                 )}
//               </div>

//               {/* المعلومات الأساسية */}
//               <div className="mb-8">
//                 <h1 className="text-4xl md:text-5xl font-black text-white mb-4 drop-shadow-2xl tracking-tight hover:scale-105 transition-transform duration-300">
//                   {fullName || 'مرحباً بك'}
//                 </h1>
//                 <div className="flex flex-wrap items-center justify-center gap-4">
//                   {getRoleBadge()}
//                   {age && (
//                     <button
//                       type="button"
//                       onClick={() => {
//                         toast.info(`عمرك ${age} سنة - ماشاء الله!`);
//                       }}
//                       className="group inline-flex items-center justify-center gap-3 bg-white/20 backdrop-blur-md px-8 py-4 rounded-full text-white font-bold border border-white/30 shadow-lg hover:bg-white/30 hover:shadow-2xl hover:scale-110 hover:border-white/50 active:scale-95 transition-all duration-300 cursor-pointer min-w-[140px] min-h-[50px]"
//                     >
//                       <Sparkles className="w-5 h-5 group-hover:rotate-180 group-hover:scale-125 transition-all duration-500" />
//                       <span className="group-hover:tracking-wide transition-all duration-300">
//                         العمر: {age} سنة
//                       </span>
//                     </button>
//                   )}
//                 </div>
//               </div>

//               {/* الأزرار المحسّنة */}
//               <div className="flex flex-wrap gap-6 justify-center mt-10 mb-6">
//                 {!isEditing ? (
//                   <>
//                     {/* زر تعديل المعلومات */}
//                     <button
//                       type="button"
//                       onClick={beginEdit}
//                       className="group relative bg-white text-emerald-700 font-bold px-12 py-6 rounded-3xl border-2 border-emerald-200 min-w-[250px] shadow-xl hover:shadow-emerald-500/40 hover:scale-105 hover:border-emerald-300 active:scale-95 transition-all duration-300 overflow-hidden"
//                     >
//                       <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-teal-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
//                       <span className="relative flex items-center justify-center gap-4">
//                         <Edit className="w-7 h-7 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300" />
//                         <span className="text-xl font-black group-hover:tracking-wide transition-all duration-300">
//                           تعديل المعلومات
//                         </span>
//                       </span>
//                     </button>

//                     {/* زر تغيير كلمة المرور */}
//                     <button
//                       type="button"
//                       onClick={() => navigate('/change-password')}
//                       className="group relative bg-white/30 backdrop-blur-lg text-white font-bold px-12 py-6 rounded-3xl border-2 border-white/50 min-w-[250px] shadow-xl hover:bg-white/40 hover:scale-105 hover:border-white/70 active:scale-95 transition-all duration-300 overflow-hidden"
//                     >
//                       <span className="relative flex items-center justify-center gap-4">
//                         <Lock className="w-7 h-7 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
//                         <span className="text-xl font-black group-hover:tracking-wide transition-all duration-300">
//                           تغيير كلمة المرور
//                         </span>
//                       </span>
//                     </button>
//                   </>
//                 ) : (
//                   <>
//                     {/* زر حفظ */}
//                     <button
//                       type="button"
//                       onClick={saveProfile}
//                       disabled={isSaving}
//                       className="group relative bg-white text-green-700 font-bold px-12 py-6 rounded-3xl border-2 border-green-200 min-w-[250px] shadow-xl hover:shadow-green-500/40 hover:scale-105 hover:border-green-300 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 overflow-hidden"
//                     >
//                       <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
//                       <span className="relative flex items-center justify-center gap-4">
//                         {isSaving ? (
//                           <Loader2 className="w-7 h-7 animate-spin" />
//                         ) : (
//                           <CheckCircle2 className="w-7 h-7 group-hover:scale-110 transition-transform duration-300" />
//                         )}
//                         <span className="text-xl font-black group-hover:tracking-wide transition-all duration-300">
//                           {isSaving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
//                         </span>
//                       </span>
//                     </button>

//                     {/* زر الإلغاء */}
//                     <button
//                       type="button"
//                       onClick={cancelEdit}
//                       disabled={isSaving}
//                       className="group relative bg-red-500 text-white font-bold px-12 py-6 rounded-3xl border-2 border-red-400 min-w-[250px] shadow-xl hover:bg-red-600 hover:scale-105 hover:shadow-red-500/40 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 overflow-hidden"
//                     >
//                       <span className="relative flex items-center justify-center gap-4">
//                         <X className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" />
//                         <span className="text-xl font-black group-hover:tracking-wide transition-all duration-300">
//                           إلغاء
//                         </span>
//                       </span>
//                     </button>
//                   </>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* موجة سفلية */}
//           <div className="absolute bottom-0 left-0 right-0">
//             <svg viewBox="0 0 1440 120" className="w-full h-auto">
//               <path
//                 fill="#f8fafc"
//                 fillOpacity="1"
//                 d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
//               ></path>
//             </svg>
//           </div>
//         </div>
//       </div>

//       {/* قسم البطاقات */}
//       <div className="relative container mx-auto px-6 py-16">
//         {/* العنوان */}
//         <div className="text-center mb-12">
//           <div className="inline-flex items-center gap-3 mb-4">
//             <div className="w-12 h-1 bg-gradient-to-r from-transparent to-emerald-500 rounded-full"></div>
//             <Sparkles className="w-8 h-8 text-emerald-600 hover:rotate-180 transition-transform duration-500" />
//             <div className="w-12 h-1 bg-gradient-to-l from-transparent to-emerald-500 rounded-full"></div>
//           </div>
//           <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-3 hover:text-emerald-600 transition-colors duration-300">
//             المعلومات الشخصية
//           </h2>
//           <p className="text-slate-600 text-lg">
//             تفاصيل حسابك ومعلوماتك الشخصية
//           </p>
//         </div>

//         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {/* الاسم الكامل */}
//           {shouldShow(Boolean(fullName)) && (
//             <InfoCard
//               icon={<Users className="w-6 h-6" />}
//               iconColor="from-emerald-500 to-teal-500"
//               title="الاسم الكامل"
//               value={
//                 isEditing ? (
//                   <div className="grid grid-cols-2 gap-3">
//                     <TextInput
//                       placeholder="الاسم الأول"
//                       value={edited?.firstName ?? ''}
//                       onChange={(v) =>
//                         setEdited((p) => (p ? { ...p, firstName: v } : p))
//                       }
//                     />
//                     <TextInput
//                       placeholder="اسم العائلة"
//                       value={edited?.lastName ?? ''}
//                       onChange={(v) =>
//                         setEdited((p) => (p ? { ...p, lastName: v } : p))
//                       }
//                     />
//                   </div>
//                 ) : (
//                   nv(fullName)
//                 )
//               }
//             />
//           )}

//           {/* رقم الهوية */}
//           {shouldShow(Boolean(user.idNumber)) && (
//             <InfoCard
//               icon={<IdCard className="w-6 h-6" />}
//               iconColor="from-purple-500 to-pink-500"
//               title="رقم الهوية"
//               value={
//                 isEditing ? (
//                   <TextInput
//                     value={edited?.idNumber ?? ''}
//                     onChange={(v) =>
//                       setEdited((p) => (p ? { ...p, idNumber: v } : p))
//                     }
//                     placeholder="رقم الهوية"
//                   />
//                 ) : (
//                   nv(user.idNumber)
//                 )
//               }
//             />
//           )}

//           {/* تاريخ الميلاد والعمر والجنس */}
//           {shouldShow(
//             Boolean(user.birthDate) || Boolean(user.gender) || isEditing
//           ) && (
//             <InfoCard
//               icon={<Calendar className="w-6 h-6" />}
//               iconColor="from-amber-500 to-orange-500"
//               title="تاريخ الميلاد والجنس"
//               value={
//                 isEditing ? (
//                   <div className="space-y-3">
//                     <div className="grid grid-cols-2 gap-3">
//                       <TextInput
//                         type="date"
//                         value={
//                           edited?.birthDate ? edited.birthDate.slice(0, 10) : ''
//                         }
//                         onChange={(v) =>
//                           setEdited((p) =>
//                             p
//                               ? {
//                                   ...p,
//                                   birthDate: v ? new Date(v).toISOString() : '',
//                                 }
//                               : p
//                           )
//                         }
//                       />
//                       <div className="bg-gradient-to-br from-slate-50 to-slate-100 text-slate-700 rounded-xl px-4 py-3 flex items-center justify-center font-semibold hover:from-slate-100 hover:to-slate-200 transition-all duration-300">
//                         {calcAge(edited?.birthDate) ?? '—'} سنة
//                       </div>
//                     </div>
//                     <div className="flex items-center gap-2 justify-between bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-3 hover:from-slate-100 hover:to-slate-200 transition-all duration-300">
//                       <span className="font-semibold text-slate-700">
//                         الجنس:
//                       </span>
//                       <GenderBadge gender={user.gender} />
//                     </div>
//                     <div className="flex items-center gap-2 text-xs bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors duration-300">
//                       <span>المتبقي لتعديل تاريخ الميلاد:</span>
//                       <span className="font-bold text-emerald-800">
//                         {remainingBirth} / 2
//                       </span>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="space-y-2">
//                     <div className="flex items-center gap-2 hover:gap-3 transition-all duration-300">
//                       <Calendar className="w-4 h-4 text-slate-500" />
//                       <span>{formatDate(user.birthDate)}</span>
//                     </div>
//                     <div className="flex items-center gap-2 hover:gap-3 transition-all duration-300">
//                       <Clock className="w-4 h-4 text-slate-500" />
//                       <span>{age ?? '—'} سنة</span>
//                     </div>
//                     <div className="flex items-center gap-2 hover:gap-3 transition-all duration-300">
//                       <span className="text-slate-600">الجنس:</span>
//                       <GenderBadge gender={user.gender} />
//                     </div>
//                   </div>
//                 )
//               }
//             />
//           )}

//           {/* مكان السكن */}
//           {shouldShow(Boolean(user.residence)) && (
//             <InfoCard
//               icon={<MapPin className="w-6 h-6" />}
//               iconColor="from-pink-500 to-rose-500"
//               title="مكان السكن"
//               value={
//                 isEditing ? (
//                   <TextInput
//                     placeholder="المدينة / الحي"
//                     value={edited?.residence ?? ''}
//                     onChange={(v) =>
//                       setEdited((p) => (p ? { ...p, residence: v } : p))
//                     }
//                   />
//                 ) : (
//                   nv(user.residence)
//                 )
//               }
//             />
//           )}

//           {/* البريد الإلكتروني */}
//           {shouldShow(Boolean(user.email)) && (
//             <InfoCard
//               icon={<Mail className="w-6 h-6" />}
//               iconColor="from-blue-500 to-cyan-500"
//               title="البريد الإلكتروني"
//               value={nv(user.email)}
//             />
//           )}

//           {/* الهاتف */}
//           {shouldShow(Boolean(user.phoneNumber)) && (
//             <InfoCard
//               icon={<Phone className="w-6 h-6" />}
//               iconColor="from-orange-500 to-amber-500"
//               title="رقم الهاتف"
//               value={
//                 isEditing ? (
//                   <TextInput
//                     placeholder="05xxxxxxxx"
//                     value={edited?.phoneNumber ?? ''}
//                     onChange={(v) =>
//                       setEdited((p) => (p ? { ...p, phoneNumber: v } : p))
//                     }
//                   />
//                 ) : (
//                   nv(user.phoneNumber)
//                 )
//               }
//             />
//           )}

//           {/* اسم المجموعة */}
//           {user.role === 'student' && !isEditing && (
//             <InfoCard
//               icon={<Users className="w-6 h-6" />}
//               iconColor="from-sky-500 to-blue-500"
//               title="اسم المجموعة"
//               value={nv(user.group)}
//             />
//           )}

//           {/* اسم المعلم */}
//           {user.role === 'student' && !isEditing && (
//             <InfoCard
//               icon={<UserIcon className="w-6 h-6" />}
//               iconColor="from-emerald-500 to-green-500"
//               title="اسم المعلم"
//               value={nv(user.teacher)}
//             />
//           )}

//           {/* رقم الطالب */}
//           {user.role === 'student' && user.studentId && !isEditing && (
//             <InfoCard
//               icon={<IdCard className="w-6 h-6" />}
//               iconColor="from-indigo-500 to-blue-500"
//               title="رقم الطالب"
//               value={nv(user.studentId)}
//             />
//           )}

//           {/* تاريخ إنشاء الحساب */}
//           {shouldShow(Boolean(user.createdAt)) && (
//             <InfoCard
//               icon={<Clock className="w-6 h-6" />}
//               iconColor="from-slate-500 to-gray-500"
//               title="تاريخ إنشاء الحساب"
//               value={user.createdAt ? formatDate(user.createdAt) : 'غير متوفر'}
//             />
//           )}
//         </div>

//         {/* قسم إحصائيات إضافية */}
//         {!isEditing && (
//           <div className="mt-12 bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/50 p-8 overflow-hidden relative hover:shadow-2xl hover:border-slate-300/50 transition-all duration-500">
//             <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-400/10 to-transparent rounded-full blur-3xl"></div>
//             <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-teal-400/10 to-transparent rounded-full blur-3xl"></div>

//             <div className="relative">
//               <div className="text-center mb-8">
//                 <h3 className="text-2xl font-bold text-slate-800 mb-2 hover:text-emerald-600 transition-colors duration-300">
//                   معلومات إضافية
//                 </h3>
//                 <div className="w-20 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto rounded-full hover:w-32 transition-all duration-300"></div>
//               </div>

//               <div className="grid md:grid-cols-3 gap-6">
//                 <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 text-center border border-emerald-100 hover:border-emerald-300 hover:shadow-lg hover:scale-105 transition-all duration-300">
//                   <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl mb-4 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300">
//                     <UserIcon className="w-8 h-8 text-white" />
//                   </div>
//                   <div className="text-3xl font-black text-emerald-700 mb-2">
//                     {user.role === 'student'
//                       ? 'طالب'
//                       : user.role === 'teacher'
//                         ? 'معلم'
//                         : 'مدير'}
//                   </div>
//                   <div className="text-sm text-slate-600 font-medium">
//                     نوع الحساب
//                   </div>
//                 </div>

//                 {user.role === 'student' && user.studentId && (
//                   <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 text-center border border-blue-100 hover:border-blue-300 hover:shadow-lg hover:scale-105 transition-all duration-300">
//                     <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mb-4 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300">
//                       <IdCard className="w-8 h-8 text-white" />
//                     </div>
//                     <div className="text-3xl font-black text-blue-700 mb-2">
//                       {user.studentId}
//                     </div>
//                     <div className="text-sm text-slate-600 font-medium">
//                       رقم الطالب
//                     </div>
//                   </div>
//                 )}

//                 {age && (
//                   <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 text-center border border-purple-100 hover:border-purple-300 hover:shadow-lg hover:scale-105 transition-all duration-300">
//                     <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300">
//                       <Sparkles className="w-8 h-8 text-white" />
//                     </div>
//                     <div className="text-3xl font-black text-purple-700 mb-2">
//                       {age}
//                     </div>
//                     <div className="text-sm text-slate-600 font-medium">
//                       سنة
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       <ToastContainer rtl position="top-center" />

//       {/* CSS للأنيميشن */}
//       <style>{`
//         @keyframes blob {
//           0%, 100% {
//             transform: translate(0, 0) scale(1);
//           }
//           33% {
//             transform: translate(30px, -50px) scale(1.1);
//           }
//           66% {
//             transform: translate(-20px, 20px) scale(0.9);
//           }
//         }
//         .animate-blob {
//           animation: blob 7s infinite;
//         }
//         .animation-delay-2000 {
//           animation-delay: 2s;
//         }
//         .animation-delay-4000 {
//           animation-delay: 4s;
//         }
//       `}</style>
//     </div>
//   );
// };

// // ============================
// // عناصر فرعية
// // ============================
// const InfoCard: React.FC<{
//   icon: React.ReactNode;
//   iconColor: string;
//   title: string;
//   value: React.ReactNode;
// }> = ({ icon, iconColor, title, value }) => (
//   <div className="group relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg border border-slate-200/50 p-6 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:bg-white hover:border-slate-300/50 overflow-hidden cursor-default">
//     {/* تأثير متدرج خلفي */}
//     <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

//     {/* شعاع ضوئي متحرك */}
//     <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
//       <div className="absolute top-0 -right-full h-full w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 group-hover:right-full transition-all duration-1000"></div>
//     </div>

//     <div className="relative">
//       <div className="flex items-center gap-4 mb-4">
//         <div
//           className={`bg-gradient-to-br ${iconColor} p-3.5 rounded-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg group-hover:shadow-xl text-white`}
//         >
//           {icon}
//         </div>
//         <div className="font-bold text-slate-800 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-emerald-600 group-hover:to-teal-600 transition-all duration-300 text-lg">
//           {title}
//         </div>
//       </div>
//       <div className="text-slate-700 leading-relaxed font-medium text-base pr-1">
//         {value}
//       </div>
//     </div>

//     {/* زخرفة زاوية */}
//     <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-tr-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
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
//     className="w-full border-2 border-slate-200/80 rounded-xl px-4 py-3 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-500 hover:border-emerald-300 hover:bg-white hover:shadow-md transition-all duration-300 text-slate-700 placeholder-slate-400 shadow-sm font-medium"
//   />
// );

// const GenderBadge: React.FC<{ gender?: string }> = ({ gender }) => {
//   const arabicGender = toArabicGender(gender);

//   const getGenderStyle = () => {
//     if (arabicGender === 'ذكر') {
//       return {
//         bg: 'bg-gradient-to-r from-blue-500 to-cyan-500',
//         hoverBg: 'hover:from-blue-600 hover:to-cyan-600',
//         icon: '👨',
//       };
//     } else if (arabicGender === 'أنثى') {
//       return {
//         bg: 'bg-gradient-to-r from-pink-500 to-rose-500',
//         hoverBg: 'hover:from-pink-600 hover:to-rose-600',
//         icon: '👩',
//       };
//     } else {
//       return {
//         bg: 'bg-gradient-to-r from-gray-400 to-slate-400',
//         hoverBg: 'hover:from-gray-500 hover:to-slate-500',
//         icon: '❓',
//       };
//     }
//   };

//   const style = getGenderStyle();

//   return (
//     <span
//       className={`inline-flex items-center gap-2 ${style.bg} ${style.hoverBg} text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-default`}
//     >
//       <span className="text-base">{style.icon}</span>
//       <span>{arabicGender}</span>
//     </span>
//   );
// };

// export default Profile;

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
  Mail,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Camera,
  Award,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import Avatar from "../components/Avatar";
import { useAuth } from "../hooks/useAuth";
import "react-toastify/dist/ReactToastify.css";

// ============================
// الإعداد
// ============================
import { API_URL } from "../config";

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
  birthDate?: string;
  gender?: string;
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

const keyFor = (field: "birthDate" | "gender", userId: string) =>
  `editHistory_${field}_${userId}`;

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
  const [isSaving, setIsSaving] = useState(false);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>("");

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
      if (e?.response?.status === 401) {
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
    return () => {
      if (avatarUrl && avatarUrl.startsWith("blob:"))
        URL.revokeObjectURL(avatarUrl);
    };
  }, []);

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

    const payload: Partial<UserBase> = {
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
    const changingGender = (edited.gender ?? "") !== (user.gender ?? "");

    if (changingBirth) {
      const b = canEditFieldLocal("birthDate", user._id);
      if (!b.allowed) {
        toast.error(
          "لا يمكنك تعديل تاريخ الميلاد أكثر من مرتين خلال شهر كامل من آخر تعديلاتك"
        );
        setIsSaving(false);
        return;
      }
    }
    if (changingGender) {
      const g = canEditFieldLocal("gender", user._id);
      if (!g.allowed) {
        toast.error(
          "لا يمكنك تعديل الجنس أكثر من مرتين خلال شهر كامل من آخر تعديلاتك"
        );
        setIsSaving(false);
        return;
      }
    }

    try {
      await api.put(`/${endpoint}/${user._id}`, payload);

      if (changingBirth) recordEditLocal("birthDate", user._id);
      if (changingGender) recordEditLocal("gender", user._id);

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
    } finally {
      setIsSaving(false);
    }
  };

  const shouldShow = (valuePresent: boolean) => {
    if (user?.role === "student" && !isEditing && !valuePresent) return false;
    return true;
  };

  if (fetchState.status === "loading") {
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

  if (fetchState.status === "error") {
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
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold px-8 py-5 rounded-2xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
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

  const remainingBirth = canEditFieldLocal("birthDate", user._id).remaining;

  const getRoleConfig = () => {
    const configs = {
      student: {
        label: "طالب",
        gradient: "from-blue-600 via-indigo-600 to-purple-600",
        lightGradient: "from-blue-500 to-indigo-500",
        icon: "🎓",
        pattern: "from-blue-100 to-indigo-100",
      },
      teacher: {
        label: "معلم",
        gradient: "from-purple-600 via-pink-600 to-rose-600",
        lightGradient: "from-purple-500 to-pink-500",
        icon: "👨‍🏫",
        pattern: "from-purple-100 to-pink-100",
      },
      admin: {
        label: "مدير",
        gradient: "from-orange-600 via-red-600 to-pink-600",
        lightGradient: "from-orange-500 to-red-500",
        icon: "⚡",
        pattern: "from-orange-100 to-red-100",
      },
    };
    return configs[user.role || "student"];
  };

  const roleConfig = getRoleConfig();

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100"
      dir="rtl">
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
                    onClick={() => document.getElementById("avatar")?.click()}
                    className="absolute bottom-4 right-4 bg-white text-indigo-600 p-5 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300">
                    <Camera className="w-7 h-7" />
                  </button>
                )}
              </div>

              {isEditing && (
                <input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                />
              )}
            </div>

            {/* Name */}
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 text-center drop-shadow-2xl">
              {fullName || "مرحباً بك"}
            </h1>

            {/* Role and Age Badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
              <div
                className={`inline-flex items-center gap-3 bg-white/20 backdrop-blur-lg px-8 py-4 rounded-full border-2 border-white/40 shadow-xl`}>
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
                    className="flex items-center gap-3 bg-white text-indigo-700 font-black px-12 py-6 rounded-2xl shadow-2xl hover:shadow-white/20 hover:scale-105 active:scale-95 transition-all duration-300">
                    <Edit className="w-7 h-7" />
                    <span className="text-xl">تعديل المعلومات</span>
                  </button>
                  <button
                    onClick={() => navigate("/change-password")}
                    className="flex items-center gap-3 bg-white/10 backdrop-blur-md text-white font-black px-12 py-6 rounded-2xl border-2 border-white/30 shadow-2xl hover:bg-white/20 hover:scale-105 active:scale-95 transition-all duration-300">
                    <Lock className="w-7 h-7" />
                    <span className="text-xl">تغيير كلمة المرور</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={saveProfile}
                    disabled={isSaving}
                    className="flex items-center gap-3 bg-white text-green-700 font-black px-12 py-6 rounded-2xl shadow-2xl hover:shadow-white/20 hover:scale-105 active:scale-95 disabled:opacity-60 disabled:hover:scale-100 transition-all duration-300">
                    {isSaving ? (
                      <Loader2 className="w-7 h-7 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-7 h-7" />
                    )}
                    <span className="text-xl">
                      {isSaving ? "جاري الحفظ..." : "حفظ التعديلات"}
                    </span>
                  </button>
                  <button
                    onClick={cancelEdit}
                    disabled={isSaving}
                    className="flex items-center gap-3 bg-red-600 text-white font-black px-12 py-6 rounded-2xl shadow-2xl hover:bg-red-700 hover:scale-105 active:scale-95 disabled:opacity-60 disabled:hover:scale-100 transition-all duration-300">
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
              d="M0,50L48,45C96,40,192,30,288,33.3C384,37,480,53,576,56.7C672,60,768,50,864,45C960,40,1056,40,1152,45C1248,50,1344,60,1392,65L1440,70L1440,100L0,100Z"></path>
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
              className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${roleConfig.lightGradient} rounded-2xl mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
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
          {user.role === "student" && user.studentId && (
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
                        value={edited?.firstName ?? ""}
                        onChange={(v) =>
                          setEdited((p) => (p ? { ...p, firstName: v } : p))
                        }
                      />
                      <TextInput
                        placeholder="اسم الأب"
                        value={edited?.fatherName ?? ""}
                        onChange={(v) =>
                          setEdited((p) => (p ? { ...p, fatherName: v } : p))
                        }
                      />
                      <TextInput
                        placeholder="اسم الجد"
                        value={edited?.grandFatherName ?? ""}
                        onChange={(v) =>
                          setEdited((p) =>
                            p ? { ...p, grandFatherName: v } : p
                          )
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

            {/* رقم الهوية */}
            {shouldShow(Boolean(user.idNumber)) && (
              <InfoField
                icon={<IdCard className="w-5 h-5" />}
                label="رقم الهوية"
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
}> = ({ value, onChange, placeholder, type = "text" }) => (
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
    if (arabicGender === "ذكر") {
      return {
        bg: "bg-gradient-to-r from-blue-500 to-cyan-500",
        icon: "👨",
      };
    } else if (arabicGender === "أنثى") {
      return {
        bg: "bg-gradient-to-r from-pink-500 to-rose-500",
        icon: "👩",
      };
    } else {
      return {
        bg: "bg-gradient-to-r from-slate-400 to-slate-500",
        icon: "❓",
      };
    }
  };

  const style = getGenderStyle();

  return (
    <span
      className={`inline-flex items-center gap-2 ${style.bg} text-white px-5 py-2.5 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300`}>
      <span className="text-lg">{style.icon}</span>
      <span>{arabicGender}</span>
    </span>
  );
};

export default Profile;
