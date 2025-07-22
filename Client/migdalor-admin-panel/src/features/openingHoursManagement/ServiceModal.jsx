import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

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

const ServiceModal = ({ isOpen, onClose, onSave, mode, service }) => {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (mode === "edit" && service) {
      setName(service.hebrewName || "");
    } else {
      setName("");
    }
  }, [mode, service, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await onSave({ hebrewName: name });
    } catch (error) {
      console.error("Failed to save service:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "ערוך שם שירות" : "הוסף שירות חדש"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div>
              <label
                htmlFor="serviceName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                שם השירות
              </label>
              <input
                id="serviceName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
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
              {isSubmitting ? "שומר..." : "שמור"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceModal;
