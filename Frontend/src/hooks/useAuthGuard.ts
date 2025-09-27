import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export const useAuthGuard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuthStatus = () => {
      const user = localStorage.getItem("user");
      const isLoginPage = location.pathname === "/login";
      const isAdminPage = location.pathname.startsWith("/admin");

      // إذا لم يكن المستخدم مسجل دخول ولم يكن في صفحة تسجيل الدخول
      if (!user && !isLoginPage) {
        navigate("/login", { replace: true });
        return false;
      }

      // إذا كان المستخدم مسجل دخول وفي صفحة تسجيل الدخول
      if (user && isLoginPage) {
        const userObj = JSON.parse(user);
        if (userObj.role === "admin") {
          navigate("/admin/dashboard", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
        return false;
      }

      // If user is on admin pages but not admin, redirect to home
      if (user && isAdminPage) {
        const userObj = JSON.parse(user);
        if (userObj.role !== "admin") {
          navigate("/", { replace: true });
          return false;
        }
      }

      return true;
    };

    // فحص حالة التسجيل عند تحميل المكون
    checkAuthStatus();

    // حماية من استخدام زر الرجوع
    const handlePopState = () => {
      const user = localStorage.getItem("user");

      if (!user && location.pathname !== "/login") {
        // منع العودة وإعادة التوجيه
        window.history.pushState(null, "", "/login");
        navigate("/login", { replace: true });
      }
    };

    // إضافة listener لحدث popstate
    window.addEventListener("popstate", handlePopState);

    // إضافة entry للتاريخ لمنع العودة
    window.history.pushState(null, "", window.location.href);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate, location.pathname]);
};

export default useAuthGuard;
