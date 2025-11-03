// ============================================================================
// Layout.tsx - Main Layout Component
// ============================================================================
// This component provides a consistent layout structure across all pages
// with Header, Footer, and content area for children components.
// ============================================================================

import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import { Footer } from './Footer';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface LayoutProps {
  children: React.ReactNode;
}

// ============================================================================
// Route Configurations
// ============================================================================

/**
 * Routes that should hide the footer
 */
const ROUTES_WITHOUT_FOOTER = ['/login', '/chat', '/quran', '/quran-audio'];

/**
 * Routes that should hide both header and footer
 */
const ROUTES_WITHOUT_LAYOUT = ['/login'];

/**
 * Check if current path should hide footer
 */
const shouldHideFooter = (pathname: string): boolean => {
  return ROUTES_WITHOUT_FOOTER.some((route) => pathname === route);
};

/**
 * Check if current path should hide entire layout (header + footer)
 */
const shouldHideLayout = (pathname: string): boolean => {
  return ROUTES_WITHOUT_LAYOUT.some((route) => pathname === route);
};

// ============================================================================
// Layout Component
// ============================================================================

/**
 * Layout Component
 * 
 * Provides a consistent page structure with:
 * - Header (unified for all user roles)
 * - Main content area (children)
 * - Footer (conditionally rendered)
 * 
 * @param children - Page content to render
 * 
 * @example
 * ```tsx
 * <Layout>
 *   <Dashboard />
 * </Layout>
 * ```
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  // Determine what to show based on current route
  const hideLayout = shouldHideLayout(location.pathname);
  const hideFooter = shouldHideFooter(location.pathname);
  const showHeader = !hideLayout;
  const showFooter = !hideLayout && !hideFooter;

  // Use unified Header component for all roles
  const HeaderComponent = Header;

  return (
    <div className="app-content">
      {/* Header - Conditional rendering based on route */}
      {showHeader && <HeaderComponent />}

      {/* Main Content Area */}
      <main className="main-content">
        {children}
      </main>

      {/* Footer - Conditional rendering based on route */}
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;
