import React from 'react';
import {
  PageHeader,
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
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 font-arabic"
      dir="rtl"
      lang="ar"
    >
      <div className="max-w-5xl mx-auto">
        {/* Decorative Background Elements */}
        <DecorativeBackground />

        {/* Header Section */}
        <PageHeader
          icon={<span className="text-5xl">📋</span>}
          title="الشروط والأحكام"
          subtitle="قواعد وضوابط استخدام منصتنا التعليمية المبتكرة"
          showDivider={true}
        />

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
