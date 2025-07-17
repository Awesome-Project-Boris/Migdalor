import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../api/apiService";
import SharedTable from "../../components/common/SharedTable";
import Toast from "../../components/common/Toast";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import EventModal from "./EventModal";
import { Edit, Trash2, PlusCircle, Calendar, Users } from "lucide-react";

const EventManagement = () => {
  const { token } = useAuth();
  const [view, setView] = useState("events"); // 'events' or 'classes'
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeEvent, setActiveEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState(null);

  const [sorting, setSorting] = useState([{ id: "startDate", desc: true }]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [toastState, setToastState] = useState({
    show: false,
    message: "",
    variant: "info",
  });

  const showToast = (variant, message) =>
    setToastState({ show: true, variant, message });
  const handleCloseToast = () => setToastState({ ...toastState, show: false });

  // MOCK API CALL - Replace with real API calls later
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    // In a real app, you would call different endpoints based on the view
    // For now, we'll use mock data.
    const mockEvents = [
      {
        eventID: 1,
        eventName: "הרצאה על תזונה",
        hostName: 'ד"ר כהן',
        location: "אודיטוריום",
        startDate: "2025-08-01T10:00:00",
        isRecurring: false,
        capacity: 100,
      },
      {
        eventID: 2,
        eventName: "ערב סרט",
        hostName: "ועדת תרבות",
        location: "מועדון",
        startDate: "2025-08-05T19:30:00",
        isRecurring: false,
        capacity: 50,
      },
    ];
    const mockClasses = [
      {
        eventID: 3,
        eventName: "חוג יוגה",
        hostName: "אלה יוגה",
        location: "סטודיו",
        startDate: "2025-07-21T08:00:00",
        isRecurring: true,
        recurrenceRule: "FREQ=WEEKLY;BYDAY=MO",
        capacity: 20,
      },
      {
        eventID: 4,
        eventName: "סדנת ציור",
        hostName: "אמן הבית",
        location: "חדר אומנות",
        startDate: "2025-07-22T14:00:00",
        isRecurring: true,
        recurrenceRule: "FREQ=WEEKLY;BYDAY=TU",
        capacity: 15,
      },
    ];

    setTimeout(() => {
      setData(view === "events" ? mockEvents : mockClasses);
      setIsLoading(false);
    }, 500);
  }, [view, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = (event = null) => {
    setActiveEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setActiveEvent(null);
    setIsModalOpen(false);
  };

  const handleSaveEvent = async (eventData, eventId) => {
    const isEditMode = !!eventId;
    const action = isEditMode ? "עדכון" : "יצירת";
    const typeText = eventData.IsRecurring ? "החוג" : "האירוע";

    // MOCK SAVE - Replace with real API call
    console.log(`Saving ${typeText}`, eventData);
    showToast("success", `${typeText} נשמר בהצלחה!`);
    fetchData(); // Refresh data
  };

  const handleDeleteConfirm = async () => {
    // MOCK DELETE - Replace with real API call
    showToast("success", `האירוע "${deletingEvent.eventName}" נמחק בהצלחה.`);
    setDeletingEvent(null);
    fetchData(); // Refresh data
  };

  const columns = useMemo(
    () => [
      { accessorKey: "eventName", header: "שם" },
      { accessorKey: "hostName", header: "מארח/מדריך" },
      { accessorKey: "location", header: "מיקום" },
      {
        accessorKey: "startDate",
        header: "תאריך התחלה",
        cell: ({ row }) =>
          new Date(row.original.startDate).toLocaleString("he-IL"),
      },
      { accessorKey: "capacity", header: "קיבולת" },
      {
        id: "actions",
        header: "פעולות",
        cell: ({ row }) => (
          <div className="flex items-center justify-center space-x-2 space-x-reverse">
            <button
              onClick={() => handleOpenModal(row.original)}
              className="p-2 rounded-full text-blue-600 hover:bg-blue-100"
            >
              <Edit size={20} />
            </button>
            <button
              onClick={() => setDeletingEvent(row.original)}
              className="p-2 rounded-full text-red-600 hover:bg-red-100"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="w-full bg-white p-6 rounded-lg shadow-md" dir="rtl">
      <Toast
        show={toastState.show}
        message={toastState.message}
        variant={toastState.variant}
        onClose={handleCloseToast}
      />

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          ניהול אירועים וחוגים
        </h2>
        <div className="flex items-center bg-gray-200 rounded-full p-1">
          <button
            onClick={() => setView("events")}
            className={`px-4 py-1.5 text-sm font-semibold rounded-full flex items-center transition-colors ${
              view === "events"
                ? "bg-white text-blue-600 shadow"
                : "bg-transparent text-gray-600"
            }`}
          >
            <Calendar className="ml-2 h-4 w-4" />
            אירועים
          </button>
          <button
            onClick={() => setView("classes")}
            className={`px-4 py-1.5 text-sm font-semibold rounded-full flex items-center transition-colors ${
              view === "classes"
                ? "bg-white text-blue-600 shadow"
                : "bg-transparent text-gray-600"
            }`}
          >
            <Users className="ml-2 h-4 w-4" />
            חוגים
          </button>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
        >
          <PlusCircle size={20} className="ml-2" />
          {view === "events" ? "צור אירוע חדש" : "צור חוג חדש"}
        </button>
      </div>

      {isLoading ? (
        <div className="text-center p-4">טוען נתונים...</div>
      ) : (
        <SharedTable
          data={data}
          columns={columns}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
          sorting={sorting}
          setSorting={setSorting}
        />
      )}

      <EventModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveEvent}
        showToast={showToast}
        event={activeEvent}
        eventType={view === "events" ? "event" : "class"}
      />

      {deletingEvent && (
        <ConfirmationModal
          title="אישור מחיקה"
          message={`האם אתה בטוח שברצונך למחוק את "${deletingEvent.eventName}"?`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingEvent(null)}
        />
      )}
    </div>
  );
};

export default EventManagement;
