// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { API_URL } from "../config";

// type ApiErrorData = {
//   message?: string;
//   [key: string]: unknown;
// };

// const ChangePass = () => {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     currentPassword: "",
//     newPassword: "",
//     confirmPassword: "",
//   });
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [isLoading, setIsLoading] = useState(false);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: value,
//     });
//     // Clear messages when user types
//     if (error) setError("");
//     if (success) setSuccess("");
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError("");
//     setSuccess("");
//     setIsLoading(true);

//     // Validate passwords match
//     if (formData.newPassword !== formData.confirmPassword) {
//       setError("كلمة المرور الجديدة وتأكيد كلمة المرور غير متطابقتين");
//       setIsLoading(false);
//       return;
//     }

//     // Validate password length
//     if (formData.newPassword.length < 6) {
//       setError("كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل");
//       setIsLoading(false);
//       return;
//     }

//     try {
//       // Get user data from localStorage
//       const token = localStorage.getItem("token");
//       const userJson = localStorage.getItem("user");

//       console.log("Token:", token ? "exists" : "not found");
//       console.log("User data:", userJson ? JSON.parse(userJson) : "not found");

//       if (!token || !userJson) {
//         setError("يجب تسجيل الدخول أولاً");
//         navigate("/login");
//         return;
//       }

//       const user = JSON.parse(userJson);

//       console.log("Making API request to change password...");
//       const response = await axios.post(
//         `${API_URL}/auth/change-password`,
//         {
//           currentPassword: formData.currentPassword,
//           newPassword: formData.newPassword,
//           userId: user._id,
//           userType: user.role || "student",
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         },
//       );
//       if (response.data.success) {
//         setSuccess("تم تغيير كلمة المرور بنجاح!");
//         setFormData({
//           currentPassword: "",
//           newPassword: "",
//           confirmPassword: "",
//         });

//         // Redirect to home after 2 seconds
//         setTimeout(() => {
//           navigate("/");
//         }, 2000);
//       }
//     } catch (error: unknown) {
//       console.error("Change password error:", error);

//       if (axios.isAxiosError(error)) {
//         if (error.response) {
//           // Server responded with error status
//           console.log("Error response:", error.response.data);
//           console.log("Error status:", error.response.status);

//           if (error.response.status === 401) {
//             setError("انتهت صلاحية جلسة العمل. يرجى تسجيل الدخول مرة أخرى");
//             setTimeout(() => navigate("/login"), 2000);
//           } else if ((error.response.data as ApiErrorData)?.message) {
//             setError((error.response.data as ApiErrorData).message || "");
//           } else {
//             setError(`خطأ من الخادم: ${error.response.status}`);
//           }
//         } else if (error.request) {
//           // Request was made but no response received
//           console.log("No response received:", error.request);
//           setError("لا يمكن الوصول إلى الخادم. تأكد من أن الخادم يعمل");
//         } else {
//           // Something else happened
//           console.log("Other error:", error.message);
//           setError("حدث خطأ أثناء تغيير كلمة المرور");
//         }
//       } else if (error instanceof Error) {
//         setError(error.message);
//       } else {
//         setError("حدث خطأ أثناء تغيير كلمة المرور");
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div
//       className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-4"
//       dir="rtl"
//     >
//       <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
//         <div className="flex justify-center mb-6">
//           <img
//             src="/src/images/logo.jpg"
//             alt="مدرسة القرآن"
//             className="h-16 w-16 rounded-full border-2 border-emerald-600 shadow-md"
//           />
//         </div>

//         <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 text-slate-800">
//           تغيير كلمة المرور
//         </h1>

//         {error && (
//           <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-center">
//             {error}
//           </div>
//         )}

//         {success && (
//           <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-md text-center">
//             {success}
//           </div>
//         )}

