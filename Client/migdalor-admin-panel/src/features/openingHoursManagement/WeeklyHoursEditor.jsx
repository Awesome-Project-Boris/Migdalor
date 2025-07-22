import React, { useState } from "react";
import { ChevronDown, Clock } from "lucide-react";

const WeeklyHoursEditor = ({
  services,
  openingHours,
  onDaySelect,
  selectedService,
  setSelectedService,
}) => {
  const dayNames = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

  const handleDayChange = (e) => {
    const dayIndex = parseInt(e.target.value, 10);
    if (isNaN(dayIndex) || !selectedService) return;

    const hourData = openingHours.find(
      (h) =>
        h.serviceId === selectedService.serviceID && h.dayOfWeek === dayIndex
    );

    onDaySelect(
      hourData || {
        serviceId: selectedService.serviceID,
        dayOfWeek: dayIndex,
        openTime: "00:00",
        closeTime: "00:00",
      }
    );
  };

  return (
    <div className="flex flex-row-reverse w-full" dir="rtl">
      {/* Sidebar for Services */}
      <div className="w-1/4 border-l-2 border-gray-200 pl-4 ml-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">בחר שירות</h3>
        <ul className="space-y-2">
          {services.map((service) => (
            <li key={service.serviceID}>
              <button
                onClick={() => setSelectedService(service)}
                className={`w-full text-right px-4 py-2 rounded-lg transition-colors text-base ${
                  selectedService?.serviceID === service.serviceID
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                {service.hebrewName}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="w-3/4">
        {selectedService ? (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              עריכת שעות עבור:{" "}
              <span className="text-blue-600">
                {selectedService.hebrewName}
              </span>
            </h3>
            <div className="relative">
              <label
                htmlFor="day-select"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                בחר יום לעריכה
              </label>
              <div className="relative">
                <select
                  id="day-select"
                  onChange={handleDayChange}
                  defaultValue=""
                  className="w-full p-3 bg-white border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" disabled>
                    -- בחר יום --
                  </option>
                  {dayNames.map((day, index) => (
                    <option key={index} value={index}>
                      {day}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-2 text-gray-700">
                  <ChevronDown size={20} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 bg-gray-50 rounded-lg p-8">
            <Clock size={48} className="mb-4" />
            <h3 className="text-xl font-semibold">נא לבחור שירות מהרשימה</h3>
            <p>בחר שירות מהתפריט בצד ימין כדי להתחיל לערוך את שעות הפתיחה.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyHoursEditor;
