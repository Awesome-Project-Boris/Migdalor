import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Edit,
  Trash2,
  RotateCw,
  UserPlus,
  ShieldPlus,
} from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../api/apiService";
import EditUserModal from "./EditUserModal";
import CreateUserModal from "./CreateUserModal";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

// --- Mock shadcn/ui Components for Data Table ---
const Button = React.forwardRef(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={`inline-flex mx-1 items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50
      ${
        variant === "outline"
          ? "border border-gray-300 bg-transparent hover:bg-gray-100"
          : "bg-blue-600 text-white hover:bg-blue-700"
      }
      ${size === "sm" ? "h-9 px-3" : "h-10 px-4 py-2"}
      ${className}`}
      ref={ref}
      {...props}
    />
  )
);
Button.displayName = "Button";

const Table = React.forwardRef(({ className, ...props }, ref) => (
  <table
    ref={ref}
    className={`min-w-full divide-y divide-gray-200 ${className}`}
    {...props}
  />
));
Table.displayName = "Table";

const TableHeader = React.forwardRef(({ className, ...props }, ref) => (
  <thead ref={ref} className={`bg-gray-50 ${className}`} {...props} />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={`bg-white divide-y divide-gray-200 ${className}`}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableRow = React.forwardRef(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={`transition-colors hover:bg-gray-50/50 ${className}`}
    {...props}
  />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={`px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={`px-6 py-4 whitespace-nowrap ${className}`}
    {...props}
  />
));
TableCell.displayName = "TableCell";

// --- Main UserManagement Component ---

const UserManagement = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createUserType, setCreateUserType] = useState("resident");
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.get("/Resident/residents", token);
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("נכשל בטעינת המשתמשים.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

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

  const handleCloseModals = () => {
    setEditingUser(null);
    setIsEditModalOpen(false);
    setIsCreateModalOpen(false);
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
      handleCloseModals();
      fetchUsers();
    } catch (err) {
      alert(`שגיאה בעדכון משתמש: ${err.message}`);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;
    try {
      await api.delete(`/Resident/${deletingUser.id}`, token);
      setDeletingUser(null);
      fetchUsers();
    } catch (err) {
      alert(`שגיאה במחיקת משתמש: ${err.message}`);
    }
  };

  const handleRestoreUser = useCallback(
    async (userId) => {
      try {
        await api.put(`/Resident/Restore/${userId}`, null, token);
        fetchUsers();
      } catch (err) {
        alert(`שגיאה בשחזור משתמש: ${err.message}`);
      }
    },
    [token, fetchUsers]
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: "fullName",
        header: "שם",
        cell: ({ row }) => (
          <div className="text-sm font-medium text-gray-900">
            {row.getValue("fullName")}
          </div>
        ),
      },
      {
        accessorKey: "email",
        header: "אימייל",
        cell: ({ row }) => (
          <div className="text-sm text-gray-500">
            {row.getValue("email") || "N/A"}
          </div>
        ),
      },
      {
        accessorKey: "phoneNumber",
        header: "טלפון",
        cell: ({ row }) => (
          <div className="text-sm text-gray-500">
            {row.getValue("phoneNumber") || "N/A"}
          </div>
        ),
      },
      {
        accessorKey: "roomNumber",
        header: "חדר",
        cell: ({ row }) => (
          <div className="text-sm text-gray-500">
            {row.getValue("roomNumber") || "N/A"}
          </div>
        ),
      },
      {
        accessorKey: "isActive",
        header: "סטטוס",
        cell: ({ row }) => {
          const isActive = row.getValue("isActive");
          return (
            <span
              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {isActive ? "פעיל" : "לא פעיל"}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "פעולות",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center space-x-4 space-x-reverse">
              <button
                onClick={() => handleOpenEditModal(user)}
                className="text-blue-600 hover:text-blue-900"
                title="ערוך"
              >
                <Edit size={18} />
              </button>
              {user.isActive ? (
                <button
                  onClick={() => setDeletingUser(user)}
                  className="text-red-600 hover:text-red-900"
                  title="מחק"
                >
                  <Trash2 size={18} />
                </button>
              ) : (
                <button
                  onClick={() => handleRestoreUser(user.id)}
                  className="text-green-600 hover:text-green-900"
                  title="שחזר"
                >
                  <RotateCw size={18} />
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [handleOpenEditModal, handleRestoreUser]
  );

  const table = useReactTable({
    data: users,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  if (isLoading) return <div className="text-center p-4">טוען משתמשים...</div>;
  if (error) return <div className="text-center p-4 text-red-500">{error}</div>;

  return (
    <div className="w-full bg-white p-6 rounded-lg shadow-md" dir="rtl">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">ניהול משתמשים</h2>
      <div className="flex items-center justify-between py-4">
        <div className="relative w-full max-w-sm">
          <input
            placeholder="חפש לפי שם, אימייל או טלפון..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="w-full p-2 pr-10 border border-gray-300 rounded-md text-right"
          />
          <Search
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
        </div>
      </div>
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={!row.original.isActive ? "bg-red-50" : ""}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  לא נמצאו תוצאות.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between py-4">
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
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            הקודם
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            הבא
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
      />

      {deletingUser && (
        <ConfirmationModal
          title="אישור מחיקת משתמש"
          message={`האם אתה בטוח שברצונך למחוק את ${deletingUser.fullName}? פעולה זו תסמן אותו כ"לא פעיל".`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingUser(null)}
        />
      )}
    </div>
  );
};

export default UserManagement;
