import React, { useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import SidebarButton from "./SidebarButton";
import { LayoutDashboard, Users, FileText, LogOut } from "lucide-react";
import UserManagement from "../../features/userManagement/UserManagement";
import NoticeManagement from "../../features/noticeManagement/NoticeManagement";
import Dashboard from "../../pages/Dashboard"; // Import the new Dashboard page

/**
 * The main layout for the admin panel.
 * It includes a sidebar for navigation and a main content area
 * where the selected page is displayed.
 */
const AdminLayout = () => {
  const [activePage, setActivePage] = useState("dashboard"); // Default to dashboard
  const { logout } = useAuth();

  // Renders the component corresponding to the active page.
  const renderContent = () => {
    switch (activePage) {
      case "users":
        return <UserManagement />;
      case "notices":
        return <NoticeManagement />;
      case "dashboard":
      default:
        // Pass setActivePage to allow the dashboard to navigate to other pages
        return <Dashboard setActivePage={setActivePage} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-gray-800 text-white flex flex-col">
        <div className="h-16 flex items-center justify-center text-2xl font-bold border-b border-gray-700">
          <span>מגדלור</span>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          <SidebarButton
            icon={<LayoutDashboard size={20} />}
            label="לוח בקרה"
            isActive={activePage === "dashboard"}
            onClick={() => setActivePage("dashboard")}
          />
          <SidebarButton
            icon={<Users size={20} />}
            label="ניהול משתמשים"
            isActive={activePage === "users"}
            onClick={() => setActivePage("users")}
          />
          <SidebarButton
            icon={<FileText size={20} />}
            label="ניהול מודעות"
            isActive={activePage === "notices"}
            onClick={() => setActivePage("notices")}
          />
        </nav>
        <div className="p-2 border-t border-gray-700">
          <SidebarButton
            icon={<LogOut size={20} />}
            label="התנתקות"
            onClick={logout}
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">{renderContent()}</main>
    </div>
  );
};

export default AdminLayout;
