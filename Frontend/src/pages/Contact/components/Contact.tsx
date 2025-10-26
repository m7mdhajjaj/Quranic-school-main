import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { ContactHeader, ContactInfo, ContactGrid, ContactFooter } from '.';
import { socialLinksData } from '../data/socialLinks';

const Contact = () => {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: false,
      easing: 'ease-out-cubic',
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50 to-teal-50 py-8 px-4" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <ContactHeader />

        {/* Info Section */}
        <ContactInfo />

        {/* Contact Cards Grid */}
        <ContactGrid socialLinks={socialLinksData} />

        {/* Footer Note */}
        <ContactFooter />
      </div>
    </div>
  );
};

export default Contact;

