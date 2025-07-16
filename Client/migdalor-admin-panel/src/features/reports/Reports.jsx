import React, { useState, useMemo, useEffect } from "react";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../api/apiService";
import SharedTable from "../../components/common/SharedTable";
import Toast from "../../components/common/Toast";
import Calendar from "../../components/common/Calendar"; // Import the new component
import { Download } from "lucide-react";

const Reports = () => {
  const { token } = useAuth();
  const [reportData, setReportData] = useState([]);
  const [dailyReportFiles, setDailyReportFiles] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
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

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const [liveData, fileList] = await Promise.all([
          api.get("/reports/bokertov", token),
          api.get("/reports/list", token),
        ]);

        setReportData(Array.isArray(liveData) ? liveData : []);
        setDailyReportFiles(Array.isArray(fileList) ? fileList : []);

        if (!liveData || liveData.length === 0) {
          showToast("info", "No live attendance data found.");
        }
      } catch (error) {
        showToast("error", `Failed to load initial data: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [token]);

  // Create a set of available dates for quick lookup in the Calendar component
  const availableDates = useMemo(() => {
    const dates = new Set();
    dailyReportFiles.forEach((file) => {
      const match = file.match(/(\d{2}-\d{2}-\d{4})/);
      if (match) {
        const [day, month, year] = match[1].split("-");
        dates.add(`${year}-${month}-${day}`);
      }
    });
    return dates;
  }, [dailyReportFiles]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handleDownload = async () => {
    if (!selectedDate) {
      showToast("warning", "אנא בחר תאריך להורדה.");
      return;
    }

    const day = String(selectedDate.getDate()).padStart(2, "0");
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const year = selectedDate.getFullYear();
    const fileName = `BokerTov_Report_${day}-${month}-${year}.xlsx`;

    if (!dailyReportFiles.includes(fileName)) {
      showToast("error", "לא קיים דוח עבור התאריך הנבחר.");
      return;
    }

    setIsDownloading(true);
    try {
      const response = await fetch(
        `${api.API_BASE_URL}/reports/download/${fileName}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showToast("success", "ההורדה החלה!");
    } catch (error) {
      showToast("error", `הורדת הדוח נכשלה: ${error.message}`);
    } finally {
      setIsDownloading(false);
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
      { accessorKey: "residentName", header: "שם הדייר" },
      { accessorKey: "phoneNumber", header: "מספר טלפון" },
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

  const totalEntries = reportData.length;
  const signedInCount = reportData.filter((row) => row.hasSignedIn).length;

  return (
    <div className="w-full bg-white p-6 rounded-lg shadow-md" dir="rtl">
      <Toast
        show={toastState.show}
        message={toastState.message}
        variant={toastState.variant}
        onClose={handleCloseToast}
      />

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          הורדת דוחות יומיים
        </h2>
        <div className="flex flex-col md:flex-row items-start md:space-x-8 md:space-x-reverse bg-gray-50 p-4 rounded-lg border">
          <div className="flex-shrink-0 w-full md:w-auto">
            <Calendar
              availableDates={availableDates}
              onDateSelect={handleDateSelect}
              selectedDate={selectedDate}
            />
          </div>
          <div className="mt-4 md:mt-0 flex flex-col items-start">
            <p className="text-base text-gray-700 mb-4">
              {selectedDate ? (
                <>
                  <strong>תאריך נבחר:</strong>{" "}
                  {selectedDate.toLocaleDateString("he-IL")}
                </>
              ) : (
                "בחר תאריך מהלוח להורדת הדוח."
              )}
            </p>
            <button
              onClick={handleDownload}
              disabled={
                isDownloading ||
                !selectedDate ||
                !availableDates.has(
                  `${selectedDate.getFullYear()}-${String(
                    selectedDate.getMonth() + 1
                  ).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(
                    2,
                    "0"
                  )}`
                )
              }
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center transition-all"
            >
              <Download size={20} className="ml-2" />
              {isDownloading ? "מוריד..." : "הורד דוח"}
            </button>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        דוח נוכחות כללי - בוקר טוב
      </h2>

      {isLoading ? (
        <div className="text-center p-4">טוען נתונים...</div>
      ) : (
        <>
          <SharedTable
            data={reportData}
            columns={columns}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            sorting={sorting}
            setSorting={setSorting}
          />
          {reportData.length > 0 && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg text-center font-bold text-lg">
              סה"כ נרשמו: {signedInCount} מתוך {totalEntries} רשומות
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Reports;
