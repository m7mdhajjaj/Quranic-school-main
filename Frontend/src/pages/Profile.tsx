import React, { useEffect, useState } from 'react';
import { API_URL } from '../config';

interface User {
  _id: string;
  studentId?: number;
  teacherId?: number;
  idNumber?: string;
  firstName?: string;
  fatherName?: string;
  grandFatherName?: string;
  motherName?: string;
  lastName?: string;
  birthDate?: string;
  age?: number;
  gender?: string;
  residence?: string;
  teacher?: string;
  group?: string;
  email?: string;
  phoneNumber?: string;
  groups?: string[];
  role?: string;
  avatar?: string;
}

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          setUser(data.user);
        }
        setAvatarPreview(data.user?.avatar ? `${API_URL}/uploads/${data.user.avatar}` : undefined);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile || !user) return;
    const formData = new FormData();
    formData.append('avatar', avatarFile);
    await fetch(`${API_URL}/users/${user._id}/avatar`, {
      method: 'POST',
      body: formData,
    });
    // Optionally, refetch user info
    window.location.reload();
  };

  if (loading) return <div className="text-center py-10">جاري التحميل...</div>;
  if (!user) return <div className="text-center py-10 text-red-600">لم يتم العثور على المستخدم.</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-100 via-emerald-50 to-white py-10 px-4">
      <div className="bg-white/95 rounded-3xl shadow-2xl p-10 max-w-2xl w-full mx-auto border border-emerald-200 animate-fade-in">
        <h2 className="text-4xl font-extrabold text-emerald-700 mb-10 text-center tracking-tight drop-shadow-lg">صفحة شخصية</h2>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative flex flex-col items-center profile-avatar-container">
            <img
              src={avatarPreview || '/src/images/officialPhoto.jpg'}
              alt="User Avatar"
              className="mx-auto rounded-full h-72 w-72 border-4 border-emerald-400 shadow-xl object-cover transition-transform duration-300 hover:scale-105"
            />
            <label htmlFor="avatar-upload" className="absolute bottom-4 right-4 bg-emerald-500 text-white rounded-full p-3 cursor-pointer shadow-lg hover:bg-emerald-600 transition-colors" title="تغيير الصورة الشخصية">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2a2.828 2.828 0 11-4-4 2.828 2.828 0 014 4z" /></svg>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                title="تغيير الصورة الشخصية"
              />
            </label>
            {avatarFile && (
              <button
                className="mt-4 px-5 py-2 bg-emerald-500 text-white rounded-lg shadow hover:bg-emerald-600 transition-colors w-full"
                onClick={handleAvatarUpload}
              >تغيير الصورة الشخصية</button>
            )}
          </div>
          <div className="w-full">
            <div className="mb-8 text-center md:text-right">
              <span className="text-2xl font-bold text-gray-800">
                {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : '---'}
              </span>
              <span className="block text-lg text-gray-500 mt-2">{user.role === 'teacher' ? 'معلم' : user.role === 'admin' ? 'مدير' : 'طالب'}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex flex-col bg-emerald-50 rounded-xl px-6 py-4 shadow">
                <span className="text-gray-600 font-medium mb-1">البريد الإلكتروني</span>
                <span className="text-gray-800 text-lg">{user.email || '---'}</span>
              </div>
              <div className="flex flex-col bg-emerald-50 rounded-xl px-6 py-4 shadow">
                <span className="text-gray-600 font-medium mb-1">رقم الهوية</span>
                <span className="text-gray-800 text-lg">{user.idNumber || '---'}</span>
              </div>
              {user.studentId && (
                <div className="flex flex-col bg-emerald-50 rounded-xl px-6 py-4 shadow">
                  <span className="text-gray-600 font-medium mb-1">رقم الطالب</span>
                  <span className="text-gray-800 text-lg">{user.studentId}</span>
                </div>
              )}
              {user.teacherId && (
                <div className="flex flex-col bg-emerald-50 rounded-xl px-6 py-4 shadow">
                  <span className="text-gray-600 font-medium mb-1">رقم المعلم</span>
                  <span className="text-gray-800 text-lg">{user.teacherId}</span>
                </div>
              )}
              <div className="flex flex-col bg-emerald-50 rounded-xl px-6 py-4 shadow">
                <span className="text-gray-600 font-medium mb-1">الدور</span>
                <span className="text-gray-800 text-lg">{user.role || '---'}</span>
              </div>
              <div className="flex flex-col bg-emerald-50 rounded-xl px-6 py-5 shadow min-h-[80px] justify-center">
                <span className="text-gray-600 font-medium mb-1">معرف المستخدم</span>
                <span className="text-gray-800 text-lg">{user._id}</span>
              </div>
              {user.birthDate && (
                <div className="flex flex-col bg-emerald-50 rounded-xl px-6 py-4 shadow">
                  <span className="text-gray-600 font-medium mb-1">تاريخ الميلاد</span>
                  <span className="text-gray-800 text-lg">{user.birthDate}</span>
                </div>
              )}
              {user.age !== undefined && (
                <div className="flex flex-col bg-emerald-50 rounded-xl px-6 py-4 shadow">
                  <span className="text-gray-600 font-medium mb-1">العمر</span>
                  <span className="text-gray-800 text-lg">{user.age}</span>
                </div>
              )}
              {user.gender && (
                <div className="flex flex-col bg-emerald-50 rounded-xl px-6 py-4 shadow">
                  <span className="text-gray-600 font-medium mb-1">الجنس</span>
                  <span className="text-gray-800 text-lg">{user.gender}</span>
                </div>
              )}
              {user.residence && (
                <div className="flex flex-col bg-emerald-50 rounded-xl px-6 py-4 shadow">
                  <span className="text-gray-600 font-medium mb-1">مكان السكن</span>
                  <span className="text-gray-800 text-lg">{user.residence}</span>
                </div>
              )}
              {user.group && (
                <div className="flex flex-col bg-emerald-50 rounded-xl px-6 py-4 shadow">
                  <span className="text-gray-600 font-medium mb-1">الحلقة</span>
                  <span className="text-gray-800 text-lg">{user.group}</span>
                </div>
              )}
              {user.groups && user.groups.length > 0 && (
                <div className="flex flex-col bg-emerald-50 rounded-xl px-6 py-4 shadow">
                  <span className="text-gray-600 font-medium mb-1">الحلقات</span>
                  <span className="text-gray-800 text-lg">{user.groups.join(', ')}</span>
                </div>
              )}
              {user.phoneNumber && (
                <div className="flex flex-col bg-emerald-50 rounded-xl px-6 py-4 shadow">
                  <span className="text-gray-600 font-medium mb-1">رقم الهاتف</span>
                  <span className="text-gray-800 text-lg">{user.phoneNumber}</span>
                </div>
              )}
            </div>
            <div className="mt-10 flex flex-col md:flex-row gap-4 justify-center md:justify-end">
              <button className="px-6 py-2 bg-emerald-600 text-white rounded-xl shadow hover:bg-emerald-700 transition-colors font-semibold">تعديل المعلومات الشخصية</button>
              <button className="px-6 py-2 bg-gray-200 text-emerald-700 rounded-xl shadow hover:bg-gray-300 transition-colors font-semibold">تغيير كلمة المرور</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
