import React, { useState, useMemo, useCallback } from "react";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../api/apiService";
import SharedTable from "../../components/common/SharedTable";
import Toast from "../../components/common/Toast";
import { Button } from "../../components/ui/button";
import { ArrowRight } from "lucide-react";

const ActivitiesAndClassesReport = () => {
  const { token } = useAuth();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [eventSummary, setEventSummary] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toastState, setToastState] = useState({
    show: false,
    message: "",
    variant: "info",
  });

  const showToast = (variant, message) => {
    setToastState({ show: true, variant, message });
  };

  const handleFetchEvents = async () => {
    if (!startDate || !endDate) {
      showToast("warning", "אנא בחר תאריך התחלה וסיום.");
      return;
    }
    setIsLoading(true);
    try {
      const data = await api.get(
        `/reports/eventsByDateRange?startDate=${startDate}&endDate=${endDate}`,
        token
      );
      setEvents(Array.isArray(data) ? data : []);
      if (data.length === 0) {
        showToast("info", "לא נמצאו אירועים בטווח התאריכים שנבחר.");
      }
    } catch (error) {
      showToast("error", `שגיאה בטעינת דוחות: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventSelect = async (event) => {
    setSelectedEvent(event);
    setIsLoading(true);
    try {
      const [participantsData, summaryData] = await Promise.all([
        api.get(`/reports/eventParticipants/${event.eventId}`, token),
        api.get(`/reports/eventSummary/${event.eventId}`, token),
      ]);
      setParticipants(Array.isArray(participantsData) ? participantsData : []);
      setEventSummary(Array.isArray(summaryData) ? summaryData : []);
    } catch (error) {
      showToast("error", `שגיאה בטעינת פרטי האירוע: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const eventColumns = useMemo(
    () => [
      {
        accessorKey: "eventName",
        header: "שם האירוע",
      },
      {
        accessorKey: "eventDate",
        header: "תאריך",
        cell: ({ row }) =>
          new Date(row.original.eventDate).toLocaleDateString("he-IL"),
      },
      {
        accessorKey: "participantCount",
        header: "מספר משתתפים",
      },
      {
        id: "actions",
        header: "פעולות",
        cell: ({ row }) => (
          <Button onClick={() => handleEventSelect(row.original)} size="sm">
            הצג פרטים
          </Button>
        ),
      },
    ],
    []
  );

  const participantColumns = useMemo(
    () => [
      {
        accessorKey: "participantName",
        header: "שם המשתתף",
      },
      {
        accessorKey: "status",
        header: "סטטוס",
      },
    ],
    []
  );

  if (selectedEvent) {
    return (
      <div dir="rtl">
        <Button onClick={() => setSelectedEvent(null)} className="mb-4">
          <ArrowRight className="ml-2 h-4 w-4" />
          חזור לרשימת האירועים
        </Button>
        <h3 className="text-xl font-bold mb-2">
          דוח נוכחות עבור: {selectedEvent.eventName}
        </h3>
        <div className="mb-4">
          <h4 className="font-bold">סיכום:</h4>
          {eventSummary.length > 0 ? (
            <ul className="list-disc list-inside">
              {eventSummary.map((summary, index) => (
                <li key={index}>
                  {summary.status}: {summary.count}
                </li>
              ))}
            </ul>
          ) : (
            <p>אין נתוני סיכום להצגה.</p>
          )}
        </div>
        {isLoading ? (
          <p>טוען משתתפים...</p>
        ) : (
          <SharedTable data={participants} columns={participantColumns} />
        )}
      </div>
    );
  }

  return (
    <div dir="rtl">
      <Toast
        show={toastState.show}
        message={toastState.message}
        variant={toastState.variant}
        onClose={() => setToastState({ ...toastState, show: false })}
      />
      <div className="flex items-center space-x-4 mb-4">
        <div>
          <label
            htmlFor="startDate"
            className="block text-sm font-medium text-gray-700"
          >
            מתאריך
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="endDate"
            className="block text-sm font-medium text-gray-700"
          >
            עד תאריך
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="self-end">
          <Button onClick={handleFetchEvents} disabled={isLoading}>
            {isLoading ? "טוען..." : "הפק דוח"}
          </Button>
        </div>
      </div>
      {isLoading ? (
        <p>טוען דוחות...</p>
      ) : (
        <SharedTable data={events} columns={eventColumns} />
      )}
    </div>
  );
};

export default ActivitiesAndClassesReport;
