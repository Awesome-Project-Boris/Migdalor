import React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronUp,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";

const SharedTable = ({
  data,
  columns,
  globalFilter,
  setGlobalFilter,
  sorting,
  setSorting,
}) => {
  const table = useReactTable({
    data,
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
      },
    },
  });

  return (
    <div dir="rtl">
      <div className="relative mb-4">
        <input
          placeholder="חיפוש..."
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
                    className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer ${
                      header.column.id === "actions"
                        ? "text-center"
                        : "text-right"
                    }`}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div
                      className={`flex items-center ${
                        header.column.id === "actions" ? "justify-center" : ""
                      }`}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
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
                    <td
                      key={cell.id}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
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
            <ChevronsRight size={20} />
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={20} />
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="p-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronsLeft size={20} />
          </button>
        </div>
        <span>
          עמוד{" "}
          <strong>
            {table.getState().pagination.pageIndex + 1} מתוך{" "}
            {table.getPageCount()}
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
          onChange={(e) => {
            table.setPageSize(Number(e.target.value));
          }}
          className="border p-1 rounded"
        >
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              הצג {pageSize}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SharedTable;
