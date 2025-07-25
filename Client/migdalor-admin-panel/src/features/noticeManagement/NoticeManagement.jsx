import React, { useState, useEffect, useCallback, useMemo } from "react";
import { api } from "../../api/apiService";
import { useAuth } from "../../auth/AuthContext";
import Toast from "../../components/common/Toast";
import SharedTable from "../../components/common/SharedTable";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import NoticeModal from "./NoticeModal";
import { Edit, Trash2, MessageSquarePlus } from "lucide-react";
import LoadingIndicator from "../../components/common/LoadingIndicator"; // <-- Import the new component

// --- Mock shadcn/ui Component ---
const Button = React.forwardRef(
  ({ className, variant, size, ...props }, ref) => {
    const baseClasses =
      "inline-flex mx-1 items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
    const sizeClasses = size === "sm" ? "h-9 px-3" : "h-10 px-4 py-2";

    let variantClasses;
    switch (variant) {
      case "outline":
        variantClasses =
          "border border-gray-300 bg-transparent hover:bg-gray-100";
        break;
      case "ghost":
        variantClasses = "hover:bg-gray-100";
        break;
      default:
        variantClasses = "bg-blue-600 text-white hover:bg-blue-700";
    }

    return (
      <button
        className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

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
  const { user, token } = useAuth();
  const [notices, setNotices] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeNotice, setActiveNotice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingNotice, setDeletingNotice] = useState(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([{ id: "creationDate", desc: true }]);

  const [toastState, setToastState] = useState({
    show: false,
    message: "",
    variant: "info",
  });

  const userRoles = useMemo(
    () => (user?.role?.split(",") || []).map((role) => role.trim()),
    [user]
  );
  const isAdmin = useMemo(() => userRoles.includes("admin"), [userRoles]);

  const showToast = (variant, message) => {
    setToastState({ show: true, variant, message });
  };

  const handleCloseToast = () => {
    setToastState({ ...toastState, show: false });
  };

  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [noticesData, categoriesData] = await Promise.all([
        api.get("/Notices", token),
        api.get("/Categories", token),
      ]);

      setAllCategories(Array.isArray(categoriesData) ? categoriesData : []);

      const categoriesMap = new Map(
        categoriesData.map((cat) => [cat.categoryHebName, cat.categoryEngName])
      );

      const userCategoryPermissions = new Set(userRoles);

      const filteredNotices = (
        Array.isArray(noticesData) ? noticesData : []
      ).filter((notice) => {
        if (isAdmin) {
          return true;
        }
        const noticeEngCategory = categoriesMap.get(notice.noticeCategory);
        return (
          noticeEngCategory && userCategoryPermissions.has(noticeEngCategory)
        );
      });

      setNotices(filteredNotices);
    } catch (err) {
      const errorMessage = "Failed to load page data.";
      setError(errorMessage);
      showToast("error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [token, isAdmin, userRoles]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleOpenModal = (notice = null) => {
    setActiveNotice(notice);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setActiveNotice(null);
    setIsModalOpen(false);
  };

  const handleSaveNotice = async (noticeData, noticeId) => {
    const isEditMode = !!noticeId;

    if (!user || !user.id) {
      showToast("error", "שגיאה בזיהוי המשתמש. אנא התחבר מחדש.");
      throw new Error("Could not identify user from context.");
    }

    const noticePayload = {
      ...noticeData,
      SenderId: user.id, // Always use the ID of the logged-in admin
    };

    if (isEditMode && !noticePayload.Title.startsWith("עדכון:")) {
      noticePayload.Title = `עדכון: ${noticePayload.Title}`;
    }

    try {
      let savedNotice;
      // Step 1: Save the notice (create or update)
      if (isEditMode) {
        savedNotice = await api.put(
          `/Notices/${noticeId}`,
          noticePayload,
          token
        );
      } else {
        savedNotice = await api.post("/Notices", noticePayload, token);
      }

      if (!savedNotice || !savedNotice.noticeId) {
        throw new Error("יצירת ההודעה נכשלה, השרת לא החזיר מזהה הודעה.");
      }

      showToast("info", "ההודעה נשמרה! שולח התראה...");

      // Step 2: Send the push notification
      const pushMessage = {
        to: "/topics/all",
        title: noticePayload.Title,
        body: noticePayload.Content,
        sound: "default",
        badge: "0",
        data: {
          noticeId: savedNotice.noticeId,
          category: noticePayload.Category,
          hebSenderName: `${user?.hebFirstName} ${user?.hebLastName}`,
        },
      };

      await api.post("/Notifications/broadcast", pushMessage, token);

      showToast("success", "ההודעה וההתראה נשלחו בהצלחה!");
      fetchInitialData(); // Refresh the table
    } catch (err) {
      const action = isEditMode ? "עדכון" : "יצירת";
      showToast("error", `שגיאה ב${action} ההודעה: ${err.message}`);
      throw err; // Re-throw to keep the modal open on error
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
      fetchInitialData();
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
                    onClick={() => handleOpenModal(notice)}
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
    []
  );

  if (isLoading) return <LoadingIndicator text="טוען הודעות..." />; // <-- Use the new component
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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">ניהול הודעות</h2>
          <Button
            onClick={() => handleOpenModal()}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
          >
            <MessageSquarePlus size={16} className="ml-2" />
            הוסף הודעה חדשה
          </Button>
        </div>
        <SharedTable
          data={notices}
          columns={columns}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
          sorting={sorting}
          setSorting={setSorting}
        />

        <NoticeModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveNotice}
          showToast={showToast}
          notice={activeNotice}
          allCategories={allCategories}
          userRoles={userRoles}
          isAdmin={isAdmin}
        />

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
