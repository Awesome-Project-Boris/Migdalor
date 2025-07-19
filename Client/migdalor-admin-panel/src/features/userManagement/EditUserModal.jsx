import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import InputField from "../../components/common/InputField";
import CheckboxField from "../../components/common/CheckboxField";
import SpouseCommand from "../../components/common/SpouseCommand";

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
      className={`relative z-50 grid w-full max-w-6xl gap-4 border bg-white p-6 shadow-lg rounded-2xl ${className}`}
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

// --- Main EditUserModal Component ---

const EditUserModal = ({ user, allUsers, isOpen, onClose, onSave }) => {
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(
      dateString.endsWith("Z") ? dateString : dateString + "Z"
    );
    return date.toISOString().split("T")[0];
  };

  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        hebFirstName: user.hebFirstName || "",
        hebLastName: user.hebLastName || "",
        engFirstName: user.engFirstName || "",
        engLastName: user.engLastName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        dateOfBirth: formatDateForInput(user.dateOfBirth),
        gender: user.gender === "M" ? "זכר" : "נקבה",
        personRole: user.personRole || "Resident",
        branchName: user.branchName || "נורדיה",
        isBokerTov: user.isBokerTov ?? true,
        canInitActivity: user.canInitActivity ?? false,
        spouseId: user.spouseId || null,
        dateOfArrival: formatDateForInput(user.dateOfArrival),
        homePlace: user.homePlace || "",
        profession: user.profession || "",
        residentDescription: user.residentDescription || "",
        residentApartmentNumber: user.roomNumber || "",
      });
      setIsSubmitting(false);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSpouseSelect = (spouseId) => {
    setFormData((prev) => ({ ...prev, spouseId }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const payload = { ...formData };
    payload.spouseId = payload.spouseId || null;

    try {
      // The onSave function from the parent handles the API call,
      // success toast, and closing the modal.
      await onSave(user.id, payload);
    } catch (error) {
      // The parent's onSave function will show an error toast.
      // We just need to catch the error to stop the process here.
      console.error("Failed to save user:", error);
    } finally {
      // We don't set submitting to false here because the modal
      // will be closed by the parent on success. If it fails,
      // we want the user to be able to try again.
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !user) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>עריכת פרטי דייר: {user.fullName}</DialogTitle>
          <DialogDescription>
            בצע שינויים בפרופיל הדייר כאן. לחץ על שמור בסיום.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="max-h-[70vh] overflow-y-auto pr-6 -mr-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 py-4">
            <InputField
              label="שם פרטי (עברית)"
              name="hebFirstName"
              value={formData.hebFirstName}
              onChange={handleChange}
            />
            <InputField
              label="שם משפחה (עברית)"
              name="hebLastName"
              value={formData.hebLastName}
              onChange={handleChange}
            />
            <InputField
              label="שם פרטי (אנגלית)"
              name="engFirstName"
              value={formData.engFirstName}
              onChange={handleChange}
            />
            <InputField
              label="שם משפחה (אנגלית)"
              name="engLastName"
              value={formData.engLastName}
              onChange={handleChange}
            />
            <InputField
              label="אימייל"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
            <InputField
              label="טלפון"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
            />
            <InputField
              label="תאריך לידה"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
            />
            <InputField
              label="תאריך הגעה"
              name="dateOfArrival"
              type="date"
              value={formData.dateOfArrival}
              onChange={handleChange}
            />
            <InputField
              label="מקום מגורים קודם"
              name="homePlace"
              value={formData.homePlace}
              onChange={handleChange}
            />
            <InputField
              label="מקצוע"
              name="profession"
              value={formData.profession}
              onChange={handleChange}
            />
            <InputField
              label="סניף"
              name="branchName"
              value={formData.branchName}
              onChange={handleChange}
            />
            <InputField
              label="מספר דירה"
              name="residentApartmentNumber"
              value={formData.residentApartmentNumber}
              onChange={handleChange}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                מין
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              >
                <option value="">בחר...</option>
                <option value="זכר">זכר</option>
                <option value="נקבה">נקבה</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <SpouseCommand
                users={allUsers}
                currentUser={user}
                selectedSpouseId={formData.spouseId}
                onSelectSpouse={handleSpouseSelect}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                תיאור
              </label>
              <textarea
                name="residentDescription"
                value={formData.residentDescription}
                onChange={handleChange}
                rows="3"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              ></textarea>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <CheckboxField
                label="בוקר טוב"
                name="isBokerTov"
                checked={formData.isBokerTov}
                onChange={handleChange}
              />
              <CheckboxField
                label="יכול ליזום פעילות"
                name="canInitActivity"
                checked={formData.canInitActivity}
                onChange={handleChange}
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
              {isSubmitting ? "שומר..." : "שמור שינויים"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserModal;
