import React, { useEffect, useState } from 'react';
import { Edit, Phone, Mail, Calendar, MapPin, Users, BookOpen, Camera, Lock, Save, X } from 'lucide-react';

// Types based on your database schema
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

const API_URL = "http://localhost:5005/api";

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<User | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [saving, setSaving] = useState(false);

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const userJson = localStorage.getItem('user');
      
      if (!token || !userJson) {
        window.location.href = '/login';
        return;
      }

      const userData = JSON.parse(userJson);
      const userId = userData._id;
      const userType = userData.role || 'student';

      // Determine the correct endpoint based on user type
      const endpoint = userType === 'student' ? 'students' : 'teachers';
      
      const response = await fetch(`${API_URL}/${endpoint}/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        const fetchedUser = result.data || result;
        setUser(fetchedUser);
        setEditedUser(fetchedUser);
        
        // Set avatar preview if exists
        if (fetchedUser.avatar) {
          setAvatarPreview(`${API_URL}/uploads/${fetchedUser.avatar}`);
        }
      } else {
        console.error('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field: keyof User, value: string | number) => {
    if (editedUser) {
      setEditedUser({
        ...editedUser,
        [field]: value
      });
    }
  };

  const handleSave = async () => {
    if (!editedUser || !user) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const userType = user.role || 'student';
      const endpoint = userType === 'student' ? 'students' : 'teachers';

      // First, upload avatar if changed
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);

        const avatarResponse = await fetch(`${API_URL}/${endpoint}/${user._id}/avatar`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (avatarResponse.ok) {
          const avatarResult = await avatarResponse.json();
          editedUser.avatar = avatarResult.avatar;
        }
      }

      // Update user data
      const updateResponse = await fetch(`${API_URL}/${endpoint}/${user._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editedUser)
      });

      if (updateResponse.ok) {
        const result = await updateResponse.json();
        setUser(result.data || result);
        setIsEditing(false);
        setAvatarFile(null);
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(result.data || result));
        
        alert('تم تحديث البيانات بنجاح');
      } else {
        alert('فشل في تحديث البيانات');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('حدث خطأ أثناء تحديث البيانات');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
    setAvatarFile(null);
    if (user?.avatar) {
      setAvatarPreview(`${API_URL}/uploads/${user.avatar}`);
    } else {
      setAvatarPreview("");
    }
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

  const displayUser = isEditing ? editedUser! : user;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 py-8 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">الصفحة الشخصية</h1>
          <p className="text-slate-600">أعرض/عدّل بياناتك وصورتك الشخصية</p>
        </div>

        {/* Main Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-6 text-white relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                        <div className="text-2xl font-bold text-emerald-600">
                          {displayUser.firstName.charAt(0)}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {isEditing && (
                    <label className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <Camera className="w-4 h-4 text-emerald-600" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* User Info */}
                <div>
                  <h2 className="text-2xl font-bold">
                    {displayUser.firstName} {displayUser.lastName}
                  </h2>
                  <p className="text-emerald-100 flex items-center gap-2 mt-1">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      displayUser.role === 'admin' ? 'bg-red-500' : 
                      displayUser.role === 'teacher' ? 'bg-blue-500' : 'bg-green-500'
                    }`}>
                      {displayUser.role === 'admin' ? 'مدير' : 
                       displayUser.role === 'teacher' ? 'معلم' : 'طالب'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-white text-emerald-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'جارِ الحفظ...' : 'حفظ'}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-white/20 text-white px-4 py-2 rounded-lg font-medium hover:bg-white/30 transition-colors flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      إلغاء
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-white text-emerald-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      تعديل المعلومات الشخصية
                    </button>
                    <button
                      onClick={() => window.location.href = '/change-password'}
                      className="bg-white/20 text-white px-4 py-2 rounded-lg font-medium hover:bg-white/30 transition-colors flex items-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      تغيير كلمة المرور
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Personal Information Cards */}
              
              {/* Role & ID */}
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">الدور</h3>
                    <p className="text-sm text-slate-600">
                      {displayUser.role === 'admin' ? 'مدير' : 
                       displayUser.role === 'teacher' ? 'معلم' : 'طالب'}
                    </p>
                  </div>
                </div>
              </div>

              {/* User ID */}
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">رقم</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">رقم المعرف</h3>
                    <p className="text-sm text-slate-600">
                      {displayUser.studentId || displayUser.teacherId || '1001'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Email */}
              {displayUser.email && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800">البريد الإلكتروني</h3>
                      {isEditing ? (
                        <input
                          type="email"
                          value={displayUser.email || ''}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full mt-1 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      ) : (
                        <p className="text-sm text-slate-600 break-all">
                          {displayUser.email || 'admin@quranicschool.com'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ID Number */}
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-bold text-xs">ID</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800">المعرّف</h3>
                    <p className="text-sm text-slate-600 font-mono">
                      {displayUser.idNumber || displayUser._id?.slice(-8) || '68bc7eb1cd7bab6dc97296c3'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Phone */}
              {displayUser.phoneNumber && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Phone className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800">رقم الهاتف</h3>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={displayUser.phoneNumber || ''}
                          onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                          className="w-full mt-1 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      ) : (
                        <p className="text-sm text-slate-600">
                          {displayUser.phoneNumber || '0500000000'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Groups/Classes */}
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">الحلقات</h3>
                    <p className="text-sm text-slate-600">
                      {displayUser.groups?.join(', ') || displayUser.group || 'All'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Student Fields */}
              {displayUser.role !== 'teacher' && displayUser.role !== 'admin' && (
                <>
                  {/* Father Name */}
                  {displayUser.fatherName && (
                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 font-bold text-xs">أب</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-800">اسم الأب</h3>
                          {isEditing ? (
                            <input
                              type="text"
                              value={displayUser.fatherName || ''}
                              onChange={(e) => handleInputChange('fatherName', e.target.value)}
                              className="w-full mt-1 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          ) : (
                            <p className="text-sm text-slate-600">{displayUser.fatherName}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Age */}
                  {displayUser.age && (
                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800">العمر</h3>
                          <p className="text-sm text-slate-600">{displayUser.age} سنة</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Residence */}
                  {displayUser.residence && (
                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-pink-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-800">مكان السكن</h3>
                          {isEditing ? (
                            <input
                              type="text"
                              value={displayUser.residence || ''}
                              onChange={(e) => handleInputChange('residence', e.target.value)}
                              className="w-full mt-1 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          ) : (
                            <p className="text-sm text-slate-600">{displayUser.residence}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Bottom Notice */}
            <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-sm text-blue-700 text-center">
                إذا لم تتمكن من تحديث أكثر التفاصيل، حاول إعادة تحميل الصفحة أو التحقق من الاتصال.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;