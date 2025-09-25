import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordData, setForgotPasswordData] = useState({
    firstName: '',
    fatherName: '',
    grandFatherName: '',
    lastName: '',
    motherName: '',
    idNumber: '',
    birthDate: '',
  });
  const [resetStep, setResetStep] = useState(1);
  const [newPasswordData, setNewPasswordData] = useState({
    password: '',
    confirmPassword: '',
  });

  // Load saved credentials and check authentication on component mount
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      navigate('/', { replace: true });
      return;
    }

    // Load saved credentials if remember me was checked
    const savedCredentials = localStorage.getItem('savedCredentials');
    if (savedCredentials) {
      try {
        const credentials = JSON.parse(savedCredentials);
        setFormData({
          userId: credentials.userId || '',
          password: credentials.password || '',
        });
        setRememberMe(true);
      } catch (error) {
        console.error('Error parsing saved credentials:', error);
        localStorage.removeItem('savedCredentials');
      }
    }

    const preventBack = () => {
      window.history.pushState(null, '', window.location.href);
    };

    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', preventBack);

    return () => {
      window.removeEventListener('popstate', preventBack);
    };
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError('');
  };

  const handleRememberMeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setRememberMe(checked);

    // If unchecked, remove saved credentials immediately
    if (!checked) {
      localStorage.removeItem('savedCredentials');
    }
  };

  const handleForgotPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setForgotPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError('');
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError('');
  };

  const resetForgotPasswordForm = () => {
    setShowForgotPassword(false);
    setResetStep(1);
    setError('');
    setForgotPasswordData({
      firstName: '',
      fatherName: '',
      grandFatherName: '',
      lastName: '',
      motherName: '',
      idNumber: '',
      birthDate: '',
    });
    setNewPasswordData({ password: '', confirmPassword: '' });
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (resetStep === 1) {
        const response = await axios.post(
          `${API_URL}/auth/verify-identity`,
          forgotPasswordData
        );
        if (response.data.success) {
          setResetStep(2);
        }
      } else {
        if (newPasswordData.password !== newPasswordData.confirmPassword) {
          setError('كلمات المرور غير متطابقة');
          return;
        }

        if (newPasswordData.password.length < 6) {
          setError('يجب أن تكون كلمة المرور 6 أحرف على الأقل');
          return;
        }

        const response = await axios.post(`${API_URL}/auth/reset-password`, {
          ...forgotPasswordData,
          newPassword: newPasswordData.password,
        });

        if (response.data.success) {
          alert('تم تغيير كلمة المرور بنجاح!');
          resetForgotPasswordForm();
        }
      }
    } catch (error: any) {
      console.error('Forgot password error:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('حدث خطأ. تأكد من البيانات المدخلة.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let response;

      // Try student login first
      try {
        response = await axios.post(`${API_URL}/auth/login`, {
          studentId: formData.userId,
          idNumber: formData.password,
        });
      } catch (studentError: any) {
        // If student login fails, try teacher login
        try {
          response = await axios.post(`${API_URL}/auth/login`, {
            teacherId: formData.userId,
            password: formData.password,
            userType: 'teacher',
          });
        } catch (teacherError: any) {
          throw new Error(
            'فشل تسجيل الدخول. رجاءً تأكد من الرقم وكلمة المرور.'
          );
        }
      }

      // Save authentication tokens
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Handle remember me functionality
      if (rememberMe) {
        // Save credentials for future logins
        localStorage.setItem(
          'savedCredentials',
          JSON.stringify({
            userId: formData.userId,
            password: formData.password,
          })
        );
      } else {
        // Remove any previously saved credentials
        localStorage.removeItem('savedCredentials');
      }

      // Navigate to home page
      navigate('/', { replace: true });
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('فشل تسجيل الدخول. رجاءً تأكد من الرقم وكلمة المرور.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50"
      dir="rtl"
    >
      {/* Main Login Card */}
      <div className="bg-white/90 backdrop-blur-sm p-10 rounded-3xl shadow-2xl w-full max-w-md border border-white/20">
        {/* Logo Section */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <img
              src="/src/images/logo.jpg"
              alt="مدرسة القرآن"
              className="h-20 w-20 rounded-full border-4 border-emerald-500 shadow-xl"
            />
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full blur opacity-20"></div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-center mb-8 text-slate-800 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
          تسجيل الدخول
        </h1>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 rounded-xl text-center shadow-sm">
            <div className="flex items-center justify-center">
              <svg
                className="w-5 h-5 mr-2 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* User ID Field */}
          <div className="space-y-2">
            <label
              className="block text-sm font-semibold text-gray-700"
              htmlFor="userId"
            >
              رقم الطالب / رقم المعلم
            </label>
            <input
              type="text"
              id="userId"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 bg-gray-50/50 hover:bg-white"
              placeholder="أدخل رقم الطالب أو المعلم"
              required
              autoComplete="username"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label
              className="block text-sm font-semibold text-gray-700"
              htmlFor="password"
            >
              كلمة المرور
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 bg-gray-50/50 hover:bg-white"
              placeholder="أدخل كلمة المرور"
              required
              autoComplete="current-password"
            />
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={handleRememberMeChange}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded transition-all duration-200 cursor-pointer"
                title="تذكرني"
                placeholder="تذكرني"
              />
              <label
                htmlFor="remember-me"
                className="mr-3 block text-sm text-gray-600 font-medium cursor-pointer select-none"
              >
                تذكرني
              </label>
            </div>

            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm font-semibold text-emerald-600 hover:text-emerald-500 transition-colors duration-200 hover:underline"
            >
              نسيت كلمة المرور؟
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white py-4 rounded-xl hover:from-emerald-700 hover:to-teal-600 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold text-lg disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>جاري تسجيل الدخول...</span>
              </div>
            ) : (
              'تسجيل الدخول'
            )}
          </button>
        </form>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-lg mx-4 border border-gray-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  {resetStep === 1
                    ? 'استرداد كلمة المرور'
                    : 'كلمة المرور الجديدة'}
                </h2>
                <p className="text-sm text-gray-600 mt-2">
                  {resetStep === 1
                    ? 'أدخل بياناتك الشخصية للتحقق من هويتك'
                    : 'أدخل كلمة المرور الجديدة'}
                </p>
              </div>
              <button
                onClick={resetForgotPasswordForm}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 flex-shrink-0"
                title="إغلاق"
                aria-label="إغلاق"
              >
                <svg
                  className="w-6 h-6 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                    resetStep === 1
                      ? 'bg-emerald-500 text-white'
                      : 'bg-emerald-100 text-emerald-600'
                  }`}
                >
                  {resetStep > 1 ? '✓' : '1'}
                </div>
                <div
                  className={`w-16 h-1 mx-2 transition-all duration-300 ${
                    resetStep > 1 ? 'bg-emerald-500' : 'bg-gray-200'
                  }`}
                ></div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                    resetStep === 2
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  2
                </div>
              </div>
            </div>

            {/* Error Message in Modal */}
            {error && (
              <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 rounded-xl text-center shadow-sm">
                <div className="flex items-center justify-center">
                  <svg
                    className="w-5 h-5 mr-2 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Forgot Password Form */}
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-5">
              {resetStep === 1 ? (
                // Step 1: Personal Information
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        الاسم الأول
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={forgotPasswordData.firstName}
                        onChange={handleForgotPasswordChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 bg-gray-50/50"
                        placeholder="أدخل الاسم الأول"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        اسم الأب
                      </label>
                      <input
                        type="text"
                        name="fatherName"
                        value={forgotPasswordData.fatherName}
                        onChange={handleForgotPasswordChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 bg-gray-50/50"
                        placeholder="أدخل اسم الأب"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        اسم الجد
                      </label>
                      <input
                        type="text"
                        name="grandFatherName"
                        value={forgotPasswordData.grandFatherName}
                        onChange={handleForgotPasswordChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 bg-gray-50/50"
                        placeholder="أدخل اسم الجد"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        اسم العائلة
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={forgotPasswordData.lastName}
                        onChange={handleForgotPasswordChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 bg-gray-50/50"
                        placeholder="أدخل اسم العائلة"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      اسم الأم
                    </label>
                    <input
                      type="text"
                      name="motherName"
                      value={forgotPasswordData.motherName}
                      onChange={handleForgotPasswordChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 bg-gray-50/50"
                      placeholder="أدخل اسم الأم"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        رقم الهوية
                      </label>
                      <input
                        type="text"
                        name="idNumber"
                        value={forgotPasswordData.idNumber}
                        onChange={handleForgotPasswordChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 bg-gray-50/50"
                        placeholder="أدخل رقم الهوية"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        تاريخ الميلاد
                      </label>
                      <input
                        type="date"
                        name="birthDate"
                        value={forgotPasswordData.birthDate}
                        onChange={handleForgotPasswordChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 bg-gray-50/50"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-6 bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-4 rounded-xl hover:from-emerald-700 hover:to-teal-600 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>جاري التحقق...</span>
                      </div>
                    ) : (
                      'التحقق من البيانات'
                    )}
                  </button>
                </div>
              ) : (
                // Step 2: New Password
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      كلمة المرور الجديدة
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={newPasswordData.password}
                      onChange={handleNewPasswordChange}
                      className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 bg-gray-50/50"
                      placeholder="أدخل كلمة المرور الجديدة"
                      required
                      minLength={6}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      يجب أن تكون كلمة المرور 6 أحرف على الأقل
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      تأكيد كلمة المرور
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={newPasswordData.confirmPassword}
                      onChange={handleNewPasswordChange}
                      className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 bg-gray-50/50"
                      placeholder="أعد كتابة كلمة المرور"
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setResetStep(1)}
                      className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-all duration-300 font-semibold"
                    >
                      السابق
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 rounded-xl hover:from-emerald-700 hover:to-teal-600 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          <span>جاري التحديث...</span>
                        </div>
                      ) : (
                        'تحديث كلمة المرور'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
