import React, { useState, useEffect, useCallback } from "react";

/**
 * A GUI for building iCalendar RRULE strings.
 * @param {object} props
 * @param {string} props.value - The current RRULE string.
 * @param {function} props.onChange - A callback function to pass the new RRULE string to the parent.
 */
const RRuleGenerator = ({ value, onChange }) => {
  const [freq, setFreq] = useState("WEEKLY");
  const [interval, setInterval] = useState(1);
  const [byDay, setByDay] = useState([]);
  const [endCondition, setEndCondition] = useState("never"); // 'never', 'on', 'after'
  const [until, setUntil] = useState("");
  const [count, setCount] = useState(10);

  const weekDays = [
    { label: "ראשון", value: "SU", short: "א" },
    { label: "שני", value: "MO", short: "ב" },
    { label: "שלישי", value: "TU", short: "ג" },
    { label: "רביעי", value: "WE", short: "ד" },
    { label: "חמישי", value: "TH", short: "ה" },
    { label: "שישי", value: "FR", short: "ו" },
    { label: "שבת", value: "SA", short: "ש" },
  ];

  // This effect parses the incoming RRULE string to set the component's state
  useEffect(() => {
    if (!value) {
      // If no value, reset to a default state
      setFreq("WEEKLY");
      setInterval(1);
      setByDay([]);
      setEndCondition("never");
      setUntil("");
      setCount(10);
      return;
    }

    const parts = value.split(";");
    const rule = parts.reduce((acc, part) => {
      const [key, val] = part.split("=");
      if (key && val) {
        acc[key.toUpperCase()] = val;
      }
      return acc;
    }, {});

    setFreq(rule.FREQ || "WEEKLY");
    setInterval(parseInt(rule.INTERVAL, 10) || 1);
    setByDay(rule.BYDAY ? rule.BYDAY.split(",") : []);

    if (rule.UNTIL) {
      setEndCondition("on");
      // Convert iCalendar UTC format (YYYYMMDDTHHMMSSZ) to YYYY-MM-DD for the date input
      const y = rule.UNTIL.substring(0, 4);
      const m = rule.UNTIL.substring(4, 6);
      const d = rule.UNTIL.substring(6, 8);
      setUntil(`${y}-${m}-${d}`);
      setCount(10); // Reset count when until is present
    } else if (rule.COUNT) {
      setEndCondition("after");
      setCount(parseInt(rule.COUNT, 10));
      setUntil(""); // Reset until when count is present
    } else {
      setEndCondition("never");
      setUntil("");
      setCount(10);
    }
  }, [value]);

  // This effect constructs the RRULE string whenever a setting changes
  const buildRuleString = useCallback(() => {
    let rule = `FREQ=${freq}`;
    if (interval > 1) {
      rule += `;INTERVAL=${interval}`;
    }
    if (byDay.length > 0 && freq === "WEEKLY") {
      rule += `;BYDAY=${byDay.join(",")}`;
    }
    if (endCondition === "on" && until) {
      // Convert YYYY-MM-DD to iCalendar UTC format (YYYYMMDDTHHMMSSZ)
      const date = new Date(until);
      const utcDate = new Date(
        date.getTime() + date.getTimezoneOffset() * 60000
      );
      const formattedDate =
        utcDate.toISOString().replace(/[-:.]/g, "").slice(0, 15) + "Z";
      rule += `;UNTIL=${formattedDate}`;
    } else if (endCondition === "after" && count > 0) {
      rule += `;COUNT=${count}`;
    }
    onChange(rule);
  }, [freq, interval, byDay, endCondition, until, count, onChange]);

  useEffect(() => {
    buildRuleString();
  }, [buildRuleString]);

  const handleWeekdayToggle = (dayValue) => {
    setByDay((prev) =>
      prev.includes(dayValue)
        ? prev.filter((d) => d !== dayValue)
        : [...prev, dayValue]
    );
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Frequency and Interval */}
      <div className="flex items-center space-x-2 space-x-reverse">
        <span>חוזר כל</span>
        <input
          type="number"
          value={interval}
          onChange={(e) =>
            setInterval(Math.max(1, parseInt(e.target.value, 10) || 1))
          }
          className="w-16 p-1 mx-1 border rounded-md text-center"
        />
        <select
          value={freq}
          onChange={(e) => setFreq(e.target.value)}
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
              onChange={(e) => setEndCondition(e.target.value)}
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
              onChange={(e) => setEndCondition(e.target.value)}
            />
            <label htmlFor="end-on" className="mr-2">
              בתאריך
            </label>
            <input
              type="date"
              value={until}
              onChange={(e) => setUntil(e.target.value)}
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
              onChange={(e) => setEndCondition(e.target.value)}
            />
            <label htmlFor="end-after" className="mr-2">
              לאחר
            </label>
            <input
              type="number"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value, 10) || 1)}
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
