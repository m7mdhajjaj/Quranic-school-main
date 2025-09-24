import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const SignUp: React.FC = () => {
  const navigate = useNavigate();

  // تحويل المستخدم إلى صفحة تسجيل الدخول مباشرة
  useEffect(() => {
    navigate("/login");
  }, [navigate]);

  // صفحة فارغة في حالة فشل التحويل التلقائي
  return null;
};

export default SignUp;
