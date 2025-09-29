import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config";

type ApiErrorData = {
  message?: string;
  [key: string]: unknown;
};

const ChangePass = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear messages when user types
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setError("كلمة المرور الجديدة وتأكيد كلمة المرور غير متطابقتين");
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (formData.newPassword.length < 6) {
      setError("كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل");
      setIsLoading(false);
      return;
    }

    try {
      // Get user data from localStorage
      const token = localStorage.getItem("token");
      const userJson = localStorage.getItem("user");

      console.log("Token:", token ? "exists" : "not found");
      console.log("User data:", userJson ? JSON.parse(userJson) : "not found");

      if (!token || !userJson) {
        setError("يجب تسجيل الدخول أولاً");
        navigate("/login");
        return;
      }

      const user = JSON.parse(userJson);

      console.log("Making API request to change password...");
      const response = await axios.post(
        `${API_URL}/auth/change-password`,
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          userId: user._id,
          userType: user.role || "student",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (response.data.success) {
        setSuccess("تم تغيير كلمة المرور بنجاح!");
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        // Redirect to home after 2 seconds
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } catch (error: unknown) {
      console.error("Change password error:", error);

      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Server responded with error status
          console.log("Error response:", error.response.data);
          console.log("Error status:", error.response.status);

          if (error.response.status === 401) {
            setError("انتهت صلاحية جلسة العمل. يرجى تسجيل الدخول مرة أخرى");
            setTimeout(() => navigate("/login"), 2000);
          } else if ((error.response.data as ApiErrorData)?.message) {
            setError((error.response.data as ApiErrorData).message || "");
          } else {
            setError(`خطأ من الخادم: ${error.response.status}`);
          }
        } else if (error.request) {
          // Request was made but no response received
          console.log("No response received:", error.request);
          setError("لا يمكن الوصول إلى الخادم. تأكد من أن الخادم يعمل");
        } else {
          // Something else happened
          console.log("Other error:", error.message);
          setError("حدث خطأ أثناء تغيير كلمة المرور");
        }
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("حدث خطأ أثناء تغيير كلمة المرور");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-4"
      dir="rtl"
    >
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <div className="flex justify-center mb-6">
          <img
            src="/src/images/logo.jpg"
            alt="مدرسة القرآن"
            className="h-16 w-16 rounded-full border-2 border-emerald-600 shadow-md"
          />
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 text-slate-800">
          تغيير كلمة المرور
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-md text-center">
            {success}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-2"
              htmlFor="currentPassword"
            >
              كلمة المرور الحالية
            </label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition duration-200"
              required
              placeholder="أدخل كلمة المرور الحالية"
              autoComplete="current-password"
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-2"
              htmlFor="newPassword"
            >
              كلمة المرور الجديدة
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition duration-200"
              required
              minLength={6}
              placeholder="أدخل كلمة المرور الجديدة (6 أحرف على الأقل)"
              autoComplete="new-password"
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-2"
              htmlFor="confirmPassword"
            >
              تأكيد كلمة المرور الجديدة
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition duration-200"
              required
              minLength={6}
              placeholder="أعد إدخال كلمة المرور الجديدة"
              autoComplete="new-password"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 rounded-lg hover:from-emerald-700 hover:to-teal-600 transition duration-300 shadow-md font-medium disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
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
                  جاري التغيير...
                </span>
              ) : (
                "تغيير كلمة المرور"
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition duration-300 shadow-md font-medium"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePass;
