/**
 * Layout Components - Exports
 * @module Layout
 * 
 * This module exports the main Layout component which includes:
 * - Header: Fixed navigation bar at the top
 * - Main Content Area: Children components render here
 * - Footer: Site footer at the bottom
 * 
 * Usage:
 * ```tsx
 * import { Layout } from './components/Layout';
 * 
 * <Layout>
 *   <YourPage />
 * </Layout>
 * ```
 */

// Main Layout Component - includes Header, Content Area, and Footer
export { default as Layout } from './Layout';

// Individual Components (can be used separately if needed)
export { default as Header } from './Header';
export { Footer } from './Footer';

// UI Components
export { default as PageHeader } from '../UI/PageHeader';

// Types
export type { FooterProps } from './Footer/Types/types';
