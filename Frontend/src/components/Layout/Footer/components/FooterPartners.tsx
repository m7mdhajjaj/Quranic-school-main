/**
 * FooterPartners Component - قسم فريق العمل
 */

import React from 'react';
import type { FooterPartnersProps } from '../Types/types';
import { FooterSection } from './FooterSection';
import { PartnerCard } from '../UI/PartnerCard';

export const FooterPartners: React.FC<FooterPartnersProps> = ({
  partners,
  className = '',
}) => {
  return (
    <FooterSection title="فريق العمل" animated className={className}>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-2 sm:gap-3 mb-2 sm:mb-3">
        {partners.map((partner, index) => (
          <PartnerCard key={index} partner={partner} index={index} />
        ))}
      </div>
    </FooterSection>
  );
};
