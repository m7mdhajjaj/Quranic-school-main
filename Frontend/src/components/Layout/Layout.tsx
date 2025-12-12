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
import { useAuth } from '@/hooks/useAuth';
import Header from './Header';
import { Footer } from './Footer';
import { AdminLayout } from './Admin';

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
 * Admin routes that use their own header (AdminHeader)
 * Note: Some routes like /timetable are shared but should use AdminLayout when user is admin
 */
const ADMIN_ROUTES = ['/admin', '/admin/dashboard', '/admin/students', '/admin/teachers', '/admin/groups', '/admin/settings'];

/**
 * Shared routes that should use AdminLayout when user is admin
 */
const SHARED_ADMIN_ROUTES = ['/timetable'];

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

/**
 * Check if current path is an admin route (uses AdminHeader)
 */
const isAdminRoute = (pathname: string, userRole?: string): boolean => {
  // Check if it's a direct admin route
  if (ADMIN_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'))) {
    return true;
  }
  
  // Check if it's a shared route and user is admin
  if (userRole === 'admin' && SHARED_ADMIN_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'))) {
    return true;
  }
  
  return false;
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
  const { user } = useAuth();
  const userRole = user?.role;

  // Determine what to show based on current route
  const hideLayout = shouldHideLayout(location.pathname);
  const hideFooter = shouldHideFooter(location.pathname);
  const isAdmin = isAdminRoute(location.pathname, userRole);
  const showHeader = !hideLayout && !isAdmin; // Don't show regular header for admin routes
  const showFooter = !hideLayout && !hideFooter && !isAdmin; // Don't show footer for admin routes

  // If admin route, use AdminLayout
  if (isAdmin) {
    return <AdminLayout>{children}</AdminLayout>;
  }

  // Use unified Header component for all roles (except admin)
  const HeaderComponent = Header;

  return (
    <div className="app-content">
      {/* Header - Conditional rendering based on route (not shown for admin routes) */}
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
