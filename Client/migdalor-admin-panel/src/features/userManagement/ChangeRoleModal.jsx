import React, { useState, useEffect } from "react";
import { X, UserCog } from "lucide-react";

// --- Mock shadcn/ui Dialog Components ---
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
      className={`relative z-50 grid w-full max-w-md gap-4 border bg-white p-6 shadow-lg rounded-2xl ${className}`}
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
const DialogFooter = ({ className, ...props }) => (
  <div
    className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 sm:space-x-reverse pt-4 border-t ${className}`}
    {...props}
  />
);
const DialogTitle = React.forwardRef((props, ref) => (
  <h2 ref={ref} className="text-2xl font-semibold" {...props} />
));
const DialogDescription = React.forwardRef((props, ref) => (
  <p ref={ref} className="text-md text-gray-500" {...props} />
));

// --- Main ChangeRoleModal Component ---

const ChangeRoleModal = ({
  isOpen,
  onClose,
  user,
  onRoleChange,
  showToast,
}) => {
  const [newRole, setNewRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setNewRole(user.personRole || "");
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newRole) {
      showToast("warning", "יש לבחור תפקיד.");
      return;
    }
    setIsSubmitting(true);
    try {
      await onRoleChange(user.id, newRole);
      onClose(); // The parent will show the success toast
    } catch (error) {
      // The parent will show the error toast
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>שינוי תפקיד עבור {user.fullName}</DialogTitle>
          <DialogDescription>בחר את התפקיד החדש עבור המשתמש.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate>
          <div className="py-4">
            <label
              htmlFor="role-select"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              תפקיד
            </label>
            <select
              id="role-select"
              name="role"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="" disabled>
                בחר תפקיד...
              </option>
              <option value="admin">מנהל</option>
              <option value="Instructor">מדריך</option>
              {/* Add other roles as needed */}
            </select>
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 mx-1 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400"
              disabled={isSubmitting}
            >
              ביטול
            </button>
            <button
              type="submit"
              className="px-5 py-2 mx-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-blue-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? "שומר..." : "שמור שינויים"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeRoleModal;
