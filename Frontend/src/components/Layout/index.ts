/**
 * Layout Components - Exports
 * @module Layout
 */

export { default as Layout } from './Layout';
export { default as Header } from './Header';
export { default as PageHeader } from '../UI/PageHeader';

// Footer is now in its own folder with sub-components
// Import from './Footer' for backward compatibility
// Or from './Footer/Footer' for the new structure
export { Footer } from './Footer';

// Re-export Footer types and sub-components for convenience
export type { FooterProps } from './Footer/Types/types';
