import React from "react";
import { Logo, Badge, FeatureList } from "@/components/UI";
import { Star, BookOpen, BarChart, FileText } from "lucide-react";

interface WelcomeSectionProps {
  logoUrl: string | null;
  logoLoading: boolean;
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({
  logoUrl,
  logoLoading,
}) => {
  return (
    <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start justify-center text-center lg:text-right order-1 lg:order-2 px-4 lg:px-6">
      {/* Logo - with better spacing */}
      <div className="mb-8 lg:mb-10">
        <Logo
          logoUrl={logoUrl}
          logoLoading={logoLoading}
          size="lg"
          alt="مدرسة القرآن"
          showGlow={true}
        />
      </div>

      {/* Title and Description - improved hierarchy */}
      <div className="space-y-6 max-w-xl w-full">
        {/* Main Title */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent drop-shadow-lg leading-tight">
            مدرسة القرآن الكريم
          </h1>

          <p className="text-lg sm:text-xl lg:text-2xl text-emerald-700/90 font-semibold">
            نظام إدارة الطلاب المتكامل
          </p>
        </div>

        {/* Badge */}
        <div className="flex justify-center lg:justify-start pt-2">
          <Badge
            variant="primary"
            size="md"
            icon={<Star className="w-4 h-4" fill="currentColor" />}
            className="text-teal-700 bg-teal-50 border-teal-200 shadow-sm">
            منصة تعليمية متميزة
          </Badge>
        </div>

        {/* Divider for better separation */}
        <div className="hidden lg:block w-16 h-1 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"></div>

        {/* Features List - with better spacing */}
        <div className="pt-4">
          <FeatureList
            align="start"
            variant="default"
            spacing="relaxed"
            items={[
              {
                icon: <BookOpen className="w-5 h-5" />,
                text: "إدارة شاملة للطلاب والمعلمين",
              },
              {
                icon: <BarChart className="w-5 h-5" />,
                text: "تتبع الحضور والأداء الأكاديمي",
              },
              {
                icon: <FileText className="w-5 h-5" />,
                text: "تقارير تفصيلية ومتابعة دقيقة",
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};
