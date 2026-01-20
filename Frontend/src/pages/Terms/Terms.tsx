import React from 'react';
import { FileText } from 'lucide-react';
import {
  DecorativeBackground,
  IntroductionCard,
  UserRightsCard,
  UsageRulesCard,
  AcademicPoliciesCard,
  UpdatesCard,
  AgreementCard,
  BottomFooter,
} from './components';

const Terms: React.FC = () => {
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-slate-50 to-teal-50/20 py-12 px-4 font-arabic"
      dir="rtl"
      lang="ar"
    >
      <div className="max-w-[98%] mx-auto">
        {/* Decorative Background Elements */}
        <DecorativeBackground />

        {/* Header Section */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 rounded-2xl shadow-xl p-6 border border-white/10 mb-8 relative z-10">
          <div className="flex items-center gap-4">
            <div className="bg-white/15 backdrop-blur-sm p-3 rounded-xl">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                📋 الشروط والأحكام
              </h1>
              <p className="text-white/70 text-sm mt-1">
                قواعد وضوابط استخدام منصتنا التعليمية المبتكرة
              </p>
            </div>
          </div>
        </div>

        {/* Content Cards */}
        <div className="space-y-8 relative z-10">
          {/* Introduction Card */}
          <IntroductionCard />

          {/* User Rights and Responsibilities */}
          <UserRightsCard />

          {/* Usage Rules */}
          <UsageRulesCard />

          {/* Academic Policies */}
          <AcademicPoliciesCard />

          {/* Updates and Changes */}
          <UpdatesCard />

          {/* Contact and Agreement */}
          <AgreementCard />
        </div>

        {/* Bottom Footer */}
        <BottomFooter />
      </div>
    </div>
  );
};

export default Terms;
