import React from 'react';
import { Logo, Badge, FeatureList } from "@/components/UI";
import { Star, BookOpen, BarChart, FileText } from 'lucide-react';

interface WelcomeSectionProps {
  logoUrl: string | null;
  logoLoading: boolean;
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({
  logoUrl,
  logoLoading,
}) => {
  return (
    <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start justify-center text-center lg:text-left space-y-6 lg:space-y-8 order-1 lg:order-2">
      {/* Logo */}
      <Logo 
        logoUrl={logoUrl}
        logoLoading={logoLoading}
        size="lg"
        alt="مدرسة القرآن"
        showGlow={true}
      />

      {/* Title and Description */}
      <div className="space-y-4 max-w-lg">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent drop-shadow-lg leading-tight">
          مدرسة القرآن الكريم
        </h1>

        <p className="text-lg sm:text-xl lg:text-2xl text-emerald-700 font-semibold drop-shadow-md">
          نظام إدارة الطلاب المتكامل
        </p>

        <div className="flex justify-center lg:justify-start">
          <Badge 
            variant="primary" 
            size="md" 
            icon={<Star className="w-4 h-4" fill="currentColor" />}
            className="text-teal-700 bg-teal-50 border-teal-200"
          >
            منصة تعليمية متميزة
          </Badge>
        </div>

        {/* Additional Info - الآن مع الميزات الجديدة! */}
        <FeatureList
          align="start"
          variant="default"  // يمكن تغييره إلى "checklist" أو "minimal"
          spacing="normal"   // ميزة جديدة: tight/normal/relaxed
          items={[
            {
              icon: <BookOpen className="w-5 h-5" />,
              text: "إدارة شاملة للطلاب والمعلمين",
              // يمكن إضافة description للميزات
              // description: "نظام متكامل لإدارة البيانات"
            },
            {
              icon: <BarChart className="w-5 h-5" />,
              text: "تتبع الحضور والأداء الأكاديمي",
              // يمكن إضافة completed: true إذا كانت الميزة نشطة
            },
            {
              icon: <FileText className="w-5 h-5" />,
              text: "تقارير تفصيلية ومتابعة دقيقة"
            }
          ]}
        />
      </div>
    </div>
  );
};
