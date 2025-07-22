import React, { useState, useEffect, useCallback, useMemo } from "react";
import { api } from "../../api/apiService";
import { useAuth } from "../../auth/AuthContext";
import { Edit, Trash2, PlusCircle, Clock, Calendar, List } from "lucide-react";

// Common Components
import SharedTable from "../../components/common/SharedTable";
import Toast from "../../components/common/Toast";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import TabsGroup from "../../components/common/TabsGroup";
import { Button } from "../../components/ui/button";

// Page-specific Modals
import ScheduleOverrideModal from "./ScheduleOverrideModal";
import WeeklyScheduleEditor from "./WeeklyScheduleEditor";
import ServiceModal from "./ServiceModal";

// --- Mock Tooltip Components (from UserManagement.jsx) ---
const TooltipProvider = ({ children }) => <>{children}</>;
const Tooltip = ({ children }) => (
  <div className="relative inline-flex group">{children}</div>
);
const TooltipTrigger = ({ children }) => <>{children}</>;
const TooltipContent = ({ children, ...props }) => (
  <div
    className="absolute bottom-full mb-2 w-max px-2 py-1 text-xs font-semibold text-white bg-gray-900 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 transform -translate-x-1/2 left-1/2"
    {...props}
  >
    {children}
  </div>
);

