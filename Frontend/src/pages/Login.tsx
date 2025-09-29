import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config";
import { useAuth } from "../hooks/useAuth";

const Login = () => {
  const navigate = useNavigate();
  const { login: authLogin, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    userId: "",
    password: "",
  });
  // حالة عرض كلمة المرور
  const [showPassword, setShowPassword] = useState(false);
  // Active role tab controls how we submit and how labels appear
  const [roleTab, setRoleTab] = useState<"student" | "teacher" | "admin">(
    "student"
  );
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordData, setForgotPasswordData] = useState({
    firstName: "",
    fatherName: "",
    grandFatherName: "",
    lastName: "",
    motherName: "",
    idNumber: "",
    birthDate: "",
  });
  const [resetStep, setResetStep] = useState(1);
  const [newPasswordData, setNewPasswordData] = useState({
    password: "",
    confirmPassword: "",
  });

  // Load saved credentials and check authentication on component mount
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      console.log("🔄 User already logged in, redirecting to home...");
      navigate("/", { replace: true });
      return;
    }

    // Load saved credentials if remember me was checked
    const savedCredentials = localStorage.getItem("savedCredentials");
    if (savedCredentials) {
      try {
        const credentials = JSON.parse(savedCredentials);
        setFormData({
          userId: credentials.userId || "",
          password: credentials.password || "",
        });
        if (
          credentials.role === "student" ||
          credentials.role === "teacher" ||
          credentials.role === "admin"
        ) {
          setRoleTab(credentials.role);
        }
        setRememberMe(true);
      } catch (error) {
        console.error("Error parsing saved credentials:", error);
        localStorage.removeItem("savedCredentials");
      }
    }

    // إعادة التوجه إذا كان المستخدم مسجلاً دخوله
    if (isAuthenticated) {
      const userRole = JSON.parse(localStorage.getItem("user") || "{}").role;
      const targetPage = userRole === "admin" ? "/admin" : "/";
      navigate(targetPage, { replace: true });
      return;
    }

    const preventBack = () => {
      window.history.pushState(null, "", window.location.href);
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", preventBack);

    return () => {
      window.removeEventListener("popstate", preventBack);
    };
  }, [navigate, isAuthenticated]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handleRememberMeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setRememberMe(checked);

    // If unchecked, remove saved credentials immediately
    if (!checked) {
      localStorage.removeItem("savedCredentials");
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
    if (error) setError("");
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    console.log("🔐 Login attempt started...");
    console.log("👤 User ID:", formData.userId);

    try {
      let response;

      console.log(
        "📡 Making request to:",
        `${API_URL}/auth/login`,
        "as",
        roleTab
      );

      if (roleTab === "student") {
        response = await axios.post(
          `${API_URL}/auth/login`,
          {
            studentId: formData.userId,
            idNumber: formData.password,
          },
          {
            timeout: 10000,
            headers: { "Content-Type": "application/json" },
          }
        );
        console.log("✅ Student login successful!");
      } else if (roleTab === "teacher") {
        response = await axios.post(`${API_URL}/auth/login`, {
          teacherId: formData.userId,
          password: formData.password,
          userType: "teacher",
        });
        console.log("✅ Teacher login successful!");
      } else {
        response = await axios.post(`${API_URL}/auth/login`, {
          adminId: formData.userId,
          password: formData.password,
          userType: "admin",
        });
        console.log("✅ Admin login successful!");
      }

      console.log(
        "👤 User logged in:",
        response.data.user?.firstName || response.data.user?.name || "Unknown"
      );

      if (response.data && response.data.user && response.data.token) {
        // استخدام authLogin بدلاً من حفظ البيانات يدوياً
        authLogin(response.data.user, response.data.token);

        // Handle remember me functionality
        if (rememberMe) {
          localStorage.setItem(
            "savedCredentials",
            JSON.stringify({
              userId: formData.userId,
              password: formData.password,
              role: roleTab,
            })
          );
          console.log("💾 Credentials saved for next login");
        } else {
          localStorage.removeItem("savedCredentials");
        }

        console.log("🎉 Login successful!");
        console.log("🚀 Navigating to appropriate page...");

        // Navigate to appropriate page based on role
        const userRole = response.data.user.role;
        const targetPage = userRole === "admin" ? "/admin" : "/";

        // Navigate with a small delay to ensure state is updated
        setTimeout(() => {
          navigate(targetPage, { replace: true });
        }, 100);
      } else {
        console.error("❌ Invalid response data:", response.data);
        setError("رد غير صحيح من الخادم. رجاءً تأكد من بيانات الدخول.");
      }
    } catch (error: unknown) {
      console.error("❌ Login error:", error);
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        setError(message || "فشل تسجيل الدخول. رجاءً تأكد من بيانات الدخول.");
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("فشل تسجيل الدخول. رجاءً تأكد من بيانات الدخول.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, {
        ...forgotPasswordData,
      });

      if (response.data.success) {
        setResetStep(2);
      } else {
        setError(response.data.message || "فشل في التحقق من البيانات");
      }
    } catch (error: unknown) {
      console.error("Forgot password error:", error);
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        setError(
          message || "فشل في التحقق من البيانات. رجاءً تأكد من صحة المعلومات."
        );
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("فشل في التحقق من البيانات. رجاءً تأكد من صحة المعلومات.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (newPasswordData.password !== newPasswordData.confirmPassword) {
      setError("كلمة المرور وتأكيد كلمة المرور غير متطابقتين");
      setIsLoading(false);
      return;
    }

    if (newPasswordData.password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/auth/reset-password`, {
        ...forgotPasswordData,
        newPassword: newPasswordData.password,
      });

      if (response.data.success) {
        alert("تم تغيير كلمة المرور بنجاح!");
        setShowForgotPassword(false);
        setResetStep(1);
        setForgotPasswordData({
          firstName: "",
          fatherName: "",
          grandFatherName: "",
          lastName: "",
          motherName: "",
          idNumber: "",
          birthDate: "",
        });
        setNewPasswordData({
          password: "",
          confirmPassword: "",
        });
      } else {
        setError(response.data.message || "فشل في تغيير كلمة المرور");
      }
    } catch (error: unknown) {
      console.error("Reset password error:", error);
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        setError(
          message || "فشل في تغيير كلمة المرور. رجاءً المحاولة مرة أخرى."
        );
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("فشل في تغيير كلمة المرور. رجاءً المحاولة مرة أخرى.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50"
        dir="rtl">
        <div className="bg-white/90 backdrop-blur-sm p-10 rounded-3xl shadow-2xl w-full max-w-md border border-white/20">
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

          <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            {resetStep === 1 ? "نسيت كلمة المرور" : "كلمة مرور جديدة"}
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 rounded-xl text-center shadow-sm">
              {error}
            </div>
          )}

          {resetStep === 1 ? (
            <form className="space-y-6" onSubmit={handleForgotPasswordSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم الأول
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={forgotPasswordData.firstName}
                    onChange={handleForgotPasswordChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-right"
                    required
                    placeholder="أدخل الاسم الأول"
                    title="الرجاء إدخال الاسم الأول"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم الأب
                  </label>
                  <input
                    type="text"
                    name="fatherName"
                    value={forgotPasswordData.fatherName}
                    onChange={handleForgotPasswordChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-right"
                    required
                    placeholder="أدخل اسم الأب"
                    title="الرجاء إدخال اسم الأب"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم الجد
                  </label>
                  <input
                    type="text"
                    name="grandFatherName"
                    value={forgotPasswordData.grandFatherName}
                    onChange={handleForgotPasswordChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-right"
                    required
                    placeholder="أدخل اسم الجد"
                    title="الرجاء إدخال اسم الجد"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم العائلة
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={forgotPasswordData.lastName}
                    onChange={handleForgotPasswordChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-right"
                    required
                    placeholder="أدخل اسم العائلة"
                    title="الرجاء إدخال اسم العائلة"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم الأم
                </label>
                <input
                  type="text"
                  name="motherName"
                  value={forgotPasswordData.motherName}
                  onChange={handleForgotPasswordChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-right"
                  required
                  placeholder="أدخل اسم الأم"
                  title="الرجاء إدخال اسم الأم"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم الهوية
                </label>
                <input
                  type="text"
                  name="idNumber"
                  value={forgotPasswordData.idNumber}
                  onChange={handleForgotPasswordChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-right"
                  required
                  placeholder="أدخل رقم الهوية"
                  title="الرجاء إدخال رقم الهوية"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تاريخ الميلاد
                </label>
                <input
                  type="date"
                  name="birthDate"
                  value={forgotPasswordData.birthDate}
                  onChange={handleForgotPasswordChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-right"
                  required
                  title="الرجاء اختيار تاريخ الميلاد"
                />
              </div>

              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 focus:ring-4 focus:ring-emerald-300 focus:outline-none transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
                  {isLoading ? "جارٍ التحقق..." : "تحقق من البيانات"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 focus:ring-4 focus:ring-gray-300 focus:outline-none transition-all duration-200">
                  العودة لتسجيل الدخول
                </button>
              </div>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleNewPasswordSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  كلمة المرور الجديدة
                </label>
                <input
                  type="password"
                  name="password"
                  value={newPasswordData.password}
                  onChange={handleNewPasswordChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-right"
                  required
                  minLength={6}
                  placeholder="أدخل كلمة المرور الجديدة"
                  title="كلمة المرور الجديدة"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تأكيد كلمة المرور
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={newPasswordData.confirmPassword}
                  onChange={handleNewPasswordChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-right"
                  required
                  minLength={6}
                  placeholder="أدخل تأكيد كلمة المرور"
                  title="تأكيد كلمة المرور"
                />
              </div>

              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 focus:ring-4 focus:ring-emerald-300 focus:outline-none transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
                  {isLoading ? "جارٍ التحديث..." : "تحديث كلمة المرور"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setResetStep(1);
                    setShowForgotPassword(false);
                  }}
                  className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 focus:ring-4 focus:ring-gray-300 focus:outline-none transition-all duration-200">
                  إلغاء
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50"
      dir="rtl">
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
        <h1 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
          تسجيل الدخول
        </h1>

        {/* Role Tabs */}
        <div className="flex justify-center gap-2 mb-6">
          {(
            [
              { key: "student", label: "طالب" },
              { key: "teacher", label: "معلم" },
              { key: "admin", label: "إداري" },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setRoleTab(t.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                roleTab === t.key
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-emerald-700 border-emerald-200 hover:border-emerald-400"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        <div>
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 rounded-xl text-center shadow-sm">
              <div className="flex items-center justify-center">
                <svg
                  className="w-5 h-5 mr-2 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            </div>
          )}

          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="userId">
                {roleTab === "student"
                  ? "رقم الطالب أو رقم الهوية"
                  : roleTab === "teacher"
                  ? "رقم المعلم"
                  : "رقم الإداري"}
              </label>
              <input
                type="text"
                id="userId"
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-right placeholder-gray-400"
                placeholder={
                  roleTab === "student"
                    ? "أدخل رقم الطالب أو رقم الهوية"
                    : roleTab === "teacher"
                    ? "أدخل رقم المعلم"
                    : "أدخل رقم الإداري"
                }
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="password">
                {roleTab === "student"
                  ? "رقم الهوية (كلمة المرور)"
                  : "كلمة المرور"}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-right placeholder-gray-400 pr-12"
                  placeholder={
                    roleTab === "student"
                      ? "أدخل رقم الهوية"
                      : "أدخل كلمة المرور"
                  }
                  autoComplete="current-password"
                  required
                />
                {formData.password !== "" && (
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-emerald-600 focus:outline-none"
                    aria-label={
                      showPassword ? "إخفاء كلمة المرور" : "عرض كلمة المرور"
                    }>
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.96 9.96 0 012.175-6.125M6.875 6.875A3.001 3.001 0 0112 9c.828 0 1.58-.336 2.125-.875M17.125 17.125A3.001 3.001 0 0112 15c-.828 0-1.58.336-2.125.875M19.825 13.875A10.05 10.05 0 0122 12c0-5.523-4.477-10-10-10a9.96 9.96 0 00-6.125 2.175"
                        />
                        <line
                          x1="4"
                          y1="4"
                          x2="20"
                          y2="20"
                          stroke="currentColor"
                          strokeWidth={2}
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={handleRememberMeChange}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="mr-2 block text-sm text-gray-700">
                  تذكرني
                </label>
              </div>

              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-emerald-600 hover:text-emerald-800 font-medium transition-colors duration-200">
                نسيت كلمة المرور؟
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 focus:ring-4 focus:ring-emerald-300 focus:outline-none transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  جارٍ تسجيل الدخول...
                </div>
              ) : (
                "تسجيل الدخول"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            مدرسة القرآن الكريم - نظام إدارة الطلاب
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
