// ============================================================================
// Layout.tsx - Main Layout Component
// ============================================================================
// This component provides a consistent layout structure across ALL pages
// with Header, Footer, and content area for children components.
// 
// Structure:
// ┌─────────────────────────────────┐
// │          Header                 │ ← Always visible (except login)
// ├─────────────────────────────────┤
// │                                 │
// │      Main Content               │ ← Children render here
// │      (Your Pages)               │
// │                                 │
// ├─────────────────────────────────┤
// │          Footer                 │ ← Conditional based on route
// └─────────────────────────────────┘
// ============================================================================

import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar/Sidebar';
import { Footer } from './Footer';
import { AiChatbot } from '../AiChatbot';

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
const ROUTES_WITHOUT_FOOTER = ['/login'];

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Determine what to show based on current route
  const hideLayout = shouldHideLayout(location.pathname);
  const hideFooter = shouldHideFooter(location.pathname);
  const showHeader = !hideLayout;
  const showFooter = !hideLayout && !hideFooter;

  // Use unified Header component for all roles
  const HeaderComponent = Header;

  return (
    <div className="app-content m-0 p-0 min-h-screen flex flex-col">
      {/* Top Header - Always Visible if showHeader is true */}
      {showHeader && (
        <HeaderComponent />
      )}

      {/* Sidebar - Toggled visibility */}
      {showHeader && (
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main 
        className={`main-content m-0 p-0 transition-all duration-300 ease-in-out flex-grow ${
          showHeader && isSidebarOpen ? 'lg:mr-72' : ''
        }`}
      >
        {children}
      </main>

      {/* Footer - Conditional rendering based on route */}
      <div 
        className={`transition-all duration-300 ease-in-out ${
          showHeader && isSidebarOpen ? 'lg:mr-72' : ''
        }`}
      >
        {showFooter && <Footer />}
      </div>

      {/* Global AI Chatbot - للمعلم والطالب فقط */}
      <AiChatbot />
    </div>
  );
};

export default Layout;
