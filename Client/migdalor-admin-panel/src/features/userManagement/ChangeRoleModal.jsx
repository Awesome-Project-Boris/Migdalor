import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { api } from "../../api/apiService";
import { useAuth } from "../../auth/AuthContext";
import RoleSelection from "./RoleSelection"; // <-- Import the new component

// --- Mock shadcn/ui Dialog Components ---
const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
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
      className={`relative z-50 grid w-full max-w-lg gap-4 border bg-white p-6 shadow-lg rounded-2xl ${className}`} // <-- Increased width
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

const ChangeRoleModal = ({
  isOpen,
  onClose,
  onRoleChanged,
  user,
  showToast,
  allCategories,
}) => {
  const { token } = useAuth();
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [staffRoleType, setStaffRoleType] = useState("categories");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isUserAdmin = user?.personRole === "admin";

  useEffect(() => {
    if (user && user.personRole) {
      const roles = user.personRole.split(",").filter(Boolean);
      if (roles.includes("admin")) {
        setStaffRoleType("admin");
        setSelectedRoles(["admin"]);
      } else if (roles.includes("Instructor")) {
        setStaffRoleType("instructor");
        setSelectedRoles(["Instructor"]);
      } else {
        setStaffRoleType("categories");
        setSelectedRoles(roles);
      }
    } else {
      setSelectedRoles([]);
      setStaffRoleType("categories");
    }
  }, [user]);

  const handleRoleTypeChange = (e) => {
    setStaffRoleType(e.target.value);
    setSelectedRoles([]);
  };

  const handleCategoryRoleChange = (roleEngName) => {
    setSelectedRoles((prev) =>
      prev.includes(roleEngName)
        ? prev.filter((r) => r !== roleEngName)
        : [...prev, roleEngName]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    let roleString;
    switch (staffRoleType) {
      case "admin":
        roleString = "admin";
        break;
      case "instructor":
        roleString = "Instructor";
        break;
      case "categories":
        if (selectedRoles.length === 0) {
          showToast("error", "יש לבחור לפחות הרשאת קטגוריה אחת.");
          setIsSubmitting(false);
          return;
        }
        roleString = selectedRoles.join(",");
        break;
      default:
        showToast("error", "סוג תפקיד לא תקין.");
        setIsSubmitting(false);
        return;
    }

    try {
      const rolePayload = { Role: roleString };
      await api.put(`/People/UpdateRole/${user.personId}`, rolePayload, token);
      showToast(
        "success",
        `הרשאות המשתמש ${user.hebFirstName} ${user.hebLastName} עודכנו בהצלחה.`
      );
      onRoleChanged();
      onClose();
    } catch (error) {
      showToast("error", `שגיאה בעדכון הרשאות: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            שינוי הרשאה עבור {user?.hebFirstName} {user?.hebLastName}
          </DialogTitle>
          <DialogDescription>בחר את התפקיד החדש עבור המשתמש.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="py-4 space-y-4">
          {isUserAdmin ? (
            <p className="text-gray-600 p-2 border rounded-md bg-gray-50">
              לא ניתן לשנות הרשאות של מנהל מערכת ראשי (admin).
            </p>
          ) : (
            <RoleSelection
              allCategories={allCategories}
              staffRoleType={staffRoleType}
              onRoleTypeChange={handleRoleTypeChange}
              selectedRoles={selectedRoles}
              onCategoryRoleChange={handleCategoryRoleChange}
            />
          )}

          {!isUserAdmin && (
            <DialogFooter>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 mx-1 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                ביטול
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 mx-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
              >
                {isSubmitting ? "מעדכן..." : "שמור שינויים"}
              </button>
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeRoleModal;
