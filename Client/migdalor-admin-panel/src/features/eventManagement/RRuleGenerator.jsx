import React from "react";

/**
 * A fully controlled GUI for building iCalendar RRULE strings.
 * @param {object} props
 * @param {string} props.value - The current RRULE string.
 * @param {function} props.onChange - A callback function to pass the new RRULE string to the parent.
 */
const RRuleGenerator = ({ value, onChange }) => {
  const weekDays = [
    { label: "ראשון", value: "SU", short: "א" },
    { label: "שני", value: "MO", short: "ב" },
    { label: "שלישי", value: "TU", short: "ג" },
    { label: "רביעי", value: "WE", short: "ד" },
    { label: "חמישי", value: "TH", short: "ה" },
    { label: "שישי", value: "FR", short: "ו" },
    { label: "שבת", value: "SA", short: "ש" },
  ];
  const weekDayOrder = weekDays.map((d) => d.value);

  // --- State Derivation ---
  // All state is derived directly from the 'value' prop on every render.
  // This makes the component fully controlled and eliminates the need for useEffect hooks that were causing the infinite loop.
  const ruleParts = React.useMemo(() => {
    const parts = (value || "").split(";");
    const rule = parts.reduce((acc, part) => {
      const [key, val] = part.split("=");
      if (key && val) acc[key.toUpperCase()] = val;
      return acc;
    }, {});
    return rule;
  }, [value]);

  const freq = ruleParts.FREQ || "WEEKLY";
  const interval = parseInt(ruleParts.INTERVAL, 10) || 1;
  const byDay = ruleParts.BYDAY ? ruleParts.BYDAY.split(",") : [];

  let endCondition = "never";
  let until = "";
  let count = 10;

  if (ruleParts.UNTIL) {
    endCondition = "on";
    const y = ruleParts.UNTIL.substring(0, 4);
    const m = ruleParts.UNTIL.substring(4, 6);
    const d = ruleParts.UNTIL.substring(6, 8);
    until = `${y}-${m}-${d}`;
  } else if (ruleParts.COUNT) {
    endCondition = "after";
    count = parseInt(ruleParts.COUNT, 10);
  }

  // --- Event Handlers ---
  // Handlers now construct the new rule string and call onChange immediately.

  const buildAndFireOnChange = (newParts) => {
    const currentParts = {
      FREQ: freq,
      INTERVAL: interval > 1 ? interval : undefined,
      BYDAY: byDay.length > 0 ? byDay.join(",") : undefined,
      UNTIL: endCondition === "on" ? ruleParts.UNTIL : undefined,
      COUNT: endCondition === "after" ? count : undefined,
    };

    const mergedParts = { ...currentParts, ...newParts };

    // Build the new rule string from parts
    let newRule = `FREQ=${mergedParts.FREQ}`;
    if (mergedParts.INTERVAL) newRule += `;INTERVAL=${mergedParts.INTERVAL}`;
    if (mergedParts.BYDAY) newRule += `;BYDAY=${mergedParts.BYDAY}`;

    // When switching end condition, remove the other condition's part
    if (mergedParts.UNTIL) {
      newRule += `;UNTIL=${mergedParts.UNTIL}`;
    } else if (mergedParts.COUNT) {
      newRule += `;COUNT=${mergedParts.COUNT}`;
    }

    onChange(newRule);
  };

  const handleFreqChange = (e) => {
    buildAndFireOnChange({ FREQ: e.target.value });
  };

  const handleIntervalChange = (e) => {
    const newInterval = Math.max(1, parseInt(e.target.value, 10) || 1);
    buildAndFireOnChange({ INTERVAL: newInterval });
  };

  const handleWeekdayToggle = (dayValue) => {
    const newDays = byDay.includes(dayValue)
      ? byDay.filter((d) => d !== dayValue)
      : [...byDay, dayValue];
    newDays.sort((a, b) => weekDayOrder.indexOf(a) - weekDayOrder.indexOf(b));

    buildAndFireOnChange({
      BYDAY: newDays.length > 0 ? newDays.join(",") : undefined,
    });
  };

  const handleEndConditionChange = (e) => {
    const newCondition = e.target.value;
    if (newCondition === "never") {
      buildAndFireOnChange({ UNTIL: undefined, COUNT: undefined });
    } else if (newCondition === "on") {
      // Set a default date if 'until' is not already set
      const newUntil = until || new Date().toISOString().split("T")[0];
      const date = new Date(newUntil);
      const utcDate = new Date(
        date.getTime() + date.getTimezoneOffset() * 60000
      );
      const formattedDate =
        utcDate.toISOString().replace(/[-:.]/g, "").slice(0, 15) + "Z";
      buildAndFireOnChange({ UNTIL: formattedDate, COUNT: undefined });
    } else if (newCondition === "after") {
      buildAndFireOnChange({ COUNT: count || 10, UNTIL: undefined });
    }
  };

  const handleUntilChange = (e) => {
    const date = new Date(e.target.value);
    const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    const formattedDate =
      utcDate.toISOString().replace(/[-:.]/g, "").slice(0, 15) + "Z";
    buildAndFireOnChange({ UNTIL: formattedDate });
  };

  const handleCountChange = (e) => {
    buildAndFireOnChange({ COUNT: parseInt(e.target.value, 10) || 1 });
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Frequency and Interval */}
      <div className="flex items-center space-x-2 space-x-reverse">
        <span>חוזר כל</span>
        <input
          type="number"
          value={interval}
          onChange={handleIntervalChange}
          className="w-16 p-1 mx-1 border rounded-md text-center"
        />
        <select
          value={freq}
          onChange={handleFreqChange}
          className="p-1 border rounded-md"
        >
          <option value="DAILY">יום</option>
          <option value="WEEKLY">שבוע</option>
          <option value="MONTHLY">חודש</option>
          <option value="YEARLY">שנה</option>
        </select>
      </div>

      {/* Weekday Selection */}
      {freq === "WEEKLY" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            בימים
          </label>
          <div className="flex items-center justify-center space-x-1 space-x-reverse">
            {weekDays.map((day) => (
              <button
                key={day.value}
                type="button"
                onClick={() => handleWeekdayToggle(day.value)}
                className={`w-10 h-10 rounded-full text-sm font-semibold mx-1 transition-colors ${
                  byDay.includes(day.value)
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {`${day.short}׳`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* End Condition */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          סיום
        </label>
        <div className="space-y-2">
          <div className="flex items-center">
            <input
              type="radio"
              id="end-never"
              name="endCondition"
              value="never"
              checked={endCondition === "never"}
              onChange={handleEndConditionChange}
            />
            <label htmlFor="end-never" className="mr-2">
              לעולם לא
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="end-on"
              name="endCondition"
              value="on"
              checked={endCondition === "on"}
              onChange={handleEndConditionChange}
            />
            <label htmlFor="end-on" className="mr-2">
              בתאריך
            </label>
            <input
              type="date"
              value={until}
              onChange={handleUntilChange}
              disabled={endCondition !== "on"}
              className="mr-2 p-1 border rounded-md disabled:bg-gray-100"
            />
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="end-after"
              name="endCondition"
              value="after"
              checked={endCondition === "after"}
              onChange={handleEndConditionChange}
            />
            <label htmlFor="end-after" className="mr-2">
              לאחר
            </label>
            <input
              type="number"
              value={count}
              onChange={handleCountChange}
              disabled={endCondition !== "after"}
              className="w-16 p-1 border rounded-md text-center mr-2 disabled:bg-gray-100"
            />
            <span className="mr-2">פעמים</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RRuleGenerator;
