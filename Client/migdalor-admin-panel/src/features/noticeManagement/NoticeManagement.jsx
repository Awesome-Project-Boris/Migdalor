import React, { useState, useEffect, useCallback, useMemo } from "react";
import { api } from "../../api/apiService";
import { useAuth } from "../../auth/AuthContext";
import Toast from "../../components/common/Toast";
import SharedTable from "../../components/common/SharedTable";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import EditNoticeModal from "./EditNoticeModal";
import { Edit, Trash2 } from "lucide-react";

// --- Mock Tooltip Components ---
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

const NoticeManagement = () => {
  const { token } = useAuth();
  const [notices, setNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingNotice, setEditingNotice] = useState(null);
  const [deletingNotice, setDeletingNotice] = useState(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([{ id: "creationDate", desc: true }]);

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

  const fetchNotices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.get("/Notices", token);
      setNotices(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load notices.");
      showToast("error", "Failed to load notices.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const handleOpenEditModal = useCallback((notice) => {
    setEditingNotice(notice);
  }, []);

  const handleSave = async (noticeId, updatedNoticeData) => {
    try {
      await api.put(`/Notices/${noticeId}`, updatedNoticeData, token);
      showToast("success", "ההודעה עודכנה בהצלחה.");
      setEditingNotice(null);
      fetchNotices();
    } catch (err) {
      showToast("error", `שגיאה בעדכון ההודעה: ${err.message}`);
      throw err;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingNotice) return;
    try {
      await api.delete(`/Notices/${deletingNotice.noticeId}`, token);
      showToast(
        "success",
        `ההודעה "${deletingNotice.noticeTitle}" נמחקה בהצלחה.`
      );
      setDeletingNotice(null);
      fetchNotices();
    } catch (err) {
      showToast("error", `שגיאה במחיקת ההודעה: ${err.message}`);
      setDeletingNotice(null);
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "noticeTitle",
        header: "כותרת",
      },
      {
        accessorKey: "noticeCategory",
        header: "קטגוריה",
      },
      {
        accessorKey: "hebSenderName",
        header: "שולח",
      },
      {
        accessorKey: "creationDate",
        header: "תאריך",
        cell: ({ row }) =>
          new Date(row.original.creationDate).toLocaleDateString("he-IL"),
      },
      {
        id: "actions",
        header: "פעולות",
        cell: ({ row }) => {
          const notice = row.original;
          return (
            <div className="flex items-center justify-center space-x-2 space-x-reverse">
              <Tooltip>
                <TooltipTrigger>
                  <button
                    onClick={() => handleOpenEditModal(notice)}
                    className="p-2 rounded-full text-blue-600 hover:bg-blue-100"
                  >
                    <Edit size={20} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>ערוך הודעה</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger>
                  <button
                    onClick={() => setDeletingNotice(notice)}
                    className="p-2 rounded-full text-red-600 hover:bg-red-100"
                  >
                    <Trash2 size={20} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>מחק הודעה</p>
                </TooltipContent>
              </Tooltip>
            </div>
          );
        },
      },
    ],
    [handleOpenEditModal]
  );

  if (isLoading) return <div className="text-center p-4">טוען הודעות...</div>;
  if (error) return <div className="text-center p-4 text-red-500">{error}</div>;

  return (
    <TooltipProvider>
      <div className="w-full bg-white p-6 rounded-lg shadow-md" dir="rtl">
        <Toast
          show={toastState.show}
          message={toastState.message}
          variant={toastState.variant}
          onClose={handleCloseToast}
        />
        <h2 className="text-2xl font-bold text-gray-800 mb-4">ניהול הודעות</h2>
        <SharedTable
          data={notices}
          columns={columns}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
          sorting={sorting}
          setSorting={setSorting}
        />
        {editingNotice && (
          <EditNoticeModal
            notice={editingNotice}
            isOpen={!!editingNotice}
            onClose={() => setEditingNotice(null)}
            onSave={handleSave}
          />
        )}
        {deletingNotice && (
          <ConfirmationModal
            title="אישור מחיקה"
            message={`האם אתה בטוח שברצונך למחוק את ההודעה "${deletingNotice.noticeTitle}"?`}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeletingNotice(null)}
          />
        )}
      </div>
    </TooltipProvider>
  );
};

export default NoticeManagement;