//         <form className="space-y-6" onSubmit={handleSubmit}>
//           <div>
//             <label
//               className="block text-sm font-medium text-gray-700 mb-2"
//               htmlFor="currentPassword"
//             >
//               كلمة المرور الحالية
//             </label>
//             <input
//               type="password"
//               id="currentPassword"
//               name="currentPassword"
//               value={formData.currentPassword}
//               onChange={handleChange}
//               className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition duration-200"
//               required
//               placeholder="أدخل كلمة المرور الحالية"
//               autoComplete="current-password"
//             />
//           </div>

//           <div>
//             <label
//               className="block text-sm font-medium text-gray-700 mb-2"
//               htmlFor="newPassword"
//             >
//               كلمة المرور الجديدة
//             </label>
//             <input
//               type="password"
//               id="newPassword"
//               name="newPassword"
//               value={formData.newPassword}
//               onChange={handleChange}
//               className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition duration-200"
//               required
//               minLength={6}
//               placeholder="أدخل كلمة المرور الجديدة (6 أحرف على الأقل)"
//               autoComplete="new-password"
//             />
//           </div>

//           <div>
//             <label
//               className="block text-sm font-medium text-gray-700 mb-2"
//               htmlFor="confirmPassword"
//             >
//               تأكيد كلمة المرور الجديدة
//             </label>
//             <input
//               type="password"
//               id="confirmPassword"
//               name="confirmPassword"
//               value={formData.confirmPassword}
//               onChange={handleChange}
//               className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition duration-200"
//               required
//               minLength={6}
//               placeholder="أعد إدخال كلمة المرور الجديدة"
//               autoComplete="new-password"
//             />
//           </div>

//           <div className="flex gap-4">
//             <button
//               type="submit"
//               disabled={isLoading}
//               className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 rounded-lg hover:from-emerald-700 hover:to-teal-600 transition duration-300 shadow-md font-medium disabled:opacity-50"
//             >
//               {isLoading ? (
//                 <span className="flex items-center justify-center">
//                   <svg
//                     className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                   >
//                     <circle
//                       className="opacity-25"
//                       cx="12"
//                       cy="12"
//                       r="10"
//                       stroke="currentColor"
//                       strokeWidth="4"
//                     ></circle>
//                     <path
//                       className="opacity-75"
//                       fill="currentColor"
//                       d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                     ></path>
//                   </svg>
//                   جاري التغيير...
//                 </span>
//               ) : (
//                 "تغيير كلمة المرور"
//               )}
//             </button>

//             <button
//               type="button"
//               onClick={() => navigate("/")}
//               className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition duration-300 shadow-md font-medium"
//             >
//               إلغاء
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default ChangePass;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config";

type ApiErrorData = {
  message?: string;
  [key: string]: unknown;
};

