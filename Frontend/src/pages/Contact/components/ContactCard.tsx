import { Link } from 'react-router-dom';
import type { SocialLink } from '../types';

interface ContactCardProps {
  link: SocialLink;
  index: number;
}

const ContactCard = ({ link, index }: ContactCardProps) => {
  // Check if it's an external link
  const isExternal =
    link.url.startsWith('http') ||
    link.url.startsWith('tel:') ||
    link.url.startsWith('mailto:');

  const content = (
    <div className="flex flex-col items-center gap-4 p-8">
      {/* Circular Icon Container */}
      <div
        className={`relative w-32 h-32 rounded-full bg-gradient-to-br ${link.bgColor} ${link.hoverColor} shadow-2xl transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 cursor-pointer`}
      >
        {/* Glow Effect */}
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${link.bgColor} opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-500`}
        ></div>

        {/* Icon */}
        <div className="absolute inset-0 flex items-center justify-center text-white transform transition-transform duration-500 group-hover:scale-110">
          <div className="w-14 h-14 flex items-center justify-center">
            {link.icon}
          </div>
        </div>

        {/* Pulse Ring */}
        <div
          className={`absolute inset-0 rounded-full border-4 border-white/30 opacity-0 group-hover:opacity-100 animate-ping`}
        ></div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-center text-gray-800 group-hover:text-emerald-600 transition-colors duration-300">
        {link.name}
      </h3>

      {/* Description */}
      {link.description && (
        <p className="text-sm text-gray-600 text-center font-medium leading-relaxed max-w-xs">
          {link.description}
        </p>
      )}

      {/* Hover Indicator */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="text-sm text-emerald-600 font-semibold">
          تواصل الآن
        </span>
        <svg
          className="w-4 h-4 text-emerald-600 transform group-hover:translate-x-1 transition-transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14 5l7 7m0 0l-7 7m7-7H3"
          />
        </svg>
      </div>
    </div>
  );

  return (
    <div data-aos="zoom-in" data-aos-delay={index * 100} className="group">
      {isExternal ? (
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          {content}
        </a>
      ) : (
        <Link to={link.url} className="block">
          {content}
        </Link>
      )}
    </div>
  );
};

export default ContactCard;
