import React, { useState, useEffect, useCallback, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import Quill styles
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../api/apiService";
import Toast from "../../components/common/Toast";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { Button } from "../../components/ui/button";
import { Save, RotateCcw, Languages, Info } from "lucide-react";
import LoadingIndicator from "../../components/common/LoadingIndicator";

// This component will handle the logic for leaving the page with unsaved changes.
const useUnsavedChangesWarning = (isDirty) => {
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (isDirty) {
        event.preventDefault();
        // Modern browsers show a generic message, but this is required for the prompt to appear.
        event.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);
};

const InfoSheetManagement = () => {
  const { token } = useAuth();
  const [hebrewContent, setHebrewContent] = useState("");
  const [englishContent, setEnglishContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDirty, setIsDirty] = useState({ he: false, en: false });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [activeTab, setActiveTab] = useState("hebrew"); // State for active tab

  const [toastState, setToastState] = useState({
    show: false,
    message: "",
    variant: "info",
  });

  // Use a ref to store the callback that should be executed after confirmation.
  const pendingTabChange = useRef(null);

  // Custom hook to warn user on leaving the page
  useUnsavedChangesWarning(isDirty.he || isDirty.en);

  // Fetches the info sheet content from the server
  const fetchInfo = useCallback(async () => {
    setIsLoading(true);
    try {
      const [heResponse, enResponse] = await Promise.all([
        api.get("/InfoSheet/he", token),
        api.get("/InfoSheet/en", token),
      ]);

      const heContent = heResponse?.content || "";
      const enContent = enResponse?.content || "";

      setHebrewContent(heContent);
      setEnglishContent(enContent);

      localStorage.setItem("info_sheet_he_backup", heContent);
      localStorage.setItem("info_sheet_en_backup", enContent);
    } catch (error) {
      console.error("Error fetching info sheet content:", error);
      showToast("error", `שגיאה בטעינת המידע: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchInfo();
  }, [fetchInfo]);

  const showToast = (variant, message) => {
    setToastState({ show: true, variant, message });
  };

  const handleContentChange = (language, content) => {
    if (language === "he") {
      setHebrewContent(content);
    } else {
      setEnglishContent(content);
    }
    setIsDirty((prev) => ({ ...prev, [language]: true }));
  };

  const handleSave = async (language) => {
    const content = language === "he" ? hebrewContent : englishContent;
    try {
      await api.put(`/InfoSheet/${language}`, content, token);
      showToast("success", "התוכן נשמר בהצלחה!");
      localStorage.setItem(`info_sheet_${language}_backup`, content);
      setIsDirty((prev) => ({ ...prev, [language]: false }));
    } catch (error) {
      showToast("error", `שגיאה בשמירת התוכן: ${error.message}`);
    }
  };

  const handleRevert = (language) => {
    const backupContent = localStorage.getItem(`info_sheet_${language}_backup`);
    if (language === "he") {
      setHebrewContent(backupContent || "");
    } else {
      setEnglishContent(backupContent || "");
    }
    setIsDirty((prev) => ({ ...prev, [language]: false }));
    showToast("info", "השינויים שוחזרו.");
  };

  const handleTabChange = (tab) => {
    if (isDirty.he || isDirty.en) {
      setShowConfirmModal(true);
      pendingTabChange.current = tab;
    } else {
      setActiveTab(tab);
    }
  };

  const handleConfirmNavigation = () => {
    setIsDirty({ he: false, en: false });
    setActiveTab(pendingTabChange.current);
    setShowConfirmModal(false);
    pendingTabChange.current = null;
  };

  const handleCancelNavigation = () => {
    setShowConfirmModal(false);
    pendingTabChange.current = null;
  };

  const editorModules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      ["link"],
      ["clean"],
    ],
  };

  if (isLoading) {
    return <LoadingIndicator text="טוען תוכן..." />;
  }

  return (
    <div className="w-full bg-white p-6 rounded-lg shadow-md" dir="rtl">
      <Toast
        show={toastState.show}
        message={toastState.message}
        variant={toastState.variant}
        onClose={() => setToastState({ ...toastState, show: false })}
      />
      {showConfirmModal && (
        <ConfirmationModal
          title="שינויים שלא נשמרו"
          message="ישנם שינויים שלא נשמרו. האם ברצונך להמשיך ולבטל אותם?"
          onConfirm={handleConfirmNavigation}
          onCancel={handleCancelNavigation}
        />
      )}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Info className="ml-3" />
          ניהול דף מידע
        </h2>
        {/* Styled Tab Switcher */}
        <div className="flex items-center bg-gray-200 rounded-full p-1">
          <button
            onClick={() => handleTabChange("hebrew")}
            className={`px-4 py-1.5 text-sm font-semibold rounded-full flex items-center transition-colors ${
              activeTab === "hebrew"
                ? "bg-white text-blue-600 shadow"
                : "bg-transparent text-gray-600"
            }`}
          >
            <Languages className="ml-2 h-4 w-4" />
            עברית
          </button>
          <button
            onClick={() => handleTabChange("english")}
            className={`px-4 py-1.5 text-sm font-semibold rounded-full flex items-center transition-colors ${
              activeTab === "english"
                ? "bg-white text-blue-600 shadow"
                : "bg-transparent text-gray-600"
            }`}
          >
            <Languages className="ml-2 h-4 w-4" />
            English
          </button>
        </div>
      </div>

      {/* Conditional Rendering of Editors */}
      <div className="py-4">
        {activeTab === "hebrew" && (
          <>
            <ReactQuill
              theme="snow"
              value={hebrewContent}
              onChange={(content) => handleContentChange("he", content)}
              modules={editorModules}
              style={{
                direction: "rtl",
                height: "300px",
                marginBottom: "50px",
              }}
            />
            <div className="flex justify-end items-center mt-4 space-x-2 space-x-reverse">
              <Button
                onClick={() => handleRevert("he")}
                disabled={!isDirty.he}
                className="bg-blue-600 hover:bg-blue-700 mx-1"
              >
                <RotateCcw size={16} className="ml-2" />
                שחזר שינויים
              </Button>
              <Button
                onClick={() => handleSave("he")}
                disabled={!isDirty.he}
                className="bg-blue-600 hover:bg-blue-700 mx-1"
              >
                <Save size={16} className="ml-2" />
                שמור שינויים
              </Button>
            </div>
          </>
        )}
        {activeTab === "english" && (
          <>
            <ReactQuill
              theme="snow"
              value={englishContent}
              onChange={(content) => handleContentChange("en", content)}
              modules={editorModules}
              style={{ height: "300px", marginBottom: "50px" }}
            />
            <div className="flex justify-end items-center mt-4 space-x-2">
              <Button
                onClick={() => handleRevert("en")}
                disabled={!isDirty.en}
                className="bg-blue-600 hover:bg-blue-700 mx-1"
              >
                <RotateCcw size={16} className="mr-2" />
                Revert Changes
              </Button>
              <Button
                onClick={() => handleSave("en")}
                disabled={!isDirty.en}
                className="bg-blue-600 hover:bg-blue-700 mx-1"
              >
                <Save size={16} className="mr-2" />
                Save Changes
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InfoSheetManagement;