type ValidationErrors = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
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
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<number>(0);

  // Password strength calculator
  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 6) strength += 20;
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 10;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 10;
    return Math.min(strength, 100);
  };

  // Get strength color and text
  const getStrengthInfo = (strength: number) => {
    if (strength < 40) return { color: "bg-red-500", text: "ضعيفة", textColor: "text-red-600" };
    if (strength < 70) return { color: "bg-yellow-500", text: "متوسطة", textColor: "text-yellow-600" };
    return { color: "bg-green-500", text: "قوية", textColor: "text-green-600" };
  };

  // Validate field
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "currentPassword":
        if (!value) return "كلمة المرور الحالية مطلوبة";
        if (value.length < 6) return "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
        return "";
      
      case "newPassword":
        if (!value) return "كلمة المرور الجديدة مطلوبة";
        if (value.length < 6) return "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل";
        if (value.length < 8) return "يُنصح باستخدام 8 أحرف على الأقل";
        if (!/[a-z]/.test(value) || !/[A-Z]/.test(value)) {
          return "يُنصح باستخدام أحرف كبيرة وصغيرة";
        }
        if (!/[0-9]/.test(value)) return "يُنصح بإضافة أرقام";
        if (formData.currentPassword && value === formData.currentPassword) {
          return "كلمة المرور الجديدة يجب أن تكون مختلفة عن الحالية";
        }
        return "";
      
      case "confirmPassword":
        if (!value) return "تأكيد كلمة المرور مطلوب";
        if (value !== formData.newPassword) return "كلمة المرور غير متطابقة";
        return "";
      
      default:
        return "";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Calculate password strength for new password
    if (name === "newPassword") {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    // Real-time validation
    const fieldError = validateField(name, value);
    setValidationErrors({
      ...validationErrors,
      [name]: fieldError,
    });

    // Clear messages when user types
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const fieldError = validateField(name, value);
    setValidationErrors({
      ...validationErrors,
      [name]: fieldError,
    });
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {
      currentPassword: validateField("currentPassword", formData.currentPassword),
      newPassword: validateField("newPassword", formData.newPassword),
      confirmPassword: validateField("confirmPassword", formData.confirmPassword),
    };

    setValidationErrors(errors);
    return !Object.values(errors).some(error => error !== "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate form
    if (!validateForm()) {
      setError("يرجى تصحيح الأخطاء في النموذج");
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const userJson = localStorage.getItem("user");

      if (!token || !userJson) {
        setError("يجب تسجيل الدخول أولاً");
        navigate("/login");
        return;
      }

      const user = JSON.parse(userJson);

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
        setSuccess("تم تغيير كلمة المرور بنجاح! جاري التحويل...");
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setPasswordStrength(0);
        setValidationErrors({});

        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } catch (error: unknown) {
      console.error("Change password error:", error);

      if (axios.isAxiosError(error)) {
        if (error.response) {
          if (error.response.status === 401) {
            setError("انتهت صلاحية جلسة العمل. يرجى تسجيل الدخول مرة أخرى");
            setTimeout(() => navigate("/login"), 2000);
          } else if ((error.response.data as ApiErrorData)?.message) {
            setError((error.response.data as ApiErrorData).message || "");
          } else {
            setError(`خطأ من الخادم: ${error.response.status}`);
          }
        } else if (error.request) {
          setError("لا يمكن الوصول إلى الخادم. تأكد من أن الخادم يعمل");
        } else {
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

  const strengthInfo = getStrengthInfo(passwordStrength);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-slate-100 px-4 py-8"
      dir="rtl"
    >
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <img
              src="/src/images/logo.jpg"
              alt="مدرسة القرآن"
              className="h-20 w-20 rounded-full border-4 border-emerald-600 shadow-lg"
            />
            <div className="absolute -bottom-1 -right-1 bg-emerald-600 rounded-full p-1.5 shadow-md">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center mb-2 text-slate-800">
          تغيير كلمة المرور
        </h1>
        <p className="text-center text-gray-500 text-sm mb-6">
          يرجى إدخال كلمة المرور الحالية والجديدة
        </p>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border-r-4 border-red-500 text-red-700 rounded-lg flex items-start gap-3 animate-fadeIn">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border-r-4 border-green-500 text-green-700 rounded-lg flex items-start gap-3 animate-fadeIn">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">{success}</span>
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Current Password */}
          <div>
            <label
              className="block text-sm font-semibold text-gray-700 mb-2"
              htmlFor="currentPassword"
            >
              كلمة المرور الحالية
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-3 pr-12 rounded-lg border ${
                  validationErrors.currentPassword
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
                } focus:outline-none focus:ring-2 transition duration-200`}
                placeholder="أدخل كلمة المرور الحالية"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
              >
                {showCurrentPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {validationErrors.currentPassword && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {validationErrors.currentPassword}
              </p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label
              className="block text-sm font-semibold text-gray-700 mb-2"
              htmlFor="newPassword"
            >
              كلمة المرور الجديدة
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-3 pr-12 rounded-lg border ${
                  validationErrors.newPassword
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
                } focus:outline-none focus:ring-2 transition duration-200`}
                placeholder="أدخل كلمة المرور الجديدة"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
              >
                {showNewPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {formData.newPassword && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">قوة كلمة المرور:</span>
                  <span className={`text-xs font-semibold ${strengthInfo.textColor}`}>
                    {strengthInfo.text}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full ${strengthInfo.color} transition-all duration-300 ease-out`}
                    style={{ width: `${passwordStrength}%` }}
                  />
                </div>
              </div>
            )}

            {validationErrors.newPassword && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {validationErrors.newPassword}
              </p>
            )}

            {/* Password Requirements */}
            <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs font-semibold text-gray-700 mb-2">متطلبات كلمة المرور:</p>
              <ul className="space-y-1 text-xs text-gray-600">
                <li className={`flex items-center gap-2 ${formData.newPassword.length >= 6 ? 'text-green-600' : ''}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${formData.newPassword.length >= 6 ? 'bg-green-500' : 'bg-gray-300'}`} />
                  6 أحرف على الأقل (يُنصح بـ 8 أو أكثر)
                </li>
                <li className={`flex items-center gap-2 ${/[a-z]/.test(formData.newPassword) && /[A-Z]/.test(formData.newPassword) ? 'text-green-600' : ''}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${/[a-z]/.test(formData.newPassword) && /[A-Z]/.test(formData.newPassword) ? 'bg-green-500' : 'bg-gray-300'}`} />
                  أحرف كبيرة وصغيرة
                </li>
                <li className={`flex items-center gap-2 ${/[0-9]/.test(formData.newPassword) ? 'text-green-600' : ''}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${/[0-9]/.test(formData.newPassword) ? 'bg-green-500' : 'bg-gray-300'}`} />
                  أرقام
                </li>
                <li className={`flex items-center gap-2 ${/[^a-zA-Z0-9]/.test(formData.newPassword) ? 'text-green-600' : ''}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${/[^a-zA-Z0-9]/.test(formData.newPassword) ? 'bg-green-500' : 'bg-gray-300'}`} />
                  رموز خاصة (اختياري لكن موصى به)
                </li>
              </ul>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label
              className="block text-sm font-semibold text-gray-700 mb-2"
              htmlFor="confirmPassword"
            >
              تأكيد كلمة المرور الجديدة
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-3 pr-12 rounded-lg border ${
                  validationErrors.confirmPassword
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : formData.confirmPassword && !validationErrors.confirmPassword
                    ? "border-green-300 focus:ring-green-500 focus:border-green-500"
                    : "border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
                } focus:outline-none focus:ring-2 transition duration-200`}
                placeholder="أعد إدخال كلمة المرور الجديدة"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
              >
                {showConfirmPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
              {formData.confirmPassword && !validationErrors.confirmPassword && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            {validationErrors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {validationErrors.confirmPassword}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isLoading || Object.values(validationErrors).some(e => e !== "")}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 rounded-lg hover:from-emerald-700 hover:to-teal-600 transition-all duration-300 shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
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
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  تغيير كلمة المرور
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate("/")}
              disabled={isLoading}
              className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition-all duration-300 shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                إلغاء
              </span>
            </button>
          </div>
        </form>

        {/* Security Tips */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">نصائح الأمان</h3>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• لا تشارك كلمة المرور مع أي شخص</li>
                <li>• استخدم كلمة مرور فريدة لكل حساب</li>
                <li>• غيّر كلمة المرور بانتظام</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-5px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(5px);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideIn {
          animation: slideIn 0.4s ease-out;
        }

        .animate-bounce-slow {
          animation: bounce 2s infinite;
        }

        .animate-pulse-slow {
          animation: pulse 2s infinite;
        }

        input:focus {
          animation: pulse 0.3s ease-out;
        }

        button:active:not(:disabled) {
          animation: none;
        }

        .error-shake {
          animation: shake 0.5s;
        }
      `}</style>
    </div>
  );
};

export default ChangePass;