import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config";
import { useAuth } from "../hooks/useAuth";

const TeacherLogin = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [formData, setFormData] = useState({
    teacherId: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user types
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Attempt to login with teacherId and password
      const response = await axios.post(`${API_URL}/auth/login`, {
        teacherId: formData.teacherId,
        password: formData.password,
        userType: "teacher",
      });

  // If successful, use central auth flow
  authLogin(response.data.user, response.data.token);

      // Redirect to home page
      navigate("/");
    } catch (error: unknown) {
      console.error("Login error:", error);
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

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-50 to-slate-100"
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
          تسجيل دخول المعلم
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
              htmlFor="teacherId"
            >
              رقم المعلم
            </label>
            <input
              type="text"
              id="teacherId"
              name="teacherId"
              value={formData.teacherId}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition duration-200"
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-2"
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
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition duration-200"
              autoComplete="current-password"
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
                className="mr-2 block text-sm text-gray-700"
              >
                تذكرني
              </label>
            </div>

            <div className="text-sm">
              <a
                href="#"
                className="font-medium text-emerald-700 hover:text-emerald-500"
              >
                نسيت كلمة المرور؟
              </a>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 rounded-lg hover:from-emerald-700 hover:to-teal-600 transition duration-300 shadow-md font-medium"
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
                جاري تسجيل الدخول...
              </span>
            ) : (
              "تسجيل الدخول"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a
            href="/login"
            className="text-sm text-emerald-600 hover:text-emerald-800"
          >
            تسجيل الدخول كطالب
          </a>
        </div>
      </div>
    </div>
  );
};

export default TeacherLogin;
