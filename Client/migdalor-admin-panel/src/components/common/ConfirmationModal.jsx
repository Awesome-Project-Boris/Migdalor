import React, { useState, useEffect } from "react";

/**
 * A reusable, importable modal component using Tailwind CSS for user confirmation.
 * It is designed for right-to-left (RTL) languages like Hebrew and includes animations.
 *
 * @param {object} props
 * @param {string} props.title - The title to display in the modal header.
 * @param {string} props.message - The confirmation message/question to show the user.
 * @param {Function} props.onConfirm - The function to call when the user clicks the confirm button.
 * @param {Function} props.onCancel - The function to call when the user clicks the cancel button.
 * @param {string} [props.confirmText='אישור'] - Optional text for the confirm button.
 * @param {string} [props.cancelText='ביטול'] - Optional text for the cancel button.
 * @param {number} [props.backdropOpacity=0.5] - The backdrop opacity, a value between 0 and 1.
 * @param {string} [props.confirmButtonClasses] - Custom Tailwind CSS classes for the confirm button.
 * @param {string} [props.cancelButtonClasses] - Custom Tailwind CSS classes for the cancel button.
 * @param {boolean} [props.showCloseButton=true] - Determines if the 'X' close button is shown.
 * @param {boolean} [props.closeOnBackdropClick=true] - Determines if clicking the backdrop closes the modal.
 */
const ConfirmationModal = ({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "אישור",
  cancelText = "ביטול",
  backdropOpacity = 0.5,
  confirmButtonClasses = "bg-red-600 hover:bg-red-700 text-white",
  cancelButtonClasses = "bg-gray-200 hover:bg-gray-300 text-gray-800",
  showCloseButton = true,
  closeOnBackdropClick = true,
}) => {
  const [isShowing, setIsShowing] = useState(false);

  useEffect(() => {
    // Set isShowing to true shortly after mounting to trigger the appear animation.
    const timer = setTimeout(() => setIsShowing(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const backdropStyle = {
    backgroundColor: `rgba(0, 0, 0, ${isShowing ? backdropOpacity : 0})`,
  };

  const handleBackdropClick = () => {
    if (closeOnBackdropClick) {
      onCancel();
    }
  };

  return (
    // The outer div is the modal backdrop. It transitions its opacity.
    <div
      className="fixed inset-0 bg-black flex justify-center items-center z-50 p-4 transition-colors duration-300 ease-in-out"
      style={backdropStyle}
      dir="rtl" // Ensure right-to-left direction for the entire modal
      onClick={handleBackdropClick}
    >
      {/* This is the actual modal panel. It transitions its opacity and scale. */}
      {/* We stop propagation of clicks so that clicking inside the modal doesn't close it. */}
      <div
        className={`relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md text-right transform transition-all duration-300 ease-in-out ${
          isShowing ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton && (
          <button
            onClick={onCancel}
            className="absolute top-3 left-3 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        )}

        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-600">{message}</p>

        {/* Container for the action buttons */}
        <div className="mt-8 flex justify-end space-x-6 space-x-reverse">
          {/* The 'space-x-reverse' class correctly handles spacing in RTL */}
          <button
            onClick={onCancel}
            className={`px-7 mx-2 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${cancelButtonClasses}`}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-7 mx-2 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${confirmButtonClasses}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
