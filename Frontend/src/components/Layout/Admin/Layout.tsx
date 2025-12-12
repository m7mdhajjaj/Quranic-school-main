import { useState } from "react";
import AdminHeader from "./Header/AdminHeader";
import { AdminSidebar } from "./Sidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * AdminLayout Component
 * 
 * Provides a consistent layout structure for admin pages with:
 * - AdminHeader (light background, breadcrumbs, admin navigation)
 * - AdminSidebar (dark sidebar with navigation)
 * - Main content area
 * 
 * @param children - Admin page content to render
 */
const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <>
      <AdminHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      {sidebarOpen && <AdminSidebar />}
      <div
        className={`min-h-screen transition-all duration-300 pt-16 ${
          sidebarOpen ? "mr-64" : ""
        }`}
        dir="rtl">
        {children}
      </div>
    </>
  );
};

export default AdminLayout;

