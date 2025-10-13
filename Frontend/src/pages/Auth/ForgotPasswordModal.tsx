
// export default ForgotPasswordModal;
import { useState } from "react";
import axios from "axios";
import { forgotPassword, resetPassword } from "../../Api/authApi";
import type { ForgotPasswordFormData, NewPasswordFormData } from "../../utils/forgotPasswordValidation.ts";
import {
  sanitizeForgotPasswordData,
  sanitizeNewPasswordData,
  validateForgotPasswordData,
  validateNewPasswordData,
} from "../../utils/forgotPasswordValidation.ts";

const MAX_BIRTH_DATE = new Date().toISOString().split("T")[0];
const MIN_BIRTH_DATE = (() => {
  const boundary = new Date();
  boundary.setFullYear(boundary.getFullYear() - 120);
  return boundary.toISOString().split("T")[0];
})();

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ForgotPasswordModal = ({ isOpen, onClose }: ForgotPasswordModalProps) => {
  const [forgotPasswordData, setForgotPasswordData] = useState<ForgotPasswordFormData>({
    firstName: "",
    fatherName: "",
    grandFatherName: "",
    lastName: "",
    motherName: "",
    idNumber: "",
    birthDate: "",
  });
  const [resetStep, setResetStep] = useState(1);
  const [newPasswordData, setNewPasswordData] = useState<NewPasswordFormData>({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const key = name as keyof ForgotPasswordFormData;

    setForgotPasswordData((prev) => {
      if (key === "idNumber") {
        const sanitizedId = sanitizeForgotPasswordData({ ...prev, idNumber: value }).idNumber.slice(0, 9);
        return { ...prev, idNumber: sanitizedId };
      }

      const updated = {
        ...prev,
        [key]: value,
      } as ForgotPasswordFormData;

      return updated;
    });

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

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const sanitizedData = sanitizeForgotPasswordData(forgotPasswordData);
    const validationErrors = validateForgotPasswordData(sanitizedData);
    setForgotPasswordData(sanitizedData);

    if (validationErrors.length) {
      setError(validationErrors[0]);
      return;
    }

    setIsLoading(true);

    try {
      const response = await forgotPassword(sanitizedData);

      if (response.success) {
        setResetStep(2);
      } else {
        setError(response.message || "فشل في التحقق من البيانات");
      }
    } catch (error: unknown) {
      console.error("Forgot password error:", error);
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        setError(message || "فشل في التحقق من البيانات. رجاءً تأكد من صحة المعلومات.");
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
      const response = await resetPassword({
        ...forgotPasswordData,
        newPassword: newPasswordData.password,
        confirmPassword: newPasswordData.confirmPassword,
      });

      if (response.success) {
        alert("تم تغيير كلمة المرور بنجاح!");
        handleClose();
      } else {
        setError(response.message || "فشل في تغيير كلمة المرور");
      }
    } catch (error: unknown) {
      console.error("Reset password error:", error);
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        setError(message || "فشل في تغيير كلمة المرور. رجاءً المحاولة مرة أخرى.");
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("فشل في تغيير كلمة المرور. رجاءً المحاولة مرة أخرى.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
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
    setError("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 animate-fadeIn backdrop-blur-sm"
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
      dir="rtl"
      onClick={handleClose}>
      <div
        className="bg-white rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.35)] w-full max-w-3xl max-h-[95vh] overflow-hidden transform transition-all duration-500 animate-slideUp border border-emerald-100/50"
        onClick={(e) => e.stopPropagation()}>
        
        {/* Decorative Top Bar */}
        <div className="h-2 bg-emerald-500"></div>

        <div className="overflow-y-auto max-h-[calc(95vh-8px)] custom-scrollbar">
          <div className="p-8 sm:p-10">
            {/* Header */}
            <div className="mb-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                      استعادة كلمة المرور
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {resetStep === 1 ? "التحقق من هويتك للمتابعة" : "إنشاء كلمة مرور جديدة وآمنة"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 transition-all duration-300 p-2.5 rounded-xl hover:bg-gray-100 hover:rotate-90 transform"
                  aria-label="إغلاق">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              {/* Enhanced Steps Indicator */}
              <div className="flex items-center justify-center gap-3 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-2xl p-5 shadow-inner">
                <div className="flex items-center gap-3">
                  <div className={`relative transition-all duration-500 ${resetStep >= 1 ? 'scale-110' : 'scale-100'}`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base shadow-lg transition-all duration-500 ${
                      resetStep >= 1 
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-300' 
                        : 'bg-white text-gray-400 border-2 border-gray-300'
                    }`}>
                      {resetStep > 1 ? (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                      ) : (
                        <span>1</span>
                      )}
                    </div>
                    {resetStep >= 1 && (
                      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-xl blur opacity-30 animate-pulse"></div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-sm transition-colors duration-300 ${resetStep >= 1 ? 'text-emerald-600' : 'text-gray-400'}`}>
                      التحقق من الهوية
                    </p>
                    <p className="text-xs text-gray-500">أدخل بياناتك الشخصية</p>
                  </div>
                </div>

                <div className={`h-1 w-20 rounded-full transition-all duration-700 ${
                  resetStep >= 2 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gray-300'
                }`}>
                  <div className={`h-full rounded-full transition-all duration-700 ${
                    resetStep >= 2 ? 'bg-white w-1/2 animate-shimmer' : 'w-0'
                  }`}></div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`relative transition-all duration-500 ${resetStep >= 2 ? 'scale-110' : 'scale-100'}`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base shadow-lg transition-all duration-500 ${
                      resetStep >= 2 
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-300' 
                        : 'bg-white text-gray-400 border-2 border-gray-300'
                    }`}>
                      2
                    </div>
                    {resetStep >= 2 && (
                      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-xl blur opacity-30 animate-pulse"></div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-sm transition-colors duration-300 ${resetStep >= 2 ? 'text-emerald-600' : 'text-gray-400'}`}>
                      كلمة المرور الجديدة
                    </p>
                    <p className="text-xs text-gray-500">إنشاء كلمة مرور آمنة</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border-r-4 border-red-500 rounded-xl shadow-sm animate-shake">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Forms */}
            {resetStep === 1 ? (
              <form className="space-y-6" onSubmit={handleForgotPasswordSubmit}>
                {/* Info Card */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-800">معلومة هامة</p>
                      <p className="text-xs text-blue-600 mt-1">
                        الرجاء إدخال بياناتك الشخصية بدقة كما هي مسجلة في النظام للتحقق من هويتك
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[
                    { name: "firstName", label: "الاسم الأول", placeholder: "أدخل الاسم الأول" },
                    { name: "fatherName", label: "اسم الأب", placeholder: "أدخل اسم الأب" },
                    { name: "grandFatherName", label: "اسم الجد", placeholder: "أدخل اسم الجد" },
                    { name: "lastName", label: "اسم العائلة", placeholder: "أدخل اسم العائلة" },
                  ].map((field) => (
                    <div key={field.name} className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {field.label}
                        <span className="text-red-500 mr-1">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name={field.name}
                          value={forgotPasswordData[field.name as keyof typeof forgotPasswordData]}
                          onChange={handleForgotPasswordChange}
                        className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all duration-300 text-right bg-white hover:border-emerald-300 group-hover:shadow-sm"
                          required
                          placeholder={field.placeholder}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      اسم الأم
                      <span className="text-red-500 mr-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="motherName"
                      value={forgotPasswordData.motherName}
                      onChange={handleForgotPasswordChange}
                      className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all duration-300 text-right bg-white hover:border-emerald-300 group-hover:shadow-sm"
                      required
                      placeholder="أدخل اسم الأم الكامل"
                    />
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      رقم الهوية
                      <span className="text-red-500 mr-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="idNumber"
                      value={forgotPasswordData.idNumber}
                      onChange={handleForgotPasswordChange}
                      className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all duration-300 text-right bg-white hover:border-emerald-300 group-hover:shadow-sm"
                      required
                      placeholder="أدخل رقم الهوية (9 أرقام)"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    تاريخ الميلاد
                    <span className="text-red-500 mr-1">*</span>
                  </label>
                  <input
                    type="date"
                    name="birthDate"
                    value={forgotPasswordData.birthDate}
                    onChange={handleForgotPasswordChange}
                    className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all duration-300 text-right bg-white hover:border-emerald-300 group-hover:shadow-sm"
                    required
                    placeholder="أدخل تاريخ الميلاد"
                    title="تاريخ الميلاد"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 relative group overflow-hidden rounded-xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-emerald-500/50"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative py-3.5 px-6 text-white font-bold text-base flex items-center justify-center">
                      {isLoading ? (
                        <>
                          <svg className="animate-spin h-5 w-5 ml-3" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          جارٍ التحقق...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                          تحقق من البيانات
                        </>
                      )}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-8 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 py-3.5 rounded-xl font-bold hover:from-gray-200 hover:to-gray-300 focus:ring-4 focus:ring-gray-300 focus:outline-none transition-all duration-300 hover:shadow-lg">
                    إلغاء
                  </button>
                </div>
              </form>
            ) : (
              <form className="space-y-6" onSubmit={handleNewPasswordSubmit}>
                {/* Success Message */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5 mb-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-green-800">تم التحقق من هويتك بنجاح!</p>
                      <p className="text-xs text-green-600 mt-1">
                        يمكنك الآن إنشاء كلمة مرور جديدة وآمنة لحسابك
                      </p>
                    </div>
                  </div>
                </div>

                {/* Password Requirements */}
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4 mb-6">
                  <p className="text-sm font-semibold text-amber-800 mb-2">متطلبات كلمة المرور:</p>
                  <ul className="text-xs text-amber-700 space-y-1 mr-5">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      يجب أن تحتوي على 6 أحرف على الأقل
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      يُفضل استخدام مزيج من الأحرف والأرقام
                    </li>
                  </ul>
                </div>

                <div className="space-y-5">
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      كلمة المرور الجديدة
                      <span className="text-red-500 mr-1">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={newPasswordData.password}
                        onChange={handleNewPasswordChange}
                        className="w-full px-4 py-3.5 pl-12 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all duration-300 text-right bg-white hover:border-emerald-300 group-hover:shadow-sm"
                        required
                        minLength={6}
                        placeholder="أدخل كلمة المرور الجديدة (6 أحرف على الأقل)"
                      />
                      {newPasswordData.password && (
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors duration-200">
                          {showPassword ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.274 4.057-5.065 7-9.543 7-4.477 0-8.268-2.943-9.542-7z"/>
                            </svg>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      تأكيد كلمة المرور
                      <span className="text-red-500 mr-1">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={newPasswordData.confirmPassword}
                        onChange={handleNewPasswordChange}
                        className="w-full px-4 py-3.5 pl-12 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all duration-300 text-right bg-white hover:border-emerald-300 group-hover:shadow-sm"
                        required
                        minLength={6}
                        placeholder="أعد إدخال كلمة المرور للتأكيد"
                      />
                      {newPasswordData.confirmPassword && (
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors duration-200">
                          {showConfirmPassword ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.274 4.057-5.065 7-9.543 7-4.477 0-8.268-2.943-9.542-7z"/>
                            </svg>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 relative group overflow-hidden rounded-xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-emerald-500/50"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative py-3.5 px-6 text-white font-bold text-base flex items-center justify-center">
                      {isLoading ? (
                        <>
                          <svg className="animate-spin h-5 w-5 ml-3" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          جارٍ التحديث...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                          </svg>
                          تحديث كلمة المرور
                        </>
                      )}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-8 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 py-3.5 rounded-xl font-bold hover:from-gray-200 hover:to-gray-300 focus:ring-4 focus:ring-gray-300 focus:outline-none transition-all duration-300 hover:shadow-lg">
                    إلغاء
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default ForgotPasswordModal;
