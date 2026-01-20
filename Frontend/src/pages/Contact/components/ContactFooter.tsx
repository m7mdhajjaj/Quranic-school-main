import { Card } from "@/components/UI";

const ContactFooter = () => {
  return (
    <div className="max-w-2xl mx-auto text-center" data-aos="fade-up" data-aos-delay="600">
      <Card className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 border-none">
        <div className="p-6">
          <p className="text-white text-lg font-semibold leading-relaxed">
            💡 نحن متواجدون دائماً للإجابة على استفساراتكم ومساعدتكم
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ContactFooter;