const OpeningHoursManagement = () => {
  const { token, user } = useAuth(); // Get user for senderId

  // Data states
  const [services, setServices] = useState([]);
  const [openingHours, setOpeningHours] = useState([]);
  const [overrides, setOverrides] = useState([]);

  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [toastState, setToastState] = useState({
    show: false,
    message: "",
    variant: "info",
  });

  // Modal states
  const [overrideModal, setOverrideModal] = useState({
    isOpen: false,
    mode: "add",
    data: null,
  });
  const [serviceModal, setServiceModal] = useState({
    isOpen: false,
    mode: "add",
    data: null,
  });
  const [deletingOverride, setDeletingOverride] = useState(null);

  // Table states
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // --- Data Fetching ---
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [servicesData, hoursData, overridesData] = await Promise.all([
        api.get("/services", token),
        api.get("/openinghours", token),
        api.get("/openinghours/overrides", token),
      ]);
      setServices(servicesData);
      setOpeningHours(hoursData);
      setOverrides(overridesData);
    } catch (error) {
      showToast("error", `Failed to fetch data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- UI Handlers ---
  const showToast = (variant, message) =>
    setToastState({ show: true, variant, message });
  const handleCloseToast = () => setToastState({ ...toastState, show: false });

  // --- CRUD Handlers ---

  const handleUpdateOpeningHours = async (updateData) => {
    try {
      await api.post("/openinghours/batch-update", updateData, token);
      showToast("success", "Weekly schedule updated successfully.");
      fetchData();
    } catch (err) {
      showToast("error", `Failed to update schedule: ${err.message}`);
      console.error("Schedule update error:", err);
    }
  };

  const handleSaveService = async (serviceData) => {
    const { mode, data } = serviceModal;
    const dto = {
      ServiceID: data?.serviceID || 0,
      HebrewName: serviceData.hebrewName,
      EnglishName: serviceData.englishName,
      HebrewDescription: serviceData.hebrewDescription,
      EnglishDescription: serviceData.englishDescription,
      HebrewAddendum: serviceData.hebrewAddendum,
      EnglishAddendum: serviceData.englishAddendum,
      ParentService: serviceData.parentServiceID,
      PictureID: serviceData.pictureId,
      IsActive: serviceData.isActive,
    };

    try {
      if (mode === "add") {
        await api.post("/services", dto, token);
        showToast("success", "Service created successfully.");
      } else {
        await api.put(`/services/${data.serviceID}`, dto, token);
        showToast("success", "Service updated successfully.");
      }
      fetchData();
      setServiceModal({ isOpen: false, mode: "add", data: null });
    } catch (err) {
      showToast("error", `Failed to save service: ${err.message}`);
      throw err;
    }
  };

  // FIX: This function now also creates a notice and broadcasts a notification.
  const handleSaveOverride = async (overrideData) => {
    const { mode } = overrideModal;

    if (
      overrideData.serviceId === null ||
      overrideData.serviceId === undefined ||
      overrideData.serviceId === ""
    ) {
      showToast("error", "Please select a service.");
      return;
    }

    const payload = {
      ...overrideData,
      serviceId: parseInt(overrideData.serviceId, 10),
    };

    try {
      // Step 1: Save the override
      let savedOverride;
      if (mode === "add") {
        savedOverride = await api.post(
          "/openinghours/overrides",
          payload,
          token
        );
      } else {
        await api.put(
          `/openinghours/overrides/${payload.overrideId}`,
          payload,
          token
        );
        savedOverride = payload; // Use existing payload for info
      }
      showToast("success", "Override saved successfully.");
      fetchData(); // Refetch data to show the change immediately
      setOverrideModal({ isOpen: false, mode: "add", data: null });

      // Step 2: Create and post a notice about the change
      try {
        const service = services.find((s) => s.serviceId === payload.serviceId);
        const serviceName = service ? service.hebrewName : "שירות";
        const formattedDate = new Date(payload.overrideDate).toLocaleDateString(
          "he-IL"
        );
        const statusText = payload.isOpen
          ? `פתוח בין השעות ${payload.openTime} - ${payload.closeTime}`
          : "סגור";

        const noticeTitle = `עדכון שעות פתיחה: ${serviceName}`;
        let noticeContent = `שינוי בלוח הזמנים עבור שירות '${serviceName}' בתאריך ${formattedDate}.\nהשירות יהיה ${statusText}.`;
        if (payload.notes) {
          noticeContent += `\nהערות: ${payload.notes}`;
        }

        const noticeDto = {
          Title: noticeTitle,
          Content: noticeContent, // Corrected from Body to Content
          SenderId: user.id, // Corrected from user.personId to user.id
          Category: "ספקי שירות", //do not remove or rename this category ever and all will be well!
        };

        const createdNotice = await api.post("/notices", noticeDto, token);
        showToast("success", "Notice created successfully.");

        // Step 3: Broadcast a push notification
        const pushMessage = {
          to: "/topics/all",
          title: noticeTitle,
          body: noticeContent,
          sound: "default",
          badge: "0",
          data: {
            noticeId: createdNotice.noticeId,
            category: noticeDto.Category,
            hebSenderName: `${user?.hebFirstName} ${user?.hebLastName}`,
          },
        };

        await api.post("/notifications/broadcast", pushMessage, token);
        showToast("success", "Notification sent to all users.");
      } catch (notificationError) {
        showToast(
          "warning",
          `Override was saved, but failed to send notification: ${notificationError.message}`
        );
      }
    } catch (err) {
      showToast("error", `Failed to save override: ${err.message}`);
    }
  };

  const confirmDeleteOverride = async () => {
    if (!deletingOverride) return;
    try {
      await api.delete(
        `/openinghours/overrides/${deletingOverride.overrideId}`,
        token
      );
      showToast("success", "Override deleted successfully.");
      fetchData();
      setDeletingOverride(null);
    } catch (err) {
      showToast("error", "Failed to delete override.");
    }
  };

  // --- Table Column Definitions ---
  const servicesColumns = useMemo(
    () => [
      { accessorKey: "hebrewName", header: "שם השירות" },
      {
        accessorKey: "isActive",
        header: "סטטוס",
        cell: ({ row }) => (
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              row.original.isActive
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {row.original.isActive ? "פעיל" : "לא פעיל"}
          </span>
        ),
      },
      {
        id: "actions",
        header: "פעולות",
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <Tooltip>
              <TooltipTrigger>
                <button
                  onClick={() =>
                    setServiceModal({
                      isOpen: true,
                      mode: "edit",
                      data: row.original,
                    })
                  }
                  className="p-2 rounded-full text-blue-600 hover:bg-blue-100"
                >
                  <Edit size={20} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>ערוך שירות</p>
              </TooltipContent>
            </Tooltip>
          </div>
        ),
      },
    ],
    []
  );

  const overridesColumns = useMemo(
    () => [
      {
        accessorFn: (row) =>
          services.find((s) => s.serviceId === row.serviceId)?.hebrewName ||
          "N/A",
        header: "שירות",
      },
      {
        accessorFn: (row) =>
          new Date(row.overrideDate).toLocaleDateString("he-IL"),
        header: "תאריך",
      },
      {
        accessorKey: "isOpen",
        header: "סטטוס",
        cell: (info) => (
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              info.getValue()
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {info.getValue() ? "פתוח" : "סגור"}
          </span>
        ),
      },
      { accessorFn: (row) => row.openTime || "—", header: "פתיחה" },
      { accessorFn: (row) => row.closeTime || "—", header: "סגירה" },
      { accessorKey: "notes", header: "הערות" },
      {
        id: "actions",
        header: "פעולות",
        cell: ({ row }) => (
          <div className="flex items-center justify-center space-x-2 space-x-reverse">
            <Tooltip>
              <TooltipTrigger>
                <button
                  onClick={() =>
                    setOverrideModal({
                      isOpen: true,
                      mode: "edit",
                      data: row.original,
                    })
                  }
                  className="p-2 rounded-full text-blue-600 hover:bg-blue-100"
                >
                  <Edit size={20} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>ערוך חריגה</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger>
                <button
                  onClick={() => setDeletingOverride(row.original)}
                  className="p-2 rounded-full text-red-600 hover:bg-red-100"
                >
                  <Trash2 size={20} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>מחק חריגה</p>
              </TooltipContent>
            </Tooltip>
          </div>
        ),
      },
    ],
    [services]
  );

  // --- Tabs Definition for TabsGroup ---
  const managementTabs = [
    {
      value: "weekly",
      label: 'לו"ז שבועי',
      icon: Clock,
      content: (
        <WeeklyScheduleEditor
          services={services}
          initialHours={openingHours}
          onSave={handleUpdateOpeningHours}
        />
      ),
    },
    {
      value: "overrides",
      label: 'חריגות בלו"ז',
      icon: Calendar,
      content: (
        <div>
          <div className="flex justify-end mb-4">
            <Button
              onClick={() =>
                setOverrideModal({ isOpen: true, mode: "add", data: null })
              }
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <PlusCircle size={16} className="mr-2" />
              הוסף חריגה
            </Button>
          </div>
          <SharedTable
            data={overrides}
            columns={overridesColumns}
            sorting={sorting}
            setSorting={setSorting}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
          />
        </div>
      ),
    },
    {
      value: "services",
      label: "שירותים",
      icon: List,
      content: (
        <div>
          <div className="flex justify-end mb-4">
            <Button
              onClick={() =>
                setServiceModal({ isOpen: true, mode: "add", data: null })
              }
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <PlusCircle size={16} className="mr-2" />
              הוסף שירות חדש
            </Button>
          </div>
          <SharedTable
            data={services}
            columns={servicesColumns}
            sorting={sorting}
            setSorting={setSorting}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
          />
        </div>
      ),
    },
  ];

  return (
    <TooltipProvider>
      <div className="w-full bg-white p-6 rounded-lg shadow-md" dir="rtl">
        <Toast
          show={toastState.show}
          message={toastState.message}
          variant={toastState.variant}
          onClose={handleCloseToast}
        />

        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          ניהול שעות פתיחה
        </h2>

        <TabsGroup tabs={managementTabs} />

        {/* Modals */}
        {overrideModal.isOpen && (
          <ScheduleOverrideModal
            mode={overrideModal.mode}
            override={overrideModal.data}
            services={services}
            onClose={() =>
              setOverrideModal({ isOpen: false, mode: "add", data: null })
            }
            onSave={handleSaveOverride}
          />
        )}

        {serviceModal.isOpen && (
          <ServiceModal
            isOpen={serviceModal.isOpen}
            onClose={() =>
              setServiceModal({ isOpen: false, mode: "add", data: null })
            }
            onSave={handleSaveService}
            mode={serviceModal.mode}
            service={serviceModal.data}
            services={services}
          />
        )}

        {deletingOverride && (
          <ConfirmationModal
            title="אישור מחיקת חריגה"
            message={`האם אתה בטוח שברצונך למחוק את החריגה בתאריך ${new Date(
              deletingOverride.overrideDate
            ).toLocaleDateString("he-IL")}?`}
            onConfirm={confirmDeleteOverride}
            onCancel={() => setDeletingOverride(null)}
          />
        )}
      </div>
    </TooltipProvider>
  );
};

export default OpeningHoursManagement;
