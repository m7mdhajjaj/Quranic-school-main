// Example usage of Loading Skeletons
import React from 'react';
import LoadingSkeleton, {
  DashboardSkeleton,
  ChatSkeleton,
  ProfilePageSkeleton,
  ProfileCardSkeleton,
  ActivitySkeleton,
  ArrangementSkeleton,
  NewsSkeleton,
  AbsenceSkeleton,
  GoalsSkeleton,
  DailyMarksSkeleton,
  QuranPageSkeleton,
  QuranReadingSkeleton,
  QuranAudioSkeleton,
  ReportsSkeleton,
  TestSkeleton,
  TestQuestionSkeleton,
} from './LoadingSkeleton';

// Example component showing how to use different skeletons
const LoadingExamples: React.FC = () => {
  const [activeDemo, setActiveDemo] = React.useState<string>('dashboard');

  const demos = [
    { id: 'dashboard', name: 'لوحة التحكم', component: <DashboardSkeleton /> },
    { id: 'profile', name: 'الصفحة الشخصية', component: <ProfilePageSkeleton /> },
    { id: 'chat', name: 'الدردشة', component: <ChatSkeleton /> },
    { id: 'activities', name: 'الأنشطة', component: <ActivitySkeleton /> },
    { id: 'news', name: 'الأخبار', component: <NewsSkeleton /> },
    { id: 'tests', name: 'الامتحانات', component: <TestSkeleton /> },
    { id: 'absence', name: 'الغياب', component: <AbsenceSkeleton /> },
    { id: 'goals', name: 'الأهداف', component: <GoalsSkeleton /> },
    { id: 'marks', name: 'الدرجات اليومية', component: <DailyMarksSkeleton /> },
    { id: 'arrangement', name: 'الترتيب', component: <ArrangementSkeleton /> },
    { id: 'quran', name: 'القرآن الكريم', component: <QuranPageSkeleton /> },
    { id: 'quran-reading', name: 'قراءة القرآن', component: <QuranReadingSkeleton /> },
    { id: 'quran-audio', name: 'الاستماع للقرآن', component: <QuranAudioSkeleton /> },
    { id: 'reports', name: 'التقارير', component: <ReportsSkeleton /> },
    { id: 'general', name: 'عام', component: <LoadingSkeleton title="تحميل البيانات" description="جاري تحميل المحتوى..." /> },
  ];

  return (
    <div className="min-h-screen bg-gray-100" dir="rtl">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">عرض مكونات التحميل</h1>
          <div className="flex flex-wrap gap-2">
            {demos.map((demo) => (
              <button
                key={demo.id}
                onClick={() => setActiveDemo(demo.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeDemo === demo.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {demo.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            معاينة: {demos.find(d => d.id === activeDemo)?.name}
          </h2>
          <p className="text-gray-600 text-sm">
            هذا مثال على مكون التحميل للصفحة المحددة. يمكن استخدام هذه المكونات أثناء تحميل البيانات من الخادم.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {demos.find(d => d.id === activeDemo)?.component}
        </div>
      </div>
    </div>
  );
};

export default LoadingExamples;

// Usage Examples in different components:

/*
// In Dashboard component:
import { DashboardSkeleton } from '../components/Loading/LoadingSkeleton';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div>
      // Your dashboard content
    </div>
  );
};

// In Profile component:
import { ProfilePageSkeleton } from '../components/Loading/LoadingSkeleton';

const Profile = () => {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <ProfilePageSkeleton />;
  }

  return (
    <div>
      // Your profile content
    </div>
  );
};

// In Chat component:
import { ChatSkeleton } from '../components/Loading/LoadingSkeleton';

const Chat = () => {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <ChatSkeleton />;
  }

  return (
    <div>
      // Your chat content
    </div>
  );
};

// For custom loading with messages:
import LoadingSkeleton from '../components/Loading/LoadingSkeleton';

const CustomComponent = () => {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return (
      <LoadingSkeleton 
        title="جاري تحميل بيانات الطلاب..." 
        description="الرجاء الانتظار بينما نقوم بجلب أحدث البيانات"
      />
    );
  }

  return (
    <div>
      // Your component content
    </div>
  );
};
*/