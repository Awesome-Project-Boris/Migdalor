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
  const [view, setView] = useState("events");
  const [events, setEvents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeEventId, setActiveEventId] = useState(null);
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

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/events/all", token);
      setEvents(response.events || []);
      setClasses(response.classes || []);
    } catch (error) {
      showToast("error", `שגיאה בטעינת נתונים: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = (eventSummary = null) => {
    setActiveEventId(eventSummary ? eventSummary.eventId : null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setActiveEventId(null);
    setIsModalOpen(false);
  };

  const handleSaveEvent = async (eventData, eventId) => {
    const isEditMode = !!eventId;
    const typeText = eventData.IsRecurring ? "חוג" : "אירוע";

    // FIX: Map the client-side formData to the server-side DTO, including the PictureId
    const serverEventData = {
      eventName: eventData.EventName,
      description: eventData.Description,
      location: eventData.Location,
      capacity: eventData.Capacity,
      isRecurring: eventData.IsRecurring,
      recurrenceRule: eventData.RecurrenceRule,
      startDate: eventData.StartDate,
      endDate: eventData.EndDate || null,
      hostId: eventData.HostId,
      pictureId: eventData.PictureId, // Add this line to send the PictureId to the server
    };

    try {
      if (isEditMode) {
        await api.put(`/events/admin/${eventId}`, serverEventData, token);
        showToast("success", `${typeText} עודכן בהצלחה!`);
      } else {
        await api.post("/events/admin", serverEventData, token);
        showToast("success", `${typeText} נוצר בהצלחה!`);
      }
      fetchData(); // Refresh data on success
    } catch (error) {
      showToast("error", `שגיאה בשמירת ה${typeText}: ${error.message}`);
      throw error; // Re-throw to keep modal open
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingEvent) return;
    try {
      await api.delete(`/events/admin/${deletingEvent.eventId}`, token);
      showToast("success", `האירוע "${deletingEvent.eventName}" נמחק בהצלחה.`);
      setDeletingEvent(null);
      fetchData();
    } catch (error) {
      showToast("error", `שגיאה במחיקת האירוע: ${error.message}`);
      setDeletingEvent(null);
    }
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

  const dataToDisplay = view === "events" ? events : classes;

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
          data={dataToDisplay}
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
        eventId={activeEventId}
        eventType={view}
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
