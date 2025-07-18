import React, { useState, useMemo, useEffect, useRef } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";

const SpouseCommand = ({
  users,
  currentUser,
  selectedSpouseId,
  onSelectSpouse,
  label = "בן/בת זוג",
  placeholder = "בחר/י בן/בת זוג...",
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const popoverRef = useRef(null);

  const availableSpouses = useMemo(() => {
    if (!currentUser?.id) return users; // If no current user, all are available
    return users.filter((u) => u.id !== currentUser.id);
  }, [users, currentUser?.id]);

  const filteredSpouses = useMemo(() => {
    if (!search) {
      return availableSpouses;
    }
    return availableSpouses.filter((spouse) =>
      spouse.fullName.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, availableSpouses]);

  const selectedSpouse = useMemo(() => {
    return users.find((u) => u.id === selectedSpouseId);
  }, [users, selectedSpouseId]);

  const handleSelect = (spouseId) => {
    onSelectSpouse(spouseId);
    setOpen(false);
    setSearch("");
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onSelectSpouse(null);
  };

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
      <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-right shadow-sm"
      >
        <span className="truncate">
          {selectedSpouse ? selectedSpouse.fullName : placeholder}
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
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
              autoFocus
            />
          </div>
          <ul className="max-h-60 overflow-y-auto">
            {filteredSpouses.length === 0 ? (
              <p className="p-4 text-sm text-center text-gray-500">
                לא נמצאו תוצאות.
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
