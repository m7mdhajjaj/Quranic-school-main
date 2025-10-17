


import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { loginStudent, loginTeacher, loginAdmin } from "../../Api/authApi";
import ForgotPasswordModal from "./ForgotPasswordModal";
import type { User } from "../../contexts/AuthContext";
import { validateLoginForm } from "../../Validation/loginValidation";

const Login = () => {
  const navigate = useNavigate();
  const { login: authLogin, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    userId: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0); // عداد المحاولات الفاشلة

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      console.log("🔄 User already logged in, redirecting to home...");
      navigate("/", { replace: true });
      return;
    }

    const savedCredentials = localStorage.getItem("savedCredentials");
    if (savedCredentials) {
      try {
        const credentials = JSON.parse(savedCredentials);
        setFormData({
          userId: credentials.userId || "",
          password: credentials.password || "",
        });
        setRememberMe(true);
      } catch (error) {
        console.error("Error parsing saved credentials:", error);
        localStorage.removeItem("savedCredentials");
      }
    }

    if (isAuthenticated) {
      const userRole = JSON.parse(localStorage.getItem("user") || "{}").role;
      const targetPage = userRole === "admin" ? "/admin/dashboard" : "/";
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

    if (!checked) {
      localStorage.removeItem("savedCredentials");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    console.log("🔐 Login attempt started...");
    console.log("👤 User ID:", formData.userId);

    // Client-side validation
    const validation = await validateLoginForm(formData);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      setError(firstError || "بيانات غير صحيحة");
      setIsLoading(false);
      return;
    }

    try {
      let response;
      const loginErrors: string[] = [];

      console.log("📡 Attempting auto-login detection...");

      // Try student login first (studentId + idNumber)
      try {
        console.log("🔹 Attempting student login with:");
        console.log("   - studentId:", formData.userId);
        console.log("   - studentId type:", typeof formData.userId);
        console.log("   - idNumber:", formData.password);
        console.log("   - idNumber type:", typeof formData.password);
        console.log("   - idNumber length:", formData.password?.length);
        console.log("   - rememberMe:", rememberMe);

        response = await loginStudent({
          studentId: formData.userId,
          idNumber: formData.password,
          rememberMe: rememberMe,
        });
        console.log("✅ Student login successful!");
      } catch (studentError) {
        console.error("❌ Student login failed:", studentError);
        const studentMsg = axios.isAxiosError(studentError)
          ? studentError.response?.data?.message
          : "خطأ في تسجيل دخول الطالب";
        loginErrors.push(`طالب: ${studentMsg}`);
        console.log("❌ Not a student, trying teacher...");

        // Try teacher login
        try {
          response = await loginTeacher({
            teacherId: formData.userId,
            password: formData.password,
            userType: "teacher",
            rememberMe: rememberMe,
          });
          console.log("✅ Teacher login successful!");
        } catch (teacherError) {
          const teacherMsg = axios.isAxiosError(teacherError)
            ? teacherError.response?.data?.message
            : "خطأ في تسجيل دخول المعلم";
          loginErrors.push(`معلم: ${teacherMsg}`);
          console.log("❌ Not a teacher, trying admin...");

          // Try admin login
          try {
            response = await loginAdmin({
              adminId: formData.userId,
              password: formData.password,
              userType: "admin",
              rememberMe: rememberMe,
            });
            console.log("✅ Admin login successful!");
          } catch (adminError) {
            const adminMsg = axios.isAxiosError(adminError)
              ? adminError.response?.data?.message
              : "خطأ في تسجيل دخول الإداري";
            loginErrors.push(`إداري: ${adminMsg}`);

            // All login attempts failed
            console.error("❌ All login attempts failed");
            throw new Error(
              `فشل تسجيل الدخول. البيانات غير صحيحة أو المستخدم غير موجود.\n\n` +
                `محاولات تسجيل الدخول:\n${loginErrors.join("\n")}`
            );
          }
        }
      }

      console.log(
        "👤 User logged in:",
        response.user?.firstName || response.user?.name || "Unknown"
      );

      if (response && response.user && response.token) {
        authLogin(response.user as unknown as User, response.token);

        // إعادة تعيين عداد المحاولات الفاشلة عند نجاح تسجيل الدخول
        setFailedAttempts(0);

        if (rememberMe) {
          localStorage.setItem(
            "savedCredentials",
            JSON.stringify({
              userId: formData.userId,
              password: formData.password,
            })
          );
          console.log("💾 Credentials saved for next login");
        } else {
          localStorage.removeItem("savedCredentials");
        }

        console.log("🎉 Login successful!");
        console.log("🚀 Navigating to appropriate page...");

        const userRole = response.user.role;
        const targetPage = userRole === "admin" ? "/admin/dashboard" : "/";

        setTimeout(() => {
          navigate(targetPage, { replace: true });
        }, 100);
      } else {
        console.error("❌ Invalid response data:", response);
        setError("رد غير صحيح من الخادم. رجاءً تأكد من بيانات الدخول.");
      }
    } catch (error: unknown) {
      console.error("❌ Login error:", error);
      
      // زيادة عداد المحاولات الفاشلة
      const newFailedAttempts = failedAttempts + 1;
      setFailedAttempts(newFailedAttempts);
      
      // فتح نافذة نسيت كلمة المرور بعد 3 محاولات فاشلة
      if (newFailedAttempts >= 3) {
        setShowForgotPasswordModal(true);
      }
      
      if (error instanceof Error) {
        // استخدام رسالة خطأ مبسطة بدلاً من تفاصيل كل محاولة
        const errorMsg = error.message;
        if (errorMsg.includes("محاولات تسجيل الدخول")) {
          setError(
            "البيانات المدخلة غير صحيحة. تأكد من رقم المستخدم وكلمة المرور."
          );
        } else {
          setError(errorMsg);
        }
      } else if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        setError(message || "فشل تسجيل الدخول. رجاءً تأكد من بيانات الدخول.");
      } else {
        setError("فشل تسجيل الدخول. رجاءً تأكد من بيانات الدخول.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50"
      dir="rtl">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-cyan-200/30 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Decorative Islamic Pattern Overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2760%27%20height=%2760%27%20viewBox=%270%200%2060%2060%27%20xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg%20fill=%27none%27%20fill-rule=%27evenodd%27%3E%3Cg%20fill=%27%23ffffff%27%20fill-opacity=%271%27%3E%3Cpath%20d=%27M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%27/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-6xl px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-300/40 via-teal-300/40 to-cyan-300/40 rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-500 animate-pulse"></div>
              <img
                src="/src/images/logo.jpg"
                alt="مدرسة القرآن"
                className="relative h-32 w-32 rounded-full border-4 border-emerald-500/40 shadow-2xl backdrop-blur-sm"
              />
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent drop-shadow-lg">
            مدرسة القرآن الكريم
          </h1>

          <p className="text-xl md:text-2xl text-emerald-700 font-semibold mb-2 drop-shadow-md">
            نظام إدارة الطلاب المتكامل
          </p>

          <div className="flex items-center justify-center gap-2 text-teal-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm">منصة تعليمية متميزة</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="relative max-w-xl mx-auto">
          {/* Card Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-300/30 via-teal-300/30 to-cyan-300/30 rounded-3xl blur-xl opacity-40 transition duration-500"></div>

          <div className="relative bg-white/95 backdrop-blur-xl p-12 rounded-3xl shadow-2xl border border-emerald-200/50">
            {/* Title */}
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold text-emerald-700 mb-3">
                تسجيل الدخول
              </h2>
              <div className="h-1 w-24 mx-auto bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
              <p className="text-emerald-600 text-sm mt-4">
                قم بإدخال معلومات الدخول الخاصة بك
              </p>
            </div>

            <div>
              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-500/20 backdrop-blur-sm border-2 border-red-500/50 text-gray-900 rounded-2xl shadow-lg">
                  <div className="flex items-center justify-center gap-2">
                    <svg
                      className="w-5 h-5 flex-shrink-0 text-red-600"
                      fill="currentColor"
                      viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium">{error}</span>
                  </div>
                </div>
              )}

              {/* Login Form */}
              <form className="space-y-7" onSubmit={handleSubmit}>
                <div>
                  <label
                    className="block text-base font-semibold text-gray-700 mb-3"
                    htmlFor="userId">
                    رقم المستخدم
                  </label>
                  <input
                    type="text"
                    id="userId"
                    name="userId"
                    value={formData.userId}
                    onChange={handleChange}
                    className="w-full px-6 py-4 bg-white border-2 border-emerald-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all duration-200 text-right placeholder-gray-400 text-lg shadow-sm"
                    placeholder="أدخل رقم المستخدم"
                    autoComplete="username"
                    required
                  />
                </div>

                <div>
                  <label
                    className="block text-base font-semibold text-gray-700 mb-3"
                    htmlFor="password">
                    كلمة المرور / رقم الهوية
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full py-4 pr-6 pl-14 bg-white border-2 border-emerald-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all duration-200 text-right placeholder-gray-400 text-lg shadow-sm"
                      placeholder="أدخل كلمة المرور أو رقم الهوية"
                      autoComplete="current-password"
                      required
                    />
                    {formData.password !== "" && (
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 hover:text-emerald-700 focus:outline-none transition-colors duration-200"
                        aria-label={
                          showPassword ? "إخفاء كلمة المرور" : "عرض كلمة المرور"
                        }>
                        {showPassword ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
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
                            className="h-6 w-6"
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

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Toggle Switch */}
                    <label
                      htmlFor="remember-me"
                      className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        id="remember-me"
                        checked={rememberMe}
                        onChange={handleRememberMeChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      <span className="ms-3 text-sm font-medium text-gray-700">
                        تذكرني
                      </span>
                    </label>

                    {/* Info Icon with Tooltip */}
                    <div className="relative group/info">
                      <button
                        type="button"
                        className="p-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 hover:border-emerald-400 transition-all duration-300"
                        aria-label="معلومات الجلسة">
                        <svg
                          className="w-4 h-4 text-emerald-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </button>

                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all duration-300 z-50">
                        <div className="bg-white border-2 border-emerald-300 rounded-xl shadow-2xl p-4 backdrop-blur-xl">
                          {/* Arrow */}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                            <div className="border-8 border-transparent border-t-white"></div>
                          </div>

                          {/* Content */}
                          <div className="space-y-2 text-right">
                            <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <span>مدة الجلسة</span>
                            </div>

                            {rememberMe ? (
                              <div className="space-y-1">
                                <p className="text-gray-800 text-xs font-semibold">
                                  ✅ مفعّل: 7 أيام
                                </p>
                                <p className="text-emerald-600 text-xs">
                                  ستبقى متصلاً حتى تسجيل الخروج
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <p className="text-gray-800 text-xs font-semibold">
                                  ⏰ غير مفعّل: 30 دقيقة
                                </p>
                                <p className="text-orange-600 text-xs">
                                  سيتم تسجيل الخروج تلقائياً بعد 30 دقيقة
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordModal(true)}
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold transition-colors duration-200">
                    نسيت كلمة المرور؟
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="relative w-full group overflow-hidden bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:shadow-xl hover:shadow-emerald-500/30 focus:ring-4 focus:ring-emerald-400/30 focus:outline-none transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <span className="relative flex items-center justify-center">
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-6 w-6 text-white"
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
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform duration-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                          />
                        </svg>
                        تسجيل الدخول
                      </>
                    )}
                  </span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-10">
          <p className="text-gray-600 text-sm font-medium">
            جميع الحقوق محفوظة © {new Date().getFullYear()} مدرسة القرآن الكريم
          </p>
          <p className="text-gray-500 text-xs mt-2">
            نظام إدارة متطور لخدمة التعليم القرآني
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
      />
    </div>
  );
};

export default Login;
