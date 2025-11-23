import { PageHeader } from "@/components/UI";
import { Newspaper } from 'lucide-react';

const NewsHeader = () => {

  return (
    <section className="mb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex-1">
          <PageHeader
            title="آخر الأخبار والفعاليات"
            subtitle="تابع أحدث أخبار وفعاليات مدرسة المهاجرين لتعليم القرآن الكريم، واطلع على الأنشطة والمسابقات القادمة"
            icon={<Newspaper className="w-12 h-12 sm:w-16 sm:h-16 text-white" />}
            showDivider={true}
          />
        </div>
      </div>
    </section>
  );
};

export default NewsHeader;
