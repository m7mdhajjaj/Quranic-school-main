import { Card } from "@/components/UI";

const ContactInfo = () => {
  return (
    <div className="max-w-3xl mx-auto mb-12 text-center" data-aos="fade-up" data-aos-delay="100">
      <Card className="bg-white/80 backdrop-blur-sm border-2 border-emerald-200">
        <div className="p-6">
          <p className="text-lg text-gray-700 leading-relaxed">
            نحن هنا للإجابة على استفساراتك ومساعدتك. 
            <br />
            اختر وسيلة التواصل المناسبة لك وسنكون سعداء بالرد عليك في أقرب وقت.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ContactInfo;
