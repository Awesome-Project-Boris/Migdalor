import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * A custom calendar component inspired by shadcn/ui.
 * @param {object} props
 * @param {Set<string>} props.availableDates - A Set of dates in "YYYY-MM-DD" format that should be highlighted.
 * @param {Date} props.selectedDate - The currently selected date object.
 * @param {Function} props.onDateSelect - Callback function executed when a date is selected.
 */
const Calendar = ({ availableDates, onDateSelect, selectedDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysOfWeek = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];

  const changeMonth = (offset) => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + offset);
      return newDate;
    });
  };

  const renderHeader = () => {
    const monthFormat = new Intl.DateTimeFormat("he-IL", {
      month: "long",
      year: "numeric",
    });
    return (
      <div className="flex justify-between items-center px-2 py-2">
        <button
          onClick={() => changeMonth(-1)}
          className="p-1 rounded-md hover:bg-gray-100"
        >
          <ChevronRight size={20} />
        </button>
        <h2 className="font-semibold text-lg">
          {monthFormat.format(currentDate)}
        </h2>
        <button
          onClick={() => changeMonth(1)}
          className="p-1 rounded-md hover:bg-gray-100"
        >
          <ChevronLeft size={20} />
        </button>
      </div>
    );
  };

  const renderDaysOfWeek = () => {
    return (
      <div className="grid grid-cols-7 text-center text-sm text-gray-500">
        {daysOfWeek.map((day) => (
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

    // Add blank cells for the days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div className="p-1" key={`empty-start-${i}`}></div>);
    }

    // Add cells for each day of the month
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

    // Organize cells into rows
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

  return (
    <div className="bg-white border rounded-lg p-3 shadow-sm max-w-sm mx-auto">
      {renderHeader()}
      {renderDaysOfWeek()}
      {renderCells()}
    </div>
  );
};

export default Calendar;
