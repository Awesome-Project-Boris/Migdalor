import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import InputField from "../../components/common/InputField";

const EditNoticeModal = ({ notice, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (notice) {
      setFormData({
        Title: notice.noticeTitle || "",
        Content: notice.noticeMessage || "",
        Category: notice.noticeCategory || "",
        SubCategory: notice.noticeSubCategory || "",
      });
    }
  }, [notice]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSave(notice.noticeId, formData);
    } catch (error) {
      console.error("Failed to save notice from modal:", error);
    }
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
          <h3 className="text-xl font-semibold">Edit Notice</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="py-4 space-y-4">
          <InputField
            label="Title"
            name="Title"
            value={formData.Title}
            onChange={handleChange}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 text-right">
              Message
            </label>
            <textarea
              name="Content"
              value={formData.Content}
              onChange={handleChange}
              rows="5"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <InputField
            label="Category"
            name="Category"
            value={formData.Category}
            onChange={handleChange}
          />
          <InputField
            label="Sub-Category"
            name="SubCategory"
            value={formData.SubCategory}
            onChange={handleChange}
          />
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditNoticeModal;
