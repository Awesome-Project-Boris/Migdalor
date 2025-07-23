import React, { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import InputField from "../../components/common/InputField";
import ImageUpload from "../../components/common/ImageUpload";
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
  const [users, setUsers] = useState([]);
  const [mainImage, setMainImage] = useState(null);
  const [extraImage, setExtraImage] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await api.get("/People", token);
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
      // For new listings, default the seller to the current admin user
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

    try {
      // We need a detailed endpoint for a single listing if it exists,
      // for now, we'll filter from the main list as a fallback.
      // Ideally, this would be `api.get(`/AdminListings/${listingId}`, token)`
      const allListings = await api.get("/AdminListings", token);
      const listingDetails = allListings.find((l) => l.listingId === listingId);

      if (listingDetails) {
        setFormData({
          title: listingDetails.title || "",
          description: listingDetails.description || "",
          sellerId: listingDetails.sellerId || "", // This needs to be added to the DTO
          mainPicId: null, // Pic IDs are handled via upload
          extraPicId: null,
        });
        // Set existing images for display
        setMainImage(
          listingDetails.mainPicturePath
            ? { serverPath: listingDetails.mainPicturePath }
            : null
        );
        setExtraImage(
          listingDetails.extraPicturePath
            ? { serverPath: listingDetails.extraPicturePath }
            : null
        );
      }
    } catch (error) {
      console.error("Failed to fetch listing details", error);
    }
  }, [listingId, token, user]);

  useEffect(() => {
    if (isOpen) {
      fetchListingDetails();
    }
  }, [isOpen, fetchListingDetails]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, value }));
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl"
        dir="rtl"
      >
        <div className="flex justify-between items-center pb-4 border-b">
          <h2 className="text-2xl font-semibold">
            {listingId ? "עריכת מודעה" : "יצירת מודעה חדשה"}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-gray-200"
          >
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <InputField
            label="כותרת"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
          <InputField
            label="תיאור"
            name="description"
            value={formData.description}
            onChange={handleChange}
            type="textarea"
          />
          <div className="flex flex-col">
            <label
              htmlFor="sellerId"
              className="mb-2 font-semibold text-gray-700"
            >
              מוכר
            </label>
            <select
              id="sellerId"
              name="sellerId"
              value={formData.sellerId}
              onChange={handleChange}
              className="p-2 border rounded-md"
              required
            >
              <option value="">בחר מוכר</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullName}
                </option>
              ))}
            </select>
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
      </div>
    </div>
  );
};

export default ListingModal;
