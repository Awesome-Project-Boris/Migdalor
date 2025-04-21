import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { Toast } from 'toastify-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import FloatingLabelInput from '@/components/FloatingLabelInput';
import FlipButton from '@/components/FlipButton';
import Header from '@/components/Header';
import { Globals } from '@/app/constants/Globals';
import { useTranslation } from 'react-i18next';

const SCREEN_WIDTH = Dimensions.get('window').width;

// --- Fetch Categories Function (Defined Outside, Accepts Setters) ---
const fetchCategories = async (
    setCategoryOptions,
    setSelectedCategory,
    setIsCategoryLoading,
    setCategoryError
) => {
  console.log("Fetching categories for NewNotice form...");
  setIsCategoryLoading(true);
  setCategoryError(null);
  try {
    const response = await fetch(`${Globals.API_BASE_URL}/api/Categories`);
    if (!response.ok) { throw new Error(`Failed to load categories: HTTP ${response.status}`); }
    const rawCategories = await response.json();

    if (!Array.isArray(rawCategories)) {
        console.error("API did not return an array for categories:", rawCategories);
        throw new Error("Invalid data format received for categories.");
    }

    // Create options array - Prioritize Hebrew for Label and Value
    const options = rawCategories.map(c => {
      const hebrewName = c.categoryHebName || c.categoryName;
      return {
          label: hebrewName || c.categoryEngName || 'Unnamed',
          value: hebrewName
      };
    }).filter(opt => opt.value);

    // console.log("Category options prepared (Hebrew labels/values):", options);
    setCategoryOptions(options);

    if (options.length > 0) {
      // console.log("Setting default category to:", options[0].value);
      setSelectedCategory(options[0].value);
    } else {
      console.log("No category options found.");
      setSelectedCategory(null);
    }

  } catch (err) {
    console.error("Failed to load categories:", err);
    setCategoryError(err.message || "Failed to load categories.");
    setCategoryOptions([]);
    setSelectedCategory(null);
  } finally {
    setIsCategoryLoading(false);
  }
};
// --- End Fetch Categories Function ---


export default function NewNotice() {
  const { t } = useTranslation();
  const router = useRouter();

  // --- State ---
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // For form submission
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isUserIdLoading, setIsUserIdLoading] = useState(true);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [isCategoryLoading, setIsCategoryLoading] = useState(true);
  const [categoryError, setCategoryError] = useState(null);

  // --- Fetch userID from AsyncStorage ---
  useEffect(() => {
    const fetchUserId = async () => {
        setIsUserIdLoading(true);
        try {
            const storedUserID = await AsyncStorage.getItem("userID");
            if (storedUserID) { setCurrentUserId(storedUserID); }
            else {
                console.warn("NewNotice: UserID not found...");
                setCurrentUserId(null);
                Alert.alert("Error", "User information not found...");
            }
        } catch (e) {
            console.error("NewNotice: Failed to fetch userID...", e);
            setCurrentUserId(null);
            Alert.alert("Error", "Could not retrieve user information.");
        } finally { setIsUserIdLoading(false); }
    };
    fetchUserId();
  }, []);

  // --- Fetch Categories on Mount ---
  useEffect(() => {
    fetchCategories(
        setCategoryOptions,
        setSelectedCategory,
        setIsCategoryLoading,
        setCategoryError
    );
  }, []); // Pass setters

  // --- Reset Form ---
  const resetForm = useCallback(() => {
      setTitle('');
      setMessage('');
      setSelectedCategory(categoryOptions.length > 0 ? categoryOptions[0].value : null);
  }, [categoryOptions]);

  // --- Handle Submit ---
  const handleSubmit = useCallback(async () => {
    // Validation
    if (!title.trim() || !message.trim() || !selectedCategory) {
      Alert.alert(t("Common_ValidationErrorTitle"), t("NewNoticeScreen_errorAllFieldsRequired"));
      return;
    }
    if (!currentUserId) {
      Alert.alert(t("Common_Error"), t("NewNoticeScreen_errorUserInfoMissing"));
      return;
    }

    setIsLoading(true);
    const noticePayload = {
      SenderId: currentUserId,
      Title: title.trim(),
      Content: message.trim(),
      Category: selectedCategory, // Sends the Hebrew name
      SubCategory: null
    };
    let noticeCreationResult = null;
    try {
      // Step 1: Create Notice
      const noticeApiUrl = `${Globals.API_BASE_URL}/api/Notices`;
      const noticeResponse = await fetch(noticeApiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(noticePayload) });
      if (!noticeResponse.ok) {
        let errorMsg = `Notice Creation Failed: HTTP Error ${noticeResponse.status}`;
        try { const errData = await noticeResponse.json(); errorMsg = errData.message || errData.title || errorMsg; } catch (e) {}
        throw new Error(errorMsg);
      }
      noticeCreationResult = await noticeResponse.json();
      Toast.show({ type: 'success', text1: t("NewNoticeScreen_successTitle"), text2: t("NewNoticeScreen_successMessage"), visibilityTime: 1500 });

      // Step 2: Trigger Broadcast
       if (noticeCreationResult && noticeCreationResult.noticeId) {
         const broadcastPayload = {
            title: noticePayload.Title,
            body: noticePayload.Content.substring(0, 100) + (noticePayload.Content.length > 100 ? '...' : ''),
            sound: "default",
            data: JSON.stringify({ noticeId: noticeCreationResult.noticeId }),
            to: "string"
         };
         const broadcastApiUrl = `${Globals.API_BASE_URL}/api/Notifications/broadcast`;
         try {
             const broadcastResponse = await fetch(broadcastApiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(broadcastPayload) });
             if (!broadcastResponse.ok) {
                 let broadcastErrorMsg = `Broadcast Failed: HTTP Error ${broadcastResponse.status}`;
                 try { const errData = await broadcastResponse.json(); broadcastErrorMsg = errData.message || errData.error || broadcastErrorMsg; } catch(e) {}
                  console.error(broadcastErrorMsg);
                  Toast.show({ type: 'warn', text1: t("NewNoticeScreen_broadcastWarnTitle"), text2: broadcastErrorMsg });
             } else {
                 const broadcastResult = await broadcastResponse.json();
                 Toast.show({ type: 'info', text1: t("NewNoticeScreen_broadcastSuccessTitle"), text2: t("NewNoticeScreen_broadcastSuccessMessage", {count: broadcastResult.recipients}) , visibilityTime: 3000 });
             }
         } catch (broadcastError) {
              console.error("Failed to send broadcast:", broadcastError);
              Toast.show({ type: 'error', text1: t("NewNoticeScreen_broadcastErrorTitle"), text2: broadcastError.message });
         }
       } else { console.warn("Notice created, but noticeId missing..."); }

      resetForm();

    } catch (error) { // Catch errors from Notice Creation
        console.error("Failed to submit notice:", error);
        let detailedErrorMessage = error.message || t("NewNoticeScreen_errorSubmitFailed");
        Toast.show({ type: 'error', text1: t("Common_Error"), text2: detailedErrorMessage });
    } finally {
        setIsLoading(false);
    }
  }, [title, message, selectedCategory, currentUserId, router, t, resetForm]);


  // --- Render Logic ---
  // Correctly show loading indicator while fetching userID OR categories
  if (isUserIdLoading || isCategoryLoading) {
      return (
          <View style={styles.centeredLoader}>
              <ActivityIndicator size="large" color="#0000ff"/>
              {/* Provide more specific text if desired */}
              <Text style={styles.loadingText}>Loading...</Text>
          </View>
      );
  }

  // Correctly show error if category fetching failed
  if (categoryError) {
       return (
           <View style={styles.centeredLoader}>
               <Text style={styles.errorText}>Error loading categories: {categoryError}</Text>
               {/* Optionally add a retry button */}
               <FlipButton text="Retry" onPress={fetchCategories} />
           </View>
       );
  }

  // Main component render if no loading/errors
  return (
    <>
      <Header />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <Text style={styles.pageTitle}>{t("NewNoticeScreen_title")}</Text>

            <FloatingLabelInput
              label={t("NewNoticeScreen_noticeTitleLabel")}
              value={title}
              onChangeText={setTitle}
              style={styles.input}
            />

            <FloatingLabelInput
              label={t("NewNoticeScreen_noticeMessageLabel")}
              value={message}
              onChangeText={setMessage}
              style={styles.input}
              inputStyle={styles.multilineInput}
              multiline={true}
              numberOfLines={6}
            />

            <View style={styles.pickerContainer}>
               <Text style={styles.pickerLabel}>{t("NewNoticeScreen_categoryLabel")}</Text>
               <Picker
                 selectedValue={selectedCategory}
                 onValueChange={(itemValue) => setSelectedCategory(itemValue)}
                 style={styles.picker}
                 itemStyle={styles.pickerItem}
                 enabled={categoryOptions.length > 0}
               >
                 {categoryOptions.map((option) => (
                   <Picker.Item
                       key={option.value || option.label}
                       label={option.label}
                       value={option.value}
                   />
                 ))}
                 {categoryOptions.length === 0 && !isCategoryLoading && (
                      <Picker.Item label="No categories available" value={null} enabled={false} />
                 )}
               </Picker>
            </View>

            <FlipButton
              onPress={handleSubmit}
              style={styles.submitButton}
              bgColor="#28a745"
              textColor="#ffffff"
              disabled={isLoading || !currentUserId || !selectedCategory || isCategoryLoading}
            >
              {isLoading ? ( <ActivityIndicator color="#ffffff" /> ) : ( <Text style={styles.submitButtonText}>{t("NewNoticeScreen_publishButton")}</Text> )}
            </FlipButton>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

// Styles
const styles = StyleSheet.create({
  keyboardAvoidingView: { flex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f7f9fc' },
  container: { padding: 20, backgroundColor: '#ffffff', borderRadius: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 },
  pageTitle: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 30, color: '#333' },
  input: { marginBottom: 20 },
  multilineInput: { height: 120, textAlignVertical: 'top' },
  pickerContainer: { marginBottom: 25, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, backgroundColor: 'white' },
  pickerLabel: { fontSize: 14, color: '#666', position: 'absolute', top: -10, left: 10, backgroundColor: '#ffffff', paddingHorizontal: 4, zIndex: 1 },
  picker: { height: 50, width: '100%' },
  pickerItem: { /* iOS styles if needed */ },
  submitButton: { paddingVertical: 15, borderRadius: 8, marginTop: 15 },
  submitButtonText: { fontSize: 18, fontWeight: 'bold', color: '#ffffff', textAlign: 'center' },
  centeredLoader: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { color: 'red', textAlign: 'center', marginBottom: 10 },
  loadingText: { marginTop: 10 } // Added style for loading text
});