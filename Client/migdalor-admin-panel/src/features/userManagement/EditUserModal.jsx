import React, { useState, useMemo, useEffect } from "react";
import { X } from "lucide-react";
import { api } from "../../api/apiService";
import { useAuth } from "../../auth/AuthContext";
import { API_BASE_URL } from "../../config";
import InputField from "../../components/common/InputField";
import CheckboxField from "../../components/common/CheckboxField";

/**
 * A modal form for editing user details, built with the same principles as the ConfirmationModal.
 * @param {object} props
 * @param {object} props.user - The user object being edited.
 * @param {Array} props.allUsers - The list of all users, for spouse selection.
 * @param {Function} props.onClose - Function to call to close the modal.
 * @param {Function} props.onSave - Function to call to save the changes.
 * @param {boolean} [props.closeOnBackdropClick=true] - Determines if clicking the backdrop closes the modal.
 * @param {number} [props.backdropOpacity=0.5] - The backdrop opacity, a value between 0 and 1.
 */
const EditUserModal = ({
  user,
  allUsers,
  onClose,
  onSave,
  closeOnBackdropClick = true,
  backdropOpacity = 0.5,
}) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    hebFirstName: user.hebFirstName || "",
    hebLastName: user.hebLastName || "",
    engFirstName: user.engFirstName || "",
    engLastName: user.engLastName || "",
    email: user.email || "",
    phoneNumber: user.phoneNumber || "",
    dateOfBirth: user.dateOfBirth
      ? new Date(user.dateOfBirth).toISOString().split("T")[0]
      : "",
    gender: user.gender == "M" ? "זכר" : "נקבה" || "",
    personRole: user.personRole || "Resident",
    branchName: user.branchName || "נורדיה",
    isBokerTov: user.isBokerTov ?? true,
    canInitActivity: user.canInitActivity ?? false,
    spouseId: user.spouseId || null,
    dateOfArrival: user.dateOfArrival
      ? new Date(user.dateOfArrival).toISOString().split("T")[0]
      : "",
    homePlace: user.homePlace || "",
    profession: user.profession || "",
    residentDescription: user.residentDescription || "",
    profilePicId: user.profilePicId || null,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [spouseSearch, setSpouseSearch] = useState("");
  const [isShowing, setIsShowing] = useState(false);

  useEffect(() => {
    // Animation trigger
    const timer = setTimeout(() => setIsShowing(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError("");
    const formPayload = new FormData();
    formPayload.append("file", file);

    try {
      const pictureId = await api.postForm("/Picture", formPayload, token);
      setFormData((prev) => ({
        ...prev,
        profilePicId: parseInt(pictureId, 10),
      }));
    } catch (err) {
      setUploadError(`שגיאת העלאה: ${err.message}`);
      console.error("File upload failed:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = Object.fromEntries(
      Object.entries(formData).filter(([_, v]) => v !== "" && v !== null)
    );
    payload.isBokerTov = formData.isBokerTov;
    payload.canInitActivity = formData.canInitActivity;
    payload.spouseId = formData.spouseId ? Number(formData.spouseId) : null;
    onSave(payload);
  };

  const filteredSpouses = useMemo(
    () =>
      allUsers.filter(
        (u) =>
          u.id !== user.id &&
          u.fullName.toLowerCase().includes(spouseSearch.toLowerCase())
      ),
    [allUsers, user.id, spouseSearch]
  );

  const profilePicUrl = formData.profilePicId
    ? `${API_BASE_URL}/Picture/${formData.profilePicId}`
    : `https://placehold.co/150x150/E2E8F0/64748B?text=no+picture`;

  const handleBackdropClick = () => {
    if (closeOnBackdropClick) {
      onClose();
    }
  };

  const backdropStyle = {
    backgroundColor: `rgba(0, 0, 0, ${isShowing ? backdropOpacity : 0})`,
  };

  return (
    // The backdrop now has overflow-y-auto to allow the whole page to scroll if the modal is too tall
    <div
      className="fixed inset-0 bg-black flex justify-center items-start z-50 p-4 transition-colors duration-300 ease-in-out overflow-y-auto"
      style={backdropStyle}
      dir="rtl"
      onClick={handleBackdropClick}
    >
      {/* The modal is wider (max-w-6xl) and has no max-height, allowing it to grow vertically */}
      <div
        className={`relative my-8 bg-white rounded-2xl shadow-xl w-full max-w-6xl flex flex-col transform transition-all duration-300 ease-in-out ${
          isShowing ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white rounded-t-2xl z-10">
          <h3 className="text-xl font-bold text-gray-900">
            עריכת פרטי דייר: {user.fullName}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 text-right">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: Personal Details */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg border-b pb-2">
                פרטים אישיים
              </h4>
              <InputField
                label="שם פרטי (עברית)"
                name="hebFirstName"
                value={formData.hebFirstName}
                onChange={handleChange}
              />
              <InputField
                label="שם משפחה (עברית)"
                name="hebLastName"
                value={formData.hebLastName}
                onChange={handleChange}
              />
              <InputField
                label="שם פרטי (אנגלית)"
                name="engFirstName"
                value={formData.engFirstName}
                onChange={handleChange}
              />
              <InputField
                label="שם משפחה (אנגלית)"
                name="engLastName"
                value={formData.engLastName}
                onChange={handleChange}
              />
              <InputField
                label="אימייל"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
              <InputField
                label="טלפון"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
              <InputField
                label="תאריך לידה"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  מין
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                >
                  <option value="">בחר...</option>
                  <option value="זכר">זכר</option>
                  <option value="נקבה">נקבה</option>
                </select>
              </div>
            </div>

            {/* Column 2: Resident Details */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg border-b pb-2">פרטי דייר</h4>
              <InputField
                label="סניף"
                name="branchName"
                value={formData.branchName}
                onChange={handleChange}
              />
              <InputField
                label="תאריך הגעה"
                name="dateOfArrival"
                type="date"
                value={formData.dateOfArrival}
                onChange={handleChange}
              />
              <InputField
                label="מקום מגורים קודם"
                name="homePlace"
                value={formData.homePlace}
                onChange={handleChange}
              />
              <InputField
                label="מקצוע"
                name="profession"
                value={formData.profession}
                onChange={handleChange}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  תיאור
                </label>
                <textarea
                  name="residentDescription"
                  value={formData.residentDescription}
                  onChange={handleChange}
                  rows="3"
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                ></textarea>
              </div>
              <div className="flex items-center space-x-4 space-x-reverse">
                <CheckboxField
                  label="בוקר טוב"
                  name="isBokerTov"
                  checked={formData.isBokerTov}
                  onChange={handleChange}
                />
                <CheckboxField
                  label="יכול ליזום פעילות"
                  name="canInitActivity"
                  checked={formData.canInitActivity}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  בן/בת זוג
                </label>
                <input
                  type="search"
                  placeholder="חיפוש בן/בת זוג..."
                  value={spouseSearch}
                  onChange={(e) => setSpouseSearch(e.target.value)}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm mb-2"
                />
                <select
                  name="spouseId"
                  value={formData.spouseId || ""}
                  onChange={handleChange}
                  className="block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                >
                  <option value="">ללא</option>
                  {filteredSpouses.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Column 3: Picture Upload */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg border-b pb-2">
                תמונת פרופיל
              </h4>
              <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg">
                <img
                  key={profilePicUrl}
                  src={profilePicUrl}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover mb-4"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://placehold.co/150x150/E2E8F0/64748B?text=Error";
                  }}
                />
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/*"
                  disabled={isUploading}
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
                >
                  {isUploading ? "מעלה..." : "בחר תמונה"}
                </label>
                {uploadError && (
                  <p className="text-red-500 text-sm mt-2">{uploadError}</p>
                )}
                {formData.profilePicId && !uploadError && (
                  <p className="text-green-600 text-sm mt-2">
                    תמונה הועלתה בהצלחה!
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end items-center p-4 border-t mt-6 sticky bottom-0 bg-white rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
            >
              ביטול
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors mr-4"
            >
              שמור שינויים
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
