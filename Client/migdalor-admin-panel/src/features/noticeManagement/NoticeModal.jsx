import React, { useState, useEffect, useMemo } from "react";
import { X } from "lucide-react";
import InputField from "../../components/common/InputField";
import ImageUpload from "../../components/common/ImageUpload";
import { api } from "../../api/apiService";
import { useAuth } from "../../auth/AuthContext";

const NoticeModal = ({
  isOpen,
  onClose,
  onSave,
  showToast,
  notice,
  allCategories,
  userRoles,
  isAdmin,
}) => {
  const { user, token } = useAuth();
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingImage, setExistingImage] = useState(null);

  const isEditMode = !!notice;

  const availableCategories = useMemo(() => {
    if (isAdmin) {
      return allCategories;
    }
    const userEngRoles = new Set(userRoles);
    return allCategories.filter((cat) => userEngRoles.has(cat.categoryEngName));
  }, [allCategories, userRoles, isAdmin]);

  useEffect(() => {
    const defaultCategory =
      availableCategories.length === 1
        ? availableCategories[0].categoryHebName
        : "";

    if (isEditMode && notice) {
      setFormData({
        Title: notice.noticeTitle || "",
        Content: notice.noticeMessage || "",
        Category: notice.noticeCategory || defaultCategory,
        SubCategory: notice.noticeSubCategory || "",
        PictureId: notice.pictureId || null,
      });
      if (notice.picturePath) {
        setExistingImage({ serverPath: notice.picturePath });
      } else {
        setExistingImage(null);
      }
    } else {
      setFormData({
        Title: "",
        Content: "",
        Category: defaultCategory,
        SubCategory: "",
        PictureId: null,
      });
      setExistingImage(null);
    }
  }, [notice, isEditMode, availableCategories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUploadSuccess = (picId) => {
    setFormData((prev) => ({ ...prev, PictureId: picId }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const noticeData = {
      ...formData,
      SenderId: isEditMode ? notice.senderId : user.id,
    };

    try {
      await onSave(noticeData, isEditMode ? notice.noticeId : null);
      handleClose();
    } catch (error) {
      // Parent component shows the error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      Title: "",
      Content: "",
      Category: "",
      SubCategory: "",
      PictureId: null,
    });
    setExistingImage(null);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      dir="rtl"
    >
      <div className="relative bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-4 border-b">
          <h3 className="text-xl font-semibold">
            {isEditMode ? "עריכת הודעה" : "יצירת הודעה חדשה"}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="py-4 space-y-4">
          <InputField
            label="כותרת"
            name="Title"
            value={formData.Title || ""}
            onChange={handleChange}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 text-right">
              תוכן
            </label>
            <textarea
              name="Content"
              value={formData.Content || ""}
              onChange={handleChange}
              rows="5"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
          <div>
            <label
              htmlFor="Category"
              className="block text-sm font-medium text-gray-700 text-right"
            >
              קטגוריה
            </label>
            <select
              id="Category"
              name="Category"
              value={formData.Category || ""}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              required
              disabled={availableCategories.length === 1}
            >
              <option value="" disabled>
                בחר קטגוריה
              </option>
              {availableCategories.map((cat) => (
                <option key={cat.categoryId} value={cat.categoryHebName}>
                  {cat.categoryHebName}
                </option>
              ))}
            </select>
          </div>
          <InputField
            label="תת-קטגוריה"
            name="SubCategory"
            value={formData.SubCategory || ""}
            onChange={handleChange}
          />

          <ImageUpload
            token={token}
            uploaderId={user?.id}
            onImageUploadSuccess={handleImageUploadSuccess}
            existingImage={existingImage}
            picRole="unassigned" // Using a valid role from the constraint
            picAlt={`Image for notice: ${formData.Title || "Notice"}`}
            eventName={formData.Title}
            eventDescription={formData.Content}
          />

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

export default NoticeModal;
