import React from 'react';
import { ShieldCheck } from 'lucide-react';
import {
  DecorativeBackground,
  IntroductionCard,
  DataCollectionCard,
  DataProtectionCard,
} from './components';

const Privacy: React.FC = () => {
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
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                🔒 سياسة الخصوصية
              </h1>
              <p className="text-white/70 text-sm mt-1">
                نلتزم بحماية بياناتك وخصوصيتك بأعلى معايير الأمان
              </p>
            </div>
          </div>
        </div>

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
