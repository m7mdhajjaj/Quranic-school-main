/**
 * PartnerCard Component - بطاقة عضو الفريق
 */

import React from 'react';
import { FaPhone, FaEnvelope, FaWhatsapp } from 'react-icons/fa';
import type { PartnerCardProps } from './types';

export const PartnerCard: React.FC<PartnerCardProps> = ({ partner, index }) => {
  return (
    <div
      className={`bg-white/10 backdrop-blur-md rounded-xl p-2 sm:p-3 lg:p-4 hover:bg-white/15 transition-all duration-300 border border-white/20 hover:scale-105 animate-fade-in partner-card-delay-${index}`}
    >
      <div className="flex items-start gap-2 sm:gap-3">
        {/* Avatar */}
        <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
          <span className="text-white font-bold text-xs sm:text-sm lg:text-base">
            {partner.name.split(' ')[0][0]}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1">
          <h5 className="font-bold text-white text-xs sm:text-sm lg:text-base xl:text-lg">
            {partner.name}
          </h5>
          <p className="text-emerald-200 text-xs sm:text-sm lg:text-base mb-1 sm:mb-2">
            {partner.role}
          </p>

          {/* Contact Links */}
          <div className="space-y-1 sm:space-y-2">
            {/* Phone */}
            <a
              href={`tel:${partner.phone}`}
              className="flex items-center gap-1 sm:gap-2 text-emerald-100 hover:text-white text-xs sm:text-sm transition-colors group"
            >
              <FaPhone className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 group-hover:scale-110 transition-transform" />
              <span>{partner.phone}</span>
            </a>

            {/* Email */}
            {partner.email && (
              <a
                href={`mailto:${partner.email}`}
                className="flex items-center gap-1 sm:gap-2 text-emerald-100 hover:text-white text-xs sm:text-sm lg:text-base transition-colors group w-full"
                title={partner.email}
              >
                <FaEnvelope className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 group-hover:scale-110 transition-transform flex-shrink-0" />
                <span className="truncate min-w-0 break-all sm:break-normal">
                  <span className="hidden sm:inline">{partner.email}</span>
                  <span className="sm:hidden">
                    {partner.email.length > 15
                      ? `${partner.email.substring(0, 12)}...`
                      : partner.email}
                  </span>
                </span>
              </a>
            )}

            {/* WhatsApp */}
            <a
              href={`https://wa.me/${partner.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 sm:gap-2 text-emerald-100 hover:text-white text-xs sm:text-sm transition-colors group"
            >
              <FaWhatsapp className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 group-hover:scale-110 transition-transform" />
              <span>واتساب</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
