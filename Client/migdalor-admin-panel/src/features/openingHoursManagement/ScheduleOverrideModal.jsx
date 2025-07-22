import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

// --- Mock shadcn/ui Dialog Components (from EditUserModal) ---
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

const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} className={`text-md text-gray-500 ${className}`} {...props} />
));
DialogDescription.displayName = "DialogDescription";

// --- Main ScheduleOverrideModal Component ---

const ScheduleOverrideModal = ({
  mode,
  override,
  services,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (mode === "edit" && override) {
      setFormData({
        ...override,
        overrideDate: new Date(override.overrideDate)
          .toISOString()
          .split("T")[0],
      });
    } else {
      // FIX: Initialize with null to force user selection.
      setFormData({
        serviceId: null,
        overrideDate: new Date().toISOString().split("T")[0],
        isOpen: true,
        openTime: "09:00",
        closeTime: "17:00",
        notes: "",
      });
    }
  }, [mode, override, services]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // FIX: Prepare data but let the parent component handle parsing and validation.
    const finalData = {
      ...formData,
      openTime: formData.isOpen ? formData.openTime : null,
      closeTime: formData.isOpen ? formData.closeTime : null,
    };
    try {
      await onSave(finalData);
    } catch (error) {
      console.error("Failed to save override:", error);
    } finally {
      // Ensure submitting state is always reset.
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "עריכת חריגה" : "הוספת חריגה חדשה"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "עדכן את פרטי החריגה בלוח הזמנים."
              : "צור חריגה חדשה בלוח הזמנים."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                שירות
              </label>
              <select
                name="serviceId"
                value={formData.serviceId || ""} // Use || "" to handle initial null value
                onChange={handleChange}
                required // Make selection mandatory
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                {/* FIX: Add a disabled placeholder option */}
                <option value="" disabled>
                  בחר שירות...
                </option>
                {/* FIX: Use 'serviceId' (camelCase) to match API data */}
                {services.map((s) => (
                  <option key={s.serviceId} value={s.serviceId}>
                    {s.hebrewName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                תאריך
              </label>
              <input
                type="date"
                name="overrideDate"
                value={formData.overrideDate || ""}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="flex items-center pt-2">
              <input
                type="checkbox"
                id="isOpen"
                name="isOpen"
                checked={formData.isOpen || false}
                onChange={handleChange}
                className="ml-2 h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label
                htmlFor="isOpen"
                className="text-sm font-medium text-gray-700"
              >
                האם השירות פתוח?
              </label>
            </div>
            {formData.isOpen && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    שעת פתיחה
                  </label>
                  <input
                    type="time"
                    name="openTime"
                    value={formData.openTime || ""}
                    onChange={handleChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    שעת סגירה
                  </label>
                  <input
                    type="time"
                    name="closeTime"
                    value={formData.closeTime || ""}
                    onChange={handleChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                הערות
              </label>
              <textarea
                name="notes"
                value={formData.notes || ""}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                rows="3"
              ></textarea>
            </div>
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2 mx-1 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400 transition-colors disabled:opacity-50"
            >
              ביטול
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 mx-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:bg-blue-300"
            >
              {isSubmitting ? "שומר..." : "שמירה"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleOverrideModal;
