import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import InputField from "../../components/common/InputField";
import CheckboxField from "../../components/common/CheckboxField";
import RRuleGenerator from "./RRuleGenerator"; // Import the new component
import { useAuth } from "../../auth/AuthContext";

const EventModal = ({
  isOpen,
  onClose,
  onSave,
  showToast,
  event,
  eventType,
}) => {
  const { user, token } = useAuth();
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!event;

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        EventName: event.eventName || "",
        Description: event.description || "",
        Location: event.location || "",
        Capacity: event.capacity || 0,
        IsRecurring: event.isRecurring || false,
        RecurrenceRule: event.recurrenceRule || "",
        StartDate: event.startDate
          ? new Date(event.startDate).toISOString().slice(0, 16)
          : "",
        EndDate: event.endDate
          ? new Date(event.endDate).toISOString().slice(0, 16)
          : "",
      });
    } else {
      setFormData({
        EventName: "",
        Description: "",
        Location: "",
        Capacity: 0,
        IsRecurring: eventType === "class",
        RecurrenceRule: eventType === "class" ? "FREQ=WEEKLY;INTERVAL=1" : "",
        StartDate: "",
        EndDate: "",
      });
    }
  }, [event, eventType, isEditMode, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRruleChange = (newRrule) => {
    setFormData((prev) => ({ ...prev, RecurrenceRule: newRrule }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const eventData = {
      ...formData,
      HostID: user.id,
    };

    try {
      await onSave(eventData, isEditMode ? event.eventID : null);
      handleClose();
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      dir="rtl"
    >
      <div className="relative bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-4 border-b">
          <h3 className="text-xl font-semibold">
            {isEditMode
              ? `עריכת ${event.isRecurring ? "חוג" : "אירוע"}`
              : `יצירת ${eventType === "class" ? "חוג" : "אירוע"} חדש`}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="py-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="שם האירוע/חוג"
              name="EventName"
              value={formData.EventName}
              onChange={handleChange}
              required
            />
            <InputField
              label="מיקום"
              name="Location"
              value={formData.Location}
              onChange={handleChange}
            />
            <InputField
              label="קיבולת משתתפים"
              name="Capacity"
              type="number"
              value={formData.Capacity}
              onChange={handleChange}
            />
            <InputField
              label="תאריך התחלה"
              name="StartDate"
              type="datetime-local"
              value={formData.StartDate}
              onChange={handleChange}
              required
              InputLabelProps={{ shrink: true }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 text-right">
              תיאור
            </label>
            <textarea
              name="Description"
              value={formData.Description}
              onChange={handleChange}
              rows="4"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          <div className="p-4 border rounded-md bg-gray-50 space-y-4">
            <CheckboxField
              label="אירוע קבוע (חוג)"
              name="IsRecurring"
              checked={formData.IsRecurring}
              onChange={handleChange}
            />
            {formData.IsRecurring && (
              <RRuleGenerator
                value={formData.RecurrenceRule}
                onChange={handleRruleChange}
              />
            )}
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              ביטול
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isSubmitting ? "שומר..." : "שמור שינויים"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;
