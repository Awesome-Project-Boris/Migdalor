import React, { useState, useMemo, useEffect, useRef } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";

const ApartmentCommand = ({
  apartments,
  selectedApartment,
  onSelectApartment,
  label = "מספר דירה",
  placeholder = "חפש/י מספר דירה...",
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const popoverRef = useRef(null);

  useEffect(() => {
    setSearch(selectedApartment || "");
  }, [selectedApartment]);

  const filteredApartments = useMemo(() => {
    if (!search) {
      return apartments;
    }
    return apartments.filter((apartment) =>
      apartment.toString().includes(search)
    );
  }, [search, apartments]);

  const handleSelect = (apartmentNumber) => {
    const value = apartmentNumber.toString();
    setSearch(value);
    onSelectApartment(value);
    setOpen(false);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    // Important: We only call onSelectApartment when an item is clicked,
    // not on every keystroke.
  };

  const handleInputBlur = () => {
    // If the text in the input doesn't exactly match an apartment, clear it.
    const match = apartments.find((apt) => String(apt) === search);
    if (!match) {
      setSearch("");
      onSelectApartment(null);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setSearch("");
    onSelectApartment(null);
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
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          onBlur={handleInputBlur}
          className="w-full flex items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-right shadow-sm"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-2">
          {search && (
            <X
              className="h-4 w-4 text-gray-500 hover:text-gray-800 cursor-pointer"
              onClick={handleClear}
            />
          )}
          <ChevronsUpDown
            className="h-4 w-4 opacity-50 cursor-pointer"
            onClick={() => setOpen(!open)}
          />
        </div>
      </div>

      {open && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border">
          <ul className="max-h-60 overflow-y-auto">
            {filteredApartments.length > 0 ? (
              filteredApartments.map((apartment) => (
                <li
                  key={apartment}
                  onClick={() => handleSelect(apartment)}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100"
                >
                  {selectedApartment === apartment.toString() && (
                    <Check className="absolute left-2 h-4 w-4" />
                  )}
                  {apartment}
                </li>
              ))
            ) : (
              <p className="p-4 text-sm text-center text-gray-500">
                לא נמצאו דירות.
              </p>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ApartmentCommand;
