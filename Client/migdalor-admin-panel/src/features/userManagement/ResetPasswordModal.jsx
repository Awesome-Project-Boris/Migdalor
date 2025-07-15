import React, { useState, useEffect, useCallback } from "react";
import { X, RefreshCw, Printer, Copy } from "lucide-react";
import { api } from "../../api/apiService";
import InputField from "../../components/common/InputField";

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
      className={`relative z-50 grid w-full max-w-lg gap-4 border bg-white p-6 shadow-lg rounded-2xl ${className}`}
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

// --- Main ResetPasswordModal Component ---

const ResetPasswordModal = ({ isOpen, onClose, user, onPasswordReset }) => {
  const [newPassword, setNewPassword] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setNewPassword(shuffledPass);
  }, []);

  useEffect(() => {
    if (isOpen) {
      generatePassword();
      setShowConfirmation(false);
    }
  }, [isOpen, generatePassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      alert("הסיסמה חייבת להיות באורך 8 תווים לפחות.");
      return;
    }
    setIsSubmitting(true);
    try {
      await onPasswordReset(user.id, newPassword);
      setShowConfirmation(true);
    } catch (error) {
      alert(`שגיאה באיפוס סיסמה: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById(
      "password-print-area-reset"
    ).innerHTML;
    const printWindow = window.open("", "_blank", "height=500,width=500");
    printWindow.document.write("<html><head><title>פרטי משתמש</title>");
    printWindow.document.write(
      "<style>body { direction: rtl; text-align: right; font-family: Arial, sans-serif; padding: 20px; }</style>"
    );
    printWindow.document.write("</head><body>");
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
    navigator.clipboard.writeText(
      `שם משתמש: ${user.phoneNumber}\nסיסמה חדשה: ${newPassword}`
    );
    alert("פרטי המשתמש הועתקו.");
  };

  if (!isOpen || !user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        {!showConfirmation ? (
          <>
            <DialogHeader>
              <DialogTitle>איפוס סיסמה עבור {user.fullName}</DialogTitle>
              <DialogDescription>
                הזן סיסמה חדשה או השתמש בזו שנוצרה אוטומטית.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} noValidate>
              <div className="py-4">
                <div className="relative">
                  <InputField
                    label="סיסמה חדשה"
                    name="password"
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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
                  {isSubmitting ? "מאפס סיסמה..." : "אפס סיסמה"}
                </button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>הסיסמה אופסה בהצלחה!</DialogTitle>
              <DialogDescription>
                יש למסור את הסיסמה החדשה למשתמש.
              </DialogDescription>
            </DialogHeader>
            <div
              id="password-print-area-reset"
              className="p-4 bg-gray-100 rounded-lg text-right space-y-2"
            >
              <p>
                <strong>שם:</strong> {user.fullName}
              </p>
              <p>
                <strong>שם משתמש:</strong> {user.phoneNumber}
              </p>
              <p>
                <strong>סיסמה חדשה:</strong>{" "}
                <span className="font-mono bg-gray-200 p-1 rounded">
                  {newPassword}
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
                onClick={onClose}
                className="px-5 py-2 mx-1 bg-blue-600 text-white rounded-full hover:bg-blue-700"
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

export default ResetPasswordModal;
