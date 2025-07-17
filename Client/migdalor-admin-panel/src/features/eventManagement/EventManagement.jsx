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

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const isRecurring = view === "classes";
    try {
      const result = await api.get(`/events?isRecurring=${isRecurring}`, token);
      setData(Array.isArray(result) ? result : []);
    } catch (error) {
      showToast("error", `שגיאה בטעינת הנתונים: ${error.message}`);
      setData([]); // Clear data on error
    } finally {
      setIsLoading(false);
    }
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

    try {
      if (isEditMode) {
        await api.put(`/events/${eventId}`, eventData, token);
      } else {
        await api.post("/events", eventData, token);
      }
      showToast("success", `${typeText} נשמר בהצלחה!`);
      fetchData(); // Refresh data from server
    } catch (error) {
      showToast("error", `${action} ${typeText} נכשל: ${error.message}`);
      throw error; // Re-throw to keep modal open
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingEvent) return;
    try {
      await api.delete(`/events/${deletingEvent.eventID}`, token);
      showToast("success", `האירוע "${deletingEvent.eventName}" נמחק בהצלחה.`);
      setDeletingEvent(null);
      fetchData(); // Refresh data from server
    } catch (error) {
      showToast("error", `מחיקת האירוע נכשלה: ${error.message}`);
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
          new Date(row.original.startDate).toLocaleString("he-IL", {
            dateStyle: "short",
            timeStyle: "short",
          }),
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
              title="ערוך"
            >
              <Edit size={20} />
            </button>
            <button
              onClick={() => setDeletingEvent(row.original)}
              className="p-2 rounded-full text-red-600 hover:bg-red-100"
              title="מחק"
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
