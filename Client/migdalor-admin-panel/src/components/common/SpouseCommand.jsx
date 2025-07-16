import React, { useState, useMemo, useEffect, useRef } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";

/**
 * A command-style component for searching and selecting a spouse.
 * @param {object} props
 * @param {Array} props.users - The list of all users to search from.
 * @param {object} props.currentUser - The user currently being edited.
 * @param {string|null} props.selectedSpouseId - The ID of the currently selected spouse.
 * @param {Function} props.onSelectSpouse - Callback function to update the selected spouse ID.
 */
const SpouseCommand = ({
  users,
  currentUser,
  selectedSpouseId,
  onSelectSpouse,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const popoverRef = useRef(null);

  // Filter out the current user from the list of potential spouses.
  const availableSpouses = useMemo(() => {
    return users.filter((u) => u.id !== currentUser.id);
  }, [users, currentUser.id]);

  // Filter spouses based on the search input.
  const filteredSpouses = useMemo(() => {
    if (!search) {
      return availableSpouses;
    }
    return availableSpouses.filter((spouse) =>
      spouse.fullName.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, availableSpouses]);

  // Find the full user object for the selected spouse.
  const selectedSpouse = useMemo(() => {
    return users.find((u) => u.id === selectedSpouseId);
  }, [users, selectedSpouseId]);

  // Handle selecting a spouse from the list.
  const handleSelect = (spouseId) => {
    onSelectSpouse(spouseId);
    setOpen(false);
    setSearch("");
  };

  // Handle clearing the spouse selection.
  const handleClear = (e) => {
    e.stopPropagation(); // Prevent the popover from opening
    onSelectSpouse(null);
  };

  // Close the popover if clicking outside of it.
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full" ref={popoverRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        בן/בת זוג
      </label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-right shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="truncate">
          {selectedSpouse ? selectedSpouse.fullName : "בחר/י בן/בת זוג..."}
        </span>
        <div className="flex items-center">
          {selectedSpouse && (
            <X
              className="h-4 w-4 text-gray-500 hover:text-gray-800 ml-2"
              onClick={handleClear}
            />
          )}
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </div>
      </button>
      {open && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border">
          <div className="p-2">
            <input
              type="text"
              placeholder="חיפוש..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
          </div>
          <ul className="max-h-60 overflow-y-auto">
            {filteredSpouses.length === 0 ? (
              <p className="p-4 text-sm text-center text-gray-500">
                לא נמצאו דיירים.
              </p>
            ) : (
              filteredSpouses.map((spouse) => (
                <li
                  key={spouse.id}
                  onClick={() => handleSelect(spouse.id)}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100"
                >
                  {selectedSpouseId === spouse.id && (
                    <Check className="absolute left-2 h-4 w-4" />
                  )}
                  {spouse.fullName}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SpouseCommand;
