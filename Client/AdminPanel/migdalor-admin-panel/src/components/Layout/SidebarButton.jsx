// /src/components/layout/SidebarButton.jsx

import React from "react";

/**
 * A reusable button component for the admin sidebar.
 * @param {object} props
 * @param {React.ReactNode} props.icon - The icon element to display.
 * @param {string} props.label - The text label for the button.
 * @param {Function} props.onClick - The function to call when the button is clicked.
 * @param {boolean} props.isActive - Whether the button represents the currently active page.
 * @param {boolean} [props.disabled=false] - Whether the button is disabled.
 */
const SidebarButton = ({
  icon,
  label,
  onClick,
  isActive,
  disabled = false,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center w-full px-4 py-2 text-sm font-medium text-left rounded-md transition-colors duration-150 ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-gray-300 hover:bg-gray-700 hover:text-white"
    } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
  >
    {/* Clone the icon to apply consistent styling */}
    {React.cloneElement(icon, { className: "w-5 h-5" })}
    <span className="mr-4">{label}</span>
  </button>
);

export default SidebarButton;
