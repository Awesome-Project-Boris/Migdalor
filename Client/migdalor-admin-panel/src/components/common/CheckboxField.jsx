// /src/components/common/CheckboxField.jsx

import React from "react";

/**
 * A reusable checkbox component with a label.
 * It forwards any additional props (like name, checked, onChange) to the underlying input element.
 * @param {object} props
 * @param {string} props.label - The text to display next to the checkbox.
 */
const CheckboxField = ({ label, ...props }) => (
  <div className="flex items-center">
    <input
      {...props}
      type="checkbox"
      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
    />
    <label className="mr-2 block text-sm text-gray-900">{label}</label>
  </div>
);

export default CheckboxField;
