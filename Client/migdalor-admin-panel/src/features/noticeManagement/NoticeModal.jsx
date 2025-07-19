import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import InputField from "../../components/common/InputField";
import { api } from "../../api/apiService";
import { useAuth } from "../../auth/AuthContext";

const NoticeModal = ({ isOpen, onClose, onSave, showToast, notice }) => {
  const { user, token } = useAuth();
  const [formData, setFormData] = useState({});
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine if the modal is in "edit" mode
  const isEditMode = !!notice;

  // Fetch categories from the server when the modal opens
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.get("/Categories", token);
        // The existing controller returns objects with 'categoryHebName'
        const categoryNames = data.map((cat) => cat.categoryHebName);
        setCategories(Array.isArray(categoryNames) ? categoryNames : []);
      } catch (error) {
        showToast("error", "שגיאה בטעינת הקטגוריות.");
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen, token, showToast]);

  // Populate form when 'notice' prop changes (for editing)
  useEffect(() => {
    if (isEditMode) {
      setFormData({
        Title: notice.noticeTitle || "",
        Content: notice.noticeMessage || "",
        Category: notice.noticeCategory || "",
        SubCategory: notice.noticeSubCategory || "",
      });
    } else {
      // Reset form for "create" mode
      setFormData({
        Title: "",
        Content: "",
        Category: "",
        SubCategory: "",
      });
    }
  }, [notice, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // if (!user || !user.id) {
    //   showToast("error", "לא ניתן לזהות את המשתמש השולח.");
    //   return;
    // }

    setIsSubmitting(true);
    const noticeData = {
      ...formData,
      SenderId: isEditMode ? notice.senderId : user.id, // Use existing senderId in edit mode
    };

    try {
      // Call the onSave function passed from the parent, which handles both create and edit
      await onSave(noticeData, isEditMode ? notice.noticeId : null);
      handleClose(); // Close modal on success
    } catch (error) {
      // The parent component will show the error toast
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
    });
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
      <div className="relative bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
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
            value={formData.Title}
            onChange={handleChange}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 text-right">
              תוכן
            </label>
            <textarea
              name="Content"
              value={formData.Content}
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
              value={formData.Category}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              required
            >
              <option value="" disabled>
                בחר קטגוריה
              </option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <InputField
            label="תת-קטגוריה"
            name="SubCategory"
            value={formData.SubCategory}
            onChange={handleChange}
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
