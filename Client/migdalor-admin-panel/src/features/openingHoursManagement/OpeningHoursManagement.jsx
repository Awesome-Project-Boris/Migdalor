// src/features/openingHoursManagement/OpeningHoursManagement.jsx
import React, { useState, useEffect } from "react";
import { api } from "../../api/apiService"; // Adjust path if needed
import { useAuth } from "../../auth/AuthContext";

// --- Main Component ---
const OpeningHoursManagement = () => {
  const { token } = useAuth();
  const [services, setServices] = useState([]);
  const [openingHours, setOpeningHours] = useState([]);
  const [overrides, setOverrides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [servicesData, hoursData, overridesData] = await Promise.all([
          api.get("/openinghours/services", token),
          api.get("/openinghours", token),
          api.get("/openinghours/overrides", token),
        ]);
        setServices(servicesData);
        setOpeningHours(hoursData);
        setOverrides(overridesData);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-8 bg-gray-50 min-h-full" dir="rtl">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        ניהול שעות פתיחה
      </h1>

      <div className="space-y-8">
        <ServiceList services={services} />
        <OpeningHoursList openingHours={openingHours} services={services} />
        <ScheduleOverrideList overrides={overrides} services={services} />
      </div>
    </div>
  );
};

// --- Sub-components ---

const ServiceList = ({ services }) => (
  <section className="bg-white p-6 rounded-lg shadow-md">
    <h2 className="text-2xl font-semibold text-gray-700 mb-4">שירותים</h2>
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-200">
          <tr>
            <th className="py-2 px-4 text-right">שם השירות</th>
            <th className="py-2 px-4 text-right">פעיל/לא פעיל</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <tr key={service.serviceID} className="border-b">
              <td className="py-2 px-4">{service.hebrewName}</td>
              <td className="py-2 px-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    service.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {service.isActive ? "פעיל" : "לא פעיל"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

const OpeningHoursList = ({ openingHours, services }) => {
  const getServiceName = (serviceId) => {
    const service = services.find((s) => s.serviceID === serviceId);
    return service ? service.hebrewName : "N/A";
  };

  const formatTime = (time) => time.substring(0, 5);
  const dayNames = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

  return (
    <section className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">
        שעות פתיחה שבועיות
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-2 px-4 text-right">שירות</th>
              <th className="py-2 px-4 text-right">יום בשבוע</th>
              <th className="py-2 px-4 text-right">שעת פתיחה</th>
              <th className="py-2 px-4 text-right">שעת סגירה</th>
              <th className="py-2 px-4 text-right">סטטוס</th>
            </tr>
          </thead>
          <tbody>
            {openingHours.map((hour) => (
              <tr key={hour.id} className="border-b">
                <td className="py-2 px-4">{getServiceName(hour.serviceId)}</td>
                <td className="py-2 px-4">{dayNames[hour.dayOfWeek]}</td>
                <td className="py-2 px-4">{formatTime(hour.fromTime)}</td>
                <td className="py-2 px-4">{formatTime(hour.toTime)}</td>
                <td className="py-2 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      hour.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {hour.isActive ? "פעיל" : "לא פעיל"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

const ScheduleOverrideList = ({ overrides, services }) => {
  const getServiceName = (serviceId) => {
    const service = services.find((s) => s.serviceID === serviceId);
    return service ? service.hebrewName : "N/A";
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleString("he-IL");

  return (
    <section className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">חריגות בלוז</h2>
      {/* Add button can go here */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-2 px-4 text-right">שירות</th>
              <th className="py-2 px-4 text-right">תיאור</th>
              <th className="py-2 px-4 text-right">שעת התחלה</th>
              <th className="py-2 px-4 text-right">שעת סיום</th>
              <th className="py-2 px-4 text-right">סטטוס</th>
            </tr>
          </thead>
          <tbody>
            {overrides.map((override) => (
              <tr key={override.id} className="border-b">
                <td className="py-2 px-4">
                  {getServiceName(override.serviceId)}
                </td>
                <td className="py-2 px-4">{override.description}</td>
                <td className="py-2 px-4">{formatDate(override.startTime)}</td>
                <td className="py-2 px-4">{formatDate(override.endTime)}</td>
                <td className="py-2 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      override.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {override.isActive ? "פעיל" : "לא פעיל"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default OpeningHoursManagement;
