import React, { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import InputField from "../../components/common/InputField";
import CheckboxField from "../../components/common/CheckboxField";
import RRuleGenerator from "./RRuleGenerator";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../api/apiService";
import SpouseCommand from "../../components/common/SpouseCommand";
import ImageUpload from "../../components/common/ImageUpload";

// Helper function to convert UTC date strings to the format needed by <input type="datetime-local">
const convertToInputFormat = (dateString) => {
  if (!dateString) return "";
  // Directly format the date string by slicing. This assumes the server provides a string
  // that is already correctly formatted up to the minute (e.g., "YYYY-MM-DDTHH:mm:ss").
  return dateString.slice(0, 16);
};

const EventModal = ({ isOpen, onClose, onSave, eventId, eventType }) => {
  const { user, token } = useAuth();
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allHosts, setAllHosts] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [displayHosts, setDisplayHosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [existingImage, setExistingImage] = useState(null);

  const isEditMode = !!eventId;

  useEffect(() => {
    const fetchHostData = async () => {
      if (isOpen) {
        try {
          const [hostsData, instructorsData] = await Promise.all([
            api.get("/people/all-names", token),
            api.get("/people/instructors", token),
          ]);
          setAllHosts(hostsData);
          setInstructors(instructorsData);
        } catch (error) {
          console.error("Failed to fetch host data:", error);
        }
      }
    };
    fetchHostData();
  }, [isOpen, token]);

  useEffect(() => {
    const fetchEventDetails = async () => {
      setIsLoading(true);
      try {
        const eventDetails = await api.get(`/events/${eventId}`, token);
        setFormData({
          EventName: eventDetails.eventName || "",
          Description: eventDetails.description || "",
          Location: eventDetails.location || "",
          Capacity: eventDetails.capacity || 0,
          IsRecurring: eventDetails.isRecurring || false,
          RecurrenceRule: eventDetails.recurrenceRule || "",
          StartDate: convertToInputFormat(eventDetails.startDate),
          EndDate: convertToInputFormat(eventDetails.endDate),
          HostId: eventDetails.host?.hostId || null,
          PictureId: eventDetails.pictureId || null,
        });
        if (eventDetails.picturePath) {
          setExistingImage({ serverPath: eventDetails.picturePath });
        } else {
          setExistingImage(null);
        }
      } catch (error) {
        console.error("Failed to fetch event details", error);
        onClose();
      } finally {
        setIsLoading(false);
      }
    };

    const initializeNewEventForm = () => {
      setFormData({
        EventName: "",
        Description: "",
        Location: "",
        Capacity: 0,
        IsRecurring: eventType === "classes",
        RecurrenceRule: eventType === "classes" ? "FREQ=WEEKLY;INTERVAL=1" : "",
        StartDate: "",
        EndDate: "",
        HostId: user.id,
        PictureId: null,
      });
      setExistingImage(null);
    };

    if (isOpen) {
      if (isEditMode) {
        fetchEventDetails();
      } else {
        initializeNewEventForm();
      }
    }
  }, [isOpen, eventId, eventType, user.id, token, onClose, isEditMode]);

  // Effect to manage the list of hosts displayed in the dropdown
  useEffect(() => {
    if (formData.IsRecurring) {
      setDisplayHosts(instructors);
      // If the currently selected host is not an instructor, clear the selection.
      const isHostAnInstructor = instructors.some(
        (inst) => inst.id === formData.HostId
      );
      if (formData.HostId && !isHostAnInstructor) {
        setFormData((prev) => ({ ...prev, HostId: null }));
      }
    } else {
      setDisplayHosts(allHosts);
    }
  }, [formData.IsRecurring, allHosts, instructors, formData.HostId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "StartDate") {
      const startDate = new Date(value);
      if (!isNaN(startDate.getTime())) {
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Add one hour
        const year = endDate.getFullYear();
        const month = String(endDate.getMonth() + 1).padStart(2, "0");
        const day = String(endDate.getDate()).padStart(2, "0");
        const hours = String(endDate.getHours()).padStart(2, "0");
        const minutes = String(endDate.getMinutes()).padStart(2, "0");
        const formattedEndDate = `${year}-${month}-${day}T${hours}:${minutes}`;

        setFormData((prev) => ({
          ...prev,
          StartDate: value,
          EndDate: formattedEndDate,
        }));
      } else {
        setFormData((prev) => ({ ...prev, StartDate: value, EndDate: "" }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleHostSelect = (hostId) => {
    setFormData((prev) => ({ ...prev, HostId: hostId }));
  };

  const handleRruleChange = useCallback((newRrule) => {
    setFormData((prev) => ({ ...prev, RecurrenceRule: newRrule }));
  }, []);

  const handleImageUploadSuccess = (picId) => {
    setFormData((prev) => ({ ...prev, PictureId: picId }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const finalFormData = {
      ...formData,
      Capacity: Number(formData.Capacity) || 0,
    };
    try {
      await onSave(finalFormData, eventId);
      handleClose();
    } catch (error) {
      // Parent component handles toast
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
              ? `עריכת ${formData.IsRecurring ? "חוג" : "אירוע"}`
              : `יצירת ${eventType === "classes" ? "חוג" : "אירוע"} חדש`}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <X size={24} />
          </button>
        </div>
        {isLoading ? (
          <div className="py-8 text-center">טוען פרטי אירוע...</div>
        ) : (
          <form onSubmit={handleSubmit} className="py-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="שם האירוע/חוג"
                name="EventName"
                value={formData.EventName || ""}
                onChange={handleChange}
                required
              />
              <SpouseCommand
                users={displayHosts}
                currentUser={{ id: null }}
                selectedSpouseId={formData.HostId}
                onSelectSpouse={handleHostSelect}
                label="מארח/מדריך"
                placeholder="בחר מארח..."
              />
              <InputField
                label="מיקום"
                name="Location"
                value={formData.Location || ""}
                onChange={handleChange}
              />
              <InputField
                label="קיבולת משתתפים"
                name="Capacity"
                type="number"
                value={formData.Capacity || ""}
                onChange={handleChange}
              />
              <InputField
                label="תאריך התחלה"
                name="StartDate"
                type="datetime-local"
                value={formData.StartDate || ""}
                onChange={handleChange}
                required
              />
              <InputField
                label="תאריך סיום"
                name="EndDate"
                type="datetime-local"
                value={formData.EndDate || ""}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 text-right">
                תיאור
              </label>
              <textarea
                name="Description"
                value={formData.Description || ""}
                onChange={handleChange}
                rows="4"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>

            <ImageUpload
              token={token}
              uploaderId={user?.id}
              onImageUploadSuccess={handleImageUploadSuccess}
              existingImage={existingImage}
              picRole="activity"
              picAlt={`Image for ${formData.EventName || "event"}`}
              eventName={formData.EventName}
              eventDescription={formData.Description}
            />

            <div className="p-4 border rounded-md bg-gray-50 space-y-4">
              <CheckboxField
                label="אירוע קבוע (חוג)"
                name="IsRecurring"
                checked={formData.IsRecurring || false}
                onChange={handleChange}
              />
              {formData.IsRecurring && (
                <RRuleGenerator
                  value={formData.RecurrenceRule || ""}
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
        )}
      </div>
    </div>
  );
};

export default EventModal;
