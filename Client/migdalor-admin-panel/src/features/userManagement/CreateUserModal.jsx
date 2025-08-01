import React, { useState, useEffect, useCallback } from "react";
import { X, RefreshCw, Printer, Copy } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../api/apiService";
import InputField from "../../components/common/InputField";
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
      className={`relative z-50 grid w-full max-w-2xl gap-4 border bg-white p-6 shadow-lg rounded-2xl ${className}`}
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

const CreateUserModal = ({
  isOpen,
  onClose,
  userType,
  onUserCreated,
  showToast,
  allCategories,
}) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({});
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [staffRoleType, setStaffRoleType] = useState("categories");

  const [view, setView] = useState("form");
  const [createdUserDetails, setCreatedUserDetails] = useState(null);

  const generatePassword = useCallback(() => {
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const nums = "0123456789";
    const all = lower + upper + nums;
    let pass = "";
    pass += lower[Math.floor(Math.random() * lower.length)];
    pass += upper[Math.floor(Math.random() * upper.length)];
    pass += nums[Math.floor(Math.random() * nums.length)];
    while (pass.length < 8) {
      pass += all[Math.floor(Math.random() * all.length)];
    }
    const shuffledPass = pass
      .split("")
      .sort(() => 0.5 - Math.random())
      .join("");
    setFormData((prev) => ({ ...prev, password: shuffledPass }));
    return shuffledPass;
  }, []);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        hebFirstName: "",
        hebLastName: "",
        engFirstName: "",
        engLastName: "",
        phoneNumber: "",
        password: generatePassword(),
        gender: "זכר",
      });
      setSelectedRoles([]);
      setStaffRoleType("categories");
      setView("form");
      setCreatedUserDetails(null);
    }
  }, [isOpen, generatePassword]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phoneNumber") {
      const numericValue = value.replace(/\D/g, "");
      if (numericValue.length <= 10) {
        setFormData((prev) => ({ ...prev, [name]: numericValue }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

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
    let endpoint;

    if (userType === "resident") {
      roleString = "Resident";
      endpoint = "/People/Register";
    } else {
      switch (staffRoleType) {
        case "admin":
          roleString = "admin";
          break;
        case "instructor":
          roleString = "Instructor";
          break;
        case "categories":
          if (selectedRoles.length === 0) {
            showToast(
              "error",
              "יש לבחור לפחות הרשאת קטגוריה אחת עבור משתמש צוות."
            );
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
      endpoint = "/People/RegisterAdmin";
    }

    const payload = {
      HebFirstName: formData.hebFirstName,
      HebLastName: formData.hebLastName,
      EngFirstName: formData.engFirstName,
      EngLastName: formData.engLastName,
      PhoneNumber: formData.phoneNumber,
      Password: formData.password,
      Gender: formData.gender === "זכר" ? "M" : "F",
      Role: roleString,
    };

    try {
      await api.post(endpoint, payload, token);
      showToast("success", "המשתמש נוצר בהצלחה!");

      if (userType === "resident") {
        setCreatedUserDetails(payload);
        setView("password");
      } else {
        onUserCreated();
        onClose();
      }
    } catch (error) {
      showToast("error", `שגיאה ביצירת משתמש: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalClose = () => {
    onUserCreated();
    onClose();
  };

  const handlePrint = () => {
    const printContent = document.getElementById(
      "password-print-area"
    ).innerHTML;
    const printWindow = window.open("", "_blank", "height=500,width=500");
    printWindow.document.write(
      "<html><head><title>פרטי משתמש</title><style>body { direction: rtl; text-align: right; font-family: Arial, sans-serif; padding: 20px; }</style></head><body>"
    );
    printWindow.document.write(printContent);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleCopyToClipboard = () => {
    if (createdUserDetails) {
      navigator.clipboard.writeText(
        `שם משתמש: ${createdUserDetails.PhoneNumber}\nסיסמה: ${createdUserDetails.Password}`
      );
      showToast("info", "פרטי המשתמש הועתקו.");
    }
  };

  if (!isOpen) return null;

  const isStaffCreation = userType === "admin";
  const title = isStaffCreation ? "יצירת איש צוות חדש" : "יצירת דייר חדש";
  const description = isStaffCreation
    ? "מלא את הפרטים ליצירת פרופיל איש צוות."
    : "מלא את הפרטים ליצירת פרופיל דייר חדש.";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        {view === "form" ? (
          <>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 py-4">
                <InputField
                  label="שם פרטי (עברית)"
                  name="hebFirstName"
                  value={formData.hebFirstName || ""}
                  onChange={handleChange}
                  required
                />
                <InputField
                  label="שם משפחה (עברית)"
                  name="hebLastName"
                  value={formData.hebLastName || ""}
                  onChange={handleChange}
                  required
                />
                <InputField
                  label="שם פרטי (אנגלית)"
                  name="engFirstName"
                  value={formData.engFirstName || ""}
                  onChange={handleChange}
                />
                <InputField
                  label="שם משפחה (אנגלית)"
                  name="engLastName"
                  value={formData.engLastName || ""}
                  onChange={handleChange}
                />
                <InputField
                  label="מספר טלפון (שם משתמש)"
                  name="phoneNumber"
                  value={formData.phoneNumber || ""}
                  onChange={handleChange}
                  required
                  maxLength={10}
                  pattern="\d*"
                  type="tel"
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
                    <option value="זכר">זכר</option>
                    <option value="נקבה">נקבה</option>
                  </select>
                </div>

                <div className="relative md:col-span-2">
                  <InputField
                    label="סיסמה"
                    name="password"
                    type="text"
                    value={formData.password || ""}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="absolute left-2 top-8 p-1 text-gray-500 hover:text-blue-600"
                  >
                    <RefreshCw size={18} />
                  </button>
                </div>

                {isStaffCreation && (
                  <RoleSelection
                    allCategories={allCategories}
                    staffRoleType={staffRoleType}
                    onRoleTypeChange={handleRoleTypeChange}
                    selectedRoles={selectedRoles}
                    onCategoryRoleChange={handleCategoryRoleChange}
                  />
                )}
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
                  {isSubmitting ? "יוצר..." : "צור משתמש"}
                </button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>המשתמש נוצר בהצלחה!</DialogTitle>
              <DialogDescription>
                יש למסור את הפרטים הבאים למשתמש החדש.
              </DialogDescription>
            </DialogHeader>
            <div
              id="password-print-area"
              className="p-4 bg-gray-100 rounded-lg text-right space-y-2"
            >
              <p>
                <strong>שם:</strong> {createdUserDetails.HebFirstName}{" "}
                {createdUserDetails.HebLastName}
              </p>
              <p>
                <strong>שם משתמש:</strong> {createdUserDetails.PhoneNumber}
              </p>
              <p>
                <strong>סיסמה:</strong>{" "}
                <span className="font-mono bg-gray-200 p-1 rounded">
                  {createdUserDetails.Password}
                </span>
              </p>
            </div>
            <DialogFooter>
              <button
                type="button"
                onClick={handleCopyToClipboard}
                className="px-4 py-2 flex items-center justify-center bg-gray-500 text-white rounded-full hover:bg-gray-600"
              >
                <Copy size={16} className="ml-2" />
                העתק
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 flex items-center justify-center bg-gray-500 text-white rounded-full hover:bg-gray-600"
              >
                <Printer size={16} className="ml-2" />
                הדפס
              </button>
              <button
                type="button"
                onClick={handleFinalClose}
                className="px-5 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
              >
                סגור
              </button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserModal;
