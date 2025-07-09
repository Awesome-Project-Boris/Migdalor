// /src/components/layout/AdminLayout.jsx

import React, { useState } from "react";
import { Shield, LogOut, Users, FileText } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import UserManagement from "../../features/userManagement/UserManagement";
import NoticeManagement from "../../features/noticeManagement/NoticeManagement";
import SidebarButton from "./SidebarButton";

/**
 * The main layout for the authenticated admin area.
 * It includes a persistent sidebar for navigation and a main content area
 * where different management pages are rendered.
 */
const AdminLayout = () => {
  const [currentPage, setCurrentPage] = useState("users");
  const { user, logout } = useAuth();

  // Renders the component for the currently selected page.
  const renderContent = () => {
    switch (currentPage) {
      case "users":
        return <UserManagement />;
      case "notices":
        return <NoticeManagement />;
      default:
        // Fallback to the user management page.
        return <UserManagement />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar Navigation */}
      <aside className="flex-shrink-0 flex flex-col w-64 bg-gray-800 text-gray-200">
        <div className="flex items-center justify-center h-20 border-b border-gray-700">
          <Shield className="w-8 h-8 text-blue-400" />
          <span className="mx-3 text-2xl font-bold">מנהל מגדלור</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <SidebarButton
            icon={<Users />}
            label="ניהול משתמשים"
            onClick={() => setCurrentPage("users")}
            isActive={currentPage === "users"}
          />
          <SidebarButton
            icon={<FileText />}
            label="ניהול הודעות"
            onClick={() => setCurrentPage("notices")}
            isActive={currentPage === "notices"}
          />
          {/* Future navigation buttons can be added here */}
        </nav>
        <div className="px-4 py-4 border-t border-gray-700">
          <div className="text-sm">מחובר בתור:</div>
          <div className="font-semibold truncate">
            {user ? `${user.hebFirstName} ${user.hebLastName}` : "Admin"}
          </div>
          <button
            onClick={logout}
            className="flex items-center justify-center w-full px-4 py-2 mt-4 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            <LogOut className="w-4 h-4" />
            <span className="mx-2">התנתק</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="w-full max-w-7xl mx-auto">{renderContent()}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
