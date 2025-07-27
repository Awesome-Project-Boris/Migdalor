import React from "react";

const RoleSelection = ({
  allCategories,
  staffRoleType,
  onRoleTypeChange,
  selectedRoles,
  onCategoryRoleChange,
}) => {
  return (
    <div className="md:col-span-2 space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 text-right mb-2">
          סוג תפקיד
        </label>
        <div className="grid grid-cols-3 gap-2 rounded-lg bg-gray-100 p-1">
          <label
            className={`text-center px-3 py-1.5 text-sm rounded-md cursor-pointer transition-colors ${
              staffRoleType === "categories"
                ? "bg-white text-blue-600 shadow"
                : "text-gray-600"
            }`}
          >
            <input
              type="radio"
              name="staffRoleType"
              value="categories"
              checked={staffRoleType === "categories"}
              onChange={onRoleTypeChange}
              className="sr-only"
            />
            הרשאות קטגוריה
          </label>
          <label
            className={`text-center px-3 py-1.5 text-sm rounded-md cursor-pointer transition-colors ${
              staffRoleType === "instructor"
                ? "bg-white text-blue-600 shadow"
                : "text-gray-600"
            }`}
          >
            <input
              type="radio"
              name="staffRoleType"
              value="instructor"
              checked={staffRoleType === "instructor"}
              onChange={onRoleTypeChange}
              className="sr-only"
            />
            מדריך
          </label>
          <label
            className={`text-center px-3 py-1.5 text-sm rounded-md cursor-pointer transition-colors ${
              staffRoleType === "admin"
                ? "bg-white text-blue-600 shadow"
                : "text-gray-600"
            }`}
          >
            <input
              type="radio"
              name="staffRoleType"
              value="admin"
              checked={staffRoleType === "admin"}
              onChange={onRoleTypeChange}
              className="sr-only"
            />
            מנהל מערכת
          </label>
        </div>
      </div>

      {staffRoleType === "categories" && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 text-right">
            בחר הרשאות קטגוריה
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-2 border rounded-md max-h-32 overflow-y-auto">
            {Array.isArray(allCategories) &&
              allCategories.map((cat) => (
                <label
                  key={cat.categoryId}
                  className="flex items-center space-x-2 space-x-reverse"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded mx-1 border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={selectedRoles.includes(cat.categoryEngName)}
                    onChange={() => onCategoryRoleChange(cat.categoryEngName)}
                  />
                  <span className="text-gray-700">{cat.categoryHebName}</span>
                </label>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleSelection;
