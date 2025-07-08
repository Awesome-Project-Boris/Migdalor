import React from "react";

const SidebarButton = ({ icon, label, onClick, isActive, disabled }) => {
  const marginClass = "mr-4";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center w-full px-4 py-2 text-sm font-medium text-left rounded-md transition-colors duration-150
            ${
              isActive
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:bg-gray-700 hover:text-white"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            `}
    >
      {icon}
      <span className={marginClass}>{label}</span>
    </button>
  );
};

export default SidebarButton;
