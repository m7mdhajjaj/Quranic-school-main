import React from 'react';
import { ShieldCheck } from 'lucide-react';
import {
  PageHeader,
  DecorativeBackground,
  IntroductionCard,
  DataCollectionCard,
  DataProtectionCard,
} from './components';

const Privacy: React.FC = () => {
  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 via-gray-50 to-slate-100 py-12 px-4 font-arabic"
      dir="rtl"
      lang="ar"
    >
      <div className="max-w-5xl mx-auto">
        {/* Decorative Background Elements */}
        <DecorativeBackground />

        {/* Header Section */}
        <PageHeader
          icon={
            <ShieldCheck className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
          }
          title="سياسة الخصوصية"
          subtitle="نلتزم بحماية بياناتك وخصوصيتك بأعلى معايير الأمان"
          showDivider={true}
        />

        {/* Content Cards */}
        <div className="space-y-8 relative z-10">
          {/* Introduction Card */}
          <IntroductionCard />

          {/* Data Collection Card */}
          <DataCollectionCard />

          {/* Data Protection Card */}
          <DataProtectionCard />
        </div>
      </div>
    </div>
  );
};

export default Privacy;
