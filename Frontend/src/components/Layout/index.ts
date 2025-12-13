/**
 * Layout Components - Exports
 * @module Layout
 * 
 * This module exports the main Layout component which includes:
 * - Header: Fixed navigation bar at the top (for students and teachers)
 * - AdminLayout: Header + Sidebar for admin pages
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

// Admin Layout Components
export { AdminLayout, AdminHeader, AdminSidebar } from './Admin';

// User Layout Components (for teacher and student)
export { UserLayout, UserHeader, UserSidebar } from './User';

// Individual Components (can be used separately if needed)
export { Footer } from './Footer';

// UI Components
export { default as PageHeader } from '../UI/PageHeader';

// Types
export type { FooterProps } from './Footer/Types/types';
