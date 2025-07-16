import React from "react";
import { Users, FileText } from "lucide-react";

/**
 * A card component for the dashboard, acting as a navigation button.
 * @param {object} props
 * @param {string} props.title - The title of the card.
 * @param {string} props.description - A short description of the page.
 * @param {React.ReactNode} props.icon - The icon to display on the card.
 * @param {Function} props.onClick - The function to call when the card is clicked.
 * @param {string} props.colorClass - The background color class for the icon container.
 */
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

/**
 * The main dashboard component for the admin panel.
 * @param {object} props
 * @param {Function} props.setActivePage - Function to change the currently displayed page in the AdminLayout.
 */
const Dashboard = ({ setActivePage }) => {
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
          title="ניהול מודעות"
          description="ניהול לוח המודעות של האפליקציה."
          icon={<FileText className="h-10 w-10 text-white" />}
          colorClass="bg-green-500"
          onClick={() => setActivePage("notices")}
        />
        {/* New cards for additional pages can be added here in the future */}
      </div>
    </div>
  );
};

export default Dashboard;
