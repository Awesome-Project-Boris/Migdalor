import React from "react";

const Dashboard = ({ navigate }) => {
  const adminActions = [
    {
      id: "users",
      title: "ניהול משתמשים",
      description: "הוסף, ערוך ונהל דיירים וצוות.",
      icon: <span>👥</span>,
      enabled: true,
    },
    {
      id: "notices",
      title: "ניהול הודעות",
      description: "צור, פרסם והעבר לארכיון הודעות.",
      icon: <span>📄</span>,
      enabled: true,
    },
    {
      id: "activities",
      title: "לוח פעילויות",
      description: "נהל פעילויות וחוגים בבניין.",
      icon: <span>🏃‍♂️</span>,
      enabled: false,
    },
    {
      id: "marketplace",
      title: "בקרת שוק",
      description: "פקח ונהל מודעות בשוק.",
      icon: <span>🛒</span>,
      enabled: false,
    },
    {
      id: "notifications",
      title: "שלח התראות",
      description: "שלח התראות לכל המשתמשים או לקבוצות.",
      icon: <span>🔔</span>,
      enabled: false,
    },
    {
      id: "settings",
      title: "הגדרות מערכת",
      description: "הגדר הגדרות כלליות לאפליקציה.",
      icon: <span>⚙️</span>,
      enabled: false,
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800">לוח מחוונים למנהל</h1>
      <p className="mt-2 text-gray-600">ברוך הבא! בחר פעולה כדי להתחיל.</p>
      <div className="grid grid-cols-1 gap-6 mt-8 md:grid-cols-2 lg:grid-cols-3">
        {adminActions.map((action) => (
          <button
            key={action.id}
            onClick={() => action.enabled && navigate(action.id)}
            disabled={!action.enabled}
            className={`p-6 text-left bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-200 ${
              !action.enabled
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            }`}
          >
            <div className="flex items-center">
              <div
                className={`p-3 rounded-full ${
                  action.enabled
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {action.icon}
              </div>
              <h3 className="mx-4 text-lg font-semibold text-gray-800">
                {action.title}
              </h3>
            </div>
            <p className="mt-2 text-sm text-gray-600">{action.description}</p>
            {!action.enabled && (
              <span className="text-xs text-red-500 mt-2 block">בקרוב</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
