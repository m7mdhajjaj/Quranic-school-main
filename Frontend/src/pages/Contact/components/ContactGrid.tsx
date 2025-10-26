import ContactCard from './ContactCard';
import type { SocialLink } from '../types';

interface ContactGridProps {
  socialLinks: SocialLink[];
}

const ContactGrid = ({ socialLinks }: ContactGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {socialLinks.map((link, index) => (
        <ContactCard key={index} link={link} index={index} />
      ))}
    </div>
  );
};

export default ContactGrid;
