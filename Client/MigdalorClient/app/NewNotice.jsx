import React, { useState, useCallback, useContext } from 'react';
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

import FloatingLabelInput from '@/components/FloatingLabelInput'; 
import FlipButton from '@/components/FlipButton'; 
import Header from '@/components/Header';  
import { useAuth } from '@/context/AuthProvider'; 
import { Globals } from '@/app/constants/Globals';
import { useTranslation } from 'react-i18next'; 

const SCREEN_WIDTH = Dimensions.get('window').width;

// Hardcoded categories for now - replace with DB fetch later
// Match these strings with your OH_Categories table names
const noticeCategories = ["General", "Events", "Urgent", "Maintenance", "הנהלה"]; // temp categories

export default function NewNotice() {
  const { t } = useTranslation();
  const router = useRouter();

  useEffect(() => { // Checking userID for admin
    const fetchUserId = async () => {
      try {
        const storedUserID = await AsyncStorage.getItem("userID");
        if (storedUserID) {
          console.log("MarketplaceItemScreen: Fetched UserID from AsyncStorage:", storedUserID);
          setCurrentUserId(storedUserID);
        } else {
          console.warn("MarketplaceItemScreen: UserID not found in AsyncStorage.");
          setCurrentUserId(null); // Explicitly set to null if not found
        }
      } catch (e) {
        console.error("MarketplaceItemScreen: Failed to fetch userID from storage", e);
        setCurrentUserId(null);
      }
    };
  
    fetchUserId();
  }, []);

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(noticeCategories[0]); // Default to first category
  const [isLoading, setIsLoading] = useState(false);

  // --- TODO: Implement Admin Check ---
  // useEffect(() => {
  //   // Check if user.role is 'admin' or similar
  //   // If not admin, redirect or disable the form
  //   // Example:
  //   // if (user?.role !== 'admin') {
  //   //   Alert.alert("Access Denied", "You do not have permission to publish notices.");
  //   //   router.back();
  //   // }
  // }, [user, router]);
  // --- End Admin Check Placeholder ---

  const resetForm = () => {
      setTitle('');
      setMessage('');
      setSelectedCategory(noticeCategories[0]);
  }

  const handleSubmit = useCallback(async () => {
    if (!title.trim() || !message.trim() || !selectedCategory) {
      Alert.alert(t("Common_ValidationErrorTitle"), t("NewNoticeScreen_errorAllFieldsRequired"));
      return;
    }

    if (!user?.userID) {
        Alert.alert(t("Common_Error"), t("NewNoticeScreen_errorUserInfoMissing"));
        return;
    }

    setIsLoading(true);

    const noticePayload = {
      // Match backend DTO/Model for POST /api/Notices
      // Based on OH_Notices structure
      senderID: user.userID, // Get sender ID from logged-in user context
      noticeTitle: title.trim(),
      noticeMessage: message.trim(),
      noticeCategory: selectedCategory,
      // noticeSubCategory: null, // Add if you implement subcategories
      // creationDate is likely handled by the server/DB default
    };

    console.log("Submitting Notice Payload:", noticePayload);

    try {
      const apiUrl = `${Globals.API_BASE_URL}/api/Notices`; // POST endpoint
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noticePayload),
      });

      if (!response.ok) {
        // Try to get more specific error from response body
        let errorMsg = `HTTP Error ${response.status}`;
        try {
            const errData = await response.json(); // Or response.text()
            errorMsg = errData.message || errData.title || errorMsg; // Adapt based on backend error structure
        } catch (e) {}
        throw new Error(errorMsg);
      }

      // Handle success
      const result = await response.json(); // Assuming backend returns the created notice or success message
      console.log("Notice Submission Result:", result);

      Toast.show({
          type: 'success',
          text1: t("NewNoticeScreen_successTitle"),
          text2: t("NewNoticeScreen_successMessage")
      });

      resetForm(); // Clear form on success
      // Optional: Navigate back or elsewhere
      // router.back();

    } catch (error) {
      console.error("Failed to submit notice:", error);
      Toast.show({
          type: 'error',
          text1: t("Common_Error"),
          text2: error.message || t("NewNoticeScreen_errorSubmitFailed")
      });
    } finally {
      setIsLoading(false);
    }
  }, [title, message, selectedCategory, user, router, t]);

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

            {/* Title Input */}
            <FloatingLabelInput
              label={t("NewNoticeScreen_noticeTitleLabel")}
              value={title}
              onChangeText={setTitle}
              style={styles.input}
              // Add maxLength if needed
            />

            {/* Message Input */}
            <FloatingLabelInput
              label={t("NewNoticeScreen_noticeMessageLabel")}
              value={message}
              onChangeText={setMessage}
              style={styles.input}
              inputStyle={styles.multilineInput} // Style for multiline height
              multiline={true}
              numberOfLines={6} // Suggest initial height
            />

            {/* Category Picker */}
            <View style={styles.pickerContainer}>
               <Text style={styles.pickerLabel}>{t("NewNoticeScreen_categoryLabel")}</Text>
               <Picker
                 selectedValue={selectedCategory}
                 onValueChange={(itemValue, itemIndex) =>
                   setSelectedCategory(itemValue)
                 }
                 style={styles.picker}
                 itemStyle={styles.pickerItem} // Style individual items if needed
               >
                 {noticeCategories.map((category) => (
                   <Picker.Item key={category} label={category} value={category} />
                 ))}
               </Picker>
            </View>

            {/* Submit Button */}
            <FlipButton
              onPress={handleSubmit}
              style={styles.submitButton}
              bgColor="#28a745" // Green color for submit
              textColor="#ffffff"
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.submitButtonText}>{t("NewNoticeScreen_publishButton")}</Text>
              )}
            </FlipButton>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
      flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center', // Center content vertically
    padding: 20,
    backgroundColor: '#f7f9fc', // Light background
  },
  container: {
    padding: 20,
    backgroundColor: '#ffffff', // White card background
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  input: {
    marginBottom: 20, // Space between inputs
  },
  multilineInput: {
    height: 120, // Specific height for multiline
    textAlignVertical: 'top', // Align text to top
  },
  pickerContainer: {
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: 'white', // Match input background feel
  },
  pickerLabel: {
      fontSize: 14,
      color: '#666',
      position: 'absolute',
      top: -10, // Position label above border
      left: 10,
      backgroundColor: '#ffffff', // Background to cover border line
      paddingHorizontal: 4,
      zIndex: 1, // Ensure label is above picker border/background
  },
  picker: {
    height: 50,
    width: '100%',
  },
  pickerItem: {
    // iOS specific styling for items might go here if needed
    // height: 120, // Example for iOS item height
  },
  submitButton: {
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 15, // Space above button
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff', // Ensure text color contrasts with button background
    textAlign: 'center',
  },
});