import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * A custom calendar component with month and year selection.
 * @param {object} props
 * @param {Set<string>} props.availableDates - A Set of dates in "YYYY-MM-DD" format that should be highlighted.
 * @param {Date} props.selectedDate - The currently selected date object.
 * @param {Function} props.onDateSelect - Callback function executed when a date is selected.
 */
const Calendar = ({ availableDates, onDateSelect, selectedDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isPickerVisible, setIsPickerVisible] = useState(false);

  const years = Array.from(
    { length: 21 },
    (_, i) => new Date().getFullYear() - 10 + i
  );
  const months = Array.from({ length: 12 }, (_, i) =>
    new Date(0, i).toLocaleString("he-IL", { month: "long" })
  );

  const handleMonthChange = (monthIndex) => {
    setCurrentDate(new Date(currentDate.getFullYear(), monthIndex, 1));
  };

  const handleYearChange = (year) => {
    setCurrentDate(new Date(year, currentDate.getMonth(), 1));
  };

  const handleReturnToToday = () => {
    setCurrentDate(new Date());
    setIsPickerVisible(false);
  };

  const changeMonthNavigate = (offset) => {
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
          onClick={() => changeMonthNavigate(-1)}
          className="p-1 rounded-md hover:bg-gray-100"
        >
          <ChevronRight size={20} />
        </button>
        <button
          onClick={() => setIsPickerVisible(true)}
          className="font-semibold text-lg hover:bg-gray-100 px-2 py-1 rounded-md transition-colors"
        >
          {monthFormat.format(currentDate)}
        </button>
        <button
          onClick={() => changeMonthNavigate(1)}
          className="p-1 rounded-md hover:bg-gray-100"
        >
          <ChevronLeft size={20} />
        </button>
      </div>
    );
  };

  const renderPicker = () => (
    <div className="p-4">
      <div className="flex justify-center items-center space-x-2 space-x-reverse mb-4">
        <select
          value={currentDate.getMonth()}
          onChange={(e) => handleMonthChange(e.target.value)}
          className="p-2 border border-gray-300 rounded-md"
        >
          {months.map((month, index) => (
            <option key={month} value={index}>
              {month}
            </option>
          ))}
        </select>
        <select
          value={currentDate.getFullYear()}
          onChange={(e) => handleYearChange(e.target.value)}
          className="p-2 border border-gray-300 rounded-md"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <button
          onClick={() => setIsPickerVisible(false)}
          className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          חזור ללוח השנה
        </button>
        <button
          onClick={handleReturnToToday}
          className="w-full py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          חזור להיום
        </button>
      </div>
    </div>
  );

  const renderDaysOfWeek = () => {
    const days = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];
    return (
      <div className="grid grid-cols-7 text-center text-sm text-gray-500">
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

  return (
    <div className="bg-white border rounded-lg p-3 shadow-sm max-w-sm mx-auto">
      {isPickerVisible ? (
        renderPicker()
      ) : (
        <>
          {renderHeader()}
          {renderDaysOfWeek()}
          {renderCells()}
        </>
      )}
    </div>
  );
};

export default Calendar;
