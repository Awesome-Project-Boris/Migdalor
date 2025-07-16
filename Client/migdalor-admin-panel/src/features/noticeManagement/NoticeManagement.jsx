import React, { useState, useEffect, useCallback, useMemo } from "react";
import { api } from "../../api/apiService";
import { useAuth } from "../../auth/AuthContext";
import Toast from "../../components/common/Toast";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Edit,
  Trash2,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import EditNoticeModal from "./EditNoticeModal";

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
      showToast("success", `ההודעה "${deletingNotice.noticeTitle}" נמחקה בהצלחה.`);
      setDeletingNotice(null);
      fetchNotices();
    } catch (err){
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
              <button
                onClick={() => handleOpenEditModal(notice)}
                className="p-2 rounded-full text-blue-600 hover:bg-blue-100"
                title="ערוך הודעה"
              >
                <Edit size={20} />
              </button>
              <button
                onClick={() => setDeletingNotice(notice)}
                className="p-2 rounded-full text-red-600 hover:bg-red-100"
                title="מחק הודעה"
              >
                <Trash2 size={20} />
              </button>
            </div>
          );
        },
      },
    ],
    [handleOpenEditModal]
  );

  const table = useReactTable({
    data: notices,
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
    initialState: {
        pagination: {
            pageSize: 10,
        }
    }
  });

  if (isLoading) return <div className="text-center p-4">טוען הודעות...</div>;
  if (error) return <div className="text-center p-4 text-red-500">{error}</div>;

  return (
    <div className="w-full bg-white p-6 rounded-lg shadow-md" dir="rtl">
      <Toast
        show={toastState.show}
        message={toastState.message}
        variant={toastState.variant}
        onClose={handleCloseToast}
      />
      <h2 className="text-2xl font-bold text-gray-800 mb-4">ניהול הודעות</h2>
      <div className="relative mb-4">
        <input
          placeholder="חפש הודעות..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="w-full p-2 pr-10 border border-gray-300 rounded-md text-right"
        />
        <Search
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
        />
      </div>
      <div className="overflow-x-auto rounded-md border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: <ChevronUp size={16} />,
                        desc: <ChevronDown size={16} />,
                      }[header.column.getIsSorted()] ?? null}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="h-24 text-center">
                  אין תוצאות.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-4 text-sm">
        <div className="flex items-center space-x-2 space-x-reverse">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="p-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronsRight size={20}/>
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={20}/>
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20}/>
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="p-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronsLeft size={20}/>
          </button>
        </div>
        <span>
          עמוד{" "}
          <strong>
            {table.getState().pagination.pageIndex + 1} מתוך {table.getPageCount()}
          </strong>
        </span>
        <span className="flex items-center gap-1">
          עבור לעמוד:
          <input
            type="number"
            defaultValue={table.getState().pagination.pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              table.setPageIndex(page);
            }}
            className="border p-1 rounded w-16 text-center"
            min="1"
            max={table.getPageCount()}
          />
        </span>
        <select
            value={table.getState().pagination.pageSize}
            onChange={e => {
                table.setPageSize(Number(e.target.value))
            }}
            className="border p-1 rounded"
        >
            {[10, 20, 30, 40, 50].map(pageSize => (
                <option key={pageSize} value={pageSize}>
                    הצג {pageSize}
                </option>
            ))}
        </select>
      </div>

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
  );
};

export default NoticeManagement;