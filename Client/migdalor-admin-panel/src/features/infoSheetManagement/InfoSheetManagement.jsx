import React, { useState, useEffect, useCallback, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import Quill styles
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../api/apiService";
import TabsGroup from "../../components/common/TabsGroup";
import Toast from "../../components/common/Toast";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { Button } from "../../components/ui/button";
import { Save, RotateCcw, Languages, Info } from "lucide-react";

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

      // **FIX:** Extract the 'content' property from the JSON response
      const heContent = heResponse?.content || "";
      const enContent = enResponse?.content || "";

      setHebrewContent(heContent);
      setEnglishContent(enContent);

      // Store initial content in local storage for the revert functionality
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

  // Handles saving content for a specific language
  const handleSave = async (language) => {
    const content = language === "he" ? hebrewContent : englishContent;
    try {
      // The body should be the raw string, as expected by the [FromBody] attribute in the controller.
      // The apiService's put method will correctly stringify this.
      await api.put(`/InfoSheet/${language}`, content, token);
      showToast("success", "התוכן נשמר בהצלחה!");
      // Update the backup in local storage
      localStorage.setItem(`info_sheet_${language}_backup`, content);
      setIsDirty((prev) => ({ ...prev, [language]: false }));
    } catch (error) {
      showToast("error", `שגיאה בשמירת התוכן: ${error.message}`);
    }
  };

  // Reverts content for a specific language from local storage
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

  const handleTabChange = (nextTab) => {
    // This is a proxy for the actual tab change logic within TabsGroup
    // We check for dirtiness and decide whether to show a modal.
    if (isDirty.he || isDirty.en) {
      setShowConfirmModal(true);
      // Store the function that will actually change the tab
      pendingTabChange.current = () => {
        // This is where you would integrate with your TabsGroup's state management
        // For now, we'll just log it.
        console.log(`Proceeding to tab: ${nextTab}`);
        setShowConfirmModal(false);
        pendingTabChange.current = null;
      };
      return false; // Prevent immediate tab change
    }
    return true; // Allow tab change
  };

  const handleConfirmNavigation = () => {
    // User confirmed to proceed, reset dirty states and execute the pending action
    setIsDirty({ he: false, en: false });
    if (pendingTabChange.current) {
      // Here you would call the function to change the tab.
      // Since TabsGroup doesn't expose a way to control its state from outside,
      // this part is illustrative. A real implementation might require lifting state up.
      alert("שינויים שלא נשמרו יאבדו. המשך בכל זאת.");
    }
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

  const tabs = [
    {
      value: "hebrew",
      label: "עברית",
      icon: Languages,
      content: (
        <div className="py-4">
          <ReactQuill
            theme="snow"
            value={hebrewContent}
            onChange={(content) => handleContentChange("he", content)}
            modules={editorModules}
            style={{ direction: "rtl", height: "300px", marginBottom: "50px" }}
          />
          <div className="flex justify-end items-center mt-4 space-x-2 space-x-reverse">
            <Button
              onClick={() => handleRevert("he")}
              disabled={!isDirty.he}
              variant="outline"
            >
              <RotateCcw size={16} className="ml-2" />
              שחזר שינויים
            </Button>
            <Button onClick={() => handleSave("he")} disabled={!isDirty.he}>
              <Save size={16} className="ml-2" />
              שמור שינויים
            </Button>
          </div>
        </div>
      ),
    },
    {
      value: "english",
      label: "English",
      icon: Languages,
      content: (
        <div className="py-4">
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
              variant="outline"
            >
              <RotateCcw size={16} className="mr-2" />
              Revert Changes
            </Button>
            <Button onClick={() => handleSave("en")} disabled={!isDirty.en}>
              <Save size={16} className="mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <div className="text-center p-4">טוען תוכן...</div>;
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
      </div>
      {/* NOTE: The onValueChange prop for Tabs is conceptual.
        You might need to modify your TabsGroup component to accept such a prop
        to properly implement the unsaved changes warning when switching tabs.
        For now, the browser's "beforeunload" event will catch leaving the page.
      */}
      <TabsGroup tabs={tabs} onTabChange={handleTabChange} />
    </div>
  );
};

export default InfoSheetManagement;
