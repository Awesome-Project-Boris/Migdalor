import React, { useState, useContext } from "react";
import SidebarButton from "./SidebarButton";
import AuthContext from "../Auth/AuthContext";
import Dashboard from "../Screens/Dashboard";
import UserManagement from "../Screens/UserManagement";
import NoticeManagement from "../Screens/NoticeManagement";

const AdminLayout = () => {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const { user, logout } = useContext(AuthContext);

  const renderContent = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard navigate={setCurrentPage} />;
      case "users":
        return <UserManagement />;
      case "notices":
        return <NoticeManagement />;
      default:
        return <Dashboard navigate={setCurrentPage} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="flex-shrink-0 flex flex-col w-64 bg-gray-800 text-gray-200">
        <div className="flex items-center justify-center h-20 border-b border-gray-700">
          <span className="w-8 h-8 text-blue-400">🛡️</span>
          <span className="mx-3 text-2xl font-bold">מנהל מגדלור</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <SidebarButton
            icon={<span className="w-5 h-5">👥</span>}
            label="ניהול משתמשים"
            onClick={() => setCurrentPage("users")}
            isActive={currentPage === "users"}
          />
          <SidebarButton
            icon={<span className="w-5 h-5">📄</span>}
            label="ניהול הודעות"
            onClick={() => setCurrentPage("notices")}
            isActive={currentPage === "notices"}
          />
          <SidebarButton
            icon={<span className="w-5 h-5">🏃‍♂️</span>}
            label="פעילויות"
            disabled
          />
          <SidebarButton
            icon={<span className="w-5 h-5">🛒</span>}
            label="שוק"
            disabled
          />
          <SidebarButton
            icon={<span className="w-5 h-5">🔔</span>}
            label="התראות"
            disabled
          />
          <SidebarButton
            icon={<span className="w-5 h-5">⚙️</span>}
            label="הגדרות מערכת"
            disabled
          />
        </nav>
        <div className="px-4 py-4 border-t border-gray-700">
          <div className="mt-4">
            <div className="text-sm">מחובר בתור:</div>
            <div className="font-semibold truncate">
              {user?.fullName || "Admin"}
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center justify-center w-full px-4 py-2 mt-4 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            <span className="w-4 h-4">🚪</span>
            <span className="mx-2">התנתק</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-end items-center p-4 bg-white border-b border-gray-200 shadow-sm"></header>
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="w-full max-w-7xl mx-auto">
            {currentPage !== "dashboard" && (
              <button
                onClick={() => setCurrentPage("dashboard")}
                className="text-gray-500 hover:text-gray-800 mb-4 inline-flex items-center"
                title="חזרה ללוח המחוונים"
              >
                <span className="ml-2">&rarr;</span>
                חזרה ללוח המחוונים
              </button>
            )}
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
