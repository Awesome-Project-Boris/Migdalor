import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * A custom calendar component with month and year selection integrated into the header.
 * @param {object} props
 * @param {Set<string>} props.availableDates - A Set of dates in "YYYY-MM-DD" format that should be highlighted.
 * @param {Date} props.selectedDate - The currently selected date object.
 * @param {Function} props.onDateSelect - Callback function executed when a date is selected.
 */
const Calendar = ({ availableDates, onDateSelect, selectedDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Generate a list of years for the dropdown
  const years = Array.from(
    { length: 21 },
    (_, i) => new Date().getFullYear() - 10 + i
  );
  // Generate a list of month names for the dropdown
  const months = Array.from({ length: 12 }, (_, i) =>
    new Date(0, i).toLocaleString("he-IL", { month: "long" })
  );

  const handleMonthSelect = (monthIndex) => {
    setCurrentDate(new Date(currentDate.getFullYear(), monthIndex, 1));
  };

  const handleYearSelect = (year) => {
    setCurrentDate(new Date(year, currentDate.getMonth(), 1));
  };

  const handleReturnToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    onDateSelect(today); // Also select today's date
  };

  const changeMonthNavigate = (offset) => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + offset);
      return newDate;
    });
  };

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center px-2 py-2">
        <button
          onClick={() => changeMonthNavigate(-1)}
          className="p-1 rounded-md hover:bg-gray-100"
        >
          <ChevronRight size={20} />
        </button>
        <div className="flex items-center space-x-2 space-x-reverse gap-2">
          <select
            value={currentDate.getMonth()}
            onChange={(e) => handleMonthSelect(e.target.value)}
            className="p-1 border border-gray-300 rounded-md text-sm font-semibold"
          >
            {months.map((month, index) => (
              <option key={month} value={index}>
                {month}
              </option>
            ))}
          </select>
          <select
            value={currentDate.getFullYear()}
            onChange={(e) => handleYearSelect(e.target.value)}
            className="p-1 border border-gray-300 rounded-md text-sm font-semibold"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => changeMonthNavigate(1)}
          className="p-1 rounded-md hover:bg-gray-100"
        >
          <ChevronLeft size={20} />
        </button>
      </div>
    );
  };

  const renderDaysOfWeek = () => {
    const days = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];
    return (
      <div className="grid grid-cols-7 text-center text-sm text-gray-500 mt-2">
        {days.map((day) => (
          <div key={day} className="py-2 font-medium">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const monthEnd = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );
    const firstDayOfMonth = monthStart.getDay();

    const rows = [];
    let days = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div className="p-1" key={`empty-start-${i}`}></div>);
    }

    for (let day = 1; day <= monthEnd.getDate(); day++) {
      const fullDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      const formattedDate = `${fullDate.getFullYear()}-${String(
        fullDate.getMonth() + 1
      ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      const isAvailable = availableDates.has(formattedDate);
      const isSelected =
        selectedDate && selectedDate.toDateString() === fullDate.toDateString();

      let cellClasses =
        "h-10 w-10 flex items-center justify-center rounded-md transition-colors text-sm ";

      if (isSelected) {
        cellClasses += "bg-blue-600 text-white hover:bg-blue-700";
      } else if (isAvailable) {
        cellClasses +=
          "bg-blue-100 text-blue-700 font-bold cursor-pointer hover:bg-blue-200";
      } else {
        cellClasses += "text-gray-800 hover:bg-gray-100 cursor-pointer";
      }

      days.push(
        <div
          className="p-1 flex justify-center items-center"
          key={day}
          onClick={() => onDateSelect(fullDate)}
        >
          <div className={cellClasses}>{day}</div>
        </div>
      );
    }

    let week = [];
    days.forEach((day, i) => {
      week.push(day);
      if ((i + 1) % 7 === 0 || i === days.length - 1) {
        rows.push(
          <div className="grid grid-cols-7" key={`week-${i}`}>
            {week}
          </div>
        );
        week = [];
      }
    });

    return <div>{rows}</div>;
  };

  const renderFooter = () => (
    <div className="pt-2 mt-2 border-t">
      <button
        onClick={handleReturnToToday}
        className="w-full text-center py-2 text-sm font-semibold text-blue-600 hover:bg-gray-100 rounded-md"
      >
        היום
      </button>
    </div>
  );

  return (
    <div className="bg-white border rounded-lg p-3 shadow-lg max-w-md mx-auto">
      {renderHeader()}
      {renderDaysOfWeek()}
      {renderCells()}
      {renderFooter()}
    </div>
  );
};

export default Calendar;
