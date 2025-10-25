/**
 * Footer Module - Exports
 * @module Footer
 */

// Main Component
export { Footer, default } from './Footer';

// Sub-components (for advanced customization)
export { FooterAbout } from './FooterAbout';
export { FooterQuickLinks } from './FooterQuickLinks';
export { FooterPartners } from './FooterPartners';
export { FooterBottom } from './FooterBottom';
export { FooterSection } from './FooterSection';
export { PartnerCard } from './PartnerCard';
export { SocialIcon } from './SocialIcon';

// Types
export type {
  FooterProps,
  FooterAboutProps,
  FooterQuickLinksProps,
  FooterPartnersProps,
  FooterBottomProps,
  FooterSectionProps,
  PartnerCardProps,
  SocialIconProps,
  Partner,
  QuickLink,
  SocialLink,
} from './types';

// Constants
export {
  DEFAULT_PARTNERS,
  SOCIAL_LINKS,
  ADMIN_QUICK_LINKS,
  DEFAULT_QUICK_LINKS,
  FOUNDING_DATE,
} from './constants';

// Animations
export { footerAnimations } from './animations';
