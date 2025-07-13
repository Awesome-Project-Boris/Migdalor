// /src/features/noticeManagement/NoticeManagement.jsx

import React, { useState, useEffect, useCallback } from "react";
import { api } from "../../api/apiService";
import { useAuth } from "../../auth/AuthContext";
import { API_BASE_URL } from "../../config";

// In a real application, this should be in a central config file (e.g., /src/config.js)
// You should replace this with the actual base URL of your API.


/**
 * A component for creating and sending new notices, inspired by the mobile interface.
 * It fetches categories dynamically and handles form submission with push notifications.
 */
const NoticeManagement = () => {
  // Authentication context to get user details and token
  const { user, token } = useAuth();

  // State for form fields
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");

  // State for category fetching
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [isCategoryLoading, setIsCategoryLoading] = useState(true);
  const [categoryError, setCategoryError] = useState(null);

  // State for form submission and UI feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [isError, setIsError] = useState(false);

  // --- Fetch Categories on Component Mount ---
  useEffect(() => {
    const fetchCategories = async () => {
      setIsCategoryLoading(true);
      setCategoryError(null);
      try {
        // Fetch categories using a standard fetch call, as this endpoint is public.
        const response = await fetch(`${API_BASE_URL}/Categories`);
        if (!response.ok) {
          throw new Error(`Failed to load categories: HTTP ${response.status}`);
        }
        const rawCategories = await response.json();

        if (!Array.isArray(rawCategories)) {
          throw new Error("Invalid data format received for categories.");
        }

        const options = rawCategories
          .map((c) => {
            const hebrewName = c.categoryHebName || c.categoryName;
            return {
              label: hebrewName || c.categoryEngName || "Unnamed Category",
              value: hebrewName, // Use Hebrew name as the value to be sent
            };
          })
          .filter((opt) => opt.value);

        setCategoryOptions(options);
        if (options.length > 0) {
          setSelectedCategory(options[0].value); // Set default category
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
        setCategoryError(err.message || "Failed to load categories.");
      } finally {
        setIsCategoryLoading(false);
      }
    };

    fetchCategories();
  }, []); // Empty dependency array ensures this runs only once on mount

  // --- Form Reset Logic ---
  const resetForm = useCallback(() => {
    setTitle("");
    setContent("");
    setSubCategory("");
    if (categoryOptions.length > 0) {
      setSelectedCategory(categoryOptions[0].value);
    }
  }, [categoryOptions]);

  // --- Handle Form Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setIsError(false);

    if (!title || !content || !selectedCategory) {
      setMessage("כותרת, תוכן וקטגוריה הם שדות חובה.");
      setIsError(true);
      setIsSubmitting(false);
      return;
    }

    const newNotice = {
      title,
      content,
      category: selectedCategory,
      subCategory: subCategory || null,
      senderId: user?.personId,
    };

    try {
      const noticeResponse = await api.post("/Notices", newNotice, token);
      if (!noticeResponse) {
        throw new Error("יצירת ההודעה נכשלה. השרת לא החזיר תשובה.");
      }
      setMessage("ההודעה נוצרה בהצלחה! שולח התראה לכלל המשתמשים...");

      const pushMessage = {
        title: newNotice.title,
        body: newNotice.content,
        data: {
          noticeId: noticeResponse.noticeId,
          category: newNotice.category,
        },
      };

      await api.post("/api/Notifications/broadcast", pushMessage, token);
      setMessage("ההודעה וההתראה נשלחו בהצלחה!");
      resetForm();
    } catch (error) {
      console.error("Failed to create or send notice:", error);
      setMessage(`שגיאה: ${error.message}`);
      setIsError(true);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        setMessage(null);
        setIsError(false);
      }, 7000);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        יצירת הודעה חדשה
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Field */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            כותרת
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Content Field */}
        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            תוכן ההודעה
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="5"
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          ></textarea>
        </div>

        {/* Category and Sub-Category Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              קטגוריה
            </label>
            {isCategoryLoading ? (
              <div className="text-center p-2">טוען קטגוריות...</div>
            ) : categoryError ? (
              <div className="text-red-500 text-sm p-2">
                שגיאה בטעינת הקטגוריות
              </div>
            ) : (
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                disabled={categoryOptions.length === 0}
              >
                {categoryOptions.length > 0 ? (
                  categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    אין קטגוריות זמינות
                  </option>
                )}
              </select>
            )}
          </div>
          <div>
            <label
              htmlFor="subCategory"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              תת-קטגוריה (אופציונלי)
            </label>
            <input
              type="text"
              id="subCategory"
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isSubmitting || isCategoryLoading}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isSubmitting || isCategoryLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            } transition-colors duration-200`}
          >
            {isSubmitting ? "שולח..." : "צור ושלח הודעה"}
          </button>
        </div>
      </form>

      {/* Feedback Message */}
      {message && (
        <div
          className={`mt-6 p-4 rounded-md text-center ${
            isError ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default NoticeManagement;
