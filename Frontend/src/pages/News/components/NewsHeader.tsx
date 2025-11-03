
import type { NewsHeaderProps } from "../utils/types";
import { Button } from '../../../components/UI';
import { Plus } from 'lucide-react';


const NewsHeader = ({ 
  isTeacherOrAdmin, 
  onAddNews
}: NewsHeaderProps) => {

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <h1
            className="text-3xl md:text-4xl font-bold text-emerald-800"
            data-aos="fade-down">
            آخر الأخبار والفعاليات
          </h1>
        </div>

        {isTeacherOrAdmin && (
          <div data-aos="fade-left">
            <Button
              onClick={onAddNews}
              variant="primary"
              size="md"
              className="shadow-md hover:shadow-lg"
            >
              <Plus size={20} />
              إضافة خبر جديد
            </Button>
          </div>
        )}
      </div>

      <p
        className="text-lg mb-12 max-w-3xl text-gray-600"
        data-aos="fade-up"
        data-aos-delay="100">
        تابع أحدث أخبار وفعاليات مدرسة المهاجرين لتعليم القرآن الكريم، واطلع
        على الأنشطة والمسابقات القادمة
      </p>
    </section>
  );
};

export default NewsHeader;
