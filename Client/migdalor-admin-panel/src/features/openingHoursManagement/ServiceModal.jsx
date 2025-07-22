import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../api/apiService";
import ImageUpload from "../../components/common/ImageUpload"; // Assuming this is in the same folder

// --- Mock shadcn/ui Dialog Components (reused from other modals) ---
const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={() => onOpenChange(false)}
      dir="rtl"
    >
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { onClose: () => onOpenChange(false) })
      )}
    </div>
  );
};

const DialogContent = React.forwardRef(
  ({ className, children, onClose, ...props }, ref) => (
    <div
      ref={ref}
      className={`relative z-50 grid w-full gap-4 border bg-white p-6 shadow-lg rounded-2xl ${className}`}
      onClick={(e) => e.stopPropagation()}
      {...props}
    >
      {children}
      <button
        onClick={onClose}
        className="absolute left-4 top-4 rounded-full p-2 text-gray-500 hover:bg-gray-200 transition-colors"
      >
        <X className="h-5 w-5" />
        <span className="sr-only">Close</span>
      </button>
    </div>
  )
);
DialogContent.displayName = "DialogContent";

const DialogHeader = ({ className, ...props }) => (
  <div
    className={`flex flex-col space-y-2 text-right ${className}`}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }) => (
  <div
    className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 sm:space-x-reverse pt-4 border-t ${className}`}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={`text-2xl font-semibold leading-none tracking-tight ${className}`}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

// --- Main ServiceModal Component ---

const ServiceModal = ({ isOpen, onClose, onSave, mode, service, services }) => {
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingImage, setExistingImage] = useState(null);

  const getInitialFormData = () => {
    if (mode === "edit" && service) {
      return {
        hebrewName: service.hebrewName || "",
        englishName: service.englishName || "",
        hebrewDescription: service.hebrewDescription || "",
        englishDescription: service.englishDescription || "",
        hebrewAddendum: service.hebrewAddendum || "",
        englishAddendum: service.englishAddendum || "",
        parentServiceID: service.parentServiceID || null,
        pictureId: service.pictureId || null,
        isActive: service.isActive ?? true,
      };
    }
    return {
      hebrewName: "",
      englishName: "",
      hebrewDescription: "",
      englishDescription: "",
      hebrewAddendum: "",
      englishAddendum: "",
      parentServiceID: null,
      pictureId: null,
      isActive: true,
    };
  };

  const [formData, setFormData] = useState(getInitialFormData());

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData());
      if (mode === "edit" && service?.picturePath) {
        setExistingImage(service.picturePath);
      } else {
        setExistingImage(null);
      }
    }
  }, [mode, service, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUploadSuccess = (picId) => {
    setFormData((prev) => ({ ...prev, pictureId: picId }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.hebrewName.trim()) return;
    setIsSubmitting(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error("Failed to save service:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "ערוך שירות" : "הוסף שירות חדש"}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="max-h-[70vh] overflow-y-auto pr-6 -mr-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 py-4">
            {/* Text Inputs */}
            <input name="serviceID" type="hidden" value={service?.serviceID} />
            <div className="md:col-span-1">
              <label
                htmlFor="hebrewName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                שם (עברית)
              </label>
              <input
                id="hebrewName"
                name="hebrewName"
                type="text"
                value={formData.hebrewName}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div className="md:col-span-1">
              <label
                htmlFor="englishName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                שם (אנגלית)
              </label>
              <input
                id="englishName"
                name="englishName"
                type="text"
                value={formData.englishName}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="md:col-span-2">
              <label
                htmlFor="hebrewDescription"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                תיאור (עברית)
              </label>
              <textarea
                id="hebrewDescription"
                name="hebrewDescription"
                value={formData.hebrewDescription}
                onChange={handleChange}
                rows="3"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              ></textarea>
            </div>
            <div className="md:col-span-2">
              <label
                htmlFor="englishDescription"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                תיאור (אנגלית)
              </label>
              <textarea
                id="englishDescription"
                name="englishDescription"
                value={formData.englishDescription}
                onChange={handleChange}
                rows="3"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              ></textarea>
            </div>
            <div className="md:col-span-2">
              <label
                htmlFor="hebrewAddendum"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                תוספת (עברית)
              </label>
              <textarea
                id="hebrewAddendum"
                name="hebrewAddendum"
                value={formData.hebrewAddendum}
                onChange={handleChange}
                rows="2"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              ></textarea>
            </div>
            <div className="md:col-span-2">
              <label
                htmlFor="englishAddendum"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                תוספת (אנגלית)
              </label>
              <textarea
                id="englishAddendum"
                name="englishAddendum"
                value={formData.englishAddendum}
                onChange={handleChange}
                rows="2"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              ></textarea>
            </div>

            {/* Parent Service Selector */}
            <div className="md:col-span-1">
              <label
                htmlFor="parentServiceID"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                שירות אב
              </label>
              <select
                id="parentServiceID"
                name="parentServiceID"
                value={formData.parentServiceID || ""}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">ללא</option>
                {services
                  .filter((s) => s.serviceID !== service?.serviceID)
                  .map((s) => (
                    <option key={s.serviceID} value={s.serviceID}>
                      {s.hebrewName}
                    </option>
                  ))}
              </select>
            </div>

            {/* IsActive Checkbox */}
            <div className="md:col-span-1 flex items-end pb-1">
              <div className="flex items-center">
                <input
                  id="isActive"
                  name="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="isActive"
                  className="mr-2 block text-sm font-medium text-gray-900"
                >
                  פעיל
                </label>
              </div>
            </div>

            {/* Image Upload */}
            <div className="md:col-span-2">
              <ImageUpload
                token={token}
                eventName={formData.hebrewName}
                eventDescription={formData.hebrewDescription}
                onImageUploadSuccess={handleImageUploadSuccess}
                existingImage={existingImage}
              />
            </div>
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2 mx-1 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400"
            >
              ביטול
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 mx-1 bg-blue-600 text-white rounded-full hover:bg-blue-700"
            >
              {isSubmitting ? "שומר..." : "שמור"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceModal;
