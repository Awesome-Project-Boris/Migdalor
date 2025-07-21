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
import OpeningHourEditModal from "./OpeningHourEditModal";
import ScheduleOverrideModal from "./ScheduleOverrideModal";

const OpeningHoursManagement = () => {
  const { token } = useAuth();

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
  const [hourModal, setHourModal] = useState({ isOpen: false, data: null });
  const [overrideModal, setOverrideModal] = useState({
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
        api.get("/openinghours/services", token),
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
  const handleUpdateOpeningHour = async (updatedHour) => {
    try {
      await api.put(`/openinghours/${updatedHour.hourId}`, updatedHour, token);
      showToast("success", "Opening hour updated successfully.");
      fetchData();
      setHourModal({ isOpen: false, data: null });
    } catch (err) {
      showToast("error", "Failed to update opening hour.");
    }
  };

  const handleSaveOverride = async (overrideData) => {
    const { mode } = overrideModal;
    try {
      if (mode === "add") {
        await api.post("/openinghours/overrides", overrideData, token);
        showToast("success", "Override added successfully.");
      } else {
        await api.put(
          `/openinghours/overrides/${overrideData.overrideId}`,
          overrideData,
          token
        );
        showToast("success", "Override updated successfully.");
      }
      fetchData();
      setOverrideModal({ isOpen: false, mode: "add", data: null });
    } catch (err) {
      showToast("error", `Failed to save override.`);
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
  const dayNames = useMemo(
    () => ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"],
    []
  );

  const servicesColumns = useMemo(
    () => [
      { accessorKey: "hebrewName", header: "שם השירות" },
      {
        accessorKey: "isActive",
        header: "סטטוס",
        cell: (info) => (
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              info.getValue()
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {info.getValue() ? "פעיל" : "לא פעיל"}
          </span>
        ),
      },
    ],
    []
  );

  const hoursColumns = useMemo(
    () => [
      {
        accessorFn: (row) =>
          services.find((s) => s.serviceID === row.serviceId)?.hebrewName ||
          "N/A",
        header: "שירות",
      },
      { accessorFn: (row) => dayNames[row.dayOfWeek], header: "יום" },
      { accessorKey: "openTime", header: "שעת פתיחה" },
      { accessorKey: "closeTime", header: "שעת סגירה" },
      {
        id: "actions",
        header: "עריכה",
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setHourModal({ isOpen: true, data: row.original })}
          >
            <Edit size={16} />
          </Button>
        ),
      },
    ],
    [services, dayNames]
  );

  const overridesColumns = useMemo(
    () => [
      {
        accessorFn: (row) =>
          services.find((s) => s.serviceID === row.serviceId)?.hebrewName ||
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
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setOverrideModal({
                  isOpen: true,
                  mode: "edit",
                  data: row.original,
                })
              }
            >
              <Edit size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700"
              onClick={() => setDeletingOverride(row.original)}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        ),
      },
    ],
    [services]
  );

  // --- Tabs Definition for TabsGroup ---
  const managementTabs = [
    {
      value: "hours",
      label: 'לו"ז שבועי',
      icon: Clock,
      content: (
        <div>
          <SharedTable
            data={openingHours}
            columns={hoursColumns}
            sorting={sorting}
            setSorting={setSorting}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
          />
        </div>
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
      {hourModal.isOpen && (
        <OpeningHourEditModal
          hour={hourModal.data}
          onClose={() => setHourModal({ isOpen: false, data: null })}
          onSave={handleUpdateOpeningHour}
        />
      )}

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
  );
};

export default OpeningHoursManagement;
