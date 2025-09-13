import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userId: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
  const [resetStep, setResetStep] = useState(1); // 1: verify data, 2: reset password
  const [newPasswordData, setNewPasswordData] = useState({
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user types
    if (error) setError("");
  };

  const handleForgotPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setForgotPasswordData({
      ...forgotPasswordData,
      [name]: value,
    });
    if (error) setError("");
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewPasswordData({
      ...newPasswordData,
      [name]: value,
    });
    if (error) setError("");
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (resetStep === 1) {
        // Step 1: Verify personal data
        const response = await axios.post(
          `${API_URL}/auth/verify-identity`,
          forgotPasswordData
        );
        if (response.data.success) {
          setResetStep(2);
        }
      } else {
        // Step 2: Reset password
        if (newPasswordData.password !== newPasswordData.confirmPassword) {
          setError("كلمات المرور غير متطابقة");
          setIsLoading(false);
          return;
        }

        const response = await axios.post(
          `${API_URL}/auth/reset-password`,
          {
            ...forgotPasswordData,
            newPassword: newPasswordData.password,
          }
        );

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
          setNewPasswordData({ password: "", confirmPassword: "" });
        }
      }
    } catch (error: any) {
      console.error("Forgot password error:", error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("حدث خطأ. تأكد من البيانات المدخلة.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Try both student and teacher login methods
      let response;

      // First try as student login
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
            userType: "teacher",
          });
        } catch (teacherError: any) {
          // If both fail, show generic error
          throw new Error(
            "فشل تسجيل الدخول. رجاءً تأكد من الرقم وكلمة المرور."
          );
        }
      }

      // If successful, store the token and redirect
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // Redirect to home page
      navigate("/");
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.message) {
        setError(error.message);
      } else {
        setError("فشل تسجيل الدخول. رجاءً تأكد من الرقم وكلمة المرور.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-50 to-slate-100"
      dir="rtl">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <div className="flex justify-center mb-6">
          <img
            src="/src/images/logo.jpg"
            alt="مدرسة القرآن"
            className="h-16 w-16 rounded-full border-2 border-emerald-600 shadow-md"
          />
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 text-slate-800">
          تسجيل الدخول
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-center">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-2"
              htmlFor="userId">
              رقم الطالب / رقم المعلم
            </label>
            <input
              type="text"
              id="userId"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition duration-200"
              required
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-2"
              htmlFor="password">
              كلمة المرور
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition duration-200"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="mr-2 block text-sm text-gray-700">
                تذكرني
              </label>
            </div>

            <div className="text-sm">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="font-medium text-emerald-700 hover:text-emerald-500">
                نسيت كلمة المرور؟
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 rounded-lg hover:from-emerald-700 hover:to-teal-600 transition duration-300 shadow-md font-medium">
            {isLoading ? (
              <span className="flex items-center justify-center">
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
                جاري تسجيل الدخول...
              </span>
            ) : (
              "تسجيل الدخول"
            )}
          </button>
        </form>
      </div>

      {/* نافذة نسيت كلمة المرور */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                {resetStep === 1
                  ? "استرداد كلمة المرور"
                  : "كلمة المرور الجديدة"}
              </h2>
              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetStep(1);
                  setError("");
                }}
                className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleForgotPasswordSubmit}>
              {resetStep === 1 ? (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الاسم الأول
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={forgotPasswordData.firstName}
                        onChange={handleForgotPasswordChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
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
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
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
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
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
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
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
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
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
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
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
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-6 bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 rounded-lg hover:from-emerald-700 hover:to-teal-600 transition duration-300">
                    {isLoading ? "جاري التحقق..." : "التحقق من البيانات"}
                  </button>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        كلمة المرور الجديدة
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={newPasswordData.password}
                        onChange={handleNewPasswordChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                        minLength={6}
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
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-6 bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 rounded-lg hover:from-emerald-700 hover:to-teal-600 transition duration-300">
                    {isLoading ? "جاري التحديث..." : "تحديث كلمة المرور"}
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
