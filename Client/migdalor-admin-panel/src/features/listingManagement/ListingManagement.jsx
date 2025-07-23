import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../api/apiService";
import SharedTable from "../../components/common/SharedTable";
import Toast from "../../components/common/Toast";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import ListingModal from "./ListingModal";
import { Edit, Trash2, PlusCircle } from "lucide-react";

const ListingManagement = () => {
  const { token } = useAuth();
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeListingId, setActiveListingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingListing, setDeletingListing] = useState(null);

  const [sorting, setSorting] = useState([{ id: "date", desc: true }]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [toastState, setToastState] = useState({
    show: false,
    message: "",
    variant: "info",
  });

  const showToast = (variant, message) =>
    setToastState({ show: true, variant, message });
  const handleCloseToast = () => setToastState({ ...toastState, show: false });

  const fetchListings = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.get("/AdminListings", token);
      setListings(data);
    } catch (error) {
      showToast("error", `שגיאה בטעינת המודעות: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleOpenModal = (listingId = null) => {
    setActiveListingId(listingId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setActiveListingId(null);
    setIsModalOpen(false);
  };

  const handleSaveListing = () => {
    showToast(
      "success",
      activeListingId ? "המודעה עודכנה בהצלחה" : "המודעה נוצרה בהצלחה"
    );
    fetchListings();
    handleCloseModal();
  };

  const handleDeleteClick = (listing) => {
    setDeletingListing(listing);
  };

  const confirmDelete = async () => {
    if (!deletingListing) return;

    try {
      await api.delete(`/AdminListings/${deletingListing.listingId}`, token);
      showToast("success", "המודעה נמחקה בהצלחה");
      fetchListings();
    } catch (error) {
      showToast("error", `שגיאה במחיקת המודעה: ${error.message}`);
    } finally {
      setDeletingListing(null);
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "title",
        header: "כותרת",
      },
      {
        accessorKey: "sellerName",
        header: "שם המוכר",
      },
      {
        accessorKey: "date",
        header: "תאריך פרסום",
        cell: ({ row }) =>
          new Date(row.original.date).toLocaleDateString("he-IL"),
      },
      {
        accessorKey: "isActive",
        header: "פעיל",
        cell: ({ row }) => (row.original.isActive ? "כן" : "לא"),
      },
      {
        id: "actions",
        header: "פעולות",
        cell: ({ row }) => (
          <div className="flex space-x-2">
            <button
              onClick={() => handleOpenModal(row.original.listingId)}
              className="p-1 text-blue-600 hover:text-blue-800"
            >
              <Edit size={20} />
            </button>
            <button
              onClick={() => handleDeleteClick(row.original)}
              className="p-1 text-red-600 hover:text-red-800"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Toast
        show={toastState.show}
        message={toastState.message}
        variant={toastState.variant}
        onClose={handleCloseToast}
      />
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        ניהול מודעות בלוח
      </h1>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
        >
          <PlusCircle size={20} className="ml-2" />
          צור מודעה חדשה
        </button>
      </div>
      {isLoading ? (
        <div className="text-center p-4">טוען נתונים...</div>
      ) : (
        <SharedTable
          data={listings}
          columns={columns}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
          sorting={sorting}
          setSorting={setSorting}
        />
      )}
      <ListingModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveListing}
        listingId={activeListingId}
      />
      {deletingListing && (
        <ConfirmationModal
          title="אישור מחיקת מודעה"
          message={`האם אתה בטוח שברצונך למחוק את המודעה "${deletingListing.title}"?`}
          onConfirm={confirmDelete}
          onCancel={() => setDeletingListing(null)}
        />
      )}
    </div>
  );
};

export default ListingManagement;
