// src/components/Layout/AdminLayout.jsx
import React, { useState, useEffect } from "react";
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
  ShoppingCart,
  Info,
} from "lucide-react";
import UserManagement from "../../features/userManagement/UserManagement";
import NoticeManagement from "../../features/noticeManagement/NoticeManagement";
import Dashboard from "../../pages/Dashboard";
import Reports from "../../features/reports/Reports";
import EventManagement from "../../features/eventManagement/EventManagement";
import OpeningHoursManagement from "../../features/openingHoursManagement/OpeningHoursManagement";
import ListingManagement from "../../features/listingManagement/ListingManagement";
import InfoSheetManagement from "../../features/infoSheetManagement/InfoSheetManagement";

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const [activePage, setActivePage] = useState("dashboard");
  const isAdmin = user && user.role === "admin";

  useEffect(() => {
    if (!isAdmin) {
      setActivePage("notices");
    }
  }, [isAdmin]);

  const renderContent = () => {
    if (!isAdmin) {
      return <NoticeManagement />;
    }

    switch (activePage) {
      case "users":
        return <UserManagement />;
      case "notices":
        return <NoticeManagement />;
      case "listings":
        return <ListingManagement />;
      case "infoSheet":
        return <InfoSheetManagement />;
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
          {isAdmin ? (
            <>
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
                icon={<Info size={20} />}
                label="ניהול דף מידע"
                isActive={activePage === "infoSheet"}
                onClick={() => setActivePage("infoSheet")}
              />
              <SidebarButton
                icon={<FileText size={20} />}
                label="דוחות"
                isActive={activePage === "reports"}
                onClick={() => setActivePage("reports")}
              />
            </>
          ) : (
            <SidebarButton
              icon={<MessageSquare size={20} />}
              label="ניהול הודעות"
              isActive={activePage === "notices"}
              onClick={() => setActivePage("notices")}
            />
          )}
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
