import { Link } from "react-router-dom";
import AOS from "aos";
import { useEffect } from "react";
import { Card } from "../../components/shared/UI/Card";
import { Button } from "../../components/shared/Form/Button";
import { ErrorIcon, ErrorContent } from "./components";

const NotFound = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center justify-center p-6 text-center"
      dir="rtl"
    >
      <div className="w-full max-w-md" data-aos="fade-up">
        <Card
          variant="default"
          padding="lg"
          className="border-t-4 border-emerald-600"
        >
          {/* Error Icon */}
          <ErrorIcon />

          {/* Error Content */}
          <ErrorContent
            titleDelay={100}
            subtitleDelay={200}
            descriptionDelay={300}
          />

          {/* Home Button */}
          <div className="mt-6" data-aos="fade-up" data-aos-delay="400">
            <Link to="/">
              <Button
                variant="primary"
                size="lg"
                className="inline-flex items-center"
                leftIcon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                }
              >
                العودة إلى الصفحة الرئيسية
              </Button>
            </Link>
          </div>

          {/* Support Message */}
          <div
            className="mt-8 pt-6 border-t border-gray-200"
            data-aos="fade-up"
            data-aos-delay="500"
          >
            <p className="text-sm text-gray-500">
              إذا كنت تعتقد أن هناك خطأ، يرجى التواصل مع إدارة المدرسة
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;
