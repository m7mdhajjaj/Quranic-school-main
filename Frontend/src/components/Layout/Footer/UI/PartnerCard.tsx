/**
 * PartnerCard Component - بطاقة عضو الفريق
 */

import React from 'react';
import { FaPhone, FaEnvelope, FaWhatsapp } from 'react-icons/fa';
import type { PartnerCardProps } from '../Types/types';

export const PartnerCard: React.FC<PartnerCardProps> = ({ partner, index }) => {
  return (
    <div
      className={`bg-white/60 backdrop-blur-md rounded-xl p-2.5 sm:p-3 hover:bg-white border border-emerald-200 hover:border-emerald-300 hover:shadow-md transition-all duration-300 hover:scale-105 animate-fade-in partner-card-delay-${index}`}
    >
      <div className="flex items-start gap-2 sm:gap-2.5">
        {/* Avatar */}
        <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
          <span className="text-white font-bold text-xs sm:text-sm">
            {partner.name.split(' ')[0][0]}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h5 className="font-bold text-gray-900 text-xs sm:text-sm truncate">
            {partner.name}
          </h5>
          <p className="text-emerald-700 text-xs mb-1.5 font-medium">
            {partner.role}
          </p>

          {/* Contact Links */}
          <div className="space-y-1">
            {/* Phone */}
            <a
              href={`tel:${partner.phone}`}
              className="flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 text-xs transition-colors group font-medium"
            >
              <FaPhone className="w-2.5 h-2.5 sm:w-3 sm:h-3 group-hover:scale-110 transition-transform flex-shrink-0" />
              <span className="truncate">{partner.phone}</span>
            </a>

            {/* Email */}
            {partner.email && (
              <a
                href={`mailto:${partner.email}`}
                className="flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 text-xs transition-colors group font-medium"
                title={partner.email}
              >
                <FaEnvelope className="w-2.5 h-2.5 sm:w-3 sm:h-3 group-hover:scale-110 transition-transform flex-shrink-0" />
                <span className="truncate min-w-0">
                  {partner.email.length > 20
                    ? `${partner.email.substring(0, 18)}...`
                    : partner.email}
                </span>
              </a>
            )}

            {/* WhatsApp */}
            <a
              href={`https://wa.me/${partner.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 text-xs transition-colors group font-medium"
            >
              <FaWhatsapp className="w-2.5 h-2.5 sm:w-3 sm:h-3 group-hover:scale-110 transition-transform flex-shrink-0" />
              <span>واتساب</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
