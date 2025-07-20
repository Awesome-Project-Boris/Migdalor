import React, { useState, useMemo, useCallback, useEffect } from "react";
import * as XLSX from "xlsx";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../api/apiService";
import SharedTable from "../../components/common/SharedTable";
import Toast from "../../components/common/Toast";
import { Button } from "../../components/ui/button";
import { ArrowRight, Download } from "lucide-react";

// Helper function to get the initial date range (past week)
const getInitialDateRange = () => {
  const formatDate = (date) => {
    const d = new Date(date);
    let month = "" + (d.getMonth() + 1);
    let day = "" + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
  };

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 7);

  return {
    start: formatDate(startDate),
    end: formatDate(endDate),
  };
};

const ActivitiesAndClassesReport = () => {
  const { token } = useAuth();
  const [startDate, setStartDate] = useState(getInitialDateRange().start);
  const [endDate, setEndDate] = useState(getInitialDateRange().end);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [eventSummary, setEventSummary] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Default sort is now oldest to newest
  const [eventSorting, setEventSorting] = useState([
    { id: "eventDate", desc: false },
  ]);
  const [participantSorting, setParticipantSorting] = useState([
    { id: "participantName", desc: false },
  ]);
  const [eventGlobalFilter, setEventGlobalFilter] = useState("");
  const [participantGlobalFilter, setParticipantGlobalFilter] = useState("");

  const [toastState, setToastState] = useState({
    show: false,
    message: "",
    variant: "info",
  });

  const showToast = (variant, message) => {
    setToastState({ show: true, variant, message });
  };

  const handleFetchEvents = useCallback(async () => {
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
  }, [startDate, endDate, token]);

  // Fetch data on initial component load
  useEffect(() => {
    handleFetchEvents();
  }, [handleFetchEvents]);

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

  const handleDownload = () => {
    if (!selectedEvent) return;

    const summaryRows = eventSummary.map((summary) => ({
      __summary_key__:
        summary.status === "Attended" ? "כמות הגיעו" : summary.status,
      __summary_value__: summary.count,
    }));

    const blankRow = { __summary_key__: "", __summary_value__: "" };

    const participantsHeader = {
      __summary_key__: "שם המשתתף",
      __summary_value__: "סטטוס",
    };

    const participantsRows = participants.map((p) => ({
      __summary_key__: p.participantName,
      __summary_value__: p.status === "Attended" ? "הגיע" : p.status,
    }));

    const finalSheetData = [
      ...summaryRows,
      blankRow,
      participantsHeader,
      ...participantsRows,
    ];

    const ws = XLSX.utils.json_to_sheet(finalSheetData, {
      header: ["__summary_key__", "__summary_value__"],
      skipHeader: true,
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "דוח נוכחות");

    XLSX.writeFile(wb, `${selectedEvent.eventName}_report.xlsx`);
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
          <Button
            onClick={() => handleEventSelect(row.original)}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
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
        cell: ({ row }) => {
          return row.original.status === "Attended"
            ? "הגיע"
            : row.original.status;
        },
      },
    ],
    []
  );

  if (selectedEvent) {
    return (
      <div dir="rtl">
        <div className="flex space-x-2 mb-4">
          <Button
            onClick={() => setSelectedEvent(null)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <ArrowRight className="ml-2 h-4 w-4" />
            חזור
          </Button>
          <Button
            onClick={handleDownload}
            className="bg-green-600 hover:bg-green-700"
          >
            <Download className="ml-2 h-4 w-4" />
            הורד דוח
          </Button>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          דוח נוכחות: {selectedEvent.eventName}
        </h2>
        <div className="mb-4 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-2">סיכום:</h3>
          {eventSummary.length > 0 ? (
            <ul className="list-disc list-inside">
              {eventSummary.map((summary, index) => (
                <li key={index} className="font-semibold">
                  {summary.status === "Attended" ? "הגיעו" : summary.status}:{" "}
                  {summary.count}
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
          <SharedTable
            data={participants}
            columns={participantColumns}
            sorting={participantSorting}
            setSorting={setParticipantSorting}
            globalFilter={participantGlobalFilter}
            setGlobalFilter={setParticipantGlobalFilter}
          />
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
      <div className="mb-8 p-4 bg-gray-50 rounded-lg border">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          בחר טווח תאריכים
        </h2>
        <div className="flex items-center space-x-4">
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
            <Button
              onClick={handleFetchEvents}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? "טוען..." : "הפק דוח"}
            </Button>
          </div>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">דוחות אירועים</h2>
      {isLoading && !selectedEvent ? (
        <p>טוען דוחות...</p>
      ) : (
        <SharedTable
          data={events}
          columns={eventColumns}
          sorting={eventSorting}
          setSorting={setEventSorting}
          globalFilter={eventGlobalFilter}
          setGlobalFilter={setEventGlobalFilter}
        />
      )}
    </div>
  );
};

export default ActivitiesAndClassesReport;
