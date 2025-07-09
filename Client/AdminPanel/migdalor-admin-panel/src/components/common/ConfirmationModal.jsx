// /src/components/common/ConfirmationModal.jsx

import React from "react";

/**
 * A reusable modal component to ask for user confirmation before a critical action.
 * @param {object} props
 * @param {string} props.title - The title to display in the modal header.
 * @param {string} props.message - The confirmation message/question to show the user.
 * @param {Function} props.onConfirm - The function to call when the user confirms.
 * @param {Function} props.onCancel - The function to call when the user cancels.
 */
const ConfirmationModal = ({ title, message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm text-right">
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{message}</p>
      <div className="mt-6 flex justify-end space-x-4 space-x-reverse">
        {/* The 'space-x-reverse' class is for RTL layout to correctly space buttons */}
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          ביטול
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          אישור
        </button>
      </div>
    </div>
  </div>
);

export default ConfirmationModal;
