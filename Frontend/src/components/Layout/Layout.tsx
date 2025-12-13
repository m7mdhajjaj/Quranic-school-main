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
 * Routes that should use AdminLayout when user is admin
 */
const ADMIN_SHARED_ROUTES = ['/chat', '/timetable'];

/**
 * Check if current path is an admin route (uses AdminLayout)
 * - If user is admin, ALL routes should use AdminLayout (AdminHeader + AdminSidebar, NO regular Header/Footer)
 * - Routes starting with /admin should use AdminLayout
 */
const isAdminRoute = (pathname: string, userRole?: string): boolean => {
  // If user is admin, all routes should use AdminLayout (except login)
  // AdminLayout shows: AdminHeader + AdminSidebar (NO regular Header, NO Footer)
  if (userRole === 'admin' && pathname !== '/login') {
    return true;
  }
  
  // Check if path starts with /admin (fallback for edge cases)
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
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
 * - Header (unified for teacher and student, AdminHeader for admin)
 * - Main content area (children)
 * - Footer (only for teacher and student, NOT for admin)
 * 
 * Rules:
 * - Admin: Uses AdminLayout (AdminHeader + AdminSidebar, NO Footer)
 * - Teacher: Uses regular Layout (Header + Footer)
 * - Student: Uses regular Layout (Header + Footer)
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

  // Determine what to show based on current route and user role
  const hideLayout = shouldHideLayout(location.pathname);
  const hideFooter = shouldHideFooter(location.pathname);
  const isAdmin = isAdminRoute(location.pathname, userRole);
  
  // ============================================
  // ADMIN: Use AdminLayout (AdminHeader + AdminSidebar, NO regular Header/Footer)
  // ============================================
  if (isAdmin) {
    // Admin sees: AdminHeader + AdminSidebar + pages
    // Admin does NOT see: regular Header, regular Footer
    return <AdminLayout>{children}</AdminLayout>;
  }

  // ============================================
  // TEACHER & STUDENT: Use regular Layout (Header + Footer)
  // ============================================
  // Teacher and Student see: regular Header + pages + regular Footer
  // Teacher and Student do NOT see: AdminHeader, AdminSidebar
  const showHeader = !hideLayout;
  const showFooter = !hideLayout && !hideFooter;

  return (
    <div className="app-content">
      {/* Header - Only for teacher and student (NOT for admin) */}
      {showHeader && <Header />}

      {/* Main Content Area */}
      <main className="main-content">
        {children}
      </main>

      {/* Footer - Only for teacher and student (NOT for admin) */}
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;
