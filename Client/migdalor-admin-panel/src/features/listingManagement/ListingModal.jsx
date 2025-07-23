import React, { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import InputField from "../../components/common/InputField";
import ImageUpload from "../../components/common/ImageUpload";
import SpouseCommand from "../../components/common/SpouseCommand"; // Import SpouseCommand
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../api/apiService";

const ListingModal = ({ isOpen, onClose, onSave, listingId }) => {
  const { user, token } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    sellerId: "",
    mainPicId: null,
    extraPicId: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [mainImage, setMainImage] = useState(null);
  const [extraImage, setExtraImage] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await api.get("/people/all-names", token);
        setUsers(usersData);
      } catch (error) {
        console.error("Failed to fetch users", error);
      }
    };

    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, token]);

  const fetchListingDetails = useCallback(async () => {
    if (!listingId) {
      setFormData({
        title: "",
        description: "",
        sellerId: user?.id || "",
        mainPicId: null,
        extraPicId: null,
      });
      setMainImage(null);
      setExtraImage(null);
      return;
    }

    setIsLoading(true);
    try {
      const listingDetails = await api.get(
        `/Listings/Details/${listingId}`,
        token
      );

      if (listingDetails) {
        setFormData({
          title: listingDetails.title || "",
          description: listingDetails.description || "",
          sellerId: listingDetails.sellerId || "",
          mainPicId: listingDetails.mainPicture?.picId || null,
          extraPicId: listingDetails.extraPicture?.picId || null,
        });
        setMainImage(
          listingDetails.mainPicture
            ? { serverPath: listingDetails.mainPicture.picPath }
            : null
        );
        setExtraImage(
          listingDetails.extraPicture
            ? { serverPath: listingDetails.extraPicture.picPath }
            : null
        );
      }
    } catch (error) {
      console.error("Failed to fetch listing details", error);
    } finally {
      setIsLoading(false);
    }
  }, [listingId, token, user]);

  useEffect(() => {
    if (isOpen) {
      fetchListingDetails();
    }
  }, [isOpen, fetchListingDetails]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSellerSelect = (sellerId) => {
    setFormData((prev) => ({ ...prev, sellerId }));
  };

  const handleImageUploadSuccess = (picId, role) => {
    if (role === "main") {
      setFormData((prev) => ({ ...prev, mainPicId: picId }));
    } else if (role === "extra") {
      setFormData((prev) => ({ ...prev, extraPicId: picId }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      title: formData.title,
      description: formData.description,
      sellerId: formData.sellerId,
      mainPicId: formData.mainPicId,
      extraPicId: formData.extraPicId,
    };

    try {
      if (listingId) {
        await api.put(`/AdminListings/${listingId}`, payload, token);
      } else {
        await api.post("/AdminListings", payload, token);
      }
      onSave();
    } catch (error) {
      console.error("Failed to save listing", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: "",
      description: "",
      sellerId: "",
      mainPicId: null,
      extraPicId: null,
    });
    setMainImage(null);
    setExtraImage(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      dir="rtl"
    >
      <div className="relative bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-4 border-b">
          <h3 className="text-xl font-semibold">
            {listingId ? "עריכת מודעה" : "יצירת מודעה חדשה"}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <X size={24} />
          </button>
        </div>
        {isLoading ? (
          <div className="py-8 text-center">טוען פרטי מודעה...</div>
        ) : (
          <form onSubmit={handleSubmit} className="py-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="כותרת"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
              <SpouseCommand
                users={users}
                currentUser={null} // Pass null so no user is filtered out
                selectedSpouseId={formData.sellerId}
                onSelectSpouse={handleSellerSelect}
                label="מוכר"
                placeholder="בחר מוכר..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 text-right">
                תיאור
              </label>
              <textarea
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                rows="4"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ImageUpload
                label="תמונה ראשית"
                onImageUploadSuccess={(picId) =>
                  handleImageUploadSuccess(picId, "main")
                }
                existingImage={mainImage}
                picRole="marketplace"
                picAlt={`Main photo for ${formData.title}`}
                uploaderId={user?.id}
              />
              <ImageUpload
                label="תמונה נוספת"
                onImageUploadSuccess={(picId) =>
                  handleImageUploadSuccess(picId, "extra")
                }
                existingImage={extraImage}
                picRole="marketplace_extra"
                picAlt={`Extra photo for ${formData.title}`}
                uploaderId={user?.id}
              />
            </div>

            <div className="flex justify-end space-x-4 pt-4 border-t">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                ביטול
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
              >
                {isSubmitting ? "שומר..." : "שמור שינויים"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ListingModal;
