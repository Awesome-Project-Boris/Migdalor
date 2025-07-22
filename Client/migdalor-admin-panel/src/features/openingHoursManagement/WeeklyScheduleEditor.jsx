import React, { useState, useEffect, useMemo } from "react";
import TabsGroup from "../../components/common/TabsGroup";
import { Button } from "../../components/ui/button";
import { Save } from "lucide-react";

const WeeklyScheduleEditor = ({ services, initialHours, onSave }) => {
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [schedule, setSchedule] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dayNames = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

  // Memoize the creation of the service tree structure to prevent recalculation on every render.
  const servicesTree = useMemo(() => {
    if (!services || services.length === 0) {
      return [];
    }

    const serviceMap = {};
    services.forEach((service) => {
      // FIX: Use 'serviceId' (camelCase) to match the property from the API response.
      serviceMap[service.serviceId] = { ...service, children: [] };
    });

    const rootNodes = [];
    Object.values(serviceMap).forEach((serviceNode) => {
      if (serviceNode.parentService && serviceMap[serviceNode.parentService]) {
        serviceMap[serviceNode.parentService].children.push(serviceNode);
      } else {
        rootNodes.push(serviceNode);
      }
    });

    return rootNodes;
  }, [services]);

  // Set the default selected service when the component loads or services change.
  useEffect(() => {
    if (servicesTree && servicesTree.length > 0 && !selectedServiceId) {
      const firstService = servicesTree[0];
      // FIX: Use 'serviceId' to match the property name.
      setSelectedServiceId(firstService.serviceId);
    }
  }, [servicesTree, selectedServiceId]);

  // Function to create the weekly schedule for the currently selected service from the initialHours prop.
  const createScheduleForService = () => {
    if (!selectedServiceId) return {};

    const serviceHours = initialHours.filter(
      (h) => h.serviceId === selectedServiceId
    );

    const weekSchedule = {};
    dayNames.forEach((name, index) => {
      const serverDayOfWeek = index + 1; // Server uses 1-based index for dayOfWeek (Sunday=1)

      const morning = serviceHours.find(
        (h) => h.dayOfWeek === serverDayOfWeek && h.openTime < "12:00"
      );
      const afternoon = serviceHours.find(
        (h) => h.dayOfWeek === serverDayOfWeek && h.openTime >= "12:00"
      );

      weekSchedule[index] = {
        morning: {
          openTime: morning?.openTime || "00:00",
          closeTime: morning?.closeTime || "00:00",
          hourId: morning?.hourId || null,
        },
        afternoon: {
          openTime: afternoon?.openTime || "00:00",
          closeTime: afternoon?.closeTime || "00:00",
          hourId: afternoon?.hourId || null,
        },
      };
    });
    return weekSchedule;
  };

  // Re-create the schedule whenever the selected service or initial hours change.
  useEffect(() => {
    setSchedule(createScheduleForService());
  }, [selectedServiceId, initialHours]);

  // Handles changes to the time inputs.
  const handleTimeChange = (dayIndex, period, field, value) => {
    setSchedule((prev) => ({
      ...prev,
      [dayIndex]: {
        ...prev[dayIndex],
        [period]: {
          ...prev[dayIndex][period],
          [field]: value,
        },
      },
    }));
  };

  // Compares the current schedule with the initial one and prepares data for the onSave callback.
  const handleSave = async () => {
    if (!selectedServiceId) return;
    setIsSubmitting(true);

    const originalServiceHours = initialHours.filter(
      (h) => h.serviceId === selectedServiceId
    );

    const toCreate = [];
    const toUpdate = [];
    const toDelete = [];

    Object.keys(schedule).forEach((dayIndex) => {
      const day = parseInt(dayIndex, 10);
      const serverDay = day + 1;
      const newDayData = schedule[day];

      // Process morning slot
      const originalMorning = originalServiceHours.find(
        (h) => h.dayOfWeek === serverDay && h.openTime < "12:00"
      );
      const newMorning = newDayData.morning;
      const isMorningSlotActive =
        newMorning.openTime !== "00:00" || newMorning.closeTime !== "00:00";

      if (originalMorning) {
        if (isMorningSlotActive) {
          if (
            originalMorning.openTime !== newMorning.openTime ||
            originalMorning.closeTime !== newMorning.closeTime
          ) {
            toUpdate.push({
              hourId: originalMorning.hourId,
              serviceId: selectedServiceId,
              dayOfWeek: serverDay,
              openTime: newMorning.openTime,
              closeTime: newMorning.closeTime,
            });
          }
        } else {
          toDelete.push(originalMorning.hourId);
        }
      } else if (isMorningSlotActive) {
        toCreate.push({
          serviceId: selectedServiceId,
          dayOfWeek: serverDay,
          openTime: newMorning.openTime,
          closeTime: newMorning.closeTime,
        });
      }

      // Process afternoon slot
      const originalAfternoon = originalServiceHours.find(
        (h) => h.dayOfWeek === serverDay && h.openTime >= "12:00"
      );
      const newAfternoon = newDayData.afternoon;
      const isAfternoonSlotActive =
        newAfternoon.openTime !== "00:00" || newAfternoon.closeTime !== "00:00";

      if (originalAfternoon) {
        if (isAfternoonSlotActive) {
          if (
            originalAfternoon.openTime !== newAfternoon.openTime ||
            originalAfternoon.closeTime !== newAfternoon.closeTime
          ) {
            toUpdate.push({
              hourId: originalAfternoon.hourId,
              serviceId: selectedServiceId,
              dayOfWeek: serverDay,
              openTime: newAfternoon.openTime,
              closeTime: newAfternoon.closeTime,
            });
          }
        } else {
          toDelete.push(originalAfternoon.hourId);
        }
      } else if (isAfternoonSlotActive) {
        toCreate.push({
          serviceId: selectedServiceId,
          dayOfWeek: serverDay,
          openTime: newAfternoon.openTime,
          closeTime: newAfternoon.closeTime,
        });
      }
    });

    try {
      await onSave({ toCreate, toUpdate, toDelete });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Find the currently selected service object to display its name.
  const selectedService = useMemo(() => {
    if (!selectedServiceId || !services) {
      return null;
    }
    return services.find((s) => s.serviceId === selectedServiceId);
  }, [selectedServiceId, services]);

  // Generate tab data for each day of the week.
  const dayTabs = dayNames.map((day, index) => ({
    value: day,
    label: day,
    content: (
      <div className="p-4 bg-gray-50 rounded-lg border" dir="rtl">
        <h3 className="text-lg font-semibold mb-4">
          {`שעות פתיחה ליום ${day}${
            selectedService ? ` - ${selectedService.hebrewName}` : ""
          }`}
        </h3>
        <div className="grid grid-cols-1 gap-4">
          {/* Morning Schedule */}
          <div className="p-4 border rounded-md bg-white">
            <h4 className="font-bold mb-2">בוקר</h4>
            <div className="flex items-center space-x-4 space-x-reverse">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  פתיחה
                </label>
                <input
                  type="time"
                  value={schedule[index]?.morning.openTime || "00:00"}
                  onChange={(e) =>
                    handleTimeChange(
                      index,
                      "morning",
                      "openTime",
                      e.target.value
                    )
                  }
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  סגירה
                </label>
                <input
                  type="time"
                  value={schedule[index]?.morning.closeTime || "00:00"}
                  onChange={(e) =>
                    handleTimeChange(
                      index,
                      "morning",
                      "closeTime",
                      e.target.value
                    )
                  }
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
          {/* Afternoon Schedule */}
          <div className="p-4 border rounded-md bg-white">
            <h4 className="font-bold mb-2">אחר הצהריים</h4>
            <div className="flex items-center space-x-4 space-x-reverse">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  פתיחה
                </label>
                <input
                  type="time"
                  value={schedule[index]?.afternoon.openTime || "00:00"}
                  onChange={(e) =>
                    handleTimeChange(
                      index,
                      "afternoon",
                      "openTime",
                      e.target.value
                    )
                  }
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  סגירה
                </label>
                <input
                  type="time"
                  value={schedule[index]?.afternoon.closeTime || "00:00"}
                  onChange={(e) =>
                    handleTimeChange(
                      index,
                      "afternoon",
                      "closeTime",
                      e.target.value
                    )
                  }
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  }));

  if (!services || services.length === 0) {
    return (
      <div className="text-center p-4 text-gray-500">
        אין שירותים זמינים להגדרה.
      </div>
    );
  }

  return (
    <div className="flex flex-row-reverse gap-6">
      <aside className="w-1/4 p-4 bg-gray-100 rounded-lg border">
        <h3 className="text-lg font-bold mb-4 text-right">שירותים</h3>
        <ul>
          {servicesTree.map((parentService) => (
            // FIX: Use 'serviceId' for the key to match the API data.
            <li key={parentService.serviceId}>
              <button
                // FIX: Use 'serviceId' to match the API data.
                onClick={() => setSelectedServiceId(parentService.serviceId)}
                className={`w-full text-right p-3 rounded-md text-sm font-medium transition-colors ${
                  selectedServiceId === parentService.serviceId
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-200"
                }`}
              >
                {parentService.hebrewName}
              </button>
              {parentService.children.length > 0 && (
                <ul className="pr-4 border-r-2 border-gray-200 mr-2 my-1">
                  {parentService.children.map((childService) => (
                    // FIX: Use 'serviceId' for the key to match the API data.
                    <li key={childService.serviceId}>
                      <button
                        // FIX: Use 'serviceId' to match the API data.
                        onClick={() =>
                          setSelectedServiceId(childService.serviceId)
                        }
                        className={`w-full text-right p-3 rounded-md text-sm font-medium transition-colors ${
                          selectedServiceId === childService.serviceId
                            ? "bg-blue-500 text-white"
                            : "hover:bg-gray-200"
                        }`}
                      >
                        {childService.hebrewName}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </aside>
      <main className="w-3/4">
        <TabsGroup tabs={dayTabs} />
        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSubmitting || !selectedServiceId}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Save size={16} className="ml-2" />
            {isSubmitting ? "שומר..." : "שמור שינויים"}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default WeeklyScheduleEditor;
