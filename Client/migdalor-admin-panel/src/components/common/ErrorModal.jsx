import React from "react";
import { X } from "lucide-react";

/**
 * Extracts a displayable message from a server response object.
 * @param {object} response - The `response` object from an Axios error.
 * @returns {string} A user-friendly error message.
 */
const getServerMessage = (response) => {
  // Handle network errors or cases where response is undefined
  if (!response) {
    return "Could not connect to the server. Please check your network connection.";
  }

  const { data } = response;

  // Handle cases where data itself is missing
  if (!data) {
    return "Received an empty response from the server.";
  }

  // **THE FIX IS HERE**: Look for the 'message' property in the response data.
  if (data.message) {
    return data.message;
  }

  // Fallback for older error formats or plain string responses
  if (typeof data === "string" && data.length > 0) {
    return data;
  }
  if (data.title) {
    return data.title;
  }
  if (data.detail) {
    return data.detail;
  }

  // Final fallback for unexpected structures
  return "An unexpected error occurred.";
};

const ErrorModal = ({ isOpen, onClose, title, response }) => {
  if (!isOpen) return null;

  const message = getServerMessage(response);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="relative z-50 w-full max-w-md bg-white p-6 rounded-2xl shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-red-600">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-gray-700">{message}</p>
          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
            >
              הבנתי
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
