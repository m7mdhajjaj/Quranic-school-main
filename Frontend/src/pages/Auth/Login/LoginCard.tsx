import React from 'react';
import { Card, PageHeader } from "@/components/UI";

interface LoginCardProps {
  children: React.ReactNode;
}

export const LoginCard: React.FC<LoginCardProps> = ({ children }) => {
  return (
    <div className="w-full lg:w-1/2 max-w-md lg:max-w-lg order-2 lg:order-1">
      {/* Card Glow Effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-300/30 via-teal-300/30 to-cyan-300/30 rounded-3xl blur-xl opacity-40 transition duration-500"></div>

      <Card variant="elevated" padding="xl" className="bg-white/95 backdrop-blur-xl border-emerald-200/50">
        {/* Title */}
        <PageHeader
          title="تسجيل الدخول"
          subtitle="قم بإدخال معلومات الدخول الخاصة بك"
          showDivider={true}
        />

        {children}

        {/* Footer - Inside Card */}
        <div className="text-center mt-6 pt-6 border-t border-emerald-100">
          <p className="text-gray-600 text-xs font-medium">
            جميع الحقوق محفوظة © {new Date().getFullYear()}
          </p>
          <p className="text-gray-500 text-[10px] mt-1">
            مدرسة القرآن الكريم
          </p>
        </div>
      </Card>
    </div>
  );
};
