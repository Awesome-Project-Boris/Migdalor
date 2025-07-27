// src/pages/Dashboard.jsx
import React from "react";
import { useAuth } from "@/auth/AuthContext";
import {
  Users,
  FileText,
  MessageSquare,
  CalendarDays,
  Clock,
  ShoppingCart,
  Info,
} from "lucide-react";

const DashboardCard = ({ title, description, icon, onClick, colorClass }) => (
  <button
    onClick={onClick}
    className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-in-out flex flex-col items-center justify-center text-center"
  >
    <div className={`p-4 rounded-full ${colorClass}`}>{icon}</div>
    <h3 className="mt-4 text-xl font-semibold text-gray-800">{title}</h3>
    <p className="mt-2 text-sm text-gray-500">{description}</p>
  </button>
);

const Dashboard = ({ setActivePage }) => {
  const { user } = useAuth();
  const isAdmin = user && user.role === "admin";

  if (!isAdmin) {
    return null; // Or a redirect, or a more specific "access denied" component
  }
  return (
    <div className="p-8 bg-gray-50 min-h-full">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">פאנל ניהול</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <DashboardCard
          title="ניהול משתמשים"
          description="עריכה, הוספה ומחיקה של משתמשי המערכת."
          icon={<Users className="h-10 w-10 text-white" />}
          colorClass="bg-blue-500"
          onClick={() => setActivePage("users")}
        />
        <DashboardCard
          title="ניהול הודעות"
          description="ניהול לוח ההודעות הכללי של האפליקציה."
          icon={<MessageSquare className="h-10 w-10 text-white" />}
          colorClass="bg-green-500"
          onClick={() => setActivePage("notices")}
        />
        <DashboardCard
          title="ניהול לוח מוצרים"
          description="יצירה ועריכה של מודעות בלוח המוצרים."
          icon={<ShoppingCart className="h-10 w-10 text-white" />}
          colorClass="bg-indigo-500"
          onClick={() => setActivePage("listings")}
        />
        <DashboardCard
          title="ניהול אירועים"
          description="יצירה, עריכה ומחיקה של אירועים ופעילויות."
          icon={<CalendarDays className="h-10 w-10 text-white" />}
          colorClass="bg-red-500"
          onClick={() => setActivePage("events")}
        />
        <DashboardCard
          title="ניהול שעות פתיחה"
          description="הגדרת שעות הפעילות הרגילות וחריגות במערכת."
          icon={<Clock className="h-10 w-10 text-white" />}
          colorClass="bg-yellow-500"
          onClick={() => setActivePage("openingHours")}
        />
        <DashboardCard
          title="ניהול דף מידע"
          description="עריכת דף המידע הכללי באפליקציה."
          icon={<Info className="h-10 w-10 text-white" />}
          colorClass="bg-teal-500"
          onClick={() => setActivePage("infoSheet")}
        />
        <DashboardCard
          title="דוחות"
          description="הפקה והורדה של דוחות נוכחות ופעילויות."
          icon={<FileText className="h-10 w-10 text-white" />}
          colorClass="bg-purple-500"
          onClick={() => setActivePage("reports")}
        />
      </div>
    </div>
  );
};

export default Dashboard;
