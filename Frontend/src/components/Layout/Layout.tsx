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

import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import { Footer } from './Footer';
import { AiChatbot } from '../AiChatbot';
import { useAuth } from '@/hooks/useAuth';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface LayoutProps {
  children: React.ReactNode;
  isGuest?: boolean;
}

// ============================================================================
// Route Configurations
// ============================================================================

/**
 * Routes that should hide the footer
 */
const ROUTES_WITHOUT_FOOTER = ['/login', '/chat'];

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
const Layout: React.FC<LayoutProps> = ({ children, isGuest = false }) => {
  const location = useLocation();
  const { user } = useAuth();

  // Determine what to show based on current route
  const hideLayout = shouldHideLayout(location.pathname);
  const hideFooter = shouldHideFooter(location.pathname);
  const showHeader = !hideLayout;
  const showFooter = !hideLayout && !hideFooter;

  // Use unified Header component for all roles
  const HeaderComponent = Header;

  // Show chatbot only for teacher and student (not for admin, secretary, or guests)
  const showChatbot = !isGuest && (user?.role === 'teacher' || user?.role === 'student');

  return (
    <div className="app-content m-0 p-0 min-h-screen flex flex-col">
      {/* Top Header - Always Visible if showHeader is true */}
      {showHeader && (
        <HeaderComponent isGuest={isGuest} />
      )}

      {/* Main Content Area */}
      <main className="main-content m-0 p-0 transition-all duration-300 ease-in-out flex-grow">
        {children}
      </main>

      {/* Footer - Conditional rendering based on route */}
      {showFooter && <Footer isGuest={isGuest} />}

      {/* Global AI Chatbot - للمعلم والطالب فقط */}
      {showChatbot && <AiChatbot />}
    </div>
  );
};

export default Layout;
