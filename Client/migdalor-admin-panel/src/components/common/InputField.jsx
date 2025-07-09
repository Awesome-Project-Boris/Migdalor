// /src/components/common/InputField.jsx

import React from "react";

/**
 * A reusable input field component with a label and consistent styling.
 * It forwards any additional props (like name, type, value, onChange) to the underlying input element.
 * @param {object} props
 * @param {string} props.label - The text to display in the label for the input field.
 */
const InputField = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 text-right">
      {label}
    </label>
    <input
      {...props}
      className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-right"
    />
  </div>
);

export default InputField;
