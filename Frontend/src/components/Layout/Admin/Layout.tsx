import { useState, useEffect } from "react";
import AdminHeader from "./Header/AdminHeader";
import { AdminSidebar } from "./Sidebar";
import { ChangePasswordModal } from "@/pages/Auth/ChangePass";

interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * AdminLayout Component
 * 
 * Provides a consistent layout structure for admin pages with:
 * - AdminHeader (sticky header with page title, breadcrumb, notifications, user menu)
 * - AdminSidebar (collapsible sidebar with navigation)
 * - Main content area
 * 
 * NOTE: This layout does NOT include:
 * - Regular Header (only AdminHeader)
 * - Regular Footer (admin pages have no footer)
 * 
 * @param children - Admin page content to render
 */
const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  const handleChangePasswordClick = () => {
    setIsChangePasswordModalOpen(true);
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <>
      {/* AdminHeader - Only for admin (NOT regular Header) */}
      <AdminHeader 
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        onChangePasswordClick={handleChangePasswordClick}
      />
      
      {/* AdminSidebar - Only for admin */}
      <AdminSidebar 
        isCollapsed={sidebarCollapsed}
        isMobileOpen={sidebarOpen}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onMobileToggle={() => setSidebarOpen(!sidebarOpen)}
        onMobileClose={() => setSidebarOpen(false)}
        onChangePasswordClick={handleChangePasswordClick}
      />
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Main Content Area - Admin pages */}
      <div
        className={`min-h-screen bg-gradient-to-b from-slate-50 via-gray-50 to-slate-100 transition-all duration-300 pt-14 sm:pt-16 lg:pt-16 ${
          isMobile 
            ? "mr-0" 
            : sidebarCollapsed 
              ? "lg:mr-[80px]" 
              : "lg:mr-[280px]"
        }`}
        dir="rtl">
        {children}
      </div>
      
      {/* Change Password Modal - Shared between Header and Sidebar */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
      
      {/* NOTE: No Footer for admin pages */}
    </>
  );
};

export default AdminLayout;

