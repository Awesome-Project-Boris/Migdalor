import React, { useState, useMemo } from "react";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../api/apiService";
import SharedTable from "../../components/common/SharedTable";
import Toast from "../../components/common/Toast";

const Reports = () => {
  const { token } = useAuth();
  const [reportData, setReportData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sorting, setSorting] = useState([
    { id: "attendanceDate", desc: true },
  ]);
  const [globalFilter, setGlobalFilter] = useState("");

  const [toastState, setToastState] = useState({
    show: false,
    message: "",
    variant: "info",
  });

  const showToast = (variant, message) => {
    setToastState({ show: true, variant, message });
  };

  const handleCloseToast = () => {
    setToastState({ ...toastState, show: false });
  };

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      showToast("warning", "Please select both a start and end date.");
      return;
    }
    setIsLoading(true);
    setReportData([]);
    try {
      const data = await api.get(
        `/reports/bokertov?startDate=${startDate}&endDate=${endDate}`,
        token
      );
      setReportData(Array.isArray(data) ? data : []);
      if (!data || data.length === 0) {
        showToast("info", "No data found for the selected date range.");
      }
    } catch (error) {
      showToast("error", `Failed to generate report: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "attendanceDate",
        header: "תאריך",
        cell: ({ row }) =>
          new Date(row.original.attendanceDate).toLocaleDateString("he-IL"),
      },
      {
        accessorKey: "residentName",
        header: "שם הדייר",
      },
      {
        accessorKey: "phoneNumber",
        header: "מספר טלפון",
      },
      {
        accessorKey: "hasSignedIn",
        header: "נרשם/ה",
        cell: ({ row }) => (row.original.hasSignedIn ? "כן" : "לא"),
      },
      {
        accessorKey: "signInTime",
        header: "זמן רישום",
        cell: ({ row }) =>
          row.original.signInTime
            ? new Date(row.original.signInTime).toLocaleTimeString("he-IL")
            : "N/A",
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
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        דוחות נוכחות - בוקר טוב
      </h2>

      <div className="flex items-end space-x-4 space-x-reverse bg-gray-50 p-4 rounded-lg mb-6 border">
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
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
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
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <button
          onClick={handleGenerateReport}
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isLoading ? "טוען..." : "הפק דוח"}
        </button>
      </div>

      {reportData.length > 0 && (
        <SharedTable
          data={reportData}
          columns={columns}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
          sorting={sorting}
          setSorting={setSorting}
        />
      )}
    </div>
  );
};

export default Reports;
