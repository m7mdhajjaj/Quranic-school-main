import type { ReactNode } from 'react';

export interface SocialLink {
  name: string;
  url: string;
  icon: ReactNode;
  bgColor: string;
  hoverColor: string;
  description?: string;
}
