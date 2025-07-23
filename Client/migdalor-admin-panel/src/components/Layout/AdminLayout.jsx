// src/components/Layout/AdminLayout.jsx
import React, { useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import SidebarButton from "./SidebarButton";
import {
  LayoutDashboard,
  Users,
  FileText,
  LogOut,
  MessageSquare,
  CalendarDays,
  Clock,
  ShoppingCart, // <-- Import the new icon
} from "lucide-react";
import UserManagement from "../../features/userManagement/UserManagement";
import NoticeManagement from "../../features/noticeManagement/NoticeManagement";
import Dashboard from "../../pages/Dashboard";
import Reports from "../../features/reports/Reports";
import EventManagement from "../../features/eventManagement/EventManagement";
import OpeningHoursManagement from "../../features/openingHoursManagement/OpeningHoursManagement";
import ListingManagement from "../../features/listingManagement/ListingManagement"; // <-- Import the new component

const AdminLayout = () => {
  const [activePage, setActivePage] = useState("dashboard");
  const { logout } = useAuth();

  const renderContent = () => {
    switch (activePage) {
      case "users":
        return <UserManagement />;
      case "notices":
        return <NoticeManagement />;
      case "listings": // <-- Add this case
        return <ListingManagement />;
      case "reports":
        return <Reports />;
      case "events":
        return <EventManagement />;
      case "openingHours":
        return <OpeningHoursManagement />;
      case "dashboard":
      default:
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
            icon={<MessageSquare size={20} />}
            label="ניהול הודעות"
            isActive={activePage === "notices"}
            onClick={() => setActivePage("notices")}
          />
          {/* Add the new button for Listings */}
          <SidebarButton
            icon={<ShoppingCart size={20} />}
            label="ניהול לוח מוצרים"
            isActive={activePage === "listings"}
            onClick={() => setActivePage("listings")}
          />
          <SidebarButton
            icon={<CalendarDays size={20} />}
            label="ניהול אירועים"
            isActive={activePage === "events"}
            onClick={() => setActivePage("events")}
          />
          <SidebarButton
            icon={<Clock size={20} />}
            label="ניהול שעות פתיחה"
            isActive={activePage === "openingHours"}
            onClick={() => setActivePage("openingHours")}
          />
          <SidebarButton
            icon={<FileText size={20} />}
            label="דוחות"
            isActive={activePage === "reports"}
            onClick={() => setActivePage("reports")}
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
