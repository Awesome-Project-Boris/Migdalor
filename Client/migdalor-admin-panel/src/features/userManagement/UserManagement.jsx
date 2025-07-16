import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Edit,
  Trash2,
  RotateCw,
  UserPlus,
  ShieldPlus,
  KeyRound,
  Users,
  UserCog,
  UserCheck,
} from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../api/apiService";
import EditUserModal from "./EditUserModal";
import CreateUserModal from "./CreateUserModal";
import ResetPasswordModal from "./ResetPasswordModal";
import ChangeRoleModal from "./ChangeRoleModal";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import Toast from "../../components/common/Toast";
import SharedTable from "../../components/common/SharedTable";

// --- Mock shadcn/ui Components ---
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

// --- Main UserManagement Component ---

const UserManagement = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [view, setView] = useState("residents");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [passwordResetUser, setPasswordResetUser] = useState(null);
  const [roleChangeUser, setRoleChangeUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] =
    useState(false);
  const [isChangeRoleModalOpen, setIsChangeRoleModalOpen] = useState(false);
  const [createUserType, setCreateUserType] = useState("resident");
  const [sorting, setSorting] = useState([{ id: "dateOfArrival", desc: true }]);
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

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (view === "residents") {
        const data = await api.get("/Resident/residents", token);
        setUsers(Array.isArray(data) ? data : []);
      } else {
        const data = await api.get("/People/admins", token);
        const normalizedAdmins = data.map((admin) => ({
          ...admin,
          id: admin.personId,
          fullName: `${admin.hebFirstName} ${admin.hebLastName}`.trim(),
          isActive: true,
        }));
        setAdmins(Array.isArray(normalizedAdmins) ? normalizedAdmins : []);
      }
    } catch (err) {
      const message =
        view === "residents" ? "נכשל בטעינת הדיירים." : "נכשל בטעינת המנהלים.";
      setError(message);
      showToast("error", message);
    } finally {
      setIsLoading(false);
    }
  }, [token, view]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenEditModal = useCallback((user) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  }, []);

  const handleOpenCreateModal = (type) => {
    setCreateUserType(type);
    setIsCreateModalOpen(true);
  };

  const handleOpenResetPasswordModal = useCallback((user) => {
    setPasswordResetUser(user);
    setIsResetPasswordModalOpen(true);
  }, []);

  const handleOpenChangeRoleModal = useCallback((user) => {
    setRoleChangeUser(user);
    setIsChangeRoleModalOpen(true);
  }, []);

  const handleCloseModals = () => {
    setEditingUser(null);
    setPasswordResetUser(null);
    setRoleChangeUser(null);
    setIsEditModalOpen(false);
    setIsCreateModalOpen(false);
    setIsResetPasswordModalOpen(false);
    setIsChangeRoleModalOpen(false);
  };

  const handleSave = async (userId, updatedUserData) => {
    try {
      if (updatedUserData.gender) {
        updatedUserData.gender = updatedUserData.gender === "זכר" ? "M" : "F";
      }
      await api.put(
        `/Resident/UpdateProfile/${userId}`,
        updatedUserData,
        token
      );
      showToast("success", "פרטי המשתמש עודכנו בהצלחה.");
      handleCloseModals();
      fetchUsers();
    } catch (err) {
      showToast("error", `שגיאה בעדכון משתמש: ${err.message}`);
      throw err;
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/People/UpdateRole/${userId}`, { role: newRole }, token);
      showToast("success", "תפקיד המשתמש עודכן בהצלחה.");
      fetchUsers();
    } catch (err) {
      showToast("error", `שגיאה בעדכון תפקיד: ${err.message}`);
      throw err;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;
    try {
      await api.delete(`/Resident/${deletingUser.id}`, token);
      showToast("success", `המשתמש ${deletingUser.fullName} הושבת בהצלחה.`);
      setDeletingUser(null);
      fetchUsers();
    } catch (err) {
      showToast("error", `שגיאה במחיקת משתמש: ${err.message}`);
      setDeletingUser(null);
    }
  };

  const handleRestoreUser = useCallback(
    async (userId) => {
      try {
        await api.put(`/Resident/Restore/${userId}`, null, token);
        showToast("success", "המשתמש שוחזר בהצלחה.");
        fetchUsers();
      } catch (err) {
        showToast("error", `שגיאה בשחזור משתמש: ${err.message}`);
      }
    },
    [token, fetchUsers]
  );

  const handlePasswordReset = async (userId, newPassword) => {
    return api.post(`/People/reset-password/${userId}`, { newPassword }, token);
  };

  const residentColumns = useMemo(
    () => [
      {
        accessorKey: "fullName",
        header: "שם",
      },
      {
        accessorKey: "email",
        header: "אימייל",
      },
      {
        accessorKey: "phoneNumber",
        header: "טלפון",
      },
      {
        accessorKey: "roomNumber",
        header: "חדר",
      },
      {
        accessorKey: "dateOfArrival",
        header: "תאריך הגעה",
        cell: ({ row }) =>
          new Date(row.original.dateOfArrival).toLocaleDateString("he-IL"),
      },
      {
        accessorKey: "isActive",
        header: "סטטוס",
        cell: ({ row }) => (
          <span
            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center justify-center space-x-2 space-x-reverse">
              <Tooltip>
                <TooltipTrigger>
                  <button
                    onClick={() => handleOpenEditModal(user)}
                    className="p-2 rounded-full text-blue-600 hover:bg-blue-100"
                  >
                    <Edit size={20} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>ערוך פרטי משתמש</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger>
                  <button
                    onClick={() => handleOpenResetPasswordModal(user)}
                    className="p-2 rounded-full text-yellow-600 hover:bg-yellow-100"
                  >
                    <KeyRound size={20} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>אפס סיסמה</p>
                </TooltipContent>
              </Tooltip>
              {user.isActive ? (
                <Tooltip>
                  <TooltipTrigger>
                    <button
                      onClick={() => setDeletingUser(user)}
                      className="p-2 rounded-full text-red-600 hover:bg-red-100"
                    >
                      <Trash2 size={20} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>השבת משתמש</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Tooltip>
                  <TooltipTrigger>
                    <button
                      onClick={() => handleRestoreUser(user.id)}
                      className="p-2 rounded-full text-green-600 hover:bg-green-100"
                    >
                      <RotateCw size={20} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>הפעל משתמש</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          );
        },
      },
    ],
    [handleOpenEditModal, handleRestoreUser, handleOpenResetPasswordModal]
  );

  const adminColumns = useMemo(
    () => [
      {
        accessorKey: "fullName",
        header: "שם",
      },
      {
        accessorKey: "phoneNumber",
        header: "טלפון",
      },
      {
        accessorKey: "personRole",
        header: "תפקיד",
      },
      {
        id: "actions",
        header: "פעולות",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center justify-center space-x-2 space-x-reverse">
              <Tooltip>
                <TooltipTrigger>
                  <button
                    onClick={() => handleOpenChangeRoleModal(user)}
                    className="p-2 rounded-full text-purple-600 hover:bg-purple-100"
                  >
                    <UserCheck size={20} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>שנה תפקיד</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger>
                  <button
                    onClick={() => handleOpenResetPasswordModal(user)}
                    className="p-2 rounded-full text-yellow-600 hover:bg-yellow-100"
                  >
                    <KeyRound size={20} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>אפס סיסמה</p>
                </TooltipContent>
              </Tooltip>
            </div>
          );
        },
      },
    ],
    [handleOpenResetPasswordModal, handleOpenChangeRoleModal]
  );

  const data = view === "residents" ? users : admins;
  const columns = view === "residents" ? residentColumns : adminColumns;

  if (isLoading) return <div className="text-center p-4">טוען נתונים...</div>;
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
          <h2 className="text-2xl font-bold text-gray-800">ניהול משתמשים</h2>
          <div className="flex items-center bg-gray-200 rounded-full p-1">
            <button
              onClick={() => setView("residents")}
              className={`px-4 py-1.5 text-sm font-semibold rounded-full flex items-center transition-colors ${
                view === "residents"
                  ? "bg-white text-blue-600 shadow"
                  : "bg-transparent text-gray-600"
              }`}
            >
              <Users className="ml-2 h-4 w-4" />
              דיירים
            </button>
            <button
              onClick={() => setView("admins")}
              className={`px-4 py-1.5 text-sm font-semibold rounded-full flex items-center transition-colors ${
                view === "admins"
                  ? "bg-white text-blue-600 shadow"
                  : "bg-transparent text-gray-600"
              }`}
            >
              <UserCog className="ml-2 h-4 w-4" />
              צוות
            </button>
          </div>
        </div>
        <SharedTable
          data={data}
          columns={columns}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
          sorting={sorting}
          setSorting={setSorting}
        />
        <div className="flex items-center justify-end py-4">
          <div className="flex space-x-4 space-x-reverse">
            <Button
              onClick={() => handleOpenCreateModal("resident")}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <UserPlus size={16} className="ml-2" />
              הוסף דייר
            </Button>
            <Button
              onClick={() => handleOpenCreateModal("admin")}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <ShieldPlus size={16} className="ml-2" />
              הוסף איש צוות
            </Button>
          </div>
        </div>

        <EditUserModal
          isOpen={isEditModalOpen}
          user={editingUser}
          allUsers={users}
          onClose={handleCloseModals}
          onSave={handleSave}
        />

        <CreateUserModal
          isOpen={isCreateModalOpen}
          onClose={handleCloseModals}
          userType={createUserType}
          onUserCreated={fetchUsers}
          showToast={showToast}
        />

        <ResetPasswordModal
          isOpen={isResetPasswordModalOpen}
          onClose={handleCloseModals}
          user={passwordResetUser}
          onPasswordReset={handlePasswordReset}
          showToast={showToast}
        />

        <ChangeRoleModal
          isOpen={isChangeRoleModalOpen}
          onClose={handleCloseModals}
          user={roleChangeUser}
          onRoleChange={handleRoleChange}
          showToast={showToast}
        />

        {deletingUser && (
          <ConfirmationModal
            title="אישור השבתת משתמש"
            message={`האם אתה בטוח שברצונך להשבית את ${deletingUser.fullName}?`}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeletingUser(null)}
          />
        )}
      </div>
    </TooltipProvider>
  );
};

export default UserManagement;
