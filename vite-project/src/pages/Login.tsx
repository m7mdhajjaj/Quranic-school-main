import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

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

        <form className="space-y-6">
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-2"
              htmlFor="username">
              رقم الطالب
            </label>
            <input
              type="text"
              id="username"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition duration-200"
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
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition duration-200"
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
              <a
                href="#"
                className="font-medium text-emerald-700 hover:text-emerald-500">
                نسيت كلمة المرور؟
              </a>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 rounded-lg hover:from-emerald-700 hover:to-teal-600 transition duration-300 shadow-md font-medium">
            تسجيل الدخول
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 mb-2">ليس لديك حساب؟</p>
          <button
            onClick={() => navigate("/signup")}
            className="w-full border-2 border-emerald-500 text-emerald-600 py-3 rounded-lg hover:bg-emerald-50 transition duration-300 font-medium">
            إنشاء حساب جديد
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
