import { Mail } from 'lucide-react';

const ContactHeader = () => {
  return (
    <div data-aos="fade-down">
      <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 rounded-2xl shadow-xl p-5 mb-6 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/15 backdrop-blur-sm rounded-xl shadow-sm">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">📧 تواصل معنا</h1>
            <p className="text-white/70 text-sm mt-0.5">اختر الطريقة المناسبة للتواصل معنا</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactHeader;
